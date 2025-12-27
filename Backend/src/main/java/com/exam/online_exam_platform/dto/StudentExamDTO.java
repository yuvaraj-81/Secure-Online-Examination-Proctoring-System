package com.exam.online_exam_platform.dto;

import com.exam.online_exam_platform.entity.AttemptStatus;

public class StudentExamDTO {

    private Long id;
    private String title;
    private int durationMinutes;
    private AttemptStatus attemptStatus;

    public StudentExamDTO(
            Long id,
            String title,
            int durationMinutes,
            AttemptStatus attemptStatus
    ) {
        this.id = id;
        this.title = title;
        this.durationMinutes = durationMinutes;
        this.attemptStatus = attemptStatus;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public int getDurationMinutes() { return durationMinutes; }
    public AttemptStatus getAttemptStatus() { return attemptStatus; }
}
