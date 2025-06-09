package com.jeffery.garmin_sleep.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ChatbotRequest {
    private LocalDate date;
    private String question;
}
