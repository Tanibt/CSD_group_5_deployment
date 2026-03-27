package com.genbridge.backend.repository;

import com.genbridge.backend.entity.ContentReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ContentReportRepository extends JpaRepository<ContentReport, Long> {
    List<ContentReport> findByStatusOrderByCreatedAtDesc(String status);
    List<ContentReport> findAllByOrderByCreatedAtDesc();
    boolean existsByLessonIdAndReportedBy(Long lessonId, UUID reportedBy);
    long countByLessonIdAndStatus(Long lessonId, String status);

    @Query("SELECT r.lessonId, COUNT(r) FROM ContentReport r WHERE r.status = 'OPEN' GROUP BY r.lessonId")
    List<Object[]> countOpenReportsByLesson();
}
