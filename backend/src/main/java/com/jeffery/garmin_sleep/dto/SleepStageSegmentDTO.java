package com.jeffery.garmin_sleep.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SleepStageSegmentDTO {
    private String stageType;
    private long startTime;
    private long endTime;
    private int duration;
    private String summaryId;
}
