package com.jeffery.garmin_sleep.repository;

import com.jeffery.garmin_sleep.model.SleepSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.time.LocalDate;

public interface SleepSummaryRepository extends JpaRepository<SleepSummary, String> {
    List<SleepSummary> findByDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT s FROM SleepSummary s ORDER BY s.overallScore DESC LIMIT 1")
    SleepSummary findBestSleep();

}
