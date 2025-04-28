"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, Repeat, Info } from "lucide-react"
import { CalendarHeader } from "./calendar-header"
import { WeekView } from "./week-view"
import { DayView } from "./day-view"
import { MonthView } from "./month-view"
import { CreateAppointmentModal, type Appointment } from "./create-appointment-modal"
import { BlackoutReasonModal } from "./blackout-reason-modal"
import { AppointmentDetailsModal } from "./appointment-details-modal"
import { v4 as uuidv4 } from "uuid"
import { expandRecurringAppointments } from "@/lib/recurring-appointments"

type ViewType = "day" | "week" | "month"

export interface BlackoutDay {
  date: string // Format: YYYY-MM-DD
  reason: string
}

export function CalendarView() {
  const [currentView, setCurrentView] = useState<ViewType>("week")
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [expandedAppointments, setExpandedAppointments] = useState<Appointment[]>([])
  const [blackoutDays, setBlackoutDays] = useState<BlackoutDay[]>([])
  const [showLegend, setShowLegend] = useState(false)

  // Current date state
  const [currentDate, setCurrentDate] = useState(new Date(2025, 3, 28)) // April 28, 2025

  // Blackout mode state
  const [blackoutMode, setBlackoutMode] = useState(false)

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isBlackoutReasonModalOpen, setIsBlackoutReasonModalOpen] = useState(false)
  const [isAppointmentDetailsModalOpen, setIsAppointmentDetailsModalOpen] = useState(false)

  // Selected date for operations
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedTime, setSelectedTime] = useState<string>("")

  // Selected appointment for viewing/editing
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null)

  // Update expanded appointments whenever base appointments change
  useEffect(() => {
    const expanded = expandRecurringAppointments(appointments)
    setExpandedAppointments(expanded)
  }, [appointments])

  // Format the current date for display in the header
  const formatHeaderDate = () => {
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

    if (currentView === "day") {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
    } else if (currentView === "week") {
      // Get the start and end of the week
      const weekStart = new Date(currentDate)
      const weekEnd = new Date(currentDate)

      // Adjust to the start of the week (Monday)
      const dayOfWeek = currentDate.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // If Sunday, go back 6 days, otherwise adjust to Monday
      weekStart.setDate(currentDate.getDate() + diff)

      // Set to end of week (Sunday)
      weekEnd.setDate(weekStart.getDate() + 6)

      // Format dates
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        // Same month
        return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}-${weekEnd.getDate()}, ${weekStart.getFullYear()}`
      } else if (weekStart.getFullYear() === weekEnd.getFullYear()) {
        // Different month, same year
        return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`
      } else {
        // Different month and year
        return `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()}, ${weekStart.getFullYear()} - ${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekEnd.getFullYear()}`
      }
    } else {
      // Month view
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    }
  }

  // Navigate to today
  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
  }

  // Navigate to previous period (day, week, or month)
  const goToPrevious = () => {
    const newDate = new Date(currentDate)

    if (currentView === "day") {
      newDate.setDate(newDate.getDate() - 1)
    } else if (currentView === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }

    setCurrentDate(newDate)
  }

  // Navigate to next period (day, week, or month)
  const goToNext = () => {
    const newDate = new Date(currentDate)

    if (currentView === "day") {
      newDate.setDate(newDate.getDate() + 1)
    } else if (currentView === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }

    setCurrentDate(newDate)
  }

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view)
    // Exit blackout mode when changing views
    if (blackoutMode) {
      setBlackoutMode(false)
    }
  }

  const handleCreateAppointment = (appointmentData: Omit<Appointment, "id">) => {
    if (editingAppointment) {
      // If editing a recurring instance, update all instances
      if (editingAppointment.isRecurringInstance && editingAppointment.originalAppointmentId) {
        // Find the original appointment
        const originalAppointment = appointments.find((app) => app.id === editingAppointment.originalAppointmentId)

        if (originalAppointment) {
          // Update the original appointment with new data
          const updatedAppointments = appointments.map((appointment) =>
            appointment.id === originalAppointment.id
              ? { ...appointmentData, id: originalAppointment.id }
              : appointment,
          )
          setAppointments(updatedAppointments)
        } else {
          // If original not found, just update this instance
          const updatedAppointments = appointments.map((appointment) =>
            appointment.id === editingAppointment.id ? { ...appointmentData, id: editingAppointment.id } : appointment,
          )
          setAppointments(updatedAppointments)
        }
      } else {
        // Regular edit of a single appointment
        const updatedAppointments = appointments.map((appointment) =>
          appointment.id === editingAppointment.id ? { ...appointmentData, id: editingAppointment.id } : appointment,
        )
        setAppointments(updatedAppointments)
      }
      setEditingAppointment(null)
    } else {
      // Create new appointment
      const newAppointment: Appointment = {
        ...appointmentData,
        id: uuidv4(),
      }
      setAppointments([...appointments, newAppointment])
    }
  }

  const handleCellClick = (date: string, time?: string) => {
    // If in blackout mode, handle blackout day selection
    if (blackoutMode) {
      setSelectedDate(date)
      setIsBlackoutReasonModalOpen(true)
      return
    }

    // Otherwise handle normal appointment creation
    setSelectedDate(date)
    if (time) setSelectedTime(time)
    setEditingAppointment(null)
    setIsCreateModalOpen(true)
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsAppointmentDetailsModalOpen(true)
  }

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment)
    setIsCreateModalOpen(true)
    setIsAppointmentDetailsModalOpen(false)
  }

  const handleDeleteAppointment = (appointmentId: string) => {
    // Check if this is a recurring instance
    const appointmentToDelete = expandedAppointments.find((app) => app.id === appointmentId)

    if (appointmentToDelete?.isRecurringInstance && appointmentToDelete.originalAppointmentId) {
      // If deleting a recurring instance, delete the original appointment
      setAppointments(appointments.filter((app) => app.id !== appointmentToDelete.originalAppointmentId))
    } else {
      // Regular delete
      setAppointments(appointments.filter((app) => app.id !== appointmentId))
    }
  }

  const handleCancelAppointment = (appointmentId: string) => {
    // Check if this is a recurring instance
    const appointmentToCancel = expandedAppointments.find((app) => app.id === appointmentId)

    if (appointmentToCancel?.isRecurringInstance && appointmentToCancel.originalAppointmentId) {
      // If canceling a recurring instance, cancel the original appointment
      setAppointments(
        appointments.map((app) =>
          app.id === appointmentToCancel.originalAppointmentId ? { ...app, status: "cancelled" } : app,
        ),
      )
    } else {
      // Regular cancel
      setAppointments(appointments.map((app) => (app.id === appointmentId ? { ...app, status: "cancelled" } : app)))
    }
  }

  const handleBlackoutButtonClick = () => {
    // Toggle blackout mode
    setBlackoutMode(!blackoutMode)
  }

  const handleAddBlackoutDay = (date: string, reason: string) => {
    // Check if the date is already a blackout day
    const existingIndex = blackoutDays.findIndex((bd) => bd.date === date)

    if (existingIndex >= 0) {
      // Update the reason if it already exists
      const updatedBlackoutDays = [...blackoutDays]
      updatedBlackoutDays[existingIndex] = { date, reason }
      setBlackoutDays(updatedBlackoutDays)
    } else {
      // Add new blackout day
      setBlackoutDays([...blackoutDays, { date, reason }])
    }
  }

  const isBlackoutDay = (date: string) => {
    return blackoutDays.some((bd) => bd.date === date)
  }

  const getBlackoutReason = (date: string) => {
    const blackoutDay = blackoutDays.find((bd) => bd.date === date)
    return blackoutDay?.reason || ""
  }

  // Format today's date for the Today button
  const formatTodayDate = () => {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  }

  // Get all unique meeting types for the legend
  const getMeetingTypes = () => {
    const types = new Set<string>()
    expandedAppointments.forEach((appointment) => {
      types.add(appointment.type)
    })
    return Array.from(types)
  }

  // Get color for a meeting type
  const getTypeColor = (type: string) => {
    // Map meeting types to colors
    const typeColors: Record<string, string> = {
      Consultation: "#7747FF",
      "Service Work": "#4285F4",
      "Sales Call": "#FF2D55",
      "Team Meeting": "#34A853",
      "Client Onboarding": "#FBBC05",
      "Project Review": "#EA4335",
      "Strategy Session": "#00C4CC",
      Interview: "#9C27B0",
    }

    return typeColors[type] || "#7747FF" // Default to purple
  }

  // Get Monday of the current week
  const getMonday = (date: Date) => {
    const day = date.getDay()
    const diff = date.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    return new Date(new Date(date).setDate(diff))
  }

  return (
    <div className="flex h-full flex-col bg-[#121212]">
      <div className="flex items-center justify-between border-b border-[#2A2A2A] px-6 py-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">{formatHeaderDate()}</h2>
          <div className="flex items-center gap-1">
            <button
              className="rounded-md p-1 hover:bg-[#2A2A2A]"
              onClick={goToPrevious}
              aria-label={`Previous ${currentView}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="rounded-md p-1 hover:bg-[#2A2A2A]" onClick={goToNext} aria-label={`Next ${currentView}`}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <button className="rounded-md bg-[#2A2A2A] px-3 py-1 text-sm hover:bg-[#3A3A3A]" onClick={goToToday}>
            Today
          </button>
        </div>

        <div className="flex items-center gap-4">
          <CalendarHeader currentView={currentView} onViewChange={handleViewChange} />
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2A2A2A] text-white hover:bg-[#3A3A3A]"
            title="Meeting Legend"
            onClick={() => setShowLegend(!showLegend)}
          >
            <Info className="h-4 w-4" />
          </button>
          <button
            className={`flex h-8 w-8 items-center justify-center rounded-full ${
              blackoutMode ? "bg-red-500" : "bg-red-700"
            } text-white hover:bg-red-600 transition-colors`}
            title={blackoutMode ? "Exit Blackout Mode" : "Enter Blackout Mode"}
            onClick={handleBlackoutButtonClick}
          >
            <AlertTriangle className="h-4 w-4" />
          </button>
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7747FF] text-white hover:bg-[#8A5CFF]"
            title="Add New Meeting"
            onClick={() => {
              setSelectedDate(formatTodayDate())
              setSelectedTime("")
              setEditingAppointment(null)
              setIsCreateModalOpen(true)
            }}
            disabled={blackoutMode}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Meeting Legend */}
      {showLegend && (
        <div className="bg-[#1E1E1E] border-b border-[#2A2A2A] px-6 py-3">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="text-sm font-medium text-white">Meeting Types:</div>
            {getMeetingTypes().map((type) => (
              <div key={type} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: getTypeColor(type) }}></div>
                <span className="text-sm text-gray-300">{type}</span>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-gray-300" />
              <span className="text-sm text-gray-300">Recurring Meeting</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {currentView === "day" && (
          <DayView
            currentDate={currentDate}
            appointments={expandedAppointments}
            blackoutDays={blackoutDays}
            onCellClick={handleCellClick}
            onAppointmentClick={handleAppointmentClick}
            blackoutMode={blackoutMode}
            getBlackoutReason={getBlackoutReason}
            getTypeColor={getTypeColor}
          />
        )}
        {currentView === "week" && (
          <WeekView
            currentDate={currentDate}
            appointments={expandedAppointments}
            blackoutDays={blackoutDays}
            onCellClick={handleCellClick}
            onAppointmentClick={handleAppointmentClick}
            blackoutMode={blackoutMode}
            getBlackoutReason={getBlackoutReason}
            getTypeColor={getTypeColor}
          />
        )}
        {currentView === "month" && (
          <MonthView
            currentDate={currentDate}
            appointments={expandedAppointments}
            blackoutDays={blackoutDays}
            onCellClick={handleCellClick}
            onAppointmentClick={handleAppointmentClick}
            blackoutMode={blackoutMode}
            getBlackoutReason={getBlackoutReason}
            getTypeColor={getTypeColor}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[#2A2A2A] px-6 py-2 text-sm text-gray-400">
        <div>
          {blackoutMode ? (
            <span className="text-red-400">Blackout Mode: Click on days to mark as unavailable</span>
          ) : (
            <span>&nbsp;</span> // Empty space to maintain layout
          )}
        </div>
        <div>Timezone: GMT-4 (Eastern Time)</div>
      </div>

      {/* Modals */}
      <CreateAppointmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateAppointment={handleCreateAppointment}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        editingAppointment={editingAppointment}
      />

      <BlackoutReasonModal
        isOpen={isBlackoutReasonModalOpen}
        onClose={() => setIsBlackoutReasonModalOpen(false)}
        onConfirm={(reason) => {
          handleAddBlackoutDay(selectedDate, reason)
          setIsBlackoutReasonModalOpen(false)
        }}
        selectedDate={selectedDate}
      />

      <AppointmentDetailsModal
        isOpen={isAppointmentDetailsModalOpen}
        onClose={() => setIsAppointmentDetailsModalOpen(false)}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onDelete={handleDeleteAppointment}
        onCancel={handleCancelAppointment}
      />
    </div>
  )
}
