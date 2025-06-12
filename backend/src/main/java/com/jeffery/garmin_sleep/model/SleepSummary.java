package com.jeffery.garmin_sleep.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "sleep_summary")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SleepSummary {

    @Id
    @Column(name = "summary_id")
    private String summaryId;

    private LocalDate date;
    private Integer totalDuration;
    private Integer deepSleep;
    private Integer lightSleep;
    private Integer remSleep;
    private Integer awakeSleep;
    private Integer overallScore;
    private String scoreQualifier;
}
