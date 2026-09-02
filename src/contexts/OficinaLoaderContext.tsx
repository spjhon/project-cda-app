// contexts/OficinaLoaderContext.tsx
'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useMutation, UseMutationResult, useQuery } from '@tanstack/react-query'
import { PermissionsContext } from './PermissionsLoaderContext'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { TipoVehiculoEnumType } from '@/lib/zod-schemas/order-schema'
import { CreateFeeInput } from '@/lib/zod-schemas/validaciones-formularios/crear-fee-schema'


export interface VehicleRate {
  id: string
  tenant_id: string
  vehicle_type: TipoVehiculoEnumType
  base_price: number
  service_type: "RTM" | "preventiva" | "peritaje" | "otro"
  created_at: string
}


export interface FeeType {
  id: string
  tenant_id: string
  name: string
  code: string
  description: string | null
  fee_amount: number
  iva_percentage: number
  model_year_from: number | null
  model_year_to: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// 📋 Tipos del contexto
// contexts/OficinaLoaderContext.tsx
export interface OficinaContextType {
  rol: string

  // Tarifas de servicios
  rates: VehicleRate[]
  isLoadingRates: boolean
  isFetchingRates: boolean
  errorRates: string | null
  refetchRates: () => void

  // Tipos de fees disponibles
  feeTypes: FeeType[]
  isLoadingFeeTypes: boolean
  isFetchingFeeTypes: boolean
  errorFeeTypes: string | null
  refetchFeeTypes: () => void

  isConnected: boolean
  // Mutation para crear fee
  createFeeMutation: UseMutationResult<
  boolean, // TData: resultado que devuelve la mutation cuando tiene éxito
  Error,                 // TError: tipo del error que puede producir la mutation
  CreateFeeInput,        // TVariables: datos que recibe mutate() para crear el fee
  unknown                // TContext: contexto opcional utilizado por onMutate
>
}



// 📋 Props del provider
interface OficinaLoaderContextProps {
  children: ReactNode
  rol: string
}





// Crear el contexto
export const OficinaContext = createContext<OficinaContextType | null>(null)



// Hook para usar el contexto
export function useOficina() {
  const context = useContext(OficinaContext)
  if (!context) {
    throw new Error('useOficina debe usarse dentro de OficinaLoaderContext')
  }
  return context
}



// Provider
export default function OficinaLoaderContext({ 
  children, 
  rol 
}: OficinaLoaderContextProps) {




  //const queryClient = useQueryClient()
  
  // 🔥 Obtener tenantId del PermissionsContext (que viene del server)
  const permissionsContextRecived = useContext(PermissionsContext)
  const tenantId = permissionsContextRecived?.PermissionsContextValue.tenantObject?.id









const {
  data,
  isLoading,
  error,
  isFetching,
  refetch,
} = useQuery({
  queryKey: ["vehicle-rates", tenantId],

  queryFn: async () => {
    if (!tenantId) {
      throw new Error("No se encontró el ID del tenant")
    }

    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase.rpc(
      "fetch_active_vehicle_service_rates",
      {
        p_tenant_id: tenantId,
      }
    )

    if (error) {
      console.error("Error en RPC:", error)
      throw new Error(
        error.message || "Error al obtener las tarifas"
      )
    }

    return (data || []) as VehicleRate[]
  },

  enabled: !!tenantId,
  staleTime: 0,
  refetchOnWindowFocus: false,
  retry: 1,
})









const {
  data: feeTypes,
  isLoading: isLoadingFeeTypes,
  error: errorFeeTypes,
  isFetching: isFetchingFeeTypes,
  refetch: refetchFeeTypes,
} = useQuery({
  queryKey: ["fee-types", tenantId],

  queryFn: async () => {
    if (!tenantId) {
      throw new Error("No se encontró el ID del tenant")
    }

    const supabase = createSupabaseBrowserClient()

    const { data, error } = await supabase.rpc(
      "fetch_fee_types",
      {
        p_tenant_id: tenantId,
      }
    )

    // ⏳ Simular retraso de 5 segundos
    await new Promise((resolve) => setTimeout(resolve, 5000))

    if (error) {
      console.error("Error en RPC:", error)

      throw new Error(
        error.message || "Error al obtener los fees"
      )
    }

    return (data || []) as FeeType[]
  },

  enabled: !!tenantId,
  staleTime: 0,
  refetchOnWindowFocus: false,
  retry: 1,
})




//MUTACION PARA INSERTAR NUEVOS FEES

const createFeeMutation = useMutation({
  mutationFn: async (data: CreateFeeInput) => {
    // ==========================================
    // LLAMAR SERVER ACTION
    // ==========================================

   
    return true
    
  },

})







/** 
  // 🔌 REAL-TIME: Un solo channel para rates (solo si hay tenantId)
  useEffect(() => {
    if (!tenantId) return

    const supabase = createSupabaseBrowserClient()
    
    const channel = supabase
      .channel('oficina-rates-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_service_rate',
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          console.log('🔄 Cambio detectado en rates:', payload)
          
          // Invalidar la query para que refetchee
          queryClient.invalidateQueries({
            queryKey: ['vehicle-rates', tenantId]
          })
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime status:', status)
      })

    // Cleanup
    return () => {
      console.log('🧹 Cerrando channel de rates...')
      supabase.removeChannel(channel)
    }
  }, [tenantId, queryClient])
*/




  // 📦 Valor del contexto
 const contextValue: OficinaContextType = {
  rol,

  // Tarifas de servicios
  rates: data || [],
  isLoadingRates: isLoading,
  isFetchingRates: isFetching,
  errorRates: error instanceof Error ? error.message : null,
  refetchRates: refetch,

  // Tipos de fees disponibles
  feeTypes: feeTypes || [],
  isLoadingFeeTypes,
  isFetchingFeeTypes,
  errorFeeTypes:
    errorFeeTypes instanceof Error
      ? errorFeeTypes.message
      : null,
  refetchFeeTypes,

  createFeeMutation,

  isConnected: true,

 
}

  return (
    <OficinaContext.Provider value={contextValue}>
      {children}
    </OficinaContext.Provider>
  )
}