"use client"

import React from "react"
import { Clock, AlertTriangle, Repeat } from "lucide-react"
import type { Appointment } from "./create-appointment-modal"
import type { BlackoutDay } from "./calendar-view"

interface WeekViewProps {
  currentDate: Date
  appointments: Appointment[]
  blackoutDays: BlackoutDay[]
  onCellClick: (date: string, time?: string) => void
  onAppointmentClick: (appointment: Appointment) => void
  blackoutMode: boolean
  getBlackoutReason: (date: string) => string
  getTypeColor: (type: string) => string
}

export function WeekView({
  currentDate,
  appointments,
  blackoutDays,
  onCellClick,
  onAppointmentClick,
  blackoutMode,
  getBlackoutReason,
  getTypeColor,
}: WeekViewProps) {
  // Get the Monday of the current week
  const getMonday = (date: Date) => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(date.setDate(diff))
  }

  const monday = getMonday(new Date(currentDate))

  // Check if a date is today
  function isToday(date: Date) {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Generate days of the week
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const formattedDate = `${year}-${month}-${day}`

    const dayIsToday = isToday(date)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6 // 0 = Sunday, 6 = Saturday
    const isBlackout = blackoutDays.some((bd) => bd.date === formattedDate)
    const blackoutReason = getBlackoutReason(formattedDate)

    return {
      name: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
      date: String(date.getDate()),
      fullDate: formattedDate,
      isToday: dayIsToday,
      isWeekend,
      isBlackout,
      blackoutReason,
    }
  })

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

  // Process appointments for the week view
  const processedAppointments = appointments
    .filter((appointment) => days.some((day) => day.fullDate === appointment.date))
    .map((appointment) => {
      const startHourIndex = getHourIndex(appointment.startTime)
      const duration = calculateDuration(appointment.startTime, appointment.endTime)
      const dayIndex = days.findIndex((day) => day.fullDate === appointment.date)

      return {
        ...appointment,
        startHourIndex,
        duration,
        dayIndex,
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
      {/* Days header */}
      <div className="sticky top-0 z-30 grid grid-cols-8 border-b border-[#2A2A2A] bg-[#121212]">
        {/* Time column header */}
        <div className="flex items-center justify-center p-4 border-r border-[#2A2A2A] bg-[#1A1A1A]">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
            <Clock className="h-4 w-4" />
            <span>Time</span>
          </div>
        </div>

        {/* Day headers */}
        {days.map((day, index) => (
          <div
            key={index}
            className={`flex flex-col items-center justify-center p-4 text-center ${
              day.isToday ? "bg-[#1E1E2F]" : day.isBlackout ? "bg-[#2D1A1A]" : day.isWeekend ? "bg-[#1A1A1A]" : ""
            }`}
          >
            <div
              className={`text-sm font-medium ${
                day.isToday ? "text-white" : day.isBlackout ? "text-red-300" : "text-gray-400"
              }`}
            >
              {day.name}
            </div>
            <div
              className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${
                day.isToday ? "bg-[#7747FF] text-white" : day.isBlackout ? "bg-red-900 text-red-100" : "text-gray-400"
              }`}
            >
              {day.date}
            </div>
            {day.isBlackout && <div className="mt-1 text-xs text-red-400">Unavailable</div>}
            {blackoutMode && !day.isBlackout && (
              <button
                className="mt-2 text-red-500 animate-pulse transition-opacity"
                onClick={() => onCellClick(day.fullDate)}
              >
                <AlertTriangle className="h-5 w-5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="relative">
        {/* Grid with time slots - fixed height for all cells */}
        <div className="grid grid-cols-8" style={{ height: `${timeSlots.length * 60}px` }}>
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
            <React.Fragment key={timeIndex}>
              {days.map((day, dayIndex) => (
                <div
                  key={`${timeIndex}-${dayIndex}`}
                  className={`h-[60px] border-b border-r border-[#2A2A2A] ${
                    day.isBlackout
                      ? "bg-red-900 bg-opacity-20"
                      : day.isToday
                        ? "bg-[#1E1E2F] bg-opacity-30"
                        : day.isWeekend
                          ? "bg-[#1A1A1A]"
                          : ""
                  } relative ${!blackoutMode ? "cursor-pointer hover:bg-[#2A2A2A] hover:bg-opacity-30" : ""} transition-colors`}
                  style={{
                    gridRow: timeIndex + 1,
                    gridColumn: dayIndex + 2,
                  }}
                  onClick={() => {
                    if (!blackoutMode && !day.isBlackout) {
                      // Convert timeSlot to 24-hour format for the form
                      const time24 = convertTo24Hour(timeSlot)
                      onCellClick(day.fullDate, time24)
                    }
                  }}
                  title={day.isBlackout ? day.blackoutReason : undefined}
                />
              ))}
            </React.Fragment>
          ))}

          {/* Render appointments with proper height based on duration */}
          {processedAppointments.map((appointment) => {
            const isShortAppointment = appointment.heightInHours < 0.5

            return (
              <div
                key={appointment.id}
                className={`absolute mx-1 rounded-sm px-2 overflow-hidden text-xs text-white cursor-pointer hover:opacity-90 z-10 ${
                  appointment.status === "cancelled" ? "opacity-50 line-through" : ""
                }`}
                style={{
                  backgroundColor: getTypeColor(appointment.type),
                  top: `${appointment.startHourIndex * 60}px`,
                  height: `${Math.max(appointment.heightInHours * 60, 22)}px`, // Minimum height of 22px
                  maxHeight: `${appointment.heightInHours * 60 - 2}px`,
                  left: `${(appointment.dayIndex + 1) * 12.5}%`,
                  right: `${(7 - appointment.dayIndex) * 12.5 - 12.5}%`,
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

        {/* Current time indicator - only show if today is in the current week */}
        {days.some((day) => day.isToday) && (
          <div
            className="absolute left-[12.5%] right-0 z-25 h-0.5 bg-[#7747FF]"
            style={{
              top: `${currentTimePosition}px`,
              left: `${12.5 + days.findIndex((day) => day.isToday) * 12.5}%`,
            }}
          >
            <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-[#7747FF]"></div>
          </div>
        )}
      </div>
    </div>
  )
}
