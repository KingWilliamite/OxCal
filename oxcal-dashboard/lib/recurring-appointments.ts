import type { Appointment } from "@/components/calendar/create-appointment-modal"
import { v4 as uuidv4 } from "uuid"

// Function to get all dates between start and end date based on frequency
export function getRecurringDates(startDate: string, frequency: string, endDate?: string): string[] {
  if (!endDate || frequency === "one-off") {
    return [startDate]
  }

  const dates: string[] = []

  // Parse dates properly
  const start = new Date(startDate + "T00:00:00")
  const end = new Date(endDate + "T00:00:00")

  // Add the first date
  dates.push(formatDateString(start))

  // Get the day of week of the start date (0-6, where 0 is Sunday)
  const dayOfWeek = start.getDay()

  // Clone the start date for iterations
  let current = new Date(start)

  // Generate subsequent dates based on frequency
  while (true) {
    let next = new Date(current)

    switch (frequency) {
      case "daily":
        next.setDate(next.getDate() + 1)
        break
      case "weekly":
        next.setDate(next.getDate() + 7)
        break
      case "bi-weekly":
        next.setDate(next.getDate() + 14)
        break
      case "monthly":
        // For monthly, we need to maintain the same day of month
        const dayOfMonth = current.getDate()
        next.setMonth(next.getMonth() + 1)

        // Handle edge cases like Feb 30 -> Mar 30
        if (next.getDate() !== dayOfMonth) {
          // If the day changed, we went too far (e.g., Jan 31 -> Feb 28)
          next = new Date(next.getFullYear(), next.getMonth(), 0) // Last day of previous month
        }
        break
      default:
        break
    }

    // If we've gone past the end date, break
    if (next > end) {
      break
    }

    // Verify the day of week for weekly and bi-weekly recurrences
    if ((frequency === "weekly" || frequency === "bi-weekly") && next.getDay() !== dayOfWeek) {
      console.error("Day of week mismatch in recurring dates", {
        original: dayOfWeek,
        current: next.getDay(),
        date: next.toISOString(),
      })
      // Adjust to correct day of week if needed
      const diff = dayOfWeek - next.getDay()
      next.setDate(next.getDate() + diff)
    }

    // Add the date to our list
    dates.push(formatDateString(next))
    current = next
  }

  return dates
}

// Helper to format date as YYYY-MM-DD
function formatDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Function to expand recurring appointments into individual instances
export function expandRecurringAppointments(appointments: Appointment[]): Appointment[] {
  const expandedAppointments: Appointment[] = []

  appointments.forEach((appointment) => {
    if (appointment.frequency === "one-off" || !appointment.recurrenceEndDate) {
      expandedAppointments.push(appointment)
      return
    }

    // Get all dates for this recurring appointment
    const dates = getRecurringDates(appointment.date, appointment.frequency, appointment.recurrenceEndDate)

    // Create an appointment instance for each date
    dates.forEach((date, index) => {
      if (index === 0) {
        // Use the original appointment for the first date
        expandedAppointments.push({
          ...appointment,
          isRecurringInstance: false,
        })
      } else {
        // Create new instances for subsequent dates
        expandedAppointments.push({
          ...appointment,
          id: uuidv4(), // Generate a new ID for each instance
          date: date,
          isRecurringInstance: true,
          originalAppointmentId: appointment.id,
        })
      }
    })
  })

  return expandedAppointments
}
