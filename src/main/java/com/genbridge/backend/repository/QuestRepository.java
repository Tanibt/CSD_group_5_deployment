package com.genbridge.backend.repository;

import com.genbridge.backend.entity.Quest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuestRepository extends JpaRepository<Quest, Long> {
    List<Quest> findByPublishedTrue();
    Optional<Quest> findByIdAndPublishedTrue(Long id);
}