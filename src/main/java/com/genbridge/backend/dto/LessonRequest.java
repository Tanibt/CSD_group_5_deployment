package com.genbridge.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class LessonRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    private String objective;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getObjective() { return objective; }
    public void setObjective(String objective) { this.objective = objective; }
}
