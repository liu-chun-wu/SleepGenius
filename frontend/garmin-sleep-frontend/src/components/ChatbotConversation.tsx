import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { formatDate } from "@/utils/dateUtils"
interface Message {
    role: "user" | "bot";
    content: string;
}



interface ChatbotConversationProps {
    selectedDate: Date;
}

// 在送出請求時轉換格式


const ChatbotConversation: React.FC<ChatbotConversationProps> = ({ selectedDate }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            setTimeout(() => {
                containerRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
            }, 100);
        }
    }, [messages]);

    const handleSubmit = async () => {
        if (!question.trim()) return;
        const userMessage: Message = { role: "user", content: question };
        setMessages((prev) => [...prev, userMessage]);
        setQuestion("");
        setLoading(true);

        try {
            const res = await fetch("/api/chatbot-query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, date: formatDate(selectedDate) }),
            });
            const data = await res.json();
            setMessages((prev) => [...prev, { role: "bot", content: `**[資料日期：${formatDate(selectedDate)}]**\n\n${data.answer}` }]);
        } catch (err) {
            setMessages((prev) => [...prev, { role: "bot", content: "Error getting response." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="w-full p-4">
            <h2 className="text-xl font-semibold mb-4">SleepBot</h2>
            <div className="border p-4 rounded bg-white max-h-[400px] overflow-y-auto space-y-4 mb-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={msg.role === "user" ? "text-right" : "text-left"}>
                        <div
                            className={
                                msg.role === "user"
                                    ? "inline-block bg-blue-100 px-3 py-2 rounded"
                                    : "inline-block bg-gray-100 px-3 py-2 rounded text-left prose prose-sm max-w-full"
                            }
                        >
                            {msg.role === "bot" ? (
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            ) : (
                                <span>{msg.content}</span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={containerRef} />
            </div>
            <div className="flex flex-col">
                <textarea
                    className="border rounded p-2 resize-none min-h-[80px]"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type your question..."
                    onKeyDown={handleKeyDown}
                />
                <button
                    onClick={handleSubmit}
                    disabled={loading || !selectedDate}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    {loading ? "Thinking..." : "Send"}
                </button>
            </div>
        </div>
    );
};

export default ChatbotConversation;
