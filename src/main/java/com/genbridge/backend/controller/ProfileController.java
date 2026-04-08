package com.genbridge.backend.controller;

import com.genbridge.backend.entity.Lesson;
import com.genbridge.backend.entity.LessonProgress;
import com.genbridge.backend.repository.LessonProgressRepository;
import com.genbridge.backend.repository.LessonRepository;
import com.genbridge.backend.repository.QuestCompletionRepository;
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
    private final QuestCompletionRepository questCompletionRepository;

    public ProfileController(LessonProgressRepository lessonProgressRepository,
                             LessonRepository lessonRepository,
                             QuestCompletionRepository questCompletionRepository) {
        this.lessonProgressRepository = lessonProgressRepository;
        this.lessonRepository = lessonRepository;
        this.questCompletionRepository = questCompletionRepository;
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

        List<Map<String, Object>> completedQuests = questCompletionRepository
                .findByUserOrderByCompletedAtDesc(user)
                .stream()
                .map(qc -> {
                    Map<String, Object> entry = new HashMap<>();
                    entry.put("questId", qc.getQuest().getId());
                    entry.put("questTitle", qc.getQuest().getTitle());
                    entry.put("reflection", qc.getReflection());
                    entry.put("completedAt", qc.getCompletedAt());
                    return entry;
                })
                .collect(Collectors.toList());

        int xp = completedLessons.size() * 10 + completedQuests.size() * 15;

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("currentStreak", user.getCurrentStreak());
        profile.put("lastActiveDate", user.getLastActiveDate());
        profile.put("completedLessonsCount", completedLessons.size());
        profile.put("completedLessons", completedLessons);
        profile.put("completedQuestsCount", completedQuests.size());
        profile.put("completedQuests", completedQuests);
        profile.put("xp", xp);
        profile.put("isSuspended", user.isSuspended());
        profile.put("suspensionReason", user.getSuspensionReason());

        return ResponseEntity.ok(profile);
    }
}
