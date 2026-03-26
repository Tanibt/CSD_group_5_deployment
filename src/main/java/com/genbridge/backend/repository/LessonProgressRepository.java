package com.genbridge.backend.repository;

import com.genbridge.backend.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    Optional<LessonProgress> findByUserIdAndLessonId(UUID userId, Long lessonId);
    List<LessonProgress> findByUserIdOrderByLessonIdAsc(UUID userId);
}
