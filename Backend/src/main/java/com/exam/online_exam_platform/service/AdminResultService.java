package com.exam.online_exam_platform.service;

import com.exam.online_exam_platform.dto.AdminResultDTO;
import com.exam.online_exam_platform.entity.Exam;
import com.exam.online_exam_platform.entity.Result;
import com.exam.online_exam_platform.entity.User;
import com.exam.online_exam_platform.repository.ExamRepository;
import com.exam.online_exam_platform.repository.ResultRepository;
import com.exam.online_exam_platform.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminResultService {

    private final ResultRepository resultRepository;
    private final UserRepository userRepository;
    private final ExamRepository examRepository;

    public AdminResultService(
            ResultRepository resultRepository,
            UserRepository userRepository,
            ExamRepository examRepository
    ) {
        this.resultRepository = resultRepository;
        this.userRepository = userRepository;
        this.examRepository = examRepository;
    }

    public List<AdminResultDTO> getAllResults() {

        return resultRepository.findAll()
                .stream()
                .map(result -> {

                    User student = userRepository.findById(result.getStudentId())
                            .orElseThrow(() ->
                                    new RuntimeException("Student not found: " + result.getStudentId())
                            );

                    Exam exam = examRepository.findById(result.getExamId())
                            .orElseThrow(() ->
                                    new RuntimeException("Exam not found: " + result.getExamId())
                            );

                    return new AdminResultDTO(
                            result.getId(),
                            student.getId(),
                            student.getName(),
                            student.getEmail(),
                            exam.getId(),
                            exam.getTitle(),
                            result.getScore(),
                            result.getTotalQuestions(),
                            result.getCorrectAnswers(),
                            result.getViolations(),
                            result.getStatus(),
                            result.getSubmissionReason(),
                            result.getSubmittedAt()
                    );
                })
                .toList();
    }
}
