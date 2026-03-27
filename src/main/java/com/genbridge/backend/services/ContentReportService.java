package com.genbridge.backend.services;

import com.genbridge.backend.dto.CreateReportRequest;
import com.genbridge.backend.entity.ContentReport;
import com.genbridge.backend.entity.Lesson;
import com.genbridge.backend.repository.ContentReportRepository;
import com.genbridge.backend.repository.LessonRepository;
import com.genbridge.backend.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
public class ContentReportService {

    private static final int UNPUBLISH_THRESHOLD = 3;

    private final ContentReportRepository contentReportRepository;
    private final LessonRepository lessonRepository;

    public ContentReportService(ContentReportRepository contentReportRepository,
                                LessonRepository lessonRepository) {
        this.contentReportRepository = contentReportRepository;
        this.lessonRepository = lessonRepository;
    }

    public ContentReport createReport(Long lessonId, CreateReportRequest request, User user) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));

        // Prevent duplicate reports from the same user on the same lesson
        if (contentReportRepository.existsByLessonIdAndReportedBy(lessonId, user.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reported this lesson");
        }

        ContentReport report = new ContentReport();
        report.setLessonId(lessonId);
        report.setReportedBy(user.getId());
        report.setDescription(request.getDescription());
        contentReportRepository.save(report);

        // Auto-unpublish when OPEN report count reaches threshold
        long openReports = contentReportRepository.countByLessonIdAndStatus(lessonId, "OPEN");
        if (openReports >= UNPUBLISH_THRESHOLD && lesson.isPublished()) {
            lesson.setPublished(false);
            lesson.setPublishedAt(null);
            lessonRepository.save(lesson);
        }

        return report;
    }

    @Transactional(readOnly = true)
    public List<ContentReport> getAllReports() {
        return contentReportRepository.findAllByOrderByCreatedAtDesc();
    }

    public ContentReport resolveReport(Long reportId) {
        ContentReport report = contentReportRepository.findById(reportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Report not found"));
        report.setStatus("RESOLVED");
        return contentReportRepository.save(report);
    }
}
