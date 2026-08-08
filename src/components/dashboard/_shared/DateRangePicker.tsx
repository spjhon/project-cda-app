"use client";

import { useContext, useState } from "react";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { EntryOrdersContext } from "@/contexts/EntryOrdersContext";

interface DateRangePickerProps {
  className?: React.HTMLAttributes<HTMLDivElement>;
}

export function DateRangePicker({ className }: DateRangePickerProps) {
  const EntryOrdersContextRecived = useContext(EntryOrdersContext);
  const { query } = EntryOrdersContextRecived?.entryOrdersTableData || {};

  const { dateRange = undefined, setDateRange = () => {} } = query || {};

  // 🌟 Estado local borrador del rango
  const [localDate, setLocalDate] = useState<DateRange | undefined>(dateRange);
  const [isOpen, setIsOpen] = useState(false);

  // 🌟 Estado independiente para el mes visible de cada calendario
  const [fromMonth, setFromMonth] = useState<Date>(
    localDate?.from || new Date()
  );
  const [toMonth, setToMonth] = useState<Date>(
    localDate?.to || localDate?.from || new Date()
  );

  // Sincronizar estados locales al abrir el Popover
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setLocalDate(dateRange);
      if (dateRange?.from) {
        setFromMonth(dateRange.from);
      }
      if (dateRange?.to) {
        setToMonth(dateRange.to);
      } else if (dateRange?.from) {
        setToMonth(dateRange.from);
      }
    }
  };

  const presets = [
    {
      label: "Hoy",
      getRange: () => {
        const now = new Date();
        return { from: now, to: now };
      },
    },
    {
      label: "Ayer",
      getRange: () => {
        const temp = subDays(new Date(), 1);
        return { from: temp, to: temp };
      },
    },
    {
      label: "Últimos 7 días",
      getRange: () => ({ from: subDays(new Date(), 6), to: new Date() }),
    },
    {
      label: "Este Mes",
      getRange: () => ({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }),
    },
  ];

  // Handler para cuando se selecciona un día en el Calendario "Desde"
  const handleSelectFrom = (selectedDay: Date | undefined) => {
    setLocalDate((prev) => {
      // Si la nueva fecha 'from' queda después de 'to', reseteamos 'to' para mantener coherencia
      if (selectedDay && prev?.to && selectedDay > prev.to) {
        return { from: selectedDay, to: undefined };
      }
      return { from: selectedDay, to: prev?.to };
    });
  };

  // Handler para cuando se selecciona un día en el Calendario "Hasta"
  const handleSelectTo = (selectedDay: Date | undefined) => {
    setLocalDate((prev) => {
      // Si la nueva fecha 'to' es menor que 'from', la asignamos como nuevo 'from'
      if (selectedDay && prev?.from && selectedDay < prev.from) {
        return { from: selectedDay, to: undefined };
      }
      return { from: prev?.from, to: selectedDay };
    });
  };

  const handleApply = () => {
    setDateRange(localDate);
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          render={
            <Button
              id="date"
              variant="outline"
              className={cn(
                "w-70 justify-start text-left font-normal bg-background h-9 border-border shadow-sm hover:bg-muted hover:text-muted-foreground",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd LLL, yyyy", { locale: es })} -{" "}
                    {format(dateRange.to, "dd LLL, yyyy", { locale: es })}
                  </>
                ) : (
                  format(dateRange.from, "dd LLL, yyyy", { locale: es })
                )
              ) : (
                <span>Seleccionar rango de fechas</span>
              )}
            </Button>
          }
        />

        <PopoverContent
          className="w-auto p-0 border-none shadow-xl"
          align="start"
        >
          <Card className="w-fit border-border bg-card" size="sm">
            {/* Contenedor Flex para renderizar los dos calendarios lado a lado */}
            <CardContent className="p-3 flex flex-col md:flex-row gap-4 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* 1. CALENDARIO DESDE */}
              <div className="flex flex-col gap-1 pt-2 md:pt-0">
                <span className="text-xs font-semibold text-muted-foreground px-2">
                  Desde:
                </span>
                <Calendar
                  autoFocus
                  mode="single"
                  selected={localDate?.from}
                  onSelect={handleSelectFrom}
                  month={fromMonth}
                  onMonthChange={setFromMonth}
                  numberOfMonths={1}
                  className="rounded-lg"
                  captionLayout="dropdown"
                  showOutsideDays={false}
                />
              </div>

              {/* 2. CALENDARIO HASTA */}
              <div className="flex flex-col gap-1 pt-2 md:pt-0 md:pl-4">
                <span className="text-xs font-semibold text-muted-foreground px-2">
                  Hasta:
                </span>
                <Calendar
                  mode="single"
                  selected={localDate?.to}
                  onSelect={handleSelectTo}
                  month={toMonth}
                  onMonthChange={setToMonth}
                  numberOfMonths={1}
                  className="rounded-lg"
                  captionLayout="dropdown"
                  showOutsideDays={false}
                  // Opcional: Deshabilita días anteriores a 'from' en el calendario de fin
                  disabled={
                    localDate?.from ? { before: localDate.from } : undefined
                  }
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 border-t border-border p-3 bg-muted/30">
              <div className="flex flex-wrap gap-2 w-full">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    className="flex-1 min-w-25 text-xs font-medium bg-background border-border shadow-sm hover:bg-muted"
                    onClick={() => {
                      const newRange = preset.getRange();
                      setLocalDate(newRange);
                      if (newRange.from) {
                        setFromMonth(newRange.from);
                      }
                      if (newRange.to) {
                        setToMonth(newRange.to);
                      }
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <Button
                className="w-full text-xs font-semibold h-9 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2"
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
  );
}