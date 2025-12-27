package com.exam.online_exam_platform.service;

import com.exam.online_exam_platform.entity.Role;
import com.exam.online_exam_platform.entity.User;
import com.exam.online_exam_platform.repository.ExamAttemptRepository;
import com.exam.online_exam_platform.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminStudentService {

    private final UserRepository userRepository;
    private final ExamAttemptRepository examAttemptRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminStudentService(
            UserRepository userRepository,
            ExamAttemptRepository examAttemptRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.examAttemptRepository = examAttemptRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /* ================= STUDENTS ================= */

    public List<User> getAllStudents() {
        // ✅ ENUM-BASED QUERY
        return userRepository.findByRole(Role.STUDENT);
    }

    public void updateStudent(Long studentId, User updated) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setName(updated.getName());
        student.setEmail(updated.getEmail());

        userRepository.save(student);
    }

    public void deleteStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        long attemptCount = examAttemptRepository.countByStudent(student);

        if (attemptCount > 0) {
            throw new IllegalStateException(
                    "Cannot delete student. Student has exam attempts."
            );
        }

        userRepository.delete(student);
    }

    /* ================= CREATE STUDENT ================= */

    public User createStudent(User user) {
        // 🔒 BACKEND ENFORCED RULES
        user.setRole(Role.STUDENT);

        // ✅ FORCE DEFAULT PASSWORD (ignore frontend)
        user.setPassword(passwordEncoder.encode("user123"));

        return userRepository.save(user);
    }
}
