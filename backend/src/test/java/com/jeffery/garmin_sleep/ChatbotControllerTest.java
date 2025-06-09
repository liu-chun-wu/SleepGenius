package com.jeffery.garmin_sleep;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jeffery.garmin_sleep.controller.ChatbotController;
import com.jeffery.garmin_sleep.dto.ChatbotRequest;
import com.jeffery.garmin_sleep.dto.ChatbotResponse;
import com.jeffery.garmin_sleep.service.GeminiChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChatbotController.class)
public class ChatbotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GeminiChatService geminiChatService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testQueryByDate_returnsValidResponse() throws Exception {
        // Arrange 測試資料
        ChatbotRequest request = new ChatbotRequest();
        request.setDate(LocalDate.of(2025, 6, 2));
        request.setQuestion("我那天睡得好嗎？");

        ChatbotResponse mockResponse = new ChatbotResponse(
                "你那天的睡眠品質還不錯",
                82,
                "建議維持目前作息，效果良好"
        );

        when(geminiChatService.askGemini(request.getDate(), request.getQuestion()))
                .thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post("/api/chatbot/query")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("你那天的睡眠品質還不錯"))
                .andExpect(jsonPath("$.score").value(82))
                .andExpect(jsonPath("$.recommendation").value("建議維持目前作息，效果良好"));
    }
}
