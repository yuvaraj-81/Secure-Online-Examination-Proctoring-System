package com.exam.online_exam_platform.repository;

import com.exam.online_exam_platform.entity.*;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {

    /* ================= NORMAL READ (NO LOCK) ================= */

    Optional<ExamAttempt> findByStudentAndExam(
            User student,
            Exam exam
    );

    Optional<ExamAttempt> findByStudentAndExamAndStatus(
            User student,
            Exam exam,
            AttemptStatus status
    );

    /* ================= LOCKED READ (START / RESUME ONLY) ================= */

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT ea FROM ExamAttempt ea
        WHERE ea.student = :student AND ea.exam = :exam
    """)
    Optional<ExamAttempt> findForUpdate(
            @Param("student") User student,
            @Param("exam") Exam exam
    );

    /* ================= ADMIN SAFETY CHECK ================= */

    long countByExam(Exam exam);
    long countByStudent(User student);
}
