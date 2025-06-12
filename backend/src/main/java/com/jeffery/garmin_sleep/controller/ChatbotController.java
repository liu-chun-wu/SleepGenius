package com.jeffery.garmin_sleep.controller;

import com.jeffery.garmin_sleep.dto.ChatbotRequest;
import com.jeffery.garmin_sleep.dto.ChatbotResponse;
import com.jeffery.garmin_sleep.service.GeminiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatbotController {

    private final GeminiChatService geminiChatService;

    @PostMapping("/chatbot-query")
    public ResponseEntity<ChatbotResponse> query(@RequestBody ChatbotRequest request) {
        return ResponseEntity.ok(
                geminiChatService.askGemini(request.getDate(), request.getQuestion())
        );
    }
}