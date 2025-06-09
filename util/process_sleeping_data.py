import pandas as pd
import json

# 讀取原始 CSV
df = pd.read_csv("garmin_push_log_sleeps.csv")  # 改成你的檔名

# 初始化結果容器
summary_records = []
stage_records = []
respiration_records = []

# 每筆資料都是一個 JSON 字串
for _, row in df.iterrows():
    raw_json = json.loads(row["data"])
    summary_id = raw_json.get("summaryId")
    date = raw_json.get("calendarDate")

    # --- 睡眠總覽資料 (sleep_summary) ---
    summary_records.append({
        "summary_id":
        summary_id,
        "date":
        date,
        "total_duration":
        raw_json.get("durationInSeconds"),
        "deep_sleep":
        raw_json.get("deepSleepDurationInSeconds"),
        "light_sleep":
        raw_json.get("lightSleepDurationInSeconds"),
        "rem_sleep":
        raw_json.get("remSleepInSeconds"),
        "awake_sleep":
        raw_json.get("awakeDurationInSeconds"),
        "overall_score":
        raw_json.get("overallSleepScore", {}).get("value"),
        "score_qualifier":
        raw_json.get("overallSleepScore", {}).get("qualifierKey")
    })

    # --- 睡眠階段資料 (sleep_stage_segments) ---
    stage_map = raw_json.get("sleepLevelsMap", {})
    for stage_type, segments in stage_map.items():
        for segment in segments:
            stage_records.append({
                "summary_id":
                summary_id,
                "stage_type":
                stage_type,
                "start_time":
                segment["startTimeInSeconds"],
                "end_time":
                segment["endTimeInSeconds"],
                "duration":
                segment["endTimeInSeconds"] - segment["startTimeInSeconds"]
            })

    # --- 呼吸頻率資料 (sleep_respiration) ---
    respiration = raw_json.get("timeOffsetSleepRespiration", {})
    for offset_str, rate in respiration.items():
        respiration_records.append({
            "summary_id": summary_id,
            "offset_seconds": int(offset_str),
            "respiration_rate": rate
        })

# 建立 DataFrames
summary_df = pd.DataFrame(summary_records)
stage_df = pd.DataFrame(stage_records)
resp_df = pd.DataFrame(respiration_records)

# 儲存成 csv
summary_df.to_csv("sleep_summary.csv", index=False)
stage_df.to_csv("sleep_stage_segments.csv", index=False)
resp_df.to_csv("sleep_respiration.csv", index=False)
