package com.genbridge.backend.services;

import com.genbridge.backend.dto.QuestCompletionRequest;
import com.genbridge.backend.dto.QuestRequest;
import com.genbridge.backend.entity.Quest;
import com.genbridge.backend.entity.QuestCompletion;
import com.genbridge.backend.repository.QuestCompletionRepository;
import com.genbridge.backend.repository.QuestRepository;
import com.genbridge.backend.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuestService {

    private final QuestRepository questRepository;
    private final QuestCompletionRepository questCompletionRepository;

    public QuestService(
            QuestRepository questRepository,
            QuestCompletionRepository questCompletionRepository
    ) {
        this.questRepository = questRepository;
        this.questCompletionRepository = questCompletionRepository;
    }

    public List<Map<String, Object>> getPublishedQuestsForCurrentUser() {
        User user = getCurrentUser();
        List<Quest> quests = questRepository.findByIsPublishedTrue();

        List<Long> questIds = quests.stream().map(Quest::getId).toList();
        Set<Long> completedQuestIds = questCompletionRepository.findByQuestIdInAndUser(questIds, user)
                .stream()
                .map(completion -> completion.getQuest().getId())
                .collect(Collectors.toSet());

        return quests.stream().map(quest -> toQuestListItem(quest, completedQuestIds.contains(quest.getId()))).toList();
    }

    public Map<String, Object> getPublishedQuestByIdForCurrentUser(Long id) {
        User user = getCurrentUser();

        Quest quest = questRepository.findByIdAndIsPublishedTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quest not found"));

        boolean completed = questCompletionRepository.existsByQuestAndUser(quest, user);

        return toQuestDetailItem(quest, completed);
    }

    public QuestCompletion completeQuest(Long questId, QuestCompletionRequest request) {
        User user = getCurrentUser();

        Quest quest = questRepository.findByIdAndIsPublishedTrue(questId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quest not found"));

        if (questCompletionRepository.existsByQuestAndUser(quest, user)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You have already completed this quest");
        }

        QuestCompletion completion = new QuestCompletion();
        completion.setQuest(quest);
        completion.setUser(user);
        completion.setReflection(request.getReflection());

        return questCompletionRepository.save(completion);
    }

    public List<Map<String, Object>> getCurrentUserCompletions() {
        User user = getCurrentUser();

        return questCompletionRepository.findByUserOrderByCompletedAtDesc(user)
                .stream()
                .map(completion -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", completion.getId());
                    item.put("questId", completion.getQuest().getId());
                    item.put("questTitle", completion.getQuest().getTitle());
                    item.put("reflection", completion.getReflection());
                    item.put("completedAt", completion.getCompletedAt());
                    return item;
                })
                .toList();
    }

    public List<Quest> getAllQuests() {
        return questRepository.findAll();
    }

    public Quest createQuest(QuestRequest request) {
        Quest quest = new Quest();
        quest.setTitle(request.getTitle());
        quest.setDescription(request.getDescription());
        quest.setInstruction(request.getInstruction());
        quest.setDifficulty(request.getDifficulty());
        quest.setPublished(request.isPublished());
        return questRepository.save(quest);
    }

    public Quest updateQuest(Long id, QuestRequest request) {
        Quest quest = questRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quest not found"));

        quest.setTitle(request.getTitle());
        quest.setDescription(request.getDescription());
        quest.setInstruction(request.getInstruction());
        quest.setDifficulty(request.getDifficulty());
        quest.setPublished(request.isPublished());

        return questRepository.save(quest);
    }

    public void deleteQuest(Long id) {
        if (!questRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quest not found");
        }
        questRepository.deleteById(id);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return (User) auth.getPrincipal();
    }

    private Map<String, Object> toQuestListItem(Quest quest, boolean completed) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", quest.getId());
        item.put("title", quest.getTitle());
        item.put("description", quest.getDescription());
        item.put("instruction", quest.getInstruction());
        item.put("difficulty", quest.getDifficulty());
        item.put("isPublished", quest.isPublished());
        item.put("completed", completed);
        return item;
    }

    private Map<String, Object> toQuestDetailItem(Quest quest, boolean completed) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", quest.getId());
        item.put("title", quest.getTitle());
        item.put("description", quest.getDescription());
        item.put("instruction", quest.getInstruction());
        item.put("difficulty", quest.getDifficulty());
        item.put("isPublished", quest.isPublished());
        item.put("completed", completed);
        return item;
    }
}
