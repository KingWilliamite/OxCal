"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface BlackoutDayModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  selectedDate: string
  isRemoving: boolean
}

export function BlackoutDayModal({ isOpen, onClose, onConfirm, selectedDate, isRemoving }: BlackoutDayModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-2" />
          <DialogTitle>{isRemoving ? "Remove Blackout Day?" : "Mark as Blackout Day?"}</DialogTitle>
        </DialogHeader>

        <div className="py-4 text-center">
          <p className="text-gray-300">
            {isRemoving
              ? `Are you sure you want to remove the blackout status for ${selectedDate}?`
              : `Are you sure you want to mark ${selectedDate} as a blackout day? This will block all appointments for this day.`}
          </p>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="bg-transparent border-[#3A3A3A] text-white hover:bg-[#2A2A2A] hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={isRemoving ? "bg-gray-600 hover:bg-gray-700" : "bg-red-700 hover:bg-red-800"}
          >
            {isRemoving ? "Remove Blackout" : "Confirm Blackout"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
