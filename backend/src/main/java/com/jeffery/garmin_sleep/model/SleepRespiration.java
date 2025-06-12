package com.jeffery.garmin_sleep.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sleep_respiration")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SleepRespiration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer offsetSeconds;
    private Double respirationRate;

    @ManyToOne
    @JoinColumn(name = "summary_id") // <== 跟你資料表一致
    private SleepSummary sleepSummary;

}

