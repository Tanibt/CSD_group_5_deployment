package com.genbridge.backend.repository;

import com.genbridge.backend.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByLessonIdOrderByIdAsc(Long lessonId);
    long countByLessonId(Long lessonId);
}
