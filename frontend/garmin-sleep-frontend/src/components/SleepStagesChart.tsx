import { useEffect, useState } from "react"
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Rectangle,
  Line,
  Customized,
} from "recharts"
import { formatDate } from "@/utils/dateUtils"

interface SleepStagesChartProps {
  date: Date
}

const sleepStageColors: Record<string, string> = {
  deep: "#1e3a8a",
  light: "#60a5fa",
  rem: "#ec4899",
  awake: "#f472b6",
  unmeasurable: "#cbd5e1", // 淺灰色
}

const stageLabels: Record<string, string> = {
  deep: "深層",
  light: "淺層",
  rem: "REM",
  awake: "清醒",
  unmeasurable: "無法測量",
}

// 對應不同階段的 Y 座標和高度
const stageYValues: Record<string, number> = {
  awake: 160,
  rem: 120,
  light: 80,
  deep: 40,
  unmeasurable: 20, // 顯示在最底下
}



export default function SleepStagesChart({ date }: SleepStagesChartProps) {
  const [segments, setSegments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [xDomain, setXDomain] = useState<[number, number]>([0, 1440])

  useEffect(() => {
    const fetchStages = async () => {
      setLoading(true)
      const formattedDate = formatDate(date)
      const res = await fetch(`/api/sleep-stages/${formattedDate}`)
      const raw = await res.json()

      const transformed = raw.map((s: any) => {
        const startDate = new Date(s.startTime * 1000)
        const endDate = new Date(s.endTime * 1000)

        const start = startDate.getHours() * 60 + startDate.getMinutes()
        const end = endDate.getHours() * 60 + endDate.getMinutes()
        const duration = end - start

        return {
          ...s,
          start,
          end,
          duration,
          color: sleepStageColors[s.stageType],
        }
      })

      // ✅ 排序後，觀察順序
      transformed.sort((a: { start: number }, b: { start: number }) => a.start - b.start)

      setSegments(transformed)

      if (transformed.length) {
        const minStart = transformed[0].start
        const maxEnd = Math.max(...transformed.map((s: { end: any }) => s.end))

        const padding = 10
        const left = Math.max(minStart - padding, 0)

        setXDomain([left, maxEnd + padding])
      }

      setLoading(false)
    }


    fetchStages()
  }, [date])

  const CustomGarminStageBars = (props: any) => {
    const { xAxisMap, yAxisMap } = props
    const xAxis = xAxisMap && Object.values(xAxisMap)[0]
    const yAxis = yAxisMap && Object.values(yAxisMap)[0]

    return (
      <>
        {segments.map((seg, idx) => {
          const xStart = xAxis?.scale(seg.start) ?? 0
          const xEnd = xAxis?.scale(seg.start + seg.duration) ?? 0
          const width = xEnd - xStart

          const yTop = yAxis?.scale(stageYValues[seg.stageType]) ?? 0
          const yBottom = yAxis?.scale(0) ?? 0
          const height = yBottom - yTop

          return (
            <Rectangle
              key={idx}
              x={xStart}
              y={yTop}
              width={width}
              height={height}
              fill={seg.color}
              radius={[4, 4, 4, 4]}
            />
          )
        })}
      </>
    )
  }

  const SleepStageBackgroundLines = (props: any) => {
    const yAxis = props.yAxisMap && Object.values(props.yAxisMap)[0]
    const xAxis = props.xAxisMap && Object.values(props.xAxisMap)[0]

    if (!xAxis || !yAxis) return null

    const xStart = xAxis.scale(xAxis.domain[0])
    const xEnd = xAxis.scale(xAxis.domain[1])
    const width = xEnd - xStart

    // ✅ 只畫這 4 種階段的灰線
    const allowedStages = ["awake", "rem", "light", "deep"]

    return (
      <>
        {Object.entries(stageYValues).map(([stage, yValue]) => {
          if (!allowedStages.includes(stage)) return null
          const y = yAxis.scale(yValue)
          return (
            <Rectangle
              key={stage}
              x={xStart}
              y={y}
              width={width}
              height={1}
              fill="#e2e8f0"
              opacity={0.8}
            />
          )
        })}
      </>
    )
  }



  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-lg font-medium text-gray-800 mb-2">睡眠階段</h2>
      <div className="text-sm text-gray-500 mb-4">{formatDate(date)}</div>

      {loading ? (
        <div className="text-center text-gray-400">載入中...</div>
      ) : !segments.length ? (
        <div className="text-center text-gray-400">這天沒有睡眠資料</div>
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={segments}
              margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
            >
              <XAxis
                type="number"
                dataKey="start"
                domain={xDomain} // ✅ 加上這一行才會生效！
                tickFormatter={(v) => {
                  const h = Math.floor(v / 60)
                  const m = v % 60
                  const hour = h % 12 === 0 ? 12 : h % 12
                  const meridian = h < 12 ? "AM" : "PM"
                  return `${hour}:${m.toString().padStart(2, "0")}${meridian}`
                }}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                type="number"
                domain={[0, 180]}
                ticks={[160, 120, 80, 40]} // 對應清醒→深層
                tickFormatter={(v) => {
                  switch (v) {
                    case 160: return "清醒"
                    case 120: return "REM"
                    case 80: return "淺層"
                    case 40: return "深層"
                    default: return ""
                  }
                }}
                allowDataOverflow={true}
                stroke="#64748b"
                fontSize={12}
              />
              <Line
                dataKey="start"
                stroke="transparent"
                dot={false}
                activeDot={{
                  r: 0,
                  fill: "transparent",
                  stroke: "transparent",
                }}
              />
              <Tooltip
                cursor={{ stroke: "#94a3b8", strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const s = payload[0].payload
                  const startH = Math.floor(s.start / 60)
                  const startM = String(s.start % 60).padStart(2, "0")
                  const endH = Math.floor(s.end / 60)
                  const endM = String(s.end % 60).padStart(2, "0")
                  return (
                    <div className="bg-white p-2 border rounded shadow text-sm">
                      <div>階段：{stageLabels[s.stageType]}</div>
                      <div>
                        時間：{startH}:{startM} ~ {endH}:{endM}
                      </div>
                      <div>長度：{s.duration} 分鐘</div>
                    </div>
                  )
                }}
              />
              <Customized component={SleepStageBackgroundLines} />
              <Customized component={CustomGarminStageBars} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
      {segments.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-700">
          {["deep", "light", "rem", "awake"].map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: sleepStageColors[type] }}
              />
              <span>{stageLabels[type]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
