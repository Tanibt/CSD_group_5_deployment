package com.genbridge.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class QuestRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200)
    private String title;

    private String description;

    private String offlineInstruction;

    private boolean published;

    public QuestRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getOfflineInstruction() {
        return offlineInstruction;
    }

    public void setOfflineInstruction(String offlineInstruction) {
        this.offlineInstruction = offlineInstruction;
    }

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }
}