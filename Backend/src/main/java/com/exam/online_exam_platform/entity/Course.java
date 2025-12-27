package com.exam.online_exam_platform.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String courseCode;

    @Column(nullable = false)
    private String courseName;

    private String description;

    /* ================= RELATIONSHIPS ================= */

    @OneToMany(
            mappedBy = "course",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Exam> exams = new ArrayList<>();

    /* ================= GETTERS ================= */

    public Long getId() {
        return id;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public String getDescription() {
        return description;
    }

    public List<Exam> getExams() {
        return exams;
    }

    /* ================= SETTERS ================= */

    public void setId(Long id) {
        this.id = id;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setExams(List<Exam> exams) {
        this.exams = exams;
    }
}
