"use client";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";




export function TicketFilters() {

const router = useRouter();
const pathname = usePathname();
const searchParams = useSearchParams();

    const searchInputRef = useRef<HTMLInputElement>(null);


    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();


        const search = searchInputRef.current?.value || "";
        
        const updatedParams = new URLSearchParams(searchParams);

        updatedParams.set("search", search);
        updatedParams.set("page", "1");
       
        router.push(pathname + "?" + updatedParams.toString());
       
    };


  return (

    <form onSubmit={onSubmit} className="w-full max-w-md my-4">
      <div className="relative flex items-center gap-2">
        {/* Contenedor del Input con Icono */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            ref={searchInputRef}
            id="search"
            name="search"
            placeholder="Buscar tickets..."
            className="pl-9 bg-white/50 backdrop-blur-sm border-gray-200 focus-visible:ring-primary/20 transition-all"
          />
        </div>

        {/* Botón Estilo Shadcn */}
        <Button 
          type="submit" 
          variant="default"
          className="shadow-sm hover:shadow-md transition-shadow px-6"
        >
          Buscar
        </Button>
      </div>
    </form>



  );
}
