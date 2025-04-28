import { Calendar, BarChart3, Link2, Settings, Users } from "lucide-react"

export function DashboardSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#2A2A2A] bg-[#1E1E1E]">
      <div className="flex h-16 items-center px-6 border-b border-[#2A2A2A]">
        <h1 className="text-xl font-bold text-white">
          <span className="text-[#7747FF]">Ox</span>Cal
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg bg-[#2A2A2A] px-3 py-2 text-sm font-medium text-white"
            >
              <Calendar className="h-5 w-5 text-[#7747FF]" />
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
            >
              <Link2 className="h-5 w-5" />
              Booking Links
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
            >
              <Users className="h-5 w-5" />
              Team
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
            >
              <BarChart3 className="h-5 w-5" />
              Analytics
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 hover:bg-[#2A2A2A] hover:text-white"
            >
              <Settings className="h-5 w-5" />
              Settings
            </a>
          </li>
        </ul>
      </nav>

      <div className="px-3 py-4 border-t border-[#2A2A2A]">
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase text-gray-400">Connected Calendars</h3>
        <ul className="space-y-1">
          <li>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-[#4285F4]"></div>
              <span className="text-gray-300">Google Calendar</span>
            </div>
          </li>
          <li>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-[#00A2ED]"></div>
              <span className="text-gray-300">Outlook Calendar</span>
            </div>
          </li>
          <li>
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
              <div className="h-3 w-3 rounded-full bg-[#FF2D55]"></div>
              <span className="text-gray-300">Apple Calendar</span>
            </div>
          </li>
        </ul>
      </div>
    </aside>
  )
}
