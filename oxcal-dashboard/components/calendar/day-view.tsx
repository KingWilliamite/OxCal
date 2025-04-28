"use client"

import { Clock, AlertTriangle, Repeat } from "lucide-react"
import type { Appointment } from "./create-appointment-modal"
import type { BlackoutDay } from "./calendar-view"

interface DayViewProps {
  currentDate: Date
  appointments: Appointment[]
  blackoutDays: BlackoutDay[]
  onCellClick: (date: string, time?: string) => void
  onAppointmentClick: (appointment: Appointment) => void
  blackoutMode: boolean
  getBlackoutReason: (date: string) => string
  getTypeColor: (type: string) => string
}

export function DayView({
  currentDate,
  appointments,
  blackoutDays,
  onCellClick,
  onAppointmentClick,
  blackoutMode,
  getBlackoutReason,
  getTypeColor,
}: DayViewProps) {
  // Format the date
  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, "0")
  const day = String(currentDate.getDate()).padStart(2, "0")
  const formattedDate = `${year}-${month}-${day}`

  const isBlackout = blackoutDays.some((bd) => bd.date === formattedDate)
  const blackoutReason = getBlackoutReason(formattedDate)

  // Get day name
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Check if a date is today
  function isToday(date: Date) {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const currentDay = {
    name: dayNames[currentDate.getDay()],
    date: String(currentDate.getDate()),
    month: monthNames[currentDate.getMonth()],
    year: String(currentDate.getFullYear()),
    fullDate: formattedDate,
    isToday: isToday(currentDate),
    isBlackout,
    blackoutReason,
  }

  // Time slots - expanded to include early morning and evening
  const timeSlots = [
    "12 AM",
    "1 AM",
    "2 AM",
    "3 AM",
    "4 AM",
    "5 AM",
    "6 AM",
    "7 AM",
    "8 AM",
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
    "6 PM",
    "7 PM",
    "8 PM",
    "9 PM",
    "10 PM",
    "11 PM",
  ]

  // Helper function to convert time string to 24-hour format
  const convertTo24Hour = (timeStr: string) => {
    const [time, modifier] = timeStr.split(" ")
    let [hours, minutes] = time.split(":").map(Number)

    if (minutes === undefined) {
      minutes = 0
      hours = Number.parseInt(time)
    }

    if (modifier === "PM" && hours < 12) hours += 12
    if (modifier === "AM" && hours === 12) hours = 0

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
  }

  // Helper function to convert 24-hour format to hour index
  const getHourIndex = (time24: string) => {
    const [hours, minutes] = time24.split(":").map(Number)
    return hours
  }

  // Calculate appointment duration in hours
  const calculateDuration = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)

    let durationHours = endHours - startHours
    let durationMinutes = endMinutes - startMinutes

    if (durationMinutes < 0) {
      durationHours -= 1
      durationMinutes += 60
    }

    return durationHours + durationMinutes / 60
  }

  // Process appointments for the day view
  const processedAppointments = appointments
    .filter((appointment) => appointment.date === formattedDate)
    .map((appointment) => {
      const startHourIndex = getHourIndex(appointment.startTime)
      const duration = calculateDuration(appointment.startTime, appointment.endTime)

      return {
        ...appointment,
        startHourIndex,
        duration,
        heightInHours: duration,
      }
    })

  // Get current time for the time indicator
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentTimePosition = ((currentHour * 60 + currentMinute) * 60) / 60

  return (
    <div className="relative h-full w-full overflow-auto">
      {/* Day header */}
      <div className="sticky top-0 z-30 grid grid-cols-[10%_90%] border-b border-[#2A2A2A] bg-[#121212]">
        {/* Time column header */}
        <div className="flex items-center justify-center p-4 border-r border-[#2A2A2A] bg-[#1A1A1A]">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Time</span>
          </div>
        </div>

        {/* Day header */}
        <div
          className={`flex flex-col items-center justify-center p-4 text-center ${
            currentDay.isBlackout ? "bg-[#2D1A1A]" : currentDay.isToday ? "bg-[#1E1E2F]" : "bg-[#1A1A1A]"
          }`}
        >
          <div className={`text-sm font-medium ${currentDay.isBlackout ? "text-red-300" : "text-white"}`}>
            {currentDay.name}
          </div>
          <div
            className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${
              currentDay.isBlackout
                ? "bg-red-900 text-red-100"
                : currentDay.isToday
                  ? "bg-[#7747FF] text-white"
                  : "bg-[#2A2A2A] text-white"
            }`}
          >
            {currentDay.date}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {currentDay.month} {currentDay.year}
          </div>
          {currentDay.isBlackout && <div className="mt-1 text-xs text-red-400">Unavailable</div>}

          {/* Blackout mode indicator */}
          {blackoutMode && !currentDay.isBlackout && (
            <button
              className="mt-2 text-red-500 animate-pulse transition-opacity"
              onClick={() => onCellClick(formattedDate)}
            >
              <AlertTriangle className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Calendar grid */}
      <div className="relative">
        {/* Grid with time slots - fixed height for all cells */}
        <div className="grid grid-cols-[10%_90%]" style={{ height: `${timeSlots.length * 60}px` }}>
          {/* Time labels */}
          {timeSlots.map((time, index) => (
            <div
              key={index}
              className="sticky left-0 z-20 flex h-[60px] items-center justify-end pr-4 text-xs text-gray-500 bg-[#121212] border-b border-r border-[#2A2A2A]"
              style={{ gridRow: index + 1, gridColumn: 1 }}
            >
              {time}
            </div>
          ))}

          {/* Grid cells - explicitly set height for all cells */}
          {timeSlots.map((timeSlot, timeIndex) => (
            <div
              key={timeIndex}
              className={`h-[60px] border-b border-r border-[#2A2A2A] ${
                currentDay.isBlackout
                  ? "bg-red-900 bg-opacity-20"
                  : currentDay.isToday
                    ? "bg-[#1E1E2F] bg-opacity-30"
                    : ""
              } relative ${!blackoutMode ? "cursor-pointer hover:bg-[#2A2A2A] hover:bg-opacity-30" : ""} transition-colors`}
              style={{
                gridRow: timeIndex + 1,
                gridColumn: 2,
              }}
              onClick={() => {
                if (!blackoutMode && !currentDay.isBlackout) {
                  // Convert timeSlot to 24-hour format for the form
                  const time24 = convertTo24Hour(timeSlot)
                  onCellClick(formattedDate, time24)
                }
              }}
              title={currentDay.isBlackout ? currentDay.blackoutReason : undefined}
            />
          ))}

          {/* Render appointments with proper height based on duration */}
          {processedAppointments.map((appointment) => {
            const isShortAppointment = appointment.heightInHours < 0.5

            return (
              <div
                key={appointment.id}
                className={`absolute left-[10%] right-0 mx-1 rounded-sm px-2 overflow-hidden text-xs text-white cursor-pointer hover:opacity-90 z-10 ${
                  appointment.status === "cancelled" ? "opacity-50 line-through" : ""
                }`}
                style={{
                  backgroundColor: getTypeColor(appointment.type),
                  top: `${appointment.startHourIndex * 60}px`,
                  height: `${Math.max(appointment.heightInHours * 60, 22)}px`, // Minimum height of 22px
                  maxHeight: `${appointment.heightInHours * 60 - 2}px`,
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  onAppointmentClick(appointment)
                }}
              >
                <div className="flex flex-col h-full w-full justify-center">
                  {isShortAppointment ? (
                    <div className="truncate font-medium">{appointment.title}</div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        {appointment.frequency !== "one-off" && <Repeat className="h-3 w-3 flex-shrink-0" />}
                        <span className="font-medium truncate">{appointment.title}</span>
                      </div>
                      <div className="text-xs opacity-80 mt-1">
                        {appointment.startTime.substring(0, 5)} - {appointment.endTime.substring(0, 5)}
                      </div>
                      {appointment.heightInHours > 1 && appointment.description && (
                        <div className="text-xs opacity-70 mt-1 line-clamp-2">{appointment.description}</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Current time indicator - only show for today */}
        {currentDay.isToday && (
          <div
            className="absolute left-[10%] right-0 z-25 h-0.5 bg-[#7747FF]"
            style={{ top: `${currentTimePosition}px` }}
          >
            <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-[#7747FF]"></div>
          </div>
        )}
      </div>
    </div>
  )
}
