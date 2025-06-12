import React, { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { formatDate } from "@/utils/dateUtils"

interface DatePickerProps {
  selectedDate: Date;
  onChange: (value: string) => void;
}


const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/sleep-summary")
      .then((res) => res.json())
      .then((data) => {
        const dates = data.map((d: any) => d.date);
        setAvailableDates(dates);
      });
  }, []);

  const isToday = (day: number) => {
    const today = new Date();
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
    );
  };

  const isFutureDate = (day: number) => {
    const today = new Date();
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date > today;
  };

  const isUnavailable = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const formatted = formatDate(date);
    return !availableDates.includes(formatted);
  };

  const getDaysInMonth = () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = [];
    for (let d = start.getDate(); d <= end.getDate(); d++) {
      days.push(d);
    }
    return days;
  };

  const goToPreviousMonth = () => {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  };

  const goToNextMonth = () => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  };

  const handleClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onChange(format(date, "yyyy-MM-dd"));
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <button onClick={goToPreviousMonth} className="px-2 py-1 bg-gray-200 rounded">Previous</button>
        <span className="font-semibold">
          {currentMonth.toLocaleString("default", { month: "long" })} {currentMonth.getFullYear()}
        </span>
        <button onClick={goToNextMonth} className="px-2 py-1 bg-gray-200 rounded">Next</button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {getDaysInMonth().map((day) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const formatted = formatDate(date);
          const isSelected = formatted === formatDate(selectedDate);
          const disabled = isFutureDate(day) || isUnavailable(day);
          return (
            <button
              key={day}
              onClick={() => handleClick(day)}
              disabled={disabled}
              className={`p-2 rounded text-sm border
                ${isSelected ? "bg-blue-500 text-white" : "bg-white"}
                ${isToday(day) ? "border-blue-400" : "border-gray-300"}
                ${disabled ? "opacity-30 cursor-not-allowed" : "hover:bg-blue-100"}`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DatePicker;
