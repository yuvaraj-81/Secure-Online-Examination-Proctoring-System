package com.exam.online_exam_platform.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exams")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(name = "duration_minutes", nullable = false)
    private int durationMinutes;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    /* ================= COURSE ================= */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    @JsonBackReference
    private Course course;

    /* ================= QUESTIONS ================= */

    @OneToMany(
            mappedBy = "exam",
            fetch = FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonManagedReference
    private List<Question> questions = new ArrayList<>();

    /* ================= GETTERS ================= */

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public Course getCourse() {
        return course;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    /* ================= SETTERS ================= */

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public void setQuestions(List<Question> questions) {
        this.questions = questions;
    }
}
