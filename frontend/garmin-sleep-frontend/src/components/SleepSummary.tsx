import { useEffect, useState } from "react"
import { formatDate } from "@/utils/dateUtils"

interface SleepSummaryProps {
  date: Date
}

interface SleepSummaryData {
  summaryId: string
  date: string
  totalDuration: number
  overallScore: number
  scoreQualifier: string
}

const SleepSummary = ({ date }: SleepSummaryProps) => {
  const [summary, setSummary] = useState<SleepSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true)
      try {
        const formattedDate = formatDate(date)
        const res = await fetch(`/api/sleep-summary/${formattedDate}`)
        const data = await res.json()
        setSummary(data)
      } catch (err) {
        console.error("Error fetching sleep summary:", err)
        setSummary(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [date])

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getQualityColor = (qualifier: string) => {
    switch (qualifier.toLowerCase()) {
      case "excellent":
        return "text-green-600"
      case "good":
        return "text-blue-600"
      case "fair":
        return "text-yellow-600"
      case "poor":
      default:
        return "text-red-600"
    }
  }

  const durationText = summary
    ? `${Math.floor(summary.totalDuration / 3600)}h ${Math.floor((summary.totalDuration % 3600) / 60)}m`
    : ""

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-lg font-medium text-gray-800 mb-2">睡眠摘要</h2>
      <div className="text-sm text-gray-500 mb-4">{formatDate(date)}</div>

      {loading ? (
        <div className="text-center text-gray-400">載入中...</div>
      ) : summary ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {/* 睡眠分數 */}
          <div>
            <div className="text-base text-gray-500 mb-1">睡眠分數</div>
            <div className="flex items-center justify-center">
              <span className={`text-5xl font-extrabold ${getScoreColor(summary.overallScore)}`}>
                {summary.overallScore}
              </span>
              <span className="text-gray-500 ml-1 text-xl font-medium">/100</span>
            </div>
          </div>

          {/* 睡眠品質 */}
          <div>
            <div className="text-base text-gray-500 mb-1 ">睡眠品質</div>
            <div className={`text-4xl font-extrabold ${getQualityColor(summary.scoreQualifier)}`}>
              {summary.scoreQualifier}
            </div>
          </div>

          {/* 睡眠時長 */}
          <div>
            <div className="text-base text-gray-500 mb-1">總睡眠時長</div>
            <div className="text-4xl text-gray-800">{durationText}</div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">這天沒有睡眠資料</div>
      )}
    </div>
  )
}

export default SleepSummary
