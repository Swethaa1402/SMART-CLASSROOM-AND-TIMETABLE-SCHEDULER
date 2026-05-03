package com.smartclassroom.backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    public String getResponse(String prompt) {

        if (apiKey == null || apiKey.isBlank()) {
            return "Gemini API key missing.";
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            // ✅ Correct working endpoint
            String url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=" + apiKey;

            // ✅ Correct request structure
            Map<String, Object> textPart = Map.of(
                    "text", prompt
            );

            Map<String, Object> content = Map.of(
                    "parts", List.of(textPart)
            );

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(content)
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity =
                    new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(url, entity, Map.class);

            Map body = response.getBody();

            if (body != null && body.containsKey("candidates")) {
                List<Map> candidates = (List<Map>) body.get("candidates");

                if (!candidates.isEmpty()) {
                    Map candidate = candidates.get(0);

                    Map contentMap = (Map) candidate.get("content");
                    List<Map> parts = (List<Map>) contentMap.get("parts");

                    if (!parts.isEmpty()) {
                        return parts.get(0).get("text").toString();
                    }
                }
            }

            return "No response from Gemini.";

        } catch (Exception e) {
            e.printStackTrace();
            return "Error calling Gemini API: " + e.getMessage();
        }
    }
}