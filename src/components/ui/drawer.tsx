"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DrawerProps {
  open: boolean
  onClose: () => void
  onCloseRequest?: () => void
  title: string
  description?: string
  children: React.ReactNode
  width?: string
}

export function Drawer({
  open,
  onClose,
  onCloseRequest,
  title,
  description,
  children,
  width = "max-w-2xl",
}: DrawerProps) {
  const handleClose = onCloseRequest ?? onClose

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose, onCloseRequest]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (typeof window === "undefined") return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-[2px] z-40"
            onClick={handleClose}
          />
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className={`fixed right-0 top-0 h-full ${width} w-full bg-slate-900 border-l border-white/10 z-50 flex flex-col shadow-2xl`}
          >
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-white">{title}</h2>
                {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose} aria-label="Fechar">
                <X className="size-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
