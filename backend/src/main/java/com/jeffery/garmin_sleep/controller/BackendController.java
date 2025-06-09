package com.jeffery.garmin_sleep.controller;

import com.jeffery.garmin_sleep.model.SleepRespiration;
import com.jeffery.garmin_sleep.model.SleepStageSegment;
import com.jeffery.garmin_sleep.model.SleepSummary;
import com.jeffery.garmin_sleep.repository.SleepRespirationRepository;
import com.jeffery.garmin_sleep.repository.SleepStageSegmentRepository;
import com.jeffery.garmin_sleep.repository.SleepSummaryRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BackendController {

    @GetMapping("/test")
    public String testEndpoint() {
        return "後端連線成功！";
    }

    private final SleepSummaryRepository sleepSummaryRepository;
    private final SleepStageSegmentRepository sleepStageSegmentRepository;
    private final SleepRespirationRepository sleepRespirationRepository;

    @GetMapping("/sleep-summary")
    public ResponseEntity<List<SleepSummary>> getAllSummaries(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        if (startDate != null && endDate != null) {
            return ResponseEntity.ok(sleepSummaryRepository.findByDateBetween(startDate, endDate));
        }
        return ResponseEntity.ok(sleepSummaryRepository.findAll());
    }

    @GetMapping("/sleep-summary/{summaryId}")
    public ResponseEntity<SleepSummary> getSummaryById(@PathVariable String summaryId) {
        return sleepSummaryRepository.findById(summaryId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sleep-summary/best")
    public ResponseEntity<SleepSummary> getBestSleep() {
        return ResponseEntity.ok(sleepSummaryRepository.findBestSleep());
    }

    @GetMapping("/sleep-stages/{summaryId}")
    public ResponseEntity<List<SleepStageSegment>> getStagesBySummaryId(@PathVariable String summaryId) {
        return ResponseEntity.ok(sleepStageSegmentRepository.findBySummaryId(summaryId));
    }

    @GetMapping("/sleep-respiration/{summaryId}")
    public ResponseEntity<List<SleepRespiration>> getRespirationBySummaryId(@PathVariable String summaryId) {
        return ResponseEntity.ok(sleepRespirationRepository.findBySummaryId(summaryId));
    }
}
