package com.genbridge.backend.services;

import com.genbridge.backend.dto.CreateQuizQuestionRequest;
import com.genbridge.backend.dto.SubmitQuizRequest;
import com.genbridge.backend.entity.LessonProgress;
import com.genbridge.backend.entity.QuizAttempt;
import com.genbridge.backend.entity.QuizQuestion;
import com.genbridge.backend.repository.LessonProgressRepository;
import com.genbridge.backend.repository.LessonRepository;
import com.genbridge.backend.repository.QuizAttemptRepository;
import com.genbridge.backend.repository.QuizQuestionRepository;
import com.genbridge.backend.user.User;
import com.genbridge.backend.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class QuizService {

    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;
    private final UserService userService;

    public QuizService(QuizQuestionRepository quizQuestionRepository,
                       QuizAttemptRepository quizAttemptRepository,
                       LessonProgressRepository lessonProgressRepository,
                       LessonRepository lessonRepository,
                       UserService userService) {
        this.quizQuestionRepository = quizQuestionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.lessonProgressRepository = lessonProgressRepository;
        this.lessonRepository = lessonRepository;
        this.userService = userService;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getQuizForLesson(Long lessonId) {
        ensureLessonExists(lessonId);

        return quizQuestionRepository.findByLessonIdOrderByIdAsc(lessonId)
                .stream()
                .map(question -> {
                    Map<String, Object> questionView = new HashMap<>();
                    questionView.put("id", question.getId());
                    questionView.put("lessonId", question.getLessonId());
                    questionView.put("questionText", question.getQuestionText());
                    questionView.put("options", List.of(
                            question.getOptionA(),
                            question.getOptionB(),
                            question.getOptionC(),
                            question.getOptionD()
                    ));
                    questionView.put("explanation", question.getExplanation());
                    return questionView;
                })
                .toList();
    }

    public QuizQuestion createQuizQuestion(Long lessonId, CreateQuizQuestionRequest request) {
        ensureLessonExists(lessonId);
        if (request.getOptions() == null || request.getOptions().size() != 4) {
            throw new IllegalArgumentException("Exactly 4 options are required");
        }

        QuizQuestion question = new QuizQuestion();
        question.setLessonId(lessonId);
        question.setQuestionText(request.getQuestionText());
        question.setOptionA(request.getOptions().get(0));
        question.setOptionB(request.getOptions().get(1));
        question.setOptionC(request.getOptions().get(2));
        question.setOptionD(request.getOptions().get(3));
        question.setCorrectIndex(request.getCorrectIndex());
        question.setExplanation(request.getExplanation());
        return quizQuestionRepository.save(question);
    }

    public Map<String, Object> submitQuiz(Long lessonId, SubmitQuizRequest request, User user) {
        ensureLessonExists(lessonId);
        List<QuizQuestion> questions = quizQuestionRepository.findByLessonIdOrderByIdAsc(lessonId);
        if (questions.isEmpty()) {
            throw new IllegalArgumentException("No quiz questions found for this lesson");
        }

        int correctAnswers = 0;
        for (QuizQuestion question : questions) {
            Integer selected = request.getAnswers() == null ? null : request.getAnswers().get(question.getId());
            if (selected != null && selected == question.getCorrectIndex()) {
                correctAnswers++;
            }
        }

        int totalQuestions = questions.size();
        int score = (int) Math.round((correctAnswers * 100.0) / totalQuestions);
        boolean allAnswersCorrect = correctAnswers == totalQuestions;

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUserId(user.getId());
        attempt.setLessonId(lessonId);
        attempt.setScore(score);
        attempt.setTotalQuestions(totalQuestions);
        attempt.setCorrectAnswers(correctAnswers);
        quizAttemptRepository.save(attempt);

        updateLessonProgressStatus(user.getId(), lessonId);
        userService.updateStreak(user);

        Map<String, Object> result = new HashMap<>();
        result.put("lessonId", lessonId);
        result.put("score", score);
        result.put("correctAnswers", correctAnswers);
        result.put("totalQuestions", totalQuestions);
        result.put("completed", allAnswersCorrect);
        result.put("allAnswersCorrect", allAnswersCorrect);
        result.put("currentStreak", user.getCurrentStreak());
        return result;
    }

    public Map<String, Object> answerQuestion(Long lessonId, Long questionId, Integer selectedIndex, User user) {
        ensureLessonExists(lessonId);

        QuizQuestion question = quizQuestionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        if (!lessonId.equals(question.getLessonId())) {
            throw new IllegalArgumentException("Question does not belong to this lesson");
        }

        boolean isCorrect = selectedIndex != null && selectedIndex == question.getCorrectIndex();

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUserId(user.getId());
        attempt.setLessonId(lessonId);
        attempt.setQuestionId(questionId);
        attempt.setScore(isCorrect ? 100 : 0);
        attempt.setTotalQuestions(1);
        attempt.setCorrectAnswers(isCorrect ? 1 : 0);
        quizAttemptRepository.save(attempt);

        userService.updateStreak(user);
        boolean completed = updateLessonProgressStatus(user.getId(), lessonId);

        Map<String, Object> response = new HashMap<>();
        response.put("lessonId", lessonId);
        response.put("questionId", questionId);
        response.put("correct", isCorrect);
        response.put("selectedIndex", selectedIndex);
        response.put("correctIndex", question.getCorrectIndex());
        response.put("currentStreak", user.getCurrentStreak());
        response.put("completed", completed);
        response.put("explanation", question.getExplanation());
        return response;
    }

    private boolean updateLessonProgressStatus(java.util.UUID userId, Long lessonId) {
        LessonProgress progress = lessonProgressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> {
                    LessonProgress newProgress = new LessonProgress();
                    newProgress.setUserId(userId);
                    newProgress.setLessonId(lessonId);
                    return newProgress;
                });

        long totalQuestions = quizQuestionRepository.countByLessonId(lessonId);
        long correctAnsweredQuestions = quizAttemptRepository.countDistinctCorrectQuestionAttempts(userId, lessonId);

        boolean completed = totalQuestions > 0 && correctAnsweredQuestions >= totalQuestions;
        progress.setCompleted(completed);
        progress.setCompletedAt(completed ? LocalDateTime.now() : null);
        lessonProgressRepository.save(progress);
        return completed;
    }

    private void ensureLessonExists(Long lessonId) {
        if (!lessonRepository.existsById(lessonId)) {
            throw new IllegalArgumentException("Lesson not found");
        }
    }
}
