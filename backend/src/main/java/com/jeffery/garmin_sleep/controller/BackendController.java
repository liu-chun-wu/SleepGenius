package com.jeffery.garmin_sleep.controller;

import com.jeffery.garmin_sleep.dto.RespirationDTO;
import com.jeffery.garmin_sleep.dto.SleepStageSegmentDTO;
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
import java.util.Optional;

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

    // 查詢指定日期的摘要
    @GetMapping("/sleep-summary/{date}")
    public Optional<SleepSummary> getSummaryByDate(@PathVariable String date) {
        return sleepSummaryRepository.findByDate(LocalDate.parse(date));
    }

    @GetMapping("/sleep-stages/{date}")
    public List<SleepStageSegmentDTO> getStagesByDate(@PathVariable String date) {
        return sleepStageSegmentRepository.findBySleepSummary_Date(LocalDate.parse(date)).stream()
                .map(s -> new SleepStageSegmentDTO(
                        s.getStageType(),
                        s.getStartTime(),
                        s.getEndTime(),
                        s.getDuration(),
                        s.getSleepSummary().getSummaryId()
                ))
                .toList();
    }

    @GetMapping("/sleep-respiration/{date}")
    public List<RespirationDTO> getRespirationByDate(@PathVariable String date) {
        return sleepRespirationRepository.findBySleepSummary_Date(LocalDate.parse(date)).stream()
                .map(r -> new RespirationDTO(
                        r.getOffsetSeconds(),
                        r.getRespirationRate(),
                        r.getSleepSummary().getSummaryId(),
                        r.getSleepSummary().getDate().toString() // ✅ 把日期也傳出
                ))
                .toList();
    }
}
