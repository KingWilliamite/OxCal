"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Repeat, Tag, MapPin, Video, Phone } from "lucide-react"
import type { Appointment } from "./create-appointment-modal"

interface AppointmentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  appointment: Appointment | null
  onEdit: (appointment: Appointment) => void
  onDelete: (appointmentId: string) => void
  onCancel: (appointmentId: string) => void
}

export function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onDelete,
  onCancel,
}: AppointmentDetailsModalProps) {
  if (!appointment) return null

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return ""
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  // Get status label and color
  const getStatusInfo = () => {
    const now = new Date()
    const appointmentDate = new Date(appointment.date)
    const [hours, minutes] = appointment.startTime.split(":").map(Number)
    appointmentDate.setHours(hours, minutes)

    if (appointmentDate < now) {
      return { label: "Completed", color: "bg-green-700" }
    }

    return { label: "Upcoming", color: "bg-blue-700" }
  }

  // Get location type icon
  const getLocationTypeIcon = () => {
    switch (appointment.locationType) {
      case "in-person":
        return <MapPin className="h-5 w-5 text-gray-400" />
      case "video":
        return <Video className="h-5 w-5 text-gray-400" />
      case "phone":
        return <Phone className="h-5 w-5 text-gray-400" />
      default:
        return <MapPin className="h-5 w-5 text-gray-400" />
    }
  }

  // Get location type label
  const getLocationTypeLabel = () => {
    switch (appointment.locationType) {
      case "in-person":
        return "In Person"
      case "video":
        return "Video Call"
      case "phone":
        return "Phone Call"
      default:
        return "Other"
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{appointment.title}</DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
            <div>
              <div className="font-medium text-white">{formatDate(appointment.date)}</div>
              <div className="text-sm text-gray-400">
                {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Tag className="h-5 w-5 text-gray-400" />
            <div className="font-medium text-white">{appointment.type}</div>
          </div>

          {appointment.locationType && (
            <div className="flex items-start gap-3">
              {getLocationTypeIcon()}
              <div>
                <div className="font-medium text-white">{getLocationTypeLabel()}</div>
                {appointment.locationDetails && (
                  <div className="text-sm text-gray-400">{appointment.locationDetails}</div>
                )}
              </div>
            </div>
          )}

          {appointment.frequency !== "one-off" && (
            <div className="flex items-center gap-3">
              <Repeat className="h-5 w-5 text-gray-400" />
              <div className="font-medium text-white">
                {appointment.frequency.charAt(0).toUpperCase() + appointment.frequency.slice(1)} meeting
                {appointment.recurrenceEndDate && ` until ${formatDate(appointment.recurrenceEndDate)}`}
              </div>
            </div>
          )}

          {appointment.attendees && appointment.attendees.length > 0 && (
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <div className="font-medium text-white">Attendees</div>
                <div className="text-sm text-gray-400">{appointment.attendees.join(", ")}</div>
              </div>
            </div>
          )}

          {appointment.description && (
            <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
              <div className="font-medium text-white mb-2">Description</div>
              <div className="text-sm text-gray-300 whitespace-pre-wrap">{appointment.description}</div>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <div className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>{statusInfo.label}</div>
            {appointment.isRecurringInstance && (
              <div className="px-2 py-1 text-xs font-medium rounded-full bg-purple-700">Recurring Instance</div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 sticky bottom-0 pt-4 bg-[#1E1E1E] z-50">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onDelete(appointment.id)
                onClose()
              }}
              className="bg-transparent border-[#3A3A3A] text-red-400 hover:bg-red-900 hover:bg-opacity-20 hover:text-red-300"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onCancel(appointment.id)
                onClose()
              }}
              className="bg-transparent border-[#3A3A3A] text-yellow-400 hover:bg-yellow-900 hover:bg-opacity-20 hover:text-yellow-300"
            >
              Cancel
            </Button>
          </div>
          <Button
            onClick={() => {
              onEdit(appointment)
              onClose()
            }}
            className="bg-[#7747FF] text-white hover:bg-[#8A5CFF]"
          >
            Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
