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
import java.time.LocalDate;
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

        String prompt = buildPrompt(summary, stages, respiration, question);
        String answer = callGeminiApi(prompt);

        return new ChatbotResponse(answer, summary.getOverallScore(), "Gemini 分析");
    }


    private String buildPrompt(SleepSummary summary, List<SleepStageSegment> stages, List<SleepRespiration> respiration, String question) {
        return String.format("""
            日期：%s
            總睡眠時間：%d 分鐘
            深層睡眠：%d 分鐘，淺層睡眠：%d 分鐘，REM 睡眠：%d 分鐘，清醒：%d 分鐘
            睡眠分數：%d（%s）
            呼吸率數據筆數：%d

            使用者提問：「%s」
            請以簡潔白話的方式回應，並給出建議。
        """,
                summary.getDate(), summary.getTotalDuration(),
                summary.getDeepSleep(), summary.getLightSleep(), summary.getRemSleep(), summary.getAwakeSleep(),
                summary.getOverallScore(), summary.getScoreQualifier(),
                respiration.size(), question);
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
