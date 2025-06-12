// App.tsx：主頁面，已將 ChatbotConversation 區塊抽出
import { useState } from "react"
import DatePicker from "@/components/DatePicker"
import SleepSummary from "@/components/SleepSummary"
import RespirationChart from "@/components/RespirationChart"
import SleepStagesChart from "@/components/SleepStagesChart"
import SleepStagePieChart from "@/components/SleepStagePieChart"
import CsvUpload from "@/components/CsvUpload"
import ChatbotConversation from "@/components/ChatbotConversation"

function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // 初始為 null

  const handleDateChange = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    const localDate = new Date(year, month - 1, day);
    setSelectedDate(localDate);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">睡眠分析儀表板</h1>

        {/* Date Picker Section */}
        <div className="mb-6">
          <div className="border rounded-lg shadow-sm p-4 bg-white">
            <DatePicker selectedDate={selectedDate} onChange={handleDateChange} />
          </div>
        </div>

        {selectedDate && (
          <>
            {/* Chatbot Section */}
            <div className="mb-8">
              <div className="border rounded-lg shadow-sm p-4 bg-white">
                <ChatbotConversation selectedDate={selectedDate} />
              </div>
            </div>

            {/* Sleep Metrics and Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <SleepSummary date={selectedDate} />
              <RespirationChart date={selectedDate} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <SleepStagesChart date={selectedDate} />
              <SleepStagePieChart date={selectedDate} />
            </div>
          </>
        )}


        {/* CSV Upload Section */}
        <div className="mb-8">
          <CsvUpload />
        </div>
      </div>
    </div>
  )
}

export default App
