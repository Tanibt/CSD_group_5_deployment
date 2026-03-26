package com.genbridge.backend.controller;

import com.genbridge.backend.dto.LessonRequest;
import com.genbridge.backend.entity.Lesson;
import com.genbridge.backend.services.LessonService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    // LEARNER: Get all published lessons
    @GetMapping("/api/lessons")
    public ResponseEntity<List<Lesson>> getPublishedLessons() {
        return ResponseEntity.ok(lessonService.getPublishedLessons());
    }

    // LEARNER: Get a single published lesson by ID
    @GetMapping("/api/lessons/{id}")
    public ResponseEntity<Lesson> getPublishedLesson(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.getPublishedLessonById(id));
    }

    // ADMIN: Get all lessons (including unpublished)
    @GetMapping("/api/admin/lessons")
    public ResponseEntity<List<Lesson>> getAllLessons() {
        return ResponseEntity.ok(lessonService.getAllLessons());
    }

    // ADMIN: Create a new lesson
    @PostMapping("/api/lessons")
    public ResponseEntity<Lesson> createLesson(@Valid @RequestBody LessonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(lessonService.createLesson(request));
    }

    // ADMIN: Update a lesson
    @PutMapping("/api/lessons/{id}")
    public ResponseEntity<Lesson> updateLesson(@PathVariable Long id,
                                               @Valid @RequestBody LessonRequest request) {
        return ResponseEntity.ok(lessonService.updateLesson(id, request));
    }

    // ADMIN: Toggle publish/unpublish a lesson
    @PutMapping("/api/lessons/{id}/publish")
    public ResponseEntity<Lesson> togglePublish(@PathVariable Long id) {
        return ResponseEntity.ok(lessonService.togglePublish(id));
    }

    // ADMIN: Delete a lesson
    @DeleteMapping("/api/lessons/{id}")
    public ResponseEntity<Void> deleteLesson(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.noContent().build();
    }
}
