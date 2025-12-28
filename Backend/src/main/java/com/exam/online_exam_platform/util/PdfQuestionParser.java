package com.exam.online_exam_platform.util;

import java.util.*;
import java.util.regex.*;

public class PdfQuestionParser {

    public static class ParsedQuestion {
        public String questionText;
        public String optionA;
        public String optionB;
        public String optionC;
        public String optionD;
        public String correctAnswer;
    }

    private static final Pattern QUESTION_BLOCK = Pattern.compile(
            "Q\\d+\\.\\s*(.*?)\\n" +
                    "A\\.\\s*(.*?)\\n" +
                    "B\\.\\s*(.*?)\\n" +
                    "C\\.\\s*(.*?)\\n" +
                    "D\\.\\s*(.*?)\\n" +
                    "\\s*ANSWER:\\s*(.*?)\\n",
            Pattern.DOTALL | Pattern.CASE_INSENSITIVE
    );

    public static List<ParsedQuestion> parse(String text) {
        List<ParsedQuestion> questions = new ArrayList<>();

        Matcher matcher = QUESTION_BLOCK.matcher(text);

        while (matcher.find()) {
            ParsedQuestion q = new ParsedQuestion();

            q.questionText = matcher.group(1).trim();
            q.optionA = matcher.group(2).trim();
            q.optionB = matcher.group(3).trim();
            q.optionC = matcher.group(4).trim();
            q.optionD = matcher.group(5).trim();
            q.correctAnswer = matcher.group(6).trim();

            List<String> options = List.of(
                    q.optionA, q.optionB, q.optionC, q.optionD
            );

            if (!options.contains(q.correctAnswer)) {
                throw new IllegalArgumentException(
                        "Correct answer does not match any option: " + q.correctAnswer
                );
            }

            questions.add(q);
        }

        if (questions.isEmpty()) {
            throw new IllegalArgumentException("No valid questions found in PDF");
        }

        return questions;
    }
}
