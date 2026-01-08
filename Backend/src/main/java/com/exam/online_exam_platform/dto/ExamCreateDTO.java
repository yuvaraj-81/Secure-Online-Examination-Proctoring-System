package com.exam.online_exam_platform.dto;

import java.time.Instant;

public class ExamCreateDTO {

    private String title;
    private int durationMinutes;

    // 🔥 FIX: UTC-safe absolute time
    private Instant startTime;

    private Long courseId;

    /* ===== getters & setters ===== */

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }
}
