package com.genbridge.backend.services;

import com.genbridge.backend.dto.QuestCompletionRequest;
import com.genbridge.backend.dto.QuestRequest;
import com.genbridge.backend.entity.Quest;
import com.genbridge.backend.entity.QuestCompletion;
import com.genbridge.backend.entity.User;
import com.genbridge.backend.repository.QuestCompletionRepository;
import com.genbridge.backend.repository.QuestRepository;
import com.genbridge.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuestService {

    private final QuestRepository questRepository;
    private final QuestCompletionRepository questCompletionRepository;
    private final UserRepository userRepository;

    public QuestService(
            QuestRepository questRepository,
            QuestCompletionRepository questCompletionRepository,
            UserRepository userRepository
    ) {
        this.questRepository = questRepository;
        this.questCompletionRepository = questCompletionRepository;
        this.userRepository = userRepository;
    }

    public List<Map<String, Object>> getPublishedQuestsForCurrentUser() {
        User user = getCurrentUser();
        List<Quest> quests = questRepository.findByPublishedTrue();

        List<Long> questIds = quests.stream().map(Quest::getId).toList();
        Set<Long> completedQuestIds = questCompletionRepository.findByQuestIdInAndUser(questIds, user)
                .stream()
                .map(completion -> completion.getQuest().getId())
                .collect(Collectors.toSet());

        return quests.stream().map(quest -> toQuestListItem(quest, completedQuestIds.contains(quest.getId()))).toList();
    }

    public Map<String, Object> getPublishedQuestByIdForCurrentUser(Long id) {
        User user = getCurrentUser();

        Quest quest = questRepository.findByIdAndPublishedTrue(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quest not found"));

        boolean completed = questCompletionRepository.existsByQuestAndUser(quest, user);

        return toQuestDetailItem(quest, completed);
    }

    public QuestCompletion completeQuest(Long questId, QuestCompletionRequest request) {
        User user = getCurrentUser();

        Quest quest = questRepository.findByIdAndPublishedTrue(questId)
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
        quest.setOfflineInstruction(request.getOfflineInstruction());
        quest.setPublished(request.isPublished());
        quest.setCreatedBy(getCurrentUsername());

        if (request.isPublished()) {
            quest.setPublishedAt(LocalDateTime.now());
        }

        return questRepository.save(quest);
    }

    public Quest updateQuest(Long id, QuestRequest request) {
        Quest quest = questRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quest not found"));

        quest.setTitle(request.getTitle());
        quest.setDescription(request.getDescription());
        quest.setOfflineInstruction(request.getOfflineInstruction());
        quest.setUpdatedAt(LocalDateTime.now());

        if (request.isPublished() && !quest.isPublished()) {
            quest.setPublished(true);
            quest.setPublishedAt(LocalDateTime.now());
        } else if (!request.isPublished()) {
            quest.setPublished(false);
            quest.setPublishedAt(null);
        }

        return questRepository.save(quest);
    }

    public void deleteQuest(Long id) {
        if (!questRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Quest not found");
        }
        questRepository.deleteById(id);
    }

    private User getCurrentUser() {
        String username = getCurrentUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return auth.getName();
    }

    private Map<String, Object> toQuestListItem(Quest quest, boolean completed) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", quest.getId());
        item.put("title", quest.getTitle());
        item.put("description", quest.getDescription());
        item.put("offlineInstruction", quest.getOfflineInstruction());
        item.put("published", quest.isPublished());
        item.put("completed", completed);
        return item;
    }

    private Map<String, Object> toQuestDetailItem(Quest quest, boolean completed) {
        Map<String, Object> item = new HashMap<>();
        item.put("id", quest.getId());
        item.put("title", quest.getTitle());
        item.put("description", quest.getDescription());
        item.put("offlineInstruction", quest.getOfflineInstruction());
        item.put("published", quest.isPublished());
        item.put("completed", completed);
        item.put("publishedAt", quest.getPublishedAt());
        return item;
    }
}