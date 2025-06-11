import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { formatDate } from "@/utils/dateUtils"

interface SleepStagePieChartProps {
    date: Date
}

const COLORS = ["#60a5fa", "#1e3a8a", "#ec4899", "#f472b6"] // 淺層、深層、REM、清醒

const stageLabels: Record<string, string> = {
    deep: "深層",
    light: "淺層",
    rem: "REM",
    awake: "清醒",
}

const stageColors: Record<string, string> = {
    deep: "#1e3a8a",
    light: "#60a5fa",
    rem: "#ec4899",
    awake: "#f472b6",
}

const SleepStagePieChart = ({ date }: SleepStagePieChartProps) => {
    const [data, setData] = useState<{ stage: string; duration: number }[]>([])
    const [rawDurations, setRawDurations] = useState<Record<string, number>>({ deep: 0, light: 0, rem: 0, awake: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStageSummary = async () => {
            setLoading(true)
            const res = await fetch(`/api/sleep-stages/${formatDate(date)}`)
            const raw = await res.json()

            const summary: Record<string, number> = {
                deep: 0,
                light: 0,
                rem: 0,
                awake: 0,
            }

            for (const s of raw) {
                if (s.stageType === "unmeasurable") continue
                if (summary[s.stageType] !== undefined) {
                    summary[s.stageType] += s.duration / 60 // 換算為分鐘
                }
            }

            setRawDurations({
                deep: Math.round(summary.deep),
                light: Math.round(summary.light),
                rem: Math.round(summary.rem),
                awake: Math.round(summary.awake),
            })

            const formatted = Object.entries(summary)
                .filter(([_, d]) => d > 0)
                .map(([stage, duration]) => ({
                    stage: stageLabels[stage],
                    duration: Math.round(duration),
                }))

            setData(formatted)
            setLoading(false)
        }

        fetchStageSummary()
    }, [date])

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md h-full flex items-center justify-center">
                <span className="text-gray-400">載入中...</span>
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md h-full">
                <h2 className="text-lg font-medium text-gray-800 mb-1">睡眠階段比例</h2>
                <p className="text-sm text-gray-400 mb-4">{formatDate(date)}</p>
                <div className="flex items-center justify-center h-40">
                    <span className="text-gray-400">這天沒有睡眠資料</span>
                </div>
            </div>
        )
    }


    const total = data.reduce((sum, d) => sum + d.duration, 0)

    const renderStageItem = (label: string, duration: number, color: string) => (
        <div className="flex items-center space-x-2 justify-center">
            <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
            <span>{label}：{duration} 分鐘</span>
        </div>
    )

    return (
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
            <h2 className="text-lg font-medium text-gray-800 mb-4">睡眠階段比例</h2>
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="duration"
                        nameKey="stage"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value} 分鐘`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
            <p className="text-base text-gray-600 text-center mt-4 font-medium">總時數：{total} 分鐘</p>

            <div className="mt-6 text-base text-gray-700 flex flex-wrap justify-center gap-x-6 gap-y-2">
                {renderStageItem("深層", rawDurations.deep, stageColors.deep)}
                {renderStageItem("淺層", rawDurations.light, stageColors.light)}
                {renderStageItem("REM", rawDurations.rem, stageColors.rem)}
                {renderStageItem("清醒", rawDurations.awake, stageColors.awake)}
            </div>
        </div>
    )
}

export default SleepStagePieChart
