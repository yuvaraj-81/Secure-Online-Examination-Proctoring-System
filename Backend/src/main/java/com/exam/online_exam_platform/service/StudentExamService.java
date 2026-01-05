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
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardSummary(User student) {

        List<Result> results = resultRepo.findByStudentId(student.getId());

        int totalExams = results.size();
        int attempted = results.size();

        long passed = results.stream()
                .filter(r -> r.getScore() >= 40)
                .count();

        int averageScore = results.isEmpty()
                ? 0
                : (int) Math.round(
                results.stream()
                        .mapToInt(Result::getScore)
                        .average()
                        .orElse(0)
        );

        int completionPercent = totalExams == 0
                ? 0
                : Math.min(100, (attempted * 100) / totalExams);

        Result latest = results.stream()
                .max(Comparator.comparing(Result::getSubmittedAt))
                .orElse(null);

        Map<String, Object> latestExam = null;
        if (latest != null) {
            Exam exam = examRepo.findById(latest.getExamId()).orElse(null);
            latestExam = Map.of(
                    "title", exam != null ? exam.getTitle() : "Exam",
                    "score", latest.getScore(),
                    "status", latest.getScore() >= 40 ? "PASS" : "FAIL"
            );
        }

        return Map.of(
                "totalExams", totalExams,
                "attempted", attempted,
                "passed", passed,
                "averageScore", averageScore,
                "completionPercent", completionPercent,
                "latestExam", latestExam
        );
    }


    /* ================= GET ALL EXAMS ================= */
    public List<StudentExamDTO> getAllExamsForStudent(User student) {

        List<Exam> exams = examRepo.findAll();

        return exams.stream().map(exam -> {

            Optional<ExamAttempt> attemptOpt =
                    attemptRepo.findByStudentAndExam(student, exam);

            AttemptStatus status = attemptOpt
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

        Optional<ExamAttempt> optAttempt =
                attemptRepo.findByStudentAndExam(student, exam);

        ExamAttempt attempt;

        if (optAttempt.isPresent()) {
            attempt = optAttempt.get();

            if (attempt.getStatus() == AttemptStatus.SUBMITTED ||
                    attempt.getStatus() == AttemptStatus.TERMINATED) {

                return Map.of(
                        "status", attempt.getStatus(),
                        "examId", exam.getId(),
                        "examTitle", exam.getTitle()
                );
            }

            if (attempt.getStatus() == AttemptStatus.ACTIVE && attempt.isExpired()) {
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

        List<Question> questions = questionRepo.findByExam(exam);

        return Map.of(
                "status", attempt.getStatus(),
                "examId", exam.getId(),
                "examTitle", exam.getTitle(),
                "durationMinutes", exam.getDurationMinutes(),
                "endsAt", attempt.getEndsAt(),
                "violations", attempt.getViolations(),
                "answersJson", attempt.getAnswersJson(),
                "questions", questions
        );
    }

    /* ================= AUTOSAVE ================= */
    public void autosave(
            Long examId,
            User student,
            String answers,
            int violations
    ) {
        Exam exam = examRepo.findById(examId).orElseThrow();

        ExamAttempt attempt = attemptRepo
                .findByStudentAndExamAndStatus(
                        student,
                        exam,
                        AttemptStatus.ACTIVE
                )
                .orElse(null);

        if (attempt == null || attempt.isExpired()) return;

        attempt.setAnswersJson(answers);
        attempt.setViolations(violations);
        attemptRepo.save(attempt);
    }

    /* ================= SUBMIT ================= */
    @Transactional
    public void submit(
            Long examId,
            User student,
            String answers,
            int violations,
            String reason
    ) {
        Exam exam = examRepo.findById(examId)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        ExamAttempt attempt = attemptRepo
                .findByStudentAndExam(student, exam)
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (attempt.getStatus() != AttemptStatus.ACTIVE) return;

        attempt.setAnswersJson(answers);
        attempt.setViolations(violations);
        attempt.setSubmissionReason(reason);
        attempt.setStatus(
                attempt.isExpired()
                        ? AttemptStatus.TERMINATED
                        : AttemptStatus.SUBMITTED
        );
        attemptRepo.save(attempt);

        if (resultRepo.existsByExamAttemptId(attempt.getId())) return;

        List<Question> questions = questionRepo.findByExam(exam);
        int totalQuestions = questions.size();
        int correct = 0;

        Map<String, String> submittedAnswers;
        try {
            submittedAnswers = objectMapper.readValue(answers, Map.class);
        } catch (Exception e) {
            submittedAnswers = Map.of();
        }

        for (Question q : questions) {
            String chosen = submittedAnswers.get(String.valueOf(q.getId()));
            if (q.getCorrectAnswer() != null &&
                    q.getCorrectAnswer().equals(chosen)) {
                correct++;
            }
        }

        // ✅ NORMALIZED SCORE (OUT OF 100)
        int scorePercentage = totalQuestions == 0
                ? 0
                : Math.round((correct * 100f) / totalQuestions);

        Result result = new Result();
        result.setStudentId(student.getId());
        result.setExamId(exam.getId());
        result.setExamAttemptId(attempt.getId());
        result.setTotalQuestions(totalQuestions);
        result.setCorrectAnswers(correct);

        // 🔥 THIS IS THE FIX
        result.setScore(scorePercentage);

        result.setViolations(violations);
        result.setSubmissionReason(reason);
        result.setStatus("SUBMITTED");
        result.setSubmittedAt(LocalDateTime.now());

        resultRepo.save(result);
    }


    /* ================= PASS / FAIL ================= */
    private boolean isPassed(Result result) {
        if (result.getTotalQuestions() == 0) return false;

        double percentage =
                (result.getCorrectAnswers() * 100.0) / result.getTotalQuestions();

        return percentage >= 40.0;
    }

    /* ================= RESULT SUMMARY ================= */
    @Transactional(readOnly = true)
    public Map<String, Object> getResultSummary(User student) {

        List<Result> results = resultRepo.findByStudentId(student.getId());

        int totalExams = results.size();

        // ✅ PASS = score >= 40%
        long passed = results.stream()
                .filter(r -> r.getScore() >= 40)
                .count();

        // ✅ Average of percentage scores (0–100)
        int averageScore = totalExams == 0
                ? 0
                : (int) Math.round(
                results.stream()
                        .mapToInt(Result::getScore)
                        .average()
                        .orElse(0)
        );

        return Map.of(
                "totalExams", totalExams,
                "passed", passed,
                "averageScore", averageScore
        );
    }

    /* ================= RESULT REVIEW ================= */
    @Transactional(readOnly = true)
    public List<QuestionReviewDTO> getResultReview(Long resultId, User student) {

        Result result = resultRepo.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found"));

        if (!result.getStudentId().equals(student.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        Exam exam = examRepo.findById(result.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        ExamAttempt attempt = attemptRepo.findById(result.getExamAttemptId())
                .orElseThrow(() -> new RuntimeException("Attempt not found"));

        Map<String, String> answers;
        try {
            answers = objectMapper.readValue(attempt.getAnswersJson(), Map.class);
        } catch (Exception e) {
            answers = Map.of();
        }

        List<Question> questions = questionRepo.findByExam(exam);
        List<QuestionReviewDTO> reviewList = new ArrayList<>();

        for (Question q : questions) {

            String selected = answers.get(String.valueOf(q.getId()));
            String correct = q.getCorrectAnswer();

            String status;
            if (selected == null) status = "UNANSWERED";
            else if (selected.equals(correct)) status = "CORRECT";
            else status = "WRONG";

            QuestionReviewDTO dto = new QuestionReviewDTO();
            dto.setQuestionId(q.getId());
            dto.setQuestionText(q.getQuestionText());
            dto.setOptions(List.of(
                    q.getOptionA(),
                    q.getOptionB(),
                    q.getOptionC(),
                    q.getOptionD()
            ));
            dto.setCorrectAnswer(correct);
            dto.setSelectedAnswer(selected);
            dto.setStatus(status);

            reviewList.add(dto);
        }

        return reviewList;
    }

    @Transactional(readOnly = true)
    public List<StudentResultDTO> getStudentResults(User student) {

        List<Result> results =
                resultRepo.findByStudentId(student.getId());

        Map<Long, String> examTitleMap = examRepo.findAll()
                .stream()
                .collect(
                        java.util.stream.Collectors.toMap(
                                Exam::getId,
                                Exam::getTitle
                        )
                );

        return results.stream()
                .map(r -> new StudentResultDTO(
                        r.getId(),
                        r.getExamId(),
                        examTitleMap.getOrDefault(
                                r.getExamId(),
                                "Exam"
                        ),
                        r.getScore(),
                        r.getTotalQuestions(),
                        r.getCorrectAnswers(),
                        r.getViolations(),
                        r.getStatus(),
                        r.getSubmittedAt()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public ResultPdfDTO getResultForPdf(Long resultId, User student) {

        Result result = resultRepo.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Result not found"));

        if (!result.getStudentId().equals(student.getId())) {
            throw new RuntimeException("Unauthorized access");
        }

        Exam exam = examRepo.findById(result.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        String status = result.getScore() >= 40 ? "PASS" : "FAIL";

        return new ResultPdfDTO(
                student.getName(),
                student.getEmail(),
                exam.getTitle(),
                result.getScore(),
                status,
                result.getTotalQuestions(),
                result.getCorrectAnswers(),
                result.getViolations(),
                result.getSubmittedAt()
        );
    }

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

        int upcomingExams = totalExams - attempted;

        /* ===== Latest Exam ===== */
        StudentDashboardDTO.LatestExam latestExam = null;

        Optional<Result> latestResultOpt = results.stream()
                .max(Comparator.comparing(Result::getSubmittedAt));

        if (latestResultOpt.isPresent()) {
            Result r = latestResultOpt.get();
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
                upcomingExams,
                latestExam
        );
    }
}
