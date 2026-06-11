"use client"


import { format, subDays, startOfMonth, endOfMonth } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar as CalendarIcon, Check } from "lucide-react"
import { type DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react"

interface DateRangePickerProps {
  className?: React.HTMLAttributes<HTMLDivElement>;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
}

export function DateRangePicker({
  className,
  date,
  setDate,
}: DateRangePickerProps) {
  // 🌟 Estado local intermedio para aislar los clics antes de aplicar
  const [localDate, setLocalDate] = useState<DateRange | undefined>(date)
  const [isOpen, setIsOpen] = useState(false)

  // Sincronizamos el mes visible con la fecha inicial provisional
  const [currentMonth, setCurrentMonth] = useState<Date>(
    localDate?.from || new Date()
  )

  // 🌟 Manejo del ciclo de apertura: Cuando el usuario abre el Popover,
  // re-sincronizamos el estado local con el valor real actual del contexto.
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      setLocalDate(date)
      if (date?.from) {
        setCurrentMonth(date.from)
      }
    }
  }

  const presets = [
    { 
      label: "Hoy", 
      getRange: () => ({ from: new Date(), to: new Date() }) 
    },
    { 
      label: "Ayer", 
      getRange: () => ({ from: subDays(new Date(), 1), to: subDays(new Date(), 1) }) 
    },
    { 
      label: "Últimos 7 días", 
      getRange: () => ({ from: subDays(new Date(), 6), to: new Date() }) 
    },
    { 
      label: "Este Mes", 
      getRange: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) 
    },
  ]

  // Función para confirmar y subir el rango al Contexto global
  const handleApply = () => {
    setDate(localDate)
    setIsOpen(false)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-70 justify-start text-left font-normal bg-white h-9 border-slate-200 shadow-sm hover:bg-slate-50",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd LLL, yyyy", { locale: es })} -{" "}
                    {format(date.to, "dd LLL, yyyy", { locale: es })}
                  </>
                ) : (
                  format(date.from, "dd LLL, yyyy", { locale: es })
                )
              ) : (
                <span>Seleccionar rango de fechas</span>
              )}
            </Button>
          }
        />

        <PopoverContent className="w-auto p-0 border-none shadow-xl" align="start">
          <Card className="w-fit border-slate-200" size="sm">
            <CardContent className="p-3">
              <Calendar
                autoFocus
                mode="range"
                selected={localDate} 
                onSelect={setLocalDate} 
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                numberOfMonths={2}
                className="rounded-lg"
                captionLayout="dropdown"
                showOutsideDays={false}
              />
            </CardContent>
            
            <CardFooter className="flex flex-col gap-3 border-t p-3 bg-slate-50/50">
              <div className="flex flex-wrap gap-2 w-full">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-25 text-xs font-medium bg-white border-slate-200 shadow-sm hover:bg-slate-50"
                    onClick={() => {
                      const newRange = preset.getRange()
                      setLocalDate(newRange)
                      if (newRange.from) {
                        setCurrentMonth(newRange.from)
                      }
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <Button 
                className="w-full text-xs font-semibold h-9 shadow-sm bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                onClick={handleApply}
                disabled={!localDate?.from || !localDate?.to} 
              >
                <Check className="h-3.5 w-3.5" />
                Aplicar Rango
              </Button>
            </CardFooter>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  )
}