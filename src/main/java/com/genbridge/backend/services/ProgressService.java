package com.genbridge.backend.services;

import com.genbridge.backend.entity.LessonProgress;
import com.genbridge.backend.repository.LessonProgressRepository;
import com.genbridge.backend.repository.LessonRepository;
import com.genbridge.backend.user.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class ProgressService {

    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;

    public ProgressService(LessonProgressRepository lessonProgressRepository,
                           LessonRepository lessonRepository) {
        this.lessonProgressRepository = lessonProgressRepository;
        this.lessonRepository = lessonRepository;
    }

    public LessonProgress startLesson(Long lessonId, User user) {
        if (!lessonRepository.existsById(lessonId)) {
            throw new IllegalArgumentException("Lesson not found");
        }

        return lessonProgressRepository.findByUserIdAndLessonId(user.getId(), lessonId)
                .orElseGet(() -> {
                    LessonProgress progress = new LessonProgress();
                    progress.setUserId(user.getId());
                    progress.setLessonId(lessonId);
                    progress.setStartedAt(LocalDateTime.now());
                    return lessonProgressRepository.save(progress);
                });
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProgress(User user) {
        List<LessonProgress> progresses = lessonProgressRepository.findByUserIdOrderByLessonIdAsc(user.getId());
        long totalLessons = lessonRepository.count();
        long completedLessons = progresses.stream().filter(LessonProgress::isCompleted).count();
        double completionRate = totalLessons == 0 ? 0 : (completedLessons * 100.0) / totalLessons;

        Map<String, Object> response = new HashMap<>();
        response.put("totalLessons", totalLessons);
        response.put("startedLessons", progresses.size());
        response.put("completedLessons", completedLessons);
        response.put("completionRate", Math.round(completionRate * 100.0) / 100.0);
        response.put("lessons", progresses);
        return response;
    }
}
