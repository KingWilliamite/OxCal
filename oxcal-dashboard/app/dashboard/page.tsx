import { CalendarView } from "@/components/calendar/calendar-view"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default function DashboardPage() {
  return (
    <div className="flex h-screen w-full bg-[#121212] text-white">
      <DashboardSidebar />
      <main className="flex-1 overflow-hidden">
        <CalendarView />
      </main>
    </div>
  )
}
