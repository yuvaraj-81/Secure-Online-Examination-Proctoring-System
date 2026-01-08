package com.exam.online_exam_platform.util;

import com.exam.online_exam_platform.dto.ResultPdfDTO;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

public class ResultPdfGenerator {

    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    public static byte[] generate(ResultPdfDTO data) {

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4);

        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
            Font labelFont = new Font(Font.HELVETICA, 11, Font.BOLD);
            Font valueFont = new Font(Font.HELVETICA, 11);

            doc.add(new Paragraph("ONLINE EXAMINATION PLATFORM", titleFont));
            doc.add(new Paragraph("Official Result Statement\n\n"));

            doc.add(new Paragraph("Student Details", labelFont));
            doc.add(new Paragraph("Name: " + data.getStudentName(), valueFont));
            doc.add(new Paragraph("Email: " + data.getStudentEmail(), valueFont));
            doc.add(new Paragraph("\n"));

            doc.add(new Paragraph("Exam Details", labelFont));
            doc.add(new Paragraph("Exam Title: " + data.getExamTitle(), valueFont));

            // ✅ FIX: Instant → ZonedDateTime → format
            String submittedAt =
                    data.getSubmittedAt()
                            .atZone(ZoneId.of("Asia/Kolkata"))
                            .format(FORMATTER);

            doc.add(new Paragraph("Submitted At: " + submittedAt, valueFont));
            doc.add(new Paragraph("\n"));

            doc.add(new Paragraph("Result Summary", labelFont));
            doc.add(new Paragraph("Score: " + data.getScore() + "%", valueFont));
            doc.add(new Paragraph("Status: " + data.getResultStatus(), valueFont));
            doc.add(new Paragraph("\n"));

            doc.add(new Paragraph("Performance Breakdown", labelFont));
            doc.add(new Paragraph("Total Questions: " + data.getTotalQuestions(), valueFont));
            doc.add(new Paragraph("Correct Answers: " + data.getCorrectAnswers(), valueFont));
            doc.add(new Paragraph("Violations: " + data.getViolations(), valueFont));

            doc.add(new Paragraph("\n\n"));
            doc.add(new Paragraph(
                    "This is a system-generated document. No signature required.",
                    new Font(Font.HELVETICA, 9, Font.ITALIC)
            ));

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF", e);
        } finally {
            doc.close();
        }

        return out.toByteArray();
    }
}
