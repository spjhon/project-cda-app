import { Footer } from "@/components/landingPage/Footer";
import { Navbar } from "@/components/landingPage/NavBar/Navbar";
import Image from "next/image";
import ImageTeam from "../../../public/aboutusTeam.png";


export default function About() {
  return (
    <section >
    <Navbar></Navbar>
   <div className="flex min-h-screen flex-col items-center justify-center py-12 md:py-20">
  <div className="mx-auto max-w-4xl px-6 w-full space-y-12">
    
    {/* 📸 FOTO DE EQUIPO PANORÁMICA */}
    <div className="relative w-full aspect-video md:aspect-21/9 rounded-3xl overflow-hidden border border-border bg-muted shadow-2xl">
      <Image
        alt="Equipo multidisciplinario de cdApp: Desarrolladores, Auditores ONAC y Directores Técnicos de CDA"
        src={ImageTeam} // 👈 Tu foto horizontal aquí
        fill
        priority
        className="object-cover object-center"
        sizes="(max-w-1280px) 100vw, 896px"
      />
    </div>

    {/* 📝 SECCIÓN DE TEXTO COHESIVA */}
    <div className="space-y-8 text-center md:text-left">
      <div className="space-y-3">
        <p className="text-sm font-bold tracking-wider uppercase text-primary">Nuestra Historia</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
          Ingeniería y normatividad, <br className="hidden md:block"/>
          <span className="text-primary">unidas en un solo ecosistema.</span>
        </h1>
      </div>

      <div className="space-y-6 text-lg text-muted-foreground leading-relaxed text-justify md:text-left">
        {/* PÁRRAFO 1: El Origen y la Alianza */}
        <p>
          La historia de <strong className="text-foreground font-semibold">cdApp</strong> comenzó en el año 2025 bajo una premisa clara: el software tradicional para CDAs en Colombia es un ecosistema cerrado, con estadisticas limitadas y en su mayoria no posee sus ordenes de entrada digitalizadas. Para cambiar esto, decidimos sentarnos en la misma mesa <strong className="text-foreground font-semibold">desarrolladores de software full-stack, directores técnicos operativos y auditores expertos en la norma ISO 17020 (ONAC)</strong>. Esta alianza estratégica nos permitió fusionar la velocidad de la tecnología moderna con el conocimiento quirúrgico de la regulación técnica y legal del país.
        </p>

        {/* PÁRRAFO 2: El Producto Moldeado a la Pista */}
        <p>
          El resultado no fue simplemente una base de datos más, sino un producto moldeado directamente desde las trincheras de la inspección automotriz. Cada flujo de cdApp —desde la apertura milimétrica de una orden de entrada, pasando por el monitoreo en tiempo real de los perfiles de secretaría, hasta el blindaje en las aprobaciones de la Dirección Técnica— ha sido diseñado para eliminar el error humano. No creamos software para que adaptes tu CDA a él; creamos cdApp para que tengas un mayor control y monitoreo de los vehiculos que pasan por el.
        </p>

        {/* PÁRRAFO 3: Evolución Constante y Visión de Futuro */}
        <p>
          Hoy, lo que ves es solo el sólido cimiento de un sistema diseñado para la <strong className="text-foreground font-semibold">evolución constante</strong>. El sector automotor y regulatorio colombiano cambia rápidamente, y cdApp ha sido construido con una arquitectura escalable de última generación lista para adaptarse antes de que las normativas se conviertan en un dolor de cabeza. No vendemos una licencia estática; entregamos un socio tecnológico en la nube que crece, se actualiza en tiempo real sin interrumpir tus pistas y blinda el futuro y la acreditación de tu CDA.
        </p>
      </div>
      
      {/* 🛡️ SELLO DE CONFIANZA COMERCIAL */}
      <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <p>🚀 Diseñado exclusivamente para el contexto técnico y legal de Colombia.</p>
        <p>✅ Alineado con los criterios de acreditación ISO 17020.</p>
      </div>
    </div>

  </div>
</div>
    <Footer></Footer>
    </section>
  )
}
