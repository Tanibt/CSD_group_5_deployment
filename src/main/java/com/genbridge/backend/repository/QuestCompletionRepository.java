package com.genbridge.backend.repository;

import com.genbridge.backend.entity.Quest;
import com.genbridge.backend.entity.QuestCompletion;
import com.genbridge.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestCompletionRepository extends JpaRepository<QuestCompletion, Long> {
    boolean existsByQuestAndUser(Quest quest, User user);
    List<QuestCompletion> findByUserOrderByCompletedAtDesc(User user);
    List<QuestCompletion> findByQuestIdInAndUser(List<Long> questIds, User user);
}