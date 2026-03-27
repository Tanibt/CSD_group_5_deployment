package com.genbridge.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateReportRequest {

    @NotBlank(message = "Description is required")
    private String description;

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
