package com.genbridge.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

public class SubmitQuizRequest {

    @NotNull(message = "Answers are required")
    private Map<Long, Integer> answers;

    public Map<Long, Integer> getAnswers() {
        return answers;
    }

    public void setAnswers(Map<Long, Integer> answers) {
        this.answers = answers;
    }
}