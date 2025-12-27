package com.exam.online_exam_platform.dto;

import java.util.List;

public record QuestionDTO(
        Long id,
        String text,
        List<String> options
) {}
