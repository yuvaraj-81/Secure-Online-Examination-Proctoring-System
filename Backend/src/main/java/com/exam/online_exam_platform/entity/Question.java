package com.exam.online_exam_platform.entity;

import com.fasterxml.jackson.annotation.*;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ================= QUESTION TEXT ================= */

    @Column(name = "question_text", nullable = false)
    @JsonProperty("questionText")
    private String questionText;

    /* ================= OPTIONS ================= */

    @Column(name = "option_a", nullable = false)
    private String optionA;

    @Column(name = "option_b", nullable = false)
    private String optionB;

    @Column(name = "option_c", nullable = false)
    private String optionC;

    @Column(name = "option_d", nullable = false)
    private String optionD;

    /* ================= CORRECT ANSWER ================= */

    @Column(name = "correct_answer", nullable = false)
    private String correctAnswer; // exact text

    /* ================= RELATION ================= */

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    @JsonBackReference
    private Exam exam;

    /* ================= OPTIONS FOR FRONTEND ================= */

    @Transient
    @JsonProperty("options")
    public List<String> getOptions() {
        List<String> options = new ArrayList<>();
        options.add(optionA);
        options.add(optionB);
        options.add(optionC);
        options.add(optionD);
        return options;
    }

    /* ================= GETTERS ================= */

    public Long getId() {
        return id;
    }

    // ✅ EXISTING getter
    public String getQuestionText() {
        return questionText;
    }

    // ✅ BACKWARD-COMPATIBILITY FIX (DO NOT REMOVE)
    // This preserves StudentExamService logic
    public String getText() {
        return questionText;
    }

    public String getOptionA() {
        return optionA;
    }

    public String getOptionB() {
        return optionB;
    }

    public String getOptionC() {
        return optionC;
    }

    public String getOptionD() {
        return optionD;
    }

    public String getCorrectAnswer() {
        return correctAnswer;
    }

    public Exam getExam() {
        return exam;
    }

    /* ================= SETTERS ================= */

    public void setId(Long id) {
        this.id = id;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public void setOptionA(String optionA) {
        this.optionA = optionA;
    }

    public void setOptionB(String optionB) {
        this.optionB = optionB;
    }

    public void setOptionC(String optionC) {
        this.optionC = optionC;
    }

    public void setOptionD(String optionD) {
        this.optionD = optionD;
    }

    public void setCorrectAnswer(String correctAnswer) {
        this.correctAnswer = correctAnswer;
    }

    public void setExam(Exam exam) {
        this.exam = exam;
    }
}
