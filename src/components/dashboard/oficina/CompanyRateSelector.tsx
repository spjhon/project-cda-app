
"use client"

import { useMemo } from "react"
import {
  Loader2,
  Building2,
  ChevronsUpDown,
  Check,
  ListChecks,
  X,
} from "lucide-react"

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

interface CompanyRateForm {
  company_ids: string[]
}

interface CompanyRateSelectorProps<T extends CompanyRateForm> {
  form: T
  setForm: React.Dispatch<React.SetStateAction<T>>
}

interface CompanyOption {
  id: string
  name: string
  nit: string | null
  searchLabel: string
}

export function CompanyRateSelector<T extends CompanyRateForm>({
  form,
  setForm,
}: CompanyRateSelectorProps<T>) {
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

  const selectedCompanies = useMemo(
    () =>
      companyOptions.filter((company) =>
        form.company_ids.includes(company.id),
      ),
    [companyOptions, form.company_ids],
  )

  const allSelected =
    companyOptions.length > 0 &&
    companyOptions.every((company) =>
      form.company_ids.includes(company.id),
    )

  const updateSelectedCompanies = (ids: string[]) => {
    setForm((previous) => ({
      ...previous,
      company_ids: ids,
    }))
  }

  const toggleAllCompanies = () => {
    if (allSelected) {
      updateSelectedCompanies([])
      return
    }

    updateSelectedCompanies(companyOptions.map((company) => company.id))
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Building2 className="size-4 text-muted-foreground" />
        Empresas
      </label>

      {isError ? (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm"
        >
          <p className="font-medium text-destructive">
            No fue posible cargar las empresas.
          </p>

          {error instanceof Error && error.message && (
            <p className="mt-1 wrap-break-word text-muted-foreground">
              {error.message}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            {isFetching && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Reintentar
          </Button>
        </div>
      ) : (
        <>
          <Combobox
            multiple
            items={companyOptions}
            value={selectedCompanies}
            onValueChange={(value) => {
              updateSelectedCompanies(
                (value as CompanyOption[]).map((company) => company.id),
              )
            }}
            itemToStringValue={(company) => company.name}
          >
            <ComboboxTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="min-h-10 w-full justify-between font-normal"
                >
                  <span className="truncate">
                    {loading
                      ? "Cargando empresas..."
                      : selectedCompanies.length === 0
                        ? "Seleccione empresas"
                        : `${selectedCompanies.length} de ${companyOptions.length} empresa(s) seleccionada(s)`}
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
              <ComboboxInput
                placeholder="Buscar por nombre o NIT..."
                showTrigger={false}
              />

              {!loading && companyOptions.length > 0 && (
                <div className="border-b p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={toggleAllCompanies}
                  >
                    {allSelected ? (
                      <>
                        <X className="mr-2 size-4" />
                        Deseleccionar todas
                      </>
                    ) : (
                      <>
                        <ListChecks className="mr-2 size-4" />
                        Seleccionar todas
                      </>
                    )}
                  </Button>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Cargando empresas...
                </div>
              ) : (
                <>
                  <ComboboxEmpty>
                    No se encontraron empresas.
                  </ComboboxEmpty>

                  <ComboboxList>
                    {(company) => {
                      

                      return (
                        <ComboboxItem
                          key={company.id}
                          value={company}
                        >
                          <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate font-medium">
                                {company.name}
                              </span>

                              {company.nit && (
                                <span className="text-xs text-muted-foreground">
                                  NIT: {company.nit}
                                </span>
                              )}
                            </div>

                            
                          </div>
                        </ComboboxItem>
                      )
                    }}
                  </ComboboxList>
                </>
              )}
            </ComboboxContent>
          </Combobox>

          {selectedCompanies.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedCompanies.length} empresa(s) seleccionada(s).
              Puedes quitarlas individualmente desde la lista.
            </p>
          )}
        </>
      )}
    </div>
  )
}
