package com.jeffery.garmin_sleep.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotResponse {
    private String answer;
    private Integer score;
}
