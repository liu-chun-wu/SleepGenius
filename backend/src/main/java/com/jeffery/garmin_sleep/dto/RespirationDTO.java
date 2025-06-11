package com.jeffery.garmin_sleep.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RespirationDTO {
    private int offsetSeconds;
    private double respirationRate;
    private String summaryId;
    private String date; // ✅ 新增這個
}
