import DemoLandingPage from "@/components/tenantsLandingPages/DemoLandingPage";
import FullmotosLandingPage from "@/components/tenantsLandingPages/FullmotosLandingPage";
import TecnofresnoLandingPage from "@/components/tenantsLandingPages/TecnofresnoLandingPage";
import { Metadata } from "next";



export async function generateStaticParams() {
  // En el futuro, aquí harías un fetch/RPC a Supabase para traer los slugs de tus CDAs
  return [
    { tenant: "fullmotos" },
    { tenant: "tecnofresno" },
     { tenant: "demo" },
  ];
}





// 1. Configuración de SEO estática para cada Tenant
const tenantMetadataConfig: Record<string, { title: string; description: string; keywords: string[]; imageOpenGraph: string }> = {
  fullmotos: {
    title: "CDA Fullmotos la 25 - Revisión Técnico-Mecánica en la ciudad de Manizales",
    description: "Saca tu Revisión Técnico-Mecánica exclusivo para motos en CDA Full Motos. Pista autorizada, inspección rápida, precisa y con tecnología de punta bajo la norma ISO 17020.",
    keywords: [
      "CDA Full Motos", 
      "RTM motos", 
      "Revisión tecnicomecanica motos", 
      "inspección sensorial motos", 
      "sacar rtm motos",
      "cda de motos",
      "revision tecnico mecanica motos",
      "tecnicomecanica motos precio",
      "donde sacar la tecnicomecanica de moto",
      "cda motos cerca de mi",
      "pista de motos cda",
      "inspeccion vehicular motos",
      "cda homologado onac",
      "norma iso 17020 motos",
      "analizador de gases motos",
      "luxometro motos cda",
      "frenometro motos",
      "sonometro motos cda",
      "tramite rtm motos",
      "certificado revision tecnico mecanica",
      "cda full motos direccion",
      "cda full motos telefono",
      "agendar cita tecnicomecanica motos",
      "pre revision de motos",
      "desviacion de luces moto",
      "gases contaminantes moto",
      "profundidad labrado llantas moto",
      "cda exclusivo motos"
    ],
    imageOpenGraph: "https://lyktizihszlbmzzjrqye.supabase.co/storage/v1/object/public/tenants-public/public/fullmotos_logo.jpg"
  },
  tecnofresno: {
    title: "CDA Tecnofresno - Revisión Técnico-Mecánica Livianos y Motos",
    description: "Agenda tu Revisión Técnico-Mecánica para carros, motocarros y motos en CDA Tecnofresno. Garantizamos tu seguridad vial con un servicio rápido, transparente y certificado.",
    keywords: [
      "CDA Tecnofresno", 
      "Tecnofresno Fresno", 
      "RTM carro y moto", 
      "alineacion computarizada", 
      "revision de frenos", 
      "cda fresno tolima",
      "cda tecnofresno fresno tolima",
      "revision tecnico mecanica carro",
      "tecnicomecanica motocarros",
      "cda vehiculos livianos",
      "cda cerca a fresno",
      "rtm carros fresno",
      "revision de suspension cda",
      "alineador al paso vehiculos",
      "frenometro carros y motos",
      "inspeccion sensorial vehiculos livianos",
      "gases gasolina y diesel cda",
      "analisis de gases vehicular fresno",
      "precio tecnicomecanica carro",
      "precio tecnicomecanica moto fresno",
      "cda certificado onac tolima",
      "agendar rtm tecnofresno",
      "cda tecnofresno direccion",
      "cda tecnofresno telefono",
      "seguridad vial fresno tolima",
      "desgaste de llantas vehiculo liviano",
      "holguras de suspension cda",
      "inspeccion visual chasis carro",
      "luxometria carros cda",
      "cda livianos y motos"
    ],
    imageOpenGraph: "https://lyktizihszlbmzzjrqye.supabase.co/storage/v1/object/public/tenants-public/public/tecnofresno_logo.png"
  },
};


interface PageProps {
  params: Promise<{ tenant: string }>;
}


// 2. Función Generadora de Metadatos (Next.js la detecta automáticamente)
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenant } = await params;
  const currentTenant = tenant.toLowerCase();


  // Obtenemos la configuración del tenant actual, o usamos una por defecto si no existe
  const config = tenantMetadataConfig[currentTenant] || {
    title: `CDA ${tenant.toUpperCase()} - Revisión Técnico-Mecánica`,
    description: `Agenda tu cita para la revisión técnico-mecánica en el CDA ${tenant}.`,
    keywords: ["RTM", "CDA", "Revisión Técnico-Mecánica", "inspección vehicular"],
  };

  const APP_URL = "cda-app.com"; // Cambia por tu dominio de producción
  const tenantUrl = `https://${currentTenant}.${APP_URL}/`;

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    authors: [{ name: 'Juan Aristizabal', url: 'https://cda-app.com' }],
  creator: 'Juan Aristizabal',
  publisher: 'Juan Aristizabal',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    }},
    // Configuración Open Graph personalizada por CDA (para WhatsApp/Redes)
    openGraph: {
      title: config.title,
      description: config.description,
      url: tenantUrl,
      type: "website",
      locale: "es_CO",
      images: [
        {
          // Idealmente, guarda una imagen de marca para cada CDA en public/tenants/[tenant]/og.jpg
          url: config.imageOpenGraph, 
          width: 1200,
          height: 630,
          alt: `Instalaciones de CDA ${currentTenant.toUpperCase()}`,
        },
      ],
    },
    
    // Configuración para Twitter/X
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.description,
      images: [config.imageOpenGraph],
    },
    
    // Alternativas canónicas para evitar contenido duplicado
    alternates: {
      canonical: tenantUrl,
      languages: {
      'es-MX': 'https://cda-app.com/',
      
    },
    },
    
  };
}











export default async function TenantPage({params}: {params: Promise<{ tenant: string }>}) {
    
 const { tenant } = await params;

// Pasamos el tenant a minúsculas para evitar problemas de digitación en la URL
  const currentTenant = tenant.toLowerCase();


if (currentTenant === "fullmotos") {

    return <FullmotosLandingPage currentTenant={currentTenant} />;
  }

if (currentTenant === "tecnofresno") {
    return <TecnofresnoLandingPage  currentTenant={currentTenant} />;
  }

  if (currentTenant === "demo") {
    return <DemoLandingPage  currentTenant={currentTenant} />;
  }



return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Centro de Diagnóstico no registrado
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        El subdominio <span className="font-mono font-bold text-primary">{tenant}</span> no corresponde a una organización activa en cdApp.
      </p>
    </div>
  );
}