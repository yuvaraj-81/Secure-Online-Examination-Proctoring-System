package com.exam.online_exam_platform.dto;

public class ExamSubmitRequest {

    private String answers;
    private Integer violations;
    private String reason;

    public String getAnswers() {
        return answers;
    }

    public void setAnswers(String answers) {
        this.answers = answers;
    }

    public Integer getViolations() {
        return violations;
    }

    public void setViolations(Integer violations) {
        this.violations = violations;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
