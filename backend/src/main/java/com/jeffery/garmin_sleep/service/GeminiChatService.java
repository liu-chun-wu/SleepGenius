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


    public String buildPrompt(String userInput, SleepSummary summary, List<SleepStageSegment> stages, List<SleepRespiration> respirationList) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are a professional sleep analyst. Based on the user's question and the following sleep data, please provide an insightful analysis.\n\n");

// User Input
        prompt.append("【User Question】\n");
        prompt.append(userInput == null || userInput.isEmpty() ? "(No input provided)" : userInput).append("\n\n");

// Sleep Summary
        prompt.append("【Daily Sleep Summary】\n");
        if (summary != null) {
            prompt.append("Date: ").append(summary.getDate()).append("\n");
            prompt.append("Total Sleep Duration: ").append(summary.getTotalDuration()).append(" seconds (approx. ")
                    .append(secondsToReadableTime(summary.getTotalDuration())).append(")\n");
            prompt.append("Deep Sleep: ").append(summary.getDeepSleep()).append(" seconds\n");
            prompt.append("Light Sleep: ").append(summary.getLightSleep()).append(" seconds\n");
            prompt.append("REM Sleep: ").append(summary.getRemSleep()).append(" seconds\n");
            prompt.append("Awake Duration: ").append(summary.getAwakeSleep()).append(" seconds\n");
            prompt.append("Sleep Score: ").append(summary.getOverallScore())
                    .append(" (").append(summary.getScoreQualifier()).append(")\n");
        } else {
            prompt.append("No sleep summary data found for the selected date.\n");
        }
        prompt.append("\n");

// Sleep Stages
        prompt.append("【Sleep Stage Segments】\n");
        if (stages != null && !stages.isEmpty()) {
            int i = 1;
            DateTimeFormatter tf = DateTimeFormatter.ofPattern("HH:mm:ss");
            for (SleepStageSegment stage : stages) {
                prompt.append(i++)
                        .append(". Stage: ").append(stage.getStageType())
                        .append(", Start: ").append(epochToTime(stage.getStartTime(), tf))
                        .append(", End: ").append(epochToTime(stage.getEndTime(), tf))
                        .append(", Duration: ").append(stage.getDuration()).append(" seconds (approx. ")
                        .append(secondsToReadableTime(stage.getDuration())).append(")\n");
            }
        } else {
            prompt.append("No sleep stage data available for the selected date.\n");
        }
        prompt.append("\n");

// Respiration
        prompt.append("【Sleep Respiration Data】\n");
        if (respirationList != null && !respirationList.isEmpty()) {
            if (respirationList.size() > 40) {
                double avg = respirationList.stream().mapToDouble(SleepRespiration::getRespirationRate).average().orElse(0);
                double max = respirationList.stream().mapToDouble(SleepRespiration::getRespirationRate).max().orElse(0);
                double min = respirationList.stream().mapToDouble(SleepRespiration::getRespirationRate).min().orElse(0);
                prompt.append(String.format("Average Respiration Rate: %.2f bpm, Max: %.2f bpm, Min: %.2f bpm\n", avg, max, min));
                prompt.append("(Full respiration dataset omitted for brevity. Let us know if you need detailed data.)\n");
            } else {
                for (SleepRespiration resp : respirationList) {
                    prompt.append("Offset (sec): ").append(resp.getOffsetSeconds())
                            .append(", Respiration Rate: ").append(String.format("%.2f", resp.getRespirationRate())).append(" bpm\n");
                }
            }
        } else {
            prompt.append("No respiration data available for the selected date.\n");
        }
        prompt.append("\n");

        // Instruction to LLM
        prompt.append("You are a professional sleep analyst. Based on the user's input and sleep data, provide a short and clear summary.\n");
        prompt.append("Only mention the most important insights. Use no more than 5 bullet points.\n");
        prompt.append("Keep the answer under 300 words. Do not explain background concepts unless asked.\n");
        prompt.append("Bullet points only. Be concise.\n");

        return prompt.toString();
    }

    // epoch 轉字串時間（例如 23:07:15）
    private String epochToTime(long epoch, DateTimeFormatter tf) {
        LocalDateTime time = Instant.ofEpochSecond(epoch).atZone(ZoneId.systemDefault()).toLocalDateTime();
        return time.format(tf);
    }

    // 秒數轉為 h m s 可讀格式
    private String secondsToReadableTime(int seconds) {
        int h = seconds / 3600, m = (seconds % 3600) / 60, s = seconds % 60;
        StringBuilder sb = new StringBuilder();
        if (h > 0) sb.append(h).append("小時");
        if (m > 0) sb.append(m).append("分");
        if (s > 0) sb.append(s).append("秒");
        return sb.isEmpty() ? "0秒" : sb.toString();
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
