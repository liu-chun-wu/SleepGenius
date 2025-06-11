package com.jeffery.garmin_sleep.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "sleep_respiration")
public class SleepRespiration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int offsetSeconds;
    private float respirationRate;

    @ManyToOne
    @JoinColumn(name = "summary_id") // <== 跟你資料表一致
    private SleepSummary sleepSummary;

}

