package com.jeffery.garmin_sleep.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "sleep_stage_segments")
public class SleepStageSegment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String summaryId;

    private String stageType; // light, deep, rem

    private Long startTime;
    private Long endTime;
    private int duration;

}
