interface ChatbotResponseProps {
  response: {
    answer: string
    recommendation: string
    confidence: number
  } | null
}

const ChatbotResponse = ({ response }: ChatbotResponseProps) => {
  if (!response) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-full">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Sleep Analysis</h2>
        <div className="flex items-center justify-center h-48 text-gray-400">
          Ask a question to get personalized sleep insights
        </div>
      </div>
    )
  }

  // Determine confidence color
  const getConfidenceColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Sleep Analysis</h2>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Answer</h3>
        <p className="text-gray-800">{response.answer}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Recommendation</h3>
        <p className="text-gray-800">{response.recommendation}</p>
      </div>

      <div className="flex items-center mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 mr-2">Confidence:</div>
        <div className={`font-bold ${getConfidenceColor(response.confidence)}`}>
          {response.confidence.toFixed(1)}/10
        </div>
      </div>
    </div>
  )
}

export default ChatbotResponse
