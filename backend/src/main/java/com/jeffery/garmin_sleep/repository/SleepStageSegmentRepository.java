package com.jeffery.garmin_sleep.repository;

import com.jeffery.garmin_sleep.model.SleepStageSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SleepStageSegmentRepository extends JpaRepository<SleepStageSegment, Long> {
    List<SleepStageSegment> findBySummaryId(String summaryId);
}