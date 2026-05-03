package com.smartclassroom.backend.controllers;

import com.smartclassroom.backend.models.StudentQuestion;
import com.smartclassroom.backend.repository.StudentQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final StudentQuestionRepository questionRepository;

    @PostMapping("/ask")
    public ResponseEntity<StudentQuestion> askQuestion(@RequestBody Map<String, String> payload) {
        String studentEmail = payload.get("studentEmail");
        String questionText = payload.get("question");

        StudentQuestion question = StudentQuestion.builder()
                .studentEmail(studentEmail)
                .question(questionText)
                .status(StudentQuestion.QuestionStatus.PENDING)
                .build();

        return ResponseEntity.ok(questionRepository.save(question));
    }

    @GetMapping("/student")
    public ResponseEntity<List<StudentQuestion>> getStudentQuestions(@RequestParam String email) {
        return ResponseEntity.ok(questionRepository.findByStudentEmailOrderByCreatedAtDesc(email));
    }

    @GetMapping("/teacher")
    public ResponseEntity<List<StudentQuestion>> getAllQuestions() {
        return ResponseEntity.ok(questionRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping("/reply")
    public ResponseEntity<?> replyToQuestion(@RequestBody Map<String, Object> payload) {
        Long id = Long.valueOf(payload.get("id").toString());
        String answer = payload.get("answer").toString();

        return questionRepository.findById(id).map(q -> {
            q.setAnswer(answer);
            q.setStatus(StudentQuestion.QuestionStatus.ANSWERED);
            return ResponseEntity.ok(questionRepository.save(q));
        }).orElse(ResponseEntity.notFound().build());
    }
}
