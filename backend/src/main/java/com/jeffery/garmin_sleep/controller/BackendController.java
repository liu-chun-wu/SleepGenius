package com.jeffery.garmin_sleep.controller;

import com.jeffery.garmin_sleep.dto.RespirationDTO;
import com.jeffery.garmin_sleep.dto.SleepStageSegmentDTO;
import com.jeffery.garmin_sleep.model.SleepRespiration;
import com.jeffery.garmin_sleep.model.SleepStageSegment;
import com.jeffery.garmin_sleep.model.SleepSummary;
import com.jeffery.garmin_sleep.repository.SleepRespirationRepository;
import com.jeffery.garmin_sleep.repository.SleepStageSegmentRepository;
import com.jeffery.garmin_sleep.repository.SleepSummaryRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.Iterator;


@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BackendController {

    @GetMapping("/test")
    public String testEndpoint() {
        return "後端連線成功！";
    }
    private static final Logger logger = LoggerFactory.getLogger(BackendController.class);
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
    @PostMapping("/upload-csv")
    public ResponseEntity<String> uploadCsv(@RequestParam("file") MultipartFile file) {
        try (Reader reader = new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8)) {
            CSVFormat format = CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).build();
            CSVParser csvParser = new CSVParser(reader, format);
            ObjectMapper objectMapper = new ObjectMapper();
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

            for (CSVRecord record : csvParser) {
                String jsonData = record.get("data");

                JsonNode root = objectMapper.readTree(jsonData);
                String summaryId = root.path("summaryId").asText();
                String dateStr = root.path("calendarDate").asText();
                LocalDate date = LocalDate.parse(dateStr, dateFormatter);

                // Save to sleep_summary
                SleepSummary summary = new SleepSummary(
                        summaryId,
                        date,
                        root.path("durationInSeconds").asInt(),
                        root.path("deepSleepDurationInSeconds").asInt(),
                        root.path("lightSleepDurationInSeconds").asInt(),
                        root.path("remSleepInSeconds").asInt(),
                        root.path("awakeDurationInSeconds").asInt(),
                        root.path("overallSleepScore").path("value").asInt(),
                        root.path("overallSleepScore").path("qualifierKey").asText(null)
                );
                sleepSummaryRepository.save(summary);

                // Save to sleep_stage_segments
                JsonNode stageMap = root.path("sleepLevelsMap");
                if (stageMap.isObject()) {
                    Iterator<String> fieldNames = stageMap.fieldNames();
                    while (fieldNames.hasNext()) {
                        String stageType = fieldNames.next();
                        for (JsonNode segment : stageMap.path(stageType)) {
                            long start = segment.path("startTimeInSeconds").asLong();
                            long end = segment.path("endTimeInSeconds").asLong();
                            int duration = (int) (end - start);
                            SleepStageSegment s = new SleepStageSegment(null, stageType, start, end, duration, summary);
                            sleepStageSegmentRepository.save(s);
                        }
                    }
                }

                // Save to sleep_respiration
                JsonNode respiration = root.path("timeOffsetSleepRespiration");
                if (respiration.isObject()) {
                    Iterator<String> offsets = respiration.fieldNames();
                    while (offsets.hasNext()) {
                        String offsetStr = offsets.next();
                        Double rate = respiration.path(offsetStr).asDouble();
                        SleepRespiration r = new SleepRespiration(null, Integer.parseInt(offsetStr), rate, summary);
                        sleepRespirationRepository.save(r);
                    }
                }
            }
            return ResponseEntity.ok("Upload and processing completed.");
        } catch (Exception e) {
            logger.error("Error occurred while processing uploaded CSV", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }
}
