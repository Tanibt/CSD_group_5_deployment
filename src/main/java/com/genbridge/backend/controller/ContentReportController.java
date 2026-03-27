package com.genbridge.backend.controller;

import com.genbridge.backend.dto.CreateReportRequest;
import com.genbridge.backend.entity.ContentReport;
import com.genbridge.backend.services.ContentReportService;
import com.genbridge.backend.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ContentReportController {

    private final ContentReportService contentReportService;

    public ContentReportController(ContentReportService contentReportService) {
        this.contentReportService = contentReportService;
    }

    // LEARNER: Submit a report for a lesson
    @PostMapping("/api/lessons/{lessonId}/report")
    public ResponseEntity<ContentReport> createReport(
            @PathVariable Long lessonId,
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contentReportService.createReport(lessonId, request, user));
    }

    // ADMIN: Get all reports
    @GetMapping("/api/admin/reports")
    public ResponseEntity<List<ContentReport>> getAllReports() {
        return ResponseEntity.ok(contentReportService.getAllReports());
    }

    // ADMIN: Resolve a report
    @PutMapping("/api/admin/reports/{reportId}/resolve")
    public ResponseEntity<ContentReport> resolveReport(@PathVariable Long reportId) {
        return ResponseEntity.ok(contentReportService.resolveReport(reportId));
    }
}
