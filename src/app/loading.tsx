export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md transition-all duration-500">
      <div className="relative flex items-center justify-center">
        {/* Anillo exterior con gradiente y rotación suave */}
        <div className="h-16 w-16 animate-spin rounded-full border-2 border-transparent border-t-blue-600 border-r-blue-600/30" />
        
        {/* Círculo interior con efecto de pulso */}
        <div className="absolute h-10 w-10 animate-pulse rounded-full bg-blue-100/50 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-blue-600" />
        </div>
      </div>

      {/* Texto sutil con espaciado elegante */}
      <div className="mt-6 flex flex-col items-center space-y-2">
        <span className="text-sm font-medium tracking-widest text-gray-500 uppercase animate-pulse">
          Loading...
        </span>
        <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
      </div>
    </div>
  );
}