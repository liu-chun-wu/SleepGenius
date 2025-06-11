import { useState } from "react"
import DatePicker from "@/components/DatePicker"
import QuestionInput from "@/components/QuestionInput"
import SleepMetricsCard from "@/components/SleepMetricsCard"
import RespirationChart from "@/components/RespirationChart"
import SleepStagesChart from "@/components/SleepStagesChart"
import ChatbotResponse from "@/components/ChatbotResponse"
import SleepStagePieChart from "@/components/SleepStagePieChart"
import CsvUpload from "@/components/CsvUpload"
import { formatDate } from "@/utils/dateUtils"

function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [question, setQuestion] = useState<string>("")
  const [chatbotResponse, setChatbotResponse] = useState<{
    answer: string
    recommendation: string
    confidence: number
  } | null>(null)

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const handleQuestionSubmit = (question: string) => {
    setQuestion(question)
    // Simulate API call with mock response
    setTimeout(() => {
      setChatbotResponse({
        answer: `Based on your sleep data for ${formatDate(selectedDate)}, your question about "${question}" can be answered as follows: Your sleep was more restless than usual, with increased awakenings during the night.`,
        recommendation: "Consider limiting screen time 2 hours before bed and maintaining a consistent sleep schedule.",
        confidence: 8.5,
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Sleep Analysis Dashboard</h1>

        {/* Date Picker Section */}
        <div className="mb-6">
          <DatePicker selectedDate={selectedDate} onChange={handleDateChange} />
        </div>

        {/* Question Input Section */}
        <div className="mb-8">
          <QuestionInput onSubmit={handleQuestionSubmit} />
        </div>

        {/* Sleep Metrics and Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SleepMetricsCard sleepScore={87} sleepDuration={7.5} date={selectedDate} />
          <RespirationChart date={selectedDate} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <SleepStagesChart date={selectedDate} />
          <SleepStagePieChart date={selectedDate} />
        </div>

        {/* CSV Upload Section */}
        <div className="mb-8">
          <CsvUpload />
        </div>
      </div>
    </div>
  )
}

export default App
