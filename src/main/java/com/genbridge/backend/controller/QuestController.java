package com.genbridge.backend.controller;

import com.genbridge.backend.dto.QuestCompletionRequest;
import com.genbridge.backend.dto.QuestRequest;
import com.genbridge.backend.entity.Quest;
import com.genbridge.backend.entity.QuestCompletion;
import com.genbridge.backend.services.QuestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class QuestController {

    private final QuestService questService;

    public QuestController(QuestService questService) {
        this.questService = questService;
    }

    @GetMapping("/api/quests")
    public ResponseEntity<List<Map<String, Object>>> getPublishedQuests() {
        return ResponseEntity.ok(questService.getPublishedQuestsForCurrentUser());
    }

    @GetMapping("/api/quests/{id}")
    public ResponseEntity<Map<String, Object>> getQuestById(@PathVariable Long id) {
        return ResponseEntity.ok(questService.getPublishedQuestByIdForCurrentUser(id));
    }

    @PostMapping("/api/quests/{id}/complete")
    public ResponseEntity<Map<String, Object>> completeQuest(
            @PathVariable Long id,
            @Valid @RequestBody QuestCompletionRequest request
    ) {
        QuestCompletion completion = questService.completeQuest(id, request);
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("id", completion.getId());
        response.put("questId", completion.getQuest().getId());
        response.put("questTitle", completion.getQuest().getTitle());
        response.put("reflection", completion.getReflection());
        response.put("completedAt", completion.getCompletedAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/api/quests/completions")
    public ResponseEntity<List<Map<String, Object>>> getCurrentUserCompletions() {
        return ResponseEntity.ok(questService.getCurrentUserCompletions());
    }

    @GetMapping("/api/admin/quests")
    public ResponseEntity<List<Quest>> getAllQuests() {
        return ResponseEntity.ok(questService.getAllQuests());
    }

    @PostMapping("/api/quests")
    public ResponseEntity<Quest> createQuest(@Valid @RequestBody QuestRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(questService.createQuest(request));
    }

    @PutMapping("/api/quests/{id}")
    public ResponseEntity<Quest> updateQuest(@PathVariable Long id, @Valid @RequestBody QuestRequest request) {
        return ResponseEntity.ok(questService.updateQuest(id, request));
    }

    @DeleteMapping("/api/quests/{id}")
    public ResponseEntity<Void> deleteQuest(@PathVariable Long id) {
        questService.deleteQuest(id);
        return ResponseEntity.noContent().build();
    }
}