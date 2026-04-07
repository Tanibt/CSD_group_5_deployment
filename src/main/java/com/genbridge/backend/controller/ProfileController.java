package com.genbridge.backend.controller;

import com.genbridge.backend.entity.Lesson;
import com.genbridge.backend.entity.LessonProgress;
import com.genbridge.backend.repository.LessonProgressRepository;
import com.genbridge.backend.repository.LessonRepository;
import com.genbridge.backend.user.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProfileController {

    private final LessonProgressRepository lessonProgressRepository;
    private final LessonRepository lessonRepository;

    public ProfileController(LessonProgressRepository lessonProgressRepository,
                             LessonRepository lessonRepository) {
        this.lessonProgressRepository = lessonProgressRepository;
        this.lessonRepository = lessonRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        List<LessonProgress> completedProgress = lessonProgressRepository
                .findByUserIdOrderByLessonIdAsc(user.getId())
                .stream()
                .filter(LessonProgress::isCompleted)
                .collect(Collectors.toList());

        List<Map<String, Object>> completedLessons = completedProgress.stream()
                .map(p -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("lessonId", p.getLessonId());
                    entry.put("completedAt", p.getCompletedAt());
                    lessonRepository.findById(p.getLessonId()).ifPresent(lesson -> {
                        entry.put("title", lesson.getTitle());
                        entry.put("difficulty", lesson.getDifficulty());
                    });
                    return entry;
                })
                .collect(Collectors.toList());

        int xp = completedLessons.size() * 10;

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("currentStreak", user.getCurrentStreak());
        profile.put("lastActiveDate", user.getLastActiveDate());
        profile.put("completedLessonsCount", completedLessons.size());
        profile.put("completedLessons", completedLessons);
        profile.put("xp", xp);
        profile.put("completedQuestsCount", 0);
        profile.put("completedQuests", List.of());

        return ResponseEntity.ok(profile);
    }
}
