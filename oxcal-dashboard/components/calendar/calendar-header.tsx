"use client"

type CalendarHeaderProps = {
  currentView: "day" | "week" | "month"
  onViewChange: (view: "day" | "week" | "month") => void
}

export function CalendarHeader({ currentView, onViewChange }: CalendarHeaderProps) {
  return (
    <div className="flex items-center rounded-md bg-[#2A2A2A] p-1">
      <button
        className={`rounded-md px-3 py-1 text-sm ${
          currentView === "day" ? "bg-[#7747FF] text-white" : "text-gray-400 hover:bg-[#3A3A3A] hover:text-white"
        }`}
        onClick={() => onViewChange("day")}
      >
        Day
      </button>
      <button
        className={`rounded-md px-3 py-1 text-sm ${
          currentView === "week" ? "bg-[#7747FF] text-white" : "text-gray-400 hover:bg-[#3A3A3A] hover:text-white"
        }`}
        onClick={() => onViewChange("week")}
      >
        Week
      </button>
      <button
        className={`rounded-md px-3 py-1 text-sm ${
          currentView === "month" ? "bg-[#7747FF] text-white" : "text-gray-400 hover:bg-[#3A3A3A] hover:text-white"
        }`}
        onClick={() => onViewChange("month")}
      >
        Month
      </button>
    </div>
  )
}
