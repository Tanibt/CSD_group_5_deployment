package com.genbridge.backend.controller;

import com.genbridge.backend.dto.AnswerQuestionRequest;
import com.genbridge.backend.dto.CreateQuizQuestionRequest;
import com.genbridge.backend.dto.SubmitQuizRequest;
import com.genbridge.backend.entity.QuizQuestion;
import com.genbridge.backend.services.QuizService;
import com.genbridge.backend.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lessons/{id}/quiz")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getQuiz(@PathVariable("id") Long lessonId) {
        return ResponseEntity.ok(quizService.getQuizForLesson(lessonId));
    }

    @PostMapping
    public ResponseEntity<QuizQuestion> createQuizQuestion(@PathVariable("id") Long lessonId,
                                                           @Valid @RequestBody CreateQuizQuestionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quizService.createQuizQuestion(lessonId, request));
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitQuiz(@PathVariable("id") Long lessonId,
                                                          @Valid @RequestBody SubmitQuizRequest request,
                                                          Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(quizService.submitQuiz(lessonId, request, user));
    }

    @PutMapping("/{questionId}")
    public ResponseEntity<QuizQuestion> updateQuizQuestion(@PathVariable("id") Long lessonId,
                                                           @PathVariable Long questionId,
                                                           @Valid @RequestBody CreateQuizQuestionRequest request) {
        return ResponseEntity.ok(quizService.updateQuizQuestion(lessonId, questionId, request));
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuizQuestion(@PathVariable("id") Long lessonId,
                                                   @PathVariable Long questionId) {
        quizService.deleteQuizQuestion(lessonId, questionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{questionId}/answer")
    public ResponseEntity<Map<String, Object>> answerQuestion(@PathVariable("id") Long lessonId,
                                                               @PathVariable Long questionId,
                                                               @Valid @RequestBody AnswerQuestionRequest request,
                                                               Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(quizService.answerQuestion(lessonId, questionId, request.getSelectedIndex(), user));
    }

}
