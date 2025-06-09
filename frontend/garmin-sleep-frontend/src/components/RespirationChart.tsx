import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatDate } from "@/utils/dateUtils"

interface RespirationChartProps {
  date: Date
}

const RespirationChart = ({ date }: RespirationChartProps) => {
  const [data, setData] = useState<Array<{ time: string; rate: number; hour: number }>>([])

  useEffect(() => {
    // Generate more detailed mock data for smoother curves (every 30 minutes)
    const mockData = Array.from({ length: 48 }, (_, i) => {
      const totalMinutes = i * 30 // Every 30 minutes
      const hour = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      const formattedHour = hour % 24
      const period = formattedHour >= 12 ? "PM" : "AM"
      const displayHour = formattedHour % 12 || 12

      const timeString =
        minutes === 0 ? `${displayHour}${period}` : `${displayHour}:${minutes.toString().padStart(2, "0")}${period}`

      // Create realistic respiration patterns with smooth transitions
      let baseRate = 14
      const timeOfDay = (hour + minutes / 60) % 24

      if (timeOfDay >= 22 || timeOfDay <= 7) {
        // Sleep hours - create a smooth sine wave pattern for natural breathing
        const sleepProgress = timeOfDay >= 22 ? (timeOfDay - 22) / 9 : (timeOfDay + 2) / 9
        baseRate = 11 + 2 * Math.sin(sleepProgress * Math.PI * 4) + 1 * Math.cos(sleepProgress * Math.PI * 6)
      } else {
        // Awake hours - slightly higher with gentle variations
        baseRate = 15 + 2 * Math.sin(timeOfDay * 0.5) + 1 * Math.cos(timeOfDay * 0.8)
      }

      return {
        time: timeString,
        rate: Math.max(9, Math.min(18, baseRate + (Math.random() - 0.5) * 0.8)),
        hour: hour,
      }
    })

    setData(mockData)
  }, [date])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-800">{`Time: ${label}`}</p>
          <p className="text-sm text-indigo-600">{`Rate: ${payload[0].value.toFixed(1)} breaths/min`}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-lg font-medium text-gray-800 mb-2">Respiration Rate</h2>
      <div className="text-sm text-gray-500 mb-4">{formatDate(date)}</div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="respirationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={12} interval={Math.floor(data.length / 8)} />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              domain={["dataMin - 1", "dataMax + 1"]}
              label={{ value: "Breaths/min", angle: -90, position: "insideLeft" }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="#6366f1"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 6,
                stroke: "#6366f1",
                strokeWidth: 2,
                fill: "#ffffff",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
          <div className="text-blue-600 text-xs font-medium">Average Rate</div>
          <div className="font-bold text-blue-800">
            {data.length > 0 ? (data.reduce((sum, d) => sum + d.rate, 0) / data.length).toFixed(1) : "0"} bpm
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
          <div className="text-green-600 text-xs font-medium">Sleep Quality</div>
          <div className="font-bold text-green-800">Excellent</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-3 rounded-lg border border-purple-100">
          <div className="text-purple-600 text-xs font-medium">Variability</div>
          <div className="font-bold text-purple-800">Low</div>
        </div>
      </div>
    </div>
  )
}

export default RespirationChart
