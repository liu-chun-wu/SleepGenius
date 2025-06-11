package com.jeffery.garmin_sleep.repository;

import com.jeffery.garmin_sleep.model.SleepSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.time.LocalDate;
import java.util.Optional;

public interface SleepSummaryRepository extends JpaRepository<SleepSummary, String> {
    List<SleepSummary> findByDateBetween(LocalDate start, LocalDate end);
    Optional<SleepSummary> findByDate(LocalDate date);
}
