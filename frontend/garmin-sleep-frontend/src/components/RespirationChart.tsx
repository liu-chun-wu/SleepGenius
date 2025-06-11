import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatDate } from "@/utils/dateUtils"

interface RespirationChartProps {
  date: Date
}

const RespirationChart = ({ date }: RespirationChartProps) => {
  const [data, setData] = useState<Array<{ time: string; rate: number; hour: number }>>([])

  useEffect(() => {
    const fetchRespiration = async () => {
      const formattedDate = formatDate(date) // "2025-06-11"
      const res = await fetch(`/api/sleep-respiration/${formattedDate}`)
      const raw = await res.json()

      const transformed = raw.map((item: any) => {
        const baseDate = new Date(`${formattedDate}T00:00:00`)
        const timestamp = new Date(baseDate.getTime() + item.offsetSeconds * 1000)

        const hours = timestamp.getHours()
        const minutes = timestamp.getMinutes()
        const ampm = hours >= 12 ? "PM" : "AM"
        const displayHour = hours % 12 || 12
        const timeString =
          minutes === 0
            ? `${displayHour}${ampm}`
            : `${displayHour}:${minutes.toString().padStart(2, "0")}${ampm}`

        return {
          time: timeString,
          hour: hours,
          rate: parseFloat(item.respirationRate.toFixed(2)),
        }
      })

      setData(transformed)
    }

    fetchRespiration()
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
    </div>
  )
}

export default RespirationChart
