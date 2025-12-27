package com.exam.online_exam_platform.service;

import com.exam.online_exam_platform.dto.QuestionCreateDTO;
import com.exam.online_exam_platform.entity.Exam;
import com.exam.online_exam_platform.entity.Question;
import com.exam.online_exam_platform.repository.ExamAttemptRepository;
import com.exam.online_exam_platform.repository.ExamRepository;
import com.exam.online_exam_platform.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final ExamAttemptRepository examAttemptRepository;

    public AdminExamService(
            ExamRepository examRepository,
            QuestionRepository questionRepository,
            ExamAttemptRepository examAttemptRepository
    ) {
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.examAttemptRepository = examAttemptRepository;
    }

    /* ================= EXAMS ================= */

    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    public void createExam(Exam exam) {
        examRepository.save(exam);
    }

    public void deleteExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        long attemptCount = examAttemptRepository.countByExam(exam);

        if (attemptCount > 0) {
            throw new IllegalStateException(
                    "Cannot delete exam. Students have already attempted this exam."
            );
        }

        examRepository.delete(exam);
    }

    /* ================= QUESTIONS ================= */

    public List<Question> getQuestionsByExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        return questionRepository.findByExam(exam);
    }

    public void addQuestionToExam(Long examId, QuestionCreateDTO dto) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        Question question = new Question();
        question.setQuestionText(dto.getQuestionText());
        question.setOptionA(dto.getOptionA());
        question.setOptionB(dto.getOptionB());
        question.setOptionC(dto.getOptionC());
        question.setOptionD(dto.getOptionD());
        question.setCorrectAnswer(dto.getCorrectAnswer());
        question.setExam(exam);

        questionRepository.save(question);
    }
}
