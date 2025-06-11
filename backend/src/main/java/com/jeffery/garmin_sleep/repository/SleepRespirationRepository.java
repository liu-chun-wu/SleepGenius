package com.jeffery.garmin_sleep.repository;

import com.jeffery.garmin_sleep.model.SleepRespiration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface SleepRespirationRepository extends JpaRepository<SleepRespiration, Long> {
    List<SleepRespiration> findBySleepSummary_SummaryId(String summaryId);

    List<SleepRespiration> findBySleepSummary_Date(LocalDate sleepSummaryDate);

}