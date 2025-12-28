package com.exam.online_exam_platform.service;

import com.exam.online_exam_platform.dto.QuestionCreateDTO;
import com.exam.online_exam_platform.entity.Exam;
import com.exam.online_exam_platform.entity.Question;
import com.exam.online_exam_platform.repository.ExamAttemptRepository;
import com.exam.online_exam_platform.repository.ExamRepository;
import com.exam.online_exam_platform.repository.QuestionRepository;
import com.exam.online_exam_platform.util.PdfQuestionParser;
import com.exam.online_exam_platform.util.PdfQuestionParser.ParsedQuestion;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.ArrayList;
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

    /* ================= PDF IMPORT ================= */

    @Transactional
    public int importQuestionsFromPdf(Long examId, MultipartFile pdfFile) {

        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        String extractedText;

        try (InputStream is = pdfFile.getInputStream();
             PDDocument document = PDDocument.load(is)) {

            PDFTextStripper stripper = new PDFTextStripper();
            extractedText = stripper.getText(document);

        } catch (Exception e) {
            throw new RuntimeException("Failed to read PDF file", e);
        }

        List<ParsedQuestion> parsedQuestions =
                PdfQuestionParser.parse(extractedText);

        List<Question> questionsToSave = new ArrayList<>();

        for (ParsedQuestion pq : parsedQuestions) {

            Question q = new Question();
            q.setQuestionText(pq.questionText);
            q.setOptionA(pq.optionA);
            q.setOptionB(pq.optionB);
            q.setOptionC(pq.optionC);
            q.setOptionD(pq.optionD);

            // ✅ FULL TEXT correct answer
            q.setCorrectAnswer(pq.correctAnswer);

            q.setExam(exam);
            questionsToSave.add(q);
        }

        questionRepository.saveAll(questionsToSave);

        return questionsToSave.size();
    }
}
