package com.exam.online_exam_platform.repository;

import com.exam.online_exam_platform.entity.Exam;
import com.exam.online_exam_platform.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    /* ================= FETCH ================= */

    List<Question> findByExam(Exam exam);

    List<Question> findByExamId(Long examId);

    // Helpful when deleting an exam
    void deleteByExamId(Long examId);
}
