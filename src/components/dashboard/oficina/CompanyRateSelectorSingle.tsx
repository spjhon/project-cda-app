
"use client"

import { useMemo } from "react"
import { Building2, ChevronsUpDown, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox"
import { useCompanies } from "@/lib/client-actions/fetch_tenant_companies"

interface CompanyRateSelectorProps {
  value: string | null
  onValueChange: (companyId: string | null) => void
  disabled?: boolean
}

interface CompanyOption {
  id: string
  name: string
  nit: string | null
  searchLabel: string
}

export function CompanyRateSelectorSingle({
  value,
  onValueChange,
  disabled = false,
}: CompanyRateSelectorProps) {
  const {
    data: companies,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useCompanies()

  const loading = isPending || isFetching

  const companyOptions = useMemo<CompanyOption[]>(
    () =>
      (companies ?? []).map((company) => ({
        id: company.id,
        name: company.name,
        nit: company.nit,
        searchLabel: `${company.name} ${company.nit ?? ""}`,
      })),
    [companies],
  )

  const selectedCompany =
    companyOptions.find((company) => company.id === value) ?? null

  const clearSelection = () => {
    onValueChange(null)
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Building2 className="size-4 text-muted-foreground" />
        Empresa
      </label>

      <div className="flex w-full items-center gap-2">
        <div className="min-w-0 flex-1">
          <Combobox
            items={companyOptions}
            value={selectedCompany}
            onValueChange={(company) => {
              onValueChange(
                company &&
                  typeof company === "object" &&
                  "id" in company
                  ? String(company.id)
                  : null,
              )
            }}
            itemToStringValue={(company) => company.name}
            isItemEqualToValue={(item, selected) =>
              item.id === selected.id
            }
          >
            <ComboboxTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled || loading || isError}
                  className="min-h-10 w-full justify-between font-normal"
                >
                  <span className="min-w-0 truncate">
                    {loading
                      ? "Cargando empresas..."
                      : selectedCompany
                        ? `${selectedCompany.name} - NIT: ${selectedCompany.nit ?? "No registrado"}`
                        : "Seleccione una empresa"}
                  </span>

                  {loading ? (
                    <Loader2 className="ml-2 size-4 shrink-0 animate-spin" />
                  ) : (
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                  )}
                </Button>
              }
            />

            <ComboboxContent>
              {isError ? (
                <div className="p-4 text-sm text-destructive">
                  No fue posible cargar las empresas.

                  <button
                    type="button"
                    className="ml-2 underline"
                    onClick={() => void refetch()}
                  >
                    Reintentar
                  </button>

                  {error?.message && (
                    <p className="mt-1 text-xs">{error.message}</p>
                  )}
                </div>
              ) : (
                <>
                  {/* Opción para quitar la empresa */}
                  

                  <ComboboxInput
                    placeholder="Buscar por nombre o NIT..."
                    showTrigger={false}
                  />

                  <ComboboxEmpty>
                    No se encontraron empresas.
                  </ComboboxEmpty>

                  <ComboboxList>
                    {(company) => (
                      <ComboboxItem
                        key={company.id}
                        value={company}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {company.name}
                          </span>

                          {company.nit && (
                            <span className="text-xs text-muted-foreground">
                              NIT: {company.nit}
                            </span>
                          )}
                        </div>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </>
              )}
            </ComboboxContent>
          </Combobox>
        </div>

        {/* Botón independiente para limpiar */}
        {value !== null && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            aria-label="Quitar empresa seleccionada"
            title="Quitar empresa"
            onClick={(event) => {
              event.preventDefault()
              event.stopPropagation()
              clearSelection()
            }}
            className="shrink-0"
          >
            <X className="size-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
