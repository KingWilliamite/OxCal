"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface BlackoutReasonModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  selectedDate: string
}

export function BlackoutReasonModal({ isOpen, onClose, onConfirm, selectedDate }: BlackoutReasonModalProps) {
  const [reason, setReason] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.trim()) {
      onConfirm(reason)
      setReason("")
    }
  }

  // Format date for display
  const formatSelectedDate = () => {
    if (!selectedDate) return ""

    try {
      const date = new Date(selectedDate)
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      console.error("Error formatting date:", error)
      return selectedDate // Fallback to raw date string
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
          <DialogTitle>Mark as Unavailable</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="text-center mb-4">
            <p className="text-gray-300">{formatSelectedDate()}</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="reason" className="text-sm font-medium text-gray-300">
              Reason (required)
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md text-white min-h-[80px]"
              placeholder="Why are you unavailable on this day?"
              required
            />
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-[#3A3A3A] text-white hover:bg-[#2A2A2A] hover:text-white"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-red-700 text-white hover:bg-red-800" disabled={!reason.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
