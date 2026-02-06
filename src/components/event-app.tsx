"use client"

import { useState, useEffect } from "react"
import { DashboardView } from "./event-app/dashboard-view"
import { EventDetailView } from "./event-app/event-detail-view"
import { CalendarView } from "./event-app/calendar-view"
import { ProfileView } from "./event-app/profile-view"
import { AuthScreens } from "./event-app/auth-screens"
import { CreationModal } from "./event-app/creation-modal"
import { BottomNav } from "./event-app/bottom-nav"

export type View = "dashboard" | "event-detail" | "calendar" | "profile"
export type EventTab = "checklist" | "bitacora" | "equipo"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  age: number
  avatar: string
}

export function EventApp() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [eventTab, setEventTab] = useState<EventTab>("checklist")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("eventapp_user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem("eventapp_user")
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser)
    setIsAuthenticated(true)
    localStorage.setItem("eventapp_user", JSON.stringify(loggedInUser))
  }

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("eventapp_user", JSON.stringify(updatedUser))
  }

  const handleLogout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setCurrentView("dashboard")
    localStorage.removeItem("eventapp_user")
  }

  const handleEventClick = (eventId?: string) => {
    setCurrentView("event-detail")
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  // Show auth screens if not authenticated
  if (!isAuthenticated || !user) {
    return <AuthScreens onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Container */}
      <div className="mx-auto max-w-md min-h-screen flex flex-col relative bg-background shadow-xl lg:my-8 lg:rounded-3xl lg:min-h-[calc(100vh-4rem)] lg:border lg:border-border overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-20">
          {currentView === "dashboard" && (
            <DashboardView onEventClick={handleEventClick} userName={user.firstName} />
          )}
          {currentView === "event-detail" && (
            <EventDetailView
              activeTab={eventTab}
              onTabChange={setEventTab}
              onBack={() => setCurrentView("dashboard")}
            />
          )}
          {currentView === "calendar" && (
            <CalendarView onEventClick={handleEventClick} />
          )}
          {currentView === "profile" && (
            <ProfileView
              user={user}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* FAB - Create Button (hide on profile) */}
        {currentView !== "profile" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="fixed bottom-24 right-4 lg:absolute lg:bottom-24 lg:right-4 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all z-20"
            aria-label="Crear nuevo evento"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
        )}

        {/* Bottom Navigation */}
        <BottomNav currentView={currentView} onViewChange={setCurrentView} />

        {/* Creation Modal */}
        <CreationModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
        />
      </div>
    </div>
  )
}
