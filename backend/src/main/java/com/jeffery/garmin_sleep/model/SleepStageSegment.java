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

    private String stageType; // light, deep, rem
    private Long startTime;
    private Long endTime;
    private int duration;

    @ManyToOne
    @JoinColumn(name = "summary_id") // <== 跟你資料表一致
    private SleepSummary sleepSummary;

}
