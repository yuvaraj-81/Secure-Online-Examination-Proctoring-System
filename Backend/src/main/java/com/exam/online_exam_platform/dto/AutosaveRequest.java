package com.exam.online_exam_platform.dto;

public class AutosaveRequest {

    private String answers;
    private int violations;

    public AutosaveRequest() {
    }

    public String getAnswers() {
        return answers;
    }

    public void setAnswers(String answers) {
        this.answers = answers;
    }

    public int getViolations() {
        return violations;
    }

    public void setViolations(int violations) {
        this.violations = violations;
    }
}
