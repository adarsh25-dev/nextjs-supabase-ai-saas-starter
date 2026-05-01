"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

type AuthInputProps = React.ComponentProps<"input"> & {
  label: string
  error?: string
  helperText?: string
  showTogglePassword?: boolean
}

export function AuthInput({
  id,
  label,
  error,
  helperText,
  showTogglePassword = false,
  type = "text",
  className,
  value,
  defaultValue,
  onFocus,
  onBlur,
  onChange,
  ...props
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [hasValue, setHasValue] = useState(Boolean(value ?? defaultValue))

  const inputType = useMemo(() => {
    if (showTogglePassword && type === "password") {
      return isVisible ? "text" : "password"
    }
    return type
  }, [isVisible, showTogglePassword, type])

  return (
    <div className="space-y-1">
      <div className="relative pt-5">
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isFocused || hasValue
              ? "top-0 text-xs text-[hsl(var(--color-text-secondary))]"
              : "top-7 text-sm text-[hsl(var(--color-text-secondary)/0.75)]"
          )}
        >
          {label}
        </label>
        <input
          id={id}
          type={inputType}
          value={value}
          defaultValue={defaultValue}
          onFocus={(event) => {
            setIsFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setIsFocused(false)
            setHasValue(Boolean(event.target.value))
            onBlur?.(event)
          }}
          onChange={(event) => {
            setHasValue(Boolean(event.target.value))
            onChange?.(event)
          }}
          className={cn(
            "h-11 w-full appearance-none rounded-none border-x-0 border-t-0 border-b-2 border-[hsl(var(--color-text-primary)/0.08)] bg-transparent pr-9 text-[hsl(var(--color-text-primary))] shadow-none outline-none transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:border-x-0 focus:border-t-0 focus-visible:border-[hsl(var(--color-accent-soft))] focus-visible:ring-0",
            /* Hide placeholder while label sits in the field — avoids overlapping text */
            isFocused || hasValue
              ? "placeholder:text-[hsl(var(--color-text-secondary)/0.65)]"
              : "placeholder:text-transparent",
            className
          )}
          {...props}
        />
        <span
          className={cn(
            "pointer-events-none absolute bottom-0 left-0 h-[2px] w-full origin-left bg-[linear-gradient(90deg,hsl(var(--color-accent)),hsl(var(--color-accent-soft)))] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isFocused ? "scale-x-100" : "scale-x-0"
          )}
          aria-hidden
        />
        {showTogglePassword && type === "password" ? (
          <button
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
            className={cn(
              "absolute right-0 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center text-[hsl(var(--color-text-secondary))] transition-opacity",
              isFocused || hasValue ? "opacity-100" : "opacity-0"
            )}
            aria-label={isVisible ? "Hide password" : "Show password"}
            tabIndex={0}
          >
            {isVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : null}
      </div>
      <div className="min-h-5">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -2 }}
              className="text-xs text-[hsl(var(--color-danger))] [text-shadow:0_0_16px_hsl(var(--color-danger)/0.4)]"
            >
              {error}
            </motion.p>
          ) : helperText ? (
            <p key="helper" className="text-xs text-[hsl(var(--color-text-secondary)/0.85)]">
              {helperText}
            </p>
          ) : (
            <span key="empty" className="block h-4" />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
