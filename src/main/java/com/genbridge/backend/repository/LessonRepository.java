package com.genbridge.backend.repository;

import com.genbridge.backend.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByPublishedTrue();

    Optional<Lesson> findByIdAndPublishedTrue(Long id);
}
