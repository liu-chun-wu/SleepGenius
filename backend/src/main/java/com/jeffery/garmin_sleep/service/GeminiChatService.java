package com.jeffery.garmin_sleep.service;

import com.jeffery.garmin_sleep.dto.ChatbotResponse;
import com.jeffery.garmin_sleep.model.SleepRespiration;
import com.jeffery.garmin_sleep.model.SleepStageSegment;
import com.jeffery.garmin_sleep.model.SleepSummary;
import com.jeffery.garmin_sleep.repository.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiChatService {

    private final SleepSummaryRepository summaryRepo;
    private final SleepStageSegmentRepository stageRepo;
    private final SleepRespirationRepository respirationRepo;

    @Value("${GEMINI_URL}")
    private String geminiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public ChatbotResponse askGemini(LocalDate date, String question) {
        SleepSummary summary = summaryRepo.findByDate(date)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "該日期無資料"));

        List<SleepStageSegment> stages = stageRepo.findBySleepSummary_Date(date);
        List<SleepRespiration> respiration = respirationRepo.findBySleepSummary_Date(date);

        String prompt = buildPrompt(question,summary, stages, respiration);
        String answer = callGeminiApi(prompt);

        return new ChatbotResponse(answer, summary.getOverallScore());
    }


    public String buildPrompt(String question, SleepSummary summary, List<SleepStageSegment> stages, List<SleepRespiration> respirationList) {
        StringBuilder prompt = new StringBuilder();

        // Prompt instructions (concise)
        prompt.append("You are a sleep coach. Based on the user's question and data below, give a short and helpful answer.\n\n");
        prompt.append("Question:\n\"").append(question).append("\"\n\n");

        prompt.append("Respond in 3 short sections:\n");
        prompt.append("1. Quick answer\n2. Sleep issues\n3. One or two practical suggestions\n");
        prompt.append("Be brief and clear.\n\n");

        // Sleep Summary
        prompt.append("【Summary】\n");
        if (summary != null) {
            prompt.append("Date: ").append(summary.getDate()).append(", Total: ").append(summary.getTotalDuration()).append("s, Deep: ")
                    .append(summary.getDeepSleep()).append("s, REM: ").append(summary.getRemSleep()).append("s, Awake: ")
                    .append(summary.getAwakeSleep()).append("s, Score: ").append(summary.getOverallScore()).append(" (")
                    .append(summary.getScoreQualifier()).append(")\n");
        } else {
            prompt.append("No summary.\n");
        }
        prompt.append("\n");

        // Sleep Stages
        prompt.append("【Stages】\n");
        if (stages != null && !stages.isEmpty()) {
            DateTimeFormatter tf = DateTimeFormatter.ofPattern("HH:mm");
            for (int i = 0; i < Math.min(3, stages.size()); i++) {
                SleepStageSegment s = stages.get(i);
                prompt.append(s.getStageType()).append(" [").append(toTime(s.getStartTime(), tf)).append("~")
                        .append(toTime(s.getEndTime(), tf)).append(", ").append(s.getDuration()).append("s] ");
            }
            prompt.append("...\n");
        } else {
            prompt.append("No stages.\n");
        }
        prompt.append("\n");

        // Respiration
        prompt.append("【Respiration】\n");
        if (respirationList != null && !respirationList.isEmpty()) {
            double avg = respirationList.stream().mapToDouble(SleepRespiration::getRespirationRate).average().orElse(0);
            double min = respirationList.stream().mapToDouble(SleepRespiration::getRespirationRate).min().orElse(0);
            double max = respirationList.stream().mapToDouble(SleepRespiration::getRespirationRate).max().orElse(0);
            prompt.append(String.format("Avg: %.1f bpm, Range: %.1f~%.1f bpm\n", avg, min, max));
        } else {
            prompt.append("No respiration.\n");
        }
        prompt.append("\n");

        return prompt.toString();
    }


//
//    // epoch 轉字串時間（例如 23:07:15）
//    private String epochToTime(long epoch, DateTimeFormatter tf) {
//        LocalDateTime time = Instant.ofEpochSecond(epoch).atZone(ZoneId.systemDefault()).toLocalDateTime();
//        return time.format(tf);
//    }
//
//    // 秒數轉為 h m s 可讀格式
//    private String secondsToReadableTime(int seconds) {
//        int h = seconds / 3600, m = (seconds % 3600) / 60, s = seconds % 60;
//        StringBuilder sb = new StringBuilder();
//        if (h > 0) sb.append(h).append("小時");
//        if (m > 0) sb.append(m).append("分");
//        if (s > 0) sb.append(s).append("秒");
//        return sb.isEmpty() ? "0秒" : sb.toString();
//    }
    private String toTime(long epochSeconds, DateTimeFormatter formatter) {
        LocalDateTime time = Instant.ofEpochSecond(epochSeconds).atZone(ZoneId.systemDefault()).toLocalDateTime();
        return time.format(formatter);
    }
    private String callGeminiApi(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> payload = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(geminiUrl, request, Map.class);
            if (response.getStatusCode().is2xxSuccessful()) {
                // 根據 Gemini 回應格式提取文字
                var candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, String>> parts = (List<Map<String, String>>) content.get("parts");
                    return parts.get(0).get("text");
                }
            }
            return "Gemini 回應格式錯誤或無結果。";
        } catch (Exception e) {
            log.error("Gemini API 失敗", e);
            return "無法取得 Gemini 回應，請稍後再試。";
        }
    }
}
