package com.jeffery.garmin_sleep.repository;

import com.jeffery.garmin_sleep.model.SleepRespiration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SleepRespirationRepository extends JpaRepository<SleepRespiration, Long> {
    List<SleepRespiration> findBySummaryId(String summaryId);
}