package com.genbridge.backend.repository;

import com.genbridge.backend.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByUserIdOrderBySubmittedAtDesc(UUID userId);

    @Query("""
        select count(distinct qa.questionId)
        from QuizAttempt qa
        where qa.userId = :userId
          and qa.lessonId = :lessonId
          and qa.questionId is not null
          and qa.correctAnswers = 1
    """)
    long countDistinctCorrectQuestionAttempts(@Param("userId") UUID userId, @Param("lessonId") Long lessonId);
}
