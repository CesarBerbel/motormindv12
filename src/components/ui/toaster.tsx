"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

// ── Tipos ────────────────────────────────────────────────────
export type ToastVariant = "default" | "success" | "error" | "info"

interface ToastEntry {
  id: string
  variant?: ToastVariant
  title?: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toast: (entry: Omit<ToastEntry, "id">) => void
  dismiss: (id: string) => void
}

// ── Context ──────────────────────────────────────────────────
const ToastContext = React.createContext<ToastContextValue>({
  toast: () => {},
  dismiss: () => {},
})

export function useToast() {
  return React.useContext(ToastContext)
}

// ── Componente visual de cada toast ──────────────────────────
const variantClasses: Record<ToastVariant, string> = {
  default: "bg-slate-800 border-white/10 text-white",
  success: "bg-emerald-950 border-emerald-500/30 text-emerald-50",
  error: "bg-red-950 border-red-500/30 text-red-50",
  info: "bg-brand-950 border-brand-500/30 text-brand-50",
}

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  default: <Info className="size-4 shrink-0 text-slate-400" />,
  success: <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />,
  error: <AlertCircle className="size-4 shrink-0 text-red-400" />,
  info: <Info className="size-4 shrink-0 text-brand-400" />,
}

function ToastItem({
  entry,
  onDismiss,
}: {
  entry: ToastEntry
  onDismiss: (id: string) => void
}) {
  const variant = entry.variant ?? "default"
  return (
    <ToastPrimitives.Root
      className={cn(
        "group pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-xl border p-4 shadow-xl",
        "data-[state=open]:animate-fade-in data-[state=closed]:opacity-0",
        "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
        variantClasses[variant]
      )}
      duration={entry.duration ?? 4000}
      onOpenChange={(open) => { if (!open) onDismiss(entry.id) }}
      defaultOpen
    >
      {variantIcons[variant]}
      <div className="flex-1 min-w-0">
        {entry.title && (
          <ToastPrimitives.Title className="text-sm font-semibold leading-none mb-1">
            {entry.title}
          </ToastPrimitives.Title>
        )}
        {entry.description && (
          <ToastPrimitives.Description className="text-xs opacity-80 leading-relaxed">
            {entry.description}
          </ToastPrimitives.Description>
        )}
      </div>
      <ToastPrimitives.Close className="text-current opacity-50 hover:opacity-100 transition-opacity shrink-0">
        <X className="size-4" />
      </ToastPrimitives.Close>
    </ToastPrimitives.Root>
  )
}

// ── Provider + Viewport (envolve os children do layout) ──────
export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastEntry[]>([])

  const toast = React.useCallback((entry: Omit<ToastEntry, "id">) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { ...entry, id }])
  }, [])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      <ToastPrimitives.Provider>
        {children}
        {toasts.map((t) => (
          <ToastItem key={t.id} entry={t} onDismiss={dismiss} />
        ))}
        <ToastPrimitives.Viewport className="fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2" />
      </ToastPrimitives.Provider>
    </ToastContext.Provider>
  )
}
