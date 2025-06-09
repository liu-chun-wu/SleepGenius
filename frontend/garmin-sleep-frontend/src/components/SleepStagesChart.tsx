import { useEffect, useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatDate } from "@/utils/dateUtils"

interface SleepStagesChartProps {
  date: Date
}

const SleepStagesChart = ({ date }: SleepStagesChartProps) => {
  const [data, setData] = useState<
    Array<{
      time: string
      deep: number
      light: number
      rem: number
      awake: number
      hour: number
    }>
  >([])

  const [summary, setSummary] = useState<
    Array<{
      name: string
      minutes: number
      percentage: number
      color: string
    }>
  >([])

  useEffect(() => {
    // Generate hourly sleep stage data for smooth curves
    const hourlyData = Array.from({ length: 24 }, (_, i) => {
      const hour = i
      const period = hour >= 12 ? "PM" : "AM"
      const displayHour = hour % 12 || 12
      const timeString = `${displayHour}${period}`

      // Simulate realistic sleep stages throughout the night
      let deep = 0,
        light = 0,
        rem = 0,
        awake = 0

      if (hour >= 23 || hour <= 6) {
        // Sleep hours (11 PM to 6 AM)
        const sleepHour = hour >= 23 ? hour - 23 : hour + 1

        if (sleepHour <= 2) {
          // Early sleep - more deep sleep
          deep = 60 + Math.random() * 20
          light = 30 + Math.random() * 15
          rem = 5 + Math.random() * 10
          awake = Math.random() * 5
        } else if (sleepHour <= 5) {
          // Mid sleep - mixed stages
          deep = 20 + Math.random() * 15
          light = 40 + Math.random() * 20
          rem = 25 + Math.random() * 15
          awake = Math.random() * 8
        } else {
          // Late sleep - more REM
          deep = 10 + Math.random() * 10
          light = 25 + Math.random() * 15
          rem = 45 + Math.random() * 20
          awake = Math.random() * 10
        }
      } else {
        // Awake hours
        awake = 100
      }

      return {
        time: timeString,
        deep: Math.max(0, deep),
        light: Math.max(0, light),
        rem: Math.max(0, rem),
        awake: Math.max(0, awake),
        hour,
      }
    })

    setData(hourlyData)

    // Calculate summary data
    const sleepData = hourlyData.filter((d) => d.hour >= 23 || d.hour <= 6)
    const totalDeep = sleepData.reduce((sum, d) => sum + d.deep, 0) / sleepData.length
    const totalLight = sleepData.reduce((sum, d) => sum + d.light, 0) / sleepData.length
    const totalRem = sleepData.reduce((sum, d) => sum + d.rem, 0) / sleepData.length
    const totalAwake = sleepData.reduce((sum, d) => sum + d.awake, 0) / sleepData.length

    const summaryData = [
      { name: "Deep", minutes: totalDeep * 1.2, color: "#1e40af", percentage: 0 },
      { name: "Light", minutes: totalLight * 1.2, color: "#3b82f6", percentage: 0 },
      { name: "REM", minutes: totalRem * 1.2, color: "#60a5fa", percentage: 0 },
      { name: "Awake", minutes: totalAwake * 1.2, color: "#cbd5e1", percentage: 0 },
    ]

    const total = summaryData.reduce((sum, stage) => sum + stage.minutes, 0)
    summaryData.forEach((stage) => {
      stage.percentage = (stage.minutes / total) * 100
    })

    setSummary(summaryData)
  }, [date])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value.toFixed(1)}%
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-lg font-medium text-gray-800 mb-2">Sleep Stages</h2>
      <div className="text-sm text-gray-500 mb-4">{formatDate(date)}</div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="deepGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1e40af" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#1e40af" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="remGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.3} />
              </linearGradient>
              <linearGradient id="awakeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={12} interval={2} />
            <YAxis stroke="#64748b" fontSize={12} label={{ value: "Percentage", angle: -90, position: "insideLeft" }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="awake"
              stackId="1"
              stroke="#cbd5e1"
              fill="url(#awakeGradient)"
              strokeWidth={2}
            />
            <Area type="monotone" dataKey="rem" stackId="1" stroke="#60a5fa" fill="url(#remGradient)" strokeWidth={2} />
            <Area
              type="monotone"
              dataKey="light"
              stackId="1"
              stroke="#3b82f6"
              fill="url(#lightGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="deep"
              stackId="1"
              stroke="#1e40af"
              fill="url(#deepGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {summary.map((stage) => (
          <div
            key={stage.name}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200"
          >
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full mr-3 shadow-sm" style={{ backgroundColor: stage.color }}></div>
              <span className="text-sm font-medium text-gray-700">{stage.name}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-800">{Math.round(stage.minutes)}m</div>
              <div className="text-xs text-gray-500">{stage.percentage.toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SleepStagesChart
