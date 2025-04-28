"use client"

import { AlertTriangle, Repeat, Clock } from "lucide-react"
import type { Appointment } from "./create-appointment-modal"
import type { BlackoutDay } from "./calendar-view"

interface MonthViewProps {
  currentDate: Date
  appointments: Appointment[]
  blackoutDays: BlackoutDay[]
  onCellClick: (date: string) => void
  onAppointmentClick: (appointment: Appointment) => void
  blackoutMode: boolean
  getBlackoutReason: (date: string) => string
  getTypeColor: (type: string) => string
}

export function MonthView({
  currentDate,
  appointments,
  blackoutDays,
  onCellClick,
  onAppointmentClick,
  blackoutMode,
  getBlackoutReason,
  getTypeColor,
}: MonthViewProps) {
  // Get the first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

  // Get the last day of the month
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = firstDayOfMonth.getDay()

  // Get the number of days in the month
  const daysInMonth = lastDayOfMonth.getDate()

  // Get the current day
  const today = new Date()

  // Check if a date is today
  function isToday(date: Date) {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Generate previous month days to fill the first week
  const prevMonthDays = []
  if (firstDayIndex > 0) {
    // Get the last day of the previous month
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
    const prevMonthDaysCount = prevMonthLastDay.getDate()

    for (let i = 0; i < firstDayIndex; i++) {
      const day = prevMonthDaysCount - firstDayIndex + i + 1
      const prevMonth = currentDate.getMonth() === 0 ? 12 : currentDate.getMonth()
      const prevYear = currentDate.getMonth() === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear()
      const date = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`

      prevMonthDays.push({
        date: day,
        fullDate: date,
        isCurrentMonth: false,
        isToday: isToday(new Date(prevYear, prevMonth - 1, day)),
        isBlackout: blackoutDays.some((bd) => bd.date === date),
        blackoutReason: getBlackoutReason(date),
      })
    }
  }

  // Generate current month days
  const currentMonthDays = []
  for (let i = 1; i <= daysInMonth; i++) {
    const date = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`

    currentMonthDays.push({
      date: i,
      fullDate: date,
      isCurrentMonth: true,
      isToday: isToday(new Date(currentDate.getFullYear(), currentDate.getMonth(), i)),
      isBlackout: blackoutDays.some((bd) => bd.date === date),
      blackoutReason: getBlackoutReason(date),
    })
  }

  // Generate next month days to fill the last week
  const nextMonthDays = []
  const remainingDays = 7 - ((prevMonthDays.length + currentMonthDays.length) % 7)
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      const nextMonth = currentDate.getMonth() === 11 ? 1 : currentDate.getMonth() + 2
      const nextYear = currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear()
      const date = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(i).padStart(2, "0")}`

      nextMonthDays.push({
        date: i,
        fullDate: date,
        isCurrentMonth: false,
        isToday: isToday(new Date(nextYear, nextMonth - 1, i)),
        isBlackout: blackoutDays.some((bd) => bd.date === date),
        blackoutReason: getBlackoutReason(date),
      })
    }
  }

  // Combine all days
  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]

  // Days of the week
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Get appointments for a specific day
  const getAppointmentsForDay = (date: string) => {
    return appointments.filter((appointment) => appointment.date === date).slice(0, 3) // Show max 3 appointments
  }

  // Format time for display
  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime.substring(0, 5)}-${endTime.substring(0, 5)}`
  }

  return (
    <div className="h-full w-full p-4 overflow-auto">
      {/* Week days header */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`text-center py-2 font-medium text-sm ${
              index === 0 || index === 6 ? "text-gray-500" : "text-gray-400"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 h-full">
        {allDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDay(day.fullDate)

          return (
            <div
              key={index}
              className={`relative min-h-[100px] p-2 rounded-md border border-[#2A2A2A] ${
                !day.isCurrentMonth
                  ? "bg-[#1A1A1A] bg-opacity-50 text-gray-600"
                  : day.isBlackout
                    ? "bg-red-900 bg-opacity-20 text-red-300"
                    : day.isToday
                      ? "bg-[#1E1E2F] bg-opacity-30 text-white border-[#7747FF]"
                      : "bg-[#1E1E1E] text-gray-300"
              } ${!blackoutMode ? "cursor-pointer hover:bg-[#2A2A2A] hover:bg-opacity-30" : ""} transition-colors`}
              onClick={() => {
                if (!blackoutMode && day.isCurrentMonth) {
                  onCellClick(day.fullDate)
                }
              }}
              title={day.isBlackout ? day.blackoutReason : undefined}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm ${day.isToday ? "font-bold" : ""}`}>{day.date}</span>
                <div className="flex gap-1">
                  {day.isToday && <div className="h-2 w-2 rounded-full bg-[#7747FF]"></div>}
                  {day.isBlackout && <div className="h-2 w-2 rounded-full bg-red-600"></div>}
                </div>
              </div>

              {/* Blackout mode indicator */}
              {blackoutMode && day.isCurrentMonth && !day.isBlackout && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    className="text-red-500 animate-pulse transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCellClick(day.fullDate)
                    }}
                  >
                    <AlertTriangle className="h-6 w-6" />
                  </button>
                </div>
              )}

              {/* Blackout label */}
              {day.isBlackout && <div className="mt-2 text-xs text-red-400">Unavailable</div>}

              {/* Display appointments */}
              {!blackoutMode && (
                <div className="mt-2 space-y-1">
                  {dayAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className={`rounded-sm px-1.5 py-0.5 text-xs truncate flex items-center gap-1 cursor-pointer hover:opacity-90 ${
                        appointment.status === "cancelled" ? "opacity-50 line-through" : ""
                      }`}
                      style={{ backgroundColor: getTypeColor(appointment.type) }}
                      onClick={(e) => {
                        e.stopPropagation()
                        onAppointmentClick(appointment)
                      }}
                    >
                      <div className="flex flex-col w-full">
                        <div className="flex items-center gap-1">
                          {appointment.frequency !== "one-off" && <Repeat className="h-3 w-3 flex-shrink-0" />}
                          <span className="truncate font-medium">{appointment.title}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] opacity-90">
                          <Clock className="h-2 w-2 flex-shrink-0" />
                          <span>{formatTimeRange(appointment.startTime, appointment.endTime)}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {dayAppointments.length > 0 && appointments.filter((a) => a.date === day.fullDate).length > 3 && (
                    <div className="text-xs text-gray-400 mt-1">
                      +{appointments.filter((a) => a.date === day.fullDate).length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
