package com.smartclassroom.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final com.smartclassroom.backend.services.GeminiService geminiService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> payload) {
        String question = payload.getOrDefault("question", "");
        
        String answer = geminiService.getResponse(question);

        Map<String, String> response = new HashMap<>();
        response.put("answer", answer);
        
        return ResponseEntity.ok(response);
    }
}
