package com.genbridge.backend.controller;

import com.genbridge.backend.entity.LessonProgress;
import com.genbridge.backend.services.ProgressService;
import com.genbridge.backend.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping("/api/lessons/{id}/start")
    public ResponseEntity<LessonProgress> startLesson(@PathVariable("id") Long lessonId,
                                                      Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(progressService.startLesson(lessonId, user));
    }

    @GetMapping("/api/progress")
    public ResponseEntity<Map<String, Object>> getProgress(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(progressService.getProgress(user));
    }
}
