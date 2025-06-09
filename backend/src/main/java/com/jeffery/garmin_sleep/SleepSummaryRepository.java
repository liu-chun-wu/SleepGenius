package com.jeffery.garmin_sleep;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;

public interface SleepSummaryRepository extends JpaRepository<SleepSummary, String> {
    List<SleepSummary> findByDateBetween(LocalDate start, LocalDate end);
}
