package com.jeffery.garmin_sleep;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")  // 基本路徑前綴
public class BackendController {

    @GetMapping("/test")
    public String testEndpoint() {
        return "後端連線成功！";
    }

    @Autowired
    private SleepSummaryRepository sleepSummaryRepository;

    @GetMapping("sleep/summary")
    public List<SleepSummary> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end
    ) {
        return sleepSummaryRepository.findByDateBetween(start, end);
    }

    @GetMapping("sleep/summary/all")
    public List<SleepSummary> getAllSummaries() {
        return sleepSummaryRepository.findAll();
    }
}
