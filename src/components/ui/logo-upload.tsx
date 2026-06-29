"use client"

import { useRef } from "react"
import Image from "next/image"
import { Camera, X } from "lucide-react"

interface LogoUploadProps {
  value?: string
  onChange: (base64: string | undefined) => void
}

export function LogoUpload({ value, onChange }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert("Imagem muito grande. Máximo 2 MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => onChange(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        role="button"
        tabIndex={0}
        aria-label="Fazer upload do logo"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className="relative size-28 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-brand-500/50 hover:bg-white/5 transition-all group"
      >
        {value ? (
          <>
            <Image src={value} alt="Logo da oficina" fill className="object-contain p-1" unoptimized />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <Camera className="size-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-500">
            <Camera className="size-8" />
            <span className="text-xs">Logo</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          {value ? "Alterar imagem" : "Upload do logo"}
        </button>
        {value && (
          <>
            <span className="text-slate-600">·</span>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-0.5"
            >
              <X className="size-3" /> Remover
            </button>
          </>
        )}
      </div>
      <p className="text-xs text-slate-600">PNG, JPG ou SVG · máx. 2 MB</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
