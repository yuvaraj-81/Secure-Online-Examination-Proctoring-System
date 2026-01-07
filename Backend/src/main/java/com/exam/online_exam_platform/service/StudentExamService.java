package com.exam.online_exam_platform.service;

import com.exam.online_exam_platform.dto.*;
import com.exam.online_exam_platform.entity.*;
import com.exam.online_exam_platform.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentExamService {

    private final ExamRepository examRepo;
    private final ExamAttemptRepository attemptRepo;
    private final QuestionRepository questionRepo;
    private final ResultRepository resultRepo;
    private final ObjectMapper objectMapper;

    public StudentExamService(
            ExamRepository examRepo,
            ExamAttemptRepository attemptRepo,
            QuestionRepository questionRepo,
            ResultRepository resultRepo,
            ObjectMapper objectMapper
    ) {
        this.examRepo = examRepo;
        this.attemptRepo = attemptRepo;
        this.questionRepo = questionRepo;
        this.resultRepo = resultRepo;
        this.objectMapper = objectMapper;
    }

    /* ================= STUDENT DASHBOARD ================= */
    @Transactional(readOnly = true)
    public StudentDashboardDTO getStudentDashboard(User student) {

        List<Exam> allExams = examRepo.findAll();
        List<Result> results = resultRepo.findByStudentId(student.getId());

        int totalExams = allExams.size();
        int attempted = results.size();
        int passed = (int) results.stream()
                .filter(r -> r.getScore() >= 40)
                .count();
        int failed = attempted - passed;

        int averageScore = attempted == 0
                ? 0
                : (int) Math.round(
                results.stream()
                        .mapToInt(Result::getScore)
                        .average()
                        .orElse(0)
        );

        int completionPercent = totalExams == 0
                ? 0
                : Math.round((attempted * 100f) / totalExams);

        int upcoming = totalExams - attempted;

        StudentDashboardDTO.LatestExam latestExam = null;

        Optional<Result> latestOpt =
                results.stream()
                        .max(Comparator.comparing(Result::getSubmittedAt));

        if (latestOpt.isPresent()) {
            Result r = latestOpt.get();
            Exam exam = examRepo.findById(r.getExamId()).orElse(null);

            latestExam = new StudentDashboardDTO.LatestExam();
            latestExam.examId = r.getExamId();
            latestExam.title = exam != null ? exam.getTitle() : "Exam";
            latestExam.score = r.getScore();
            latestExam.status = r.getScore() >= 40 ? "PASS" : "FAIL";
            latestExam.submittedAt = r.getSubmittedAt();
        }

        return new StudentDashboardDTO(
                totalExams,
                attempted,
                passed,
                failed,
                averageScore,
                completionPercent,
                upcoming,
                latestExam
        );
    }


    /* ================= EXAMS LIST ================= */
    public List<StudentExamDTO> getAllExamsForStudent(User student) {

        return examRepo.findAll().stream().map(exam -> {

            AttemptStatus status = attemptRepo
                    .findByStudentAndExam(student, exam)
                    .map(ExamAttempt::getStatus)
                    .orElse(null);

            return new StudentExamDTO(
                    exam.getId(),
                    exam.getTitle(),
                    exam.getDurationMinutes(),
                    status
            );
        }).toList();
    }

    /* ================= START / RESUME ================= */
    @Transactional
    public Map<String, Object> startOrResume(Long examId, User student) {

        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        Optional<ExamAttempt> opt = attemptRepo.findByStudentAndExam(student, exam);
        ExamAttempt attempt;

        if (opt.isPresent()) {
            attempt = opt.get();

            if (attempt.getStatus() != AttemptStatus.ACTIVE) {
                return Map.of(
                        "status", attempt.getStatus(),
                        "examId", exam.getId(),
                        "examTitle", exam.getTitle()
                );
            }

            if (attempt.isExpired()) {
                attempt.setStatus(AttemptStatus.TERMINATED);
                attemptRepo.save(attempt);

                return Map.of(
                        "status", AttemptStatus.TERMINATED,
                        "examId", exam.getId(),
                        "examTitle", exam.getTitle()
                );
            }

        } else {
            attempt = new ExamAttempt();
            attempt.setStudent(student);
            attempt.setExam(exam);
            attempt.setStartedAt(Instant.now());
            attempt.setEndsAt(
                    Instant.now().plus(exam.getDurationMinutes(), ChronoUnit.MINUTES)
            );
            attempt.setStatus(AttemptStatus.ACTIVE);
            attempt.setViolations(0);
            attempt.setAnswersJson("{}");
            attemptRepo.save(attempt);
        }

        return Map.of(
                "status", attempt.getStatus(),
                "examId", exam.getId(),
                "examTitle", exam.getTitle(),
                "durationMinutes", exam.getDurationMinutes(),
                "endsAt", attempt.getEndsAt(),
                "violations", attempt.getViolations(),
                "answersJson", attempt.getAnswersJson(),
                "questions", questionRepo.findByExam(exam)
        );
    }

    /* ================= AUTOSAVE ================= */
    @Transactional
    public void autosave(Long examId, User student, String answers, int violations) {

        Exam exam = examRepo.findById(examId).orElseThrow();

        ExamAttempt attempt = attemptRepo
                .findByStudentAndExamAndStatus(student, exam, AttemptStatus.ACTIVE)
                .orElse(null);

        if (attempt == null) return;

        if (attempt.isExpired()) {
            attempt.setStatus(AttemptStatus.TERMINATED);
            attemptRepo.save(attempt);
            return;
        }

        attempt.setAnswersJson(answers);
        attempt.setViolations(
                Math.max(attempt.getViolations(), violations)
        );

        attemptRepo.save(attempt);
    }

    /* ================= SUBMIT ================= */
    @Transactional
    public void submit(Long examId, User student, String answers, int violations, String reason) {

        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        ExamAttempt attempt = attemptRepo
                .findByStudentAndExam(student, exam)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (attempt.getStatus() != AttemptStatus.ACTIVE) return;

        attempt.setAnswersJson(answers);
        attempt.setViolations(
                Math.max(attempt.getViolations(), violations)
        );

        // ✅ Preserve first termination reason
        if (attempt.getSubmissionReason() == null) {
            attempt.setSubmissionReason(reason);
        }

        attempt.setStatus(
                attempt.isExpired()
                        ? AttemptStatus.TERMINATED
                        : AttemptStatus.SUBMITTED
        );

        attemptRepo.save(attempt);

        if (resultRepo.existsByExamAttemptId(attempt.getId())) return;

        List<Question> questions = questionRepo.findByExam(exam);

        Map<String, String> submitted;
        try {
            submitted = objectMapper.readValue(answers, Map.class);
        } catch (Exception e) {
            submitted = Map.of();
        }

        int correct = 0;
        for (Question q : questions) {
            if (q.getCorrectAnswer() != null &&
                    q.getCorrectAnswer().equals(submitted.get(String.valueOf(q.getId())))) {
                correct++;
            }
        }

        int score = questions.isEmpty()
                ? 0
                : Math.round((correct * 100f) / questions.size());

        Result result = new Result();
        result.setStudentId(student.getId());
        result.setExamId(exam.getId());
        result.setExamAttemptId(attempt.getId());
        result.setTotalQuestions(questions.size());
        result.setCorrectAnswers(correct);
        result.setScore(score);
        result.setViolations(attempt.getViolations());
        result.setSubmissionReason(attempt.getSubmissionReason());
        result.setStatus(attempt.getStatus().name());
        result.setSubmittedAt(LocalDateTime.now());

        resultRepo.save(result);
    }

    /* ================= RESULTS LIST ================= */
    @Transactional(readOnly = true)
    public List<StudentResultDTO> getStudentResults(User student) {

        Map<Long, String> examTitles = examRepo.findAll()
                .stream()
                .collect(Collectors.toMap(
                        Exam::getId,
                        Exam::getTitle
                ));

        return resultRepo.findByStudentId(student.getId())
                .stream()
                .map(r -> new StudentResultDTO(
                        r.getId(),
                        r.getExamId(),
                        examTitles.getOrDefault(r.getExamId(), "Exam"),
                        r.getScore(),
                        r.getTotalQuestions(),
                        r.getCorrectAnswers(),
                        r.getViolations(),
                        r.getStatus(),
                        r.getSubmittedAt()
                ))
                .toList();
    }

    /* ================= RESULT SUMMARY ================= */
    @Transactional(readOnly = true)
    public Map<String, Object> getResultSummary(User student) {

        List<Result> results = resultRepo.findByStudentId(student.getId());

        return Map.of(
                "totalExams", results.size(),
                "passed", results.stream().filter(r -> r.getScore() >= 40).count(),
                "averageScore", results.isEmpty()
                        ? 0
                        : Math.round(
                        results.stream()
                                .mapToInt(Result::getScore)
                                .average()
                                .orElse(0)
                )
        );
    }

    /* ================= RESULT REVIEW ================= */
    @Transactional(readOnly = true)
    public List<QuestionReviewDTO> getResultReview(Long resultId, User student) {

        Result result = resultRepo.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found"));

        if (!result.getStudentId().equals(student.getId()))
            throw new RuntimeException("Unauthorized");

        Exam exam = examRepo.findById(result.getExamId()).orElseThrow();
        ExamAttempt attempt = attemptRepo.findById(result.getExamAttemptId()).orElseThrow();

        Map<String, String> answers;
        try {
            answers = objectMapper.readValue(attempt.getAnswersJson(), Map.class);
        } catch (Exception e) {
            answers = Map.of();
        }

        List<QuestionReviewDTO> list = new ArrayList<>();

        for (Question q : questionRepo.findByExam(exam)) {

            String selected = answers.get(String.valueOf(q.getId()));
            String correct = q.getCorrectAnswer();

            QuestionReviewDTO dto = new QuestionReviewDTO();
            dto.setQuestionId(q.getId());
            dto.setQuestionText(q.getQuestionText());
            dto.setOptions(List.of(
                    q.getOptionA(),
                    q.getOptionB(),
                    q.getOptionC(),
                    q.getOptionD()
            ));
            dto.setSelectedAnswer(selected);
            dto.setCorrectAnswer(correct);
            dto.setStatus(
                    selected == null ? "UNANSWERED"
                            : selected.equals(correct) ? "CORRECT" : "WRONG"
            );

            list.add(dto);
        }

        return list;
    }

    /* ================= RESULT PDF ================= */
    @Transactional(readOnly = true)
    public ResultPdfDTO getResultForPdf(Long resultId, User student) {

        Result result = resultRepo.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found"));

        if (!result.getStudentId().equals(student.getId()))
            throw new RuntimeException("Unauthorized");

        Exam exam = examRepo.findById(result.getExamId()).orElseThrow();

        return new ResultPdfDTO(
                student.getName(),
                student.getEmail(),
                exam.getTitle(),
                result.getScore(),
                result.getScore() >= 40 ? "PASS" : "FAIL",
                result.getTotalQuestions(),
                result.getCorrectAnswers(),
                result.getViolations(),
                result.getSubmittedAt()
        );
    }
}
