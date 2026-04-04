package com.genbridge.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class QuestCompletionRequest {

    @NotBlank(message = "Reflection is required")
    private String reflection;

    public QuestCompletionRequest() {
    }

    public String getReflection() {
        return reflection;
    }

    public void setReflection(String reflection) {
        this.reflection = reflection;
    }
}