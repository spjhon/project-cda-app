import { Marquee } from "@/components/ui/marquee";
import { 
  ShieldCheck, 
  Database, 
  Layers, 
  Scale, 
  Cpu, 
  Server, 
  FileText, 
  CheckCircle2 
} from "lucide-react";

const stackCda = [
  {
    id: "01",
    logo: <Scale className="w-8 h-8" />,
    label: "Normativa ISO 17020",
    description: "Alineación ONAC"
  },
  {
    id: "02",
    logo: <Database className="w-8 h-8" />,
    label: "PostgreSQL Enterprise",
    description: "Base de datos relacional"
  },
  {
    id: "03",
    logo: <ShieldCheck className="w-8 h-8" />,
    label: "Row Level Security (RLS)",
    description: "Aislamiento estricto de datos"
  },
  {
    id: "04",
    logo: <Cpu className="w-8 h-8" />,
    label: "Arquitectura RPC-First",
    description: "Lógica centralizada segura"
  },
  {
    id: "05",
    logo: <Server className="w-8 h-8" />,
    label: "Infraestructura VPS dedicada",
    description: "Cero cold-starts / caídas"
  },
  {
    id: "06",
    logo: <Layers className="w-8 h-8" />,
    label: "Estructura Multi-Tenant",
    description: "Inquilinos 100% aislados"
  },
  {
    id: "07",
    logo: <FileText className="w-8 h-8" />,
    label: "Auditoría de Cambios",
    description: "Trazabilidad inmutable"
  },
  {
    id: "08",
    logo: <CheckCircle2 className="w-8 h-8" />,
    label: "Integración RUNT",
    description: "Extracción automatizada"
  }
];

// Tarjeta interna estilizada para el CDA con soporte de temas
const StackCard = ({ 
  logo, 
  label, 
  description 
}: { 
  logo: React.ReactNode, 
  label: string, 
  description: string 
}) => {
  return (
    <div className="mx-4 flex items-center gap-4 px-5 py-3 rounded-xl bg-card border border-border/60 text-card-foreground shadow-xs min-w-[280px]">
      <div className="text-primary shrink-0 bg-primary/10 p-2 rounded-lg">
        {logo}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm font-bold tracking-tight text-foreground">
          {label}
        </span>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {description}
        </span>
      </div>
    </div>
  );
};

export function LogoMarquee() {
  return (
    <section className="py-16 bg-muted/20 border-y border-border/40" id="respaldo-tecnico">
      <div className="max-w-7xl mx-auto px-4 text-center mb-10 space-y-3">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          Respaldo normativo e infraestructura de grado industrial
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          cdApp está construido sobre los pilares tecnológicos más estrictos del mercado para asegurar la continuidad de tu pista.
        </p>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden masked-marquee">
        {/* Marquee continuo con las especificaciones del SaaS */}
        <Marquee reverse pauseOnHover className="[--duration:40s]">
          {stackCda.map((item) => (
            <StackCard key={item.id} {...item} />
          ))}
        </Marquee>
      </div>
    </section>
  );
}