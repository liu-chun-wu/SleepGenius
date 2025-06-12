package com.jeffery.garmin_sleep.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sleep_stage_segments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SleepStageSegment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String stageType; // light, deep, rem
    private Long startTime;
    private Long endTime;
    private Integer duration;

    @ManyToOne
    @JoinColumn(name = "summary_id") // <== 跟你資料表一致
    private SleepSummary sleepSummary;

}
