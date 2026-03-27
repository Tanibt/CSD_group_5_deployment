package com.genbridge.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "content_reports")
public class ContentReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", insertable = false, updatable = false)
    private com.genbridge.backend.entity.Lesson lesson;

    @Column(name = "reported_by", nullable = false)
    private UUID reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by", insertable = false, updatable = false)
    private com.genbridge.backend.user.User reporter;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 20)
    private String status = "OPEN"; // OPEN, RESOLVED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public ContentReport() {}

    public Long getId() { return id; }
    public Long getLessonId() { return lessonId; }
    public void setLessonId(Long lessonId) { this.lessonId = lessonId; }
    public UUID getReportedBy() { return reportedBy; }
    public void setReportedBy(UUID reportedBy) { this.reportedBy = reportedBy; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
