import { formatDate } from "@/utils/dateUtils"

interface SleepMetricsCardProps {
  sleepScore: number
  sleepDuration: number
  date: Date
}

const SleepMetricsCard = ({ sleepScore, sleepDuration, date }: SleepMetricsCardProps) => {
  // Determine score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-blue-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  // Determine duration quality
  const getDurationQuality = (hours: number) => {
    if (hours >= 8) return "Excellent"
    if (hours >= 7) return "Good"
    if (hours >= 6) return "Fair"
    return "Poor"
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Sleep Summary for {formatDate(date)}</h2>

      <div className="flex flex-col md:flex-row justify-between">
        <div className="mb-4 md:mb-0">
          <div className="text-sm text-gray-500 mb-1">Sleep Score</div>
          <div className="flex items-center">
            <span className={`text-4xl font-bold ${getScoreColor(sleepScore)}`}>{sleepScore}</span>
            <span className="text-gray-500 ml-1">/100</span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">Total Sleep Duration</div>
          <div className="flex items-end">
            <span className="text-4xl font-bold text-gray-800">{sleepDuration}</span>
            <span className="text-gray-500 ml-1 mb-1">hours</span>
          </div>
          <div className="text-sm text-gray-600">{getDurationQuality(sleepDuration)}</div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Bedtime</div>
            <div className="font-medium">11:30 PM</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Wake Time</div>
            <div className="font-medium">7:00 AM</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SleepMetricsCard
