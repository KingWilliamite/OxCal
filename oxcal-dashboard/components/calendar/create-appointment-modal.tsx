"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Clock, Users, CalendarIcon, Repeat, Calendar, Tag, Plus, X, MapPin, Video, Phone } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"

// More flexible meeting types
export type AppointmentType = string
export type AppointmentFrequency = "one-off" | "daily" | "weekly" | "bi-weekly" | "monthly"
export type LocationType = "in-person" | "video" | "phone" | "other"

export interface Appointment {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  type: AppointmentType
  frequency: AppointmentFrequency
  locationType: LocationType
  locationDetails?: string
  recurrenceEndDate?: string
  attendees?: string[]
  description?: string
  status?: "scheduled" | "cancelled" | "completed"
  isRecurringInstance?: boolean
  originalAppointmentId?: string
}

interface CreateAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateAppointment: (appointment: Omit<Appointment, "id">) => void
  selectedDate?: string
  selectedTime?: string
  editingAppointment?: Appointment | null
}

// Default meeting types
const DEFAULT_MEETING_TYPES = [
  "Consultation",
  "Service Work",
  "Sales Call",
  "Team Meeting",
  "Client Onboarding",
  "Project Review",
  "Strategy Session",
  "Interview",
]

export function CreateAppointmentModal({
  isOpen,
  onClose,
  onCreateAppointment,
  selectedDate,
  selectedTime,
  editingAppointment,
}: CreateAppointmentModalProps) {
  const [title, setTitle] = useState("")
  const [date, setDate] = useState(selectedDate || "")
  const [startTime, setStartTime] = useState(selectedTime || "")
  const [endTime, setEndTime] = useState("")
  const [type, setType] = useState<AppointmentType>("Consultation")
  const [frequency, setFrequency] = useState<AppointmentFrequency>("one-off")
  const [locationType, setLocationType] = useState<LocationType>("in-person")
  const [locationDetails, setLocationDetails] = useState("")
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("")
  const [attendees, setAttendees] = useState("")
  const [description, setDescription] = useState("")
  const [customType, setCustomType] = useState("")
  const [showCustomType, setShowCustomType] = useState(false)
  const [meetingTypes, setMeetingTypes] = useState<string[]>(DEFAULT_MEETING_TYPES)

  // Load form with editing appointment data if provided
  useEffect(() => {
    if (editingAppointment) {
      setTitle(editingAppointment.title)
      setDate(editingAppointment.date)
      setStartTime(editingAppointment.startTime)
      setEndTime(editingAppointment.endTime)
      setType(editingAppointment.type)
      setFrequency(editingAppointment.frequency)
      setLocationType(editingAppointment.locationType || "in-person")
      setLocationDetails(editingAppointment.locationDetails || "")
      setRecurrenceEndDate(editingAppointment.recurrenceEndDate || "")
      setAttendees(editingAppointment.attendees?.join(", ") || "")
      setDescription(editingAppointment.description || "")

      // If the type is not in our default list, show custom type input
      if (!DEFAULT_MEETING_TYPES.includes(editingAppointment.type)) {
        setShowCustomType(true)
        setCustomType(editingAppointment.type)
      }
    } else {
      // Reset form when not editing
      setTitle("")
      setDate(selectedDate || "")
      setStartTime(selectedTime || "")
      setEndTime("")
      setType("Consultation")
      setFrequency("one-off")
      setLocationType("in-person")
      setLocationDetails("")
      setRecurrenceEndDate("")
      setAttendees("")
      setDescription("")
      setCustomType("")
      setShowCustomType(false)
    }
  }, [editingAppointment, selectedDate, selectedTime])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Use custom type if provided
    const finalType = showCustomType ? customType : type

    // Add custom type to the list if it's new
    if (showCustomType && customType && !meetingTypes.includes(customType)) {
      setMeetingTypes([...meetingTypes, customType])
    }

    const appointmentData: Omit<Appointment, "id"> = {
      title,
      date,
      startTime,
      endTime,
      type: finalType,
      frequency,
      locationType,
      locationDetails,
      attendees: attendees
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a),
      description,
      status: "scheduled",
    }

    // Only include recurrenceEndDate if it's a recurring meeting
    if (frequency !== "one-off") {
      appointmentData.recurrenceEndDate = recurrenceEndDate
    }

    onCreateAppointment(appointmentData)
    onClose()
  }

  const handleAddCustomType = () => {
    if (customType && !meetingTypes.includes(customType)) {
      setMeetingTypes([...meetingTypes, customType])
      setType(customType)
      setShowCustomType(false)
      setCustomType("")
    }
  }

  // Get location type icon
  const getLocationTypeIcon = (type: LocationType) => {
    switch (type) {
      case "in-person":
        return <MapPin className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "phone":
        return <Phone className="h-4 w-4" />
      default:
        return <MapPin className="h-4 w-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] pb-12">
        <DialogHeader>
          <DialogTitle>{editingAppointment ? "Edit Appointment" : "Create New Appointment"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-gray-300">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white"
              placeholder="Meeting title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="date" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Type
              </label>
              {showCustomType ? (
                <div className="flex gap-2">
                  <input
                    id="customType"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white"
                    placeholder="Custom meeting type"
                    required
                  />
                  <Button type="button" onClick={handleAddCustomType} className="bg-[#3A3A3A] hover:bg-[#4A4A4A] px-2">
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowCustomType(false)}
                    className="bg-[#3A3A3A] hover:bg-[#4A4A4A] px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white"
                  >
                    {meetingTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={() => setShowCustomType(true)}
                    className="bg-[#3A3A3A] hover:bg-[#4A4A4A] px-2"
                    title="Add custom type"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startTime" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time
              </label>
              <input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="endTime" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                End Time
              </label>
              <input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="locationType" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Type
            </label>
            <select
              id="locationType"
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as LocationType)}
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white"
            >
              <option value="in-person">In Person</option>
              <option value="video">Video Call</option>
              <option value="phone">Phone Call</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="locationDetails" className="text-sm font-medium text-gray-300">
              Location Details
            </label>
            <input
              id="locationDetails"
              value={locationDetails}
              onChange={(e) => setLocationDetails(e.target.value)}
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white"
              placeholder={
                locationType === "in-person"
                  ? "Address or meeting room"
                  : locationType === "video"
                    ? "Zoom or Google Meet link"
                    : locationType === "phone"
                      ? "Phone number"
                      : "Location details"
              }
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="frequency" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Frequency
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as AppointmentFrequency)}
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white"
            >
              <option value="one-off">One-off Meeting</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="bi-weekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Show recurrence end date only for recurring meetings */}
          {frequency !== "one-off" && (
            <div className="space-y-2">
              <label htmlFor="recurrenceEndDate" className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recurrence End Date
              </label>
              <input
                id="recurrenceEndDate"
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="attendees" className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Attendees (comma separated)
            </label>
            <input
              id="attendees"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white"
              placeholder="john@example.com, jane@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white min-h-[80px]"
              placeholder="Meeting details..."
            />
          </div>

          <DialogFooter className="mt-6 sticky bottom-0 pt-4 bg-[#1E1E1E] z-50">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-[#3A3A3A] text-white hover:bg-[#2A2A2A] hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-[#7747FF] text-white hover:bg-[#8A5CFF]">
              {editingAppointment ? "Update Appointment" : "Create Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
