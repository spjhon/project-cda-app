import React, { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { ArrowRight, Building2, Calendar, FileText, HelpCircle, Home, Menu, Phone, ShieldCheck, X } from "lucide-react";

import Image from "next/image";
import demoLogo from "../../../public/tenantsLanding/demo/CDA demo logo resized and cropped.png";
import hero from "../../../public/tenantsLanding/demo/Demo hero 2.png";
import panoramico from "../../../public/tenantsLanding/demo/Demo Panoramico cropped.webp";


//Imagenes de la rtm de ejemplo
import sensorialImage from "../../../public/tenantsLanding/demo/pasosRTM_sensorial_reziced.webp";
import lucesImage from "../../../public/tenantsLanding/demo/pasosRTM_luces_reziced.webp";
import gasesImage from "../../../public/tenantsLanding/demo/pasosRTM_gasesreziced.webp";
import sonometriaImage from "../../../public/tenantsLanding/demo/sensorial_sonometro_reziced.jpg";
import frenosImage from "../../../public/tenantsLanding/demo/pasosRTM_frenos_reziced.webp";




//Imagenes condicones para la inspeccion
import motoDescargada from "../../../public/tenantsLanding/demo/condicionesEntrada_MotoDescargada.webp";
import motoLimpia from "../../../public/tenantsLanding/demo/condiconesEntrada_MotoLimpia.jpg";
import motoBuenaPresion from "../../../public/tenantsLanding/demo/condiconesEntrada_presionllantas.jpg";
import motoSliders from "../../../public/tenantsLanding/demo/condicnoesEntrada_sliders.webp";
import motoAlarma from "../../../public/tenantsLanding/demo/condicionesEntrada_alarma.jpg";
import motoCombustible from "../../../public/tenantsLanding/demo/condicionesEntrada_combustible.jpg";
import motoSuspencion from "../../../public/tenantsLanding/demo/condicionesEntrada_suspencion.avif";
import motoRejilla from "../../../public/tenantsLanding/demo/condicionesEntrada_rejilla-1.webp";
import motoSoporte from "../../../public/tenantsLanding/demo/condicionesEntrada_soporteCentral.jpg";




//Imagenes para los medios de pago
import medioPagoEfectivo from "../../../public/tenantsLanding/demo/MediosPago_Efectivo.jpg";
import medioPagoTarjeta from "../../../public/tenantsLanding/demo/MediosPago_Targeta.jpg";
import medioPagoSistecredito from "../../../public/tenantsLanding/demo/MediosPago_Sistecredito.jpg";
import medioPagoQR from "../../../public/tenantsLanding/demo/MedioPago_QR.avif";
import medioPagoTransferencia from "../../../public/tenantsLanding/demo/MedioPago_Transferencia.jpg";


import { DemoModeToggle } from "./TenantLandingPageNavBar/demo-mode-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";




//Imagenes de las instalaciones
import instalaciones01 from "../../../public/tenantsLanding/demo/Instalaciones_01.webp";
import instalaciones02 from "../../../public/tenantsLanding/demo/Instalaciones_02.webp";
import instalaciones03 from "../../../public/tenantsLanding/demo/Instalaciones_03.webp";
import instalaciones04 from "../../../public/tenantsLanding/demo/Instalaciones_04.webp";
import instalaciones05 from "../../../public/tenantsLanding/demo/Instalaciones_05.webp";
import DynamicYear from "../landingPage/DynamicYear";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer";













const colorPalette = {
  inkBlack: "#001524", // Negro tinta profundo (Texto principal en modo claro / Fondo principal en oscuro)
  stormyTeal: "#15616d", // Azul verdoso tormenta (Acentos secundarios / Bordes / Hover)
  papayaWhip: "#ffecd1", // Crema arena suave (Fondo principal en claro / Texto en fondos oscuros)
  harvestOrange: "#ff7d00", // Naranja vibrante (Call-To-Action / Destacados / Botones principales)
  brandy: "#78290f", // Marrón cálido especiado (Detalles de contraste / Hover en botones calidos)
};





const rtmSteps = [
  {
    id: "sensorial",
    tabLabel: "1. Sensorial",
    title: "Inspección Sensorial Minuciosa",
    emoji: "👀",
    image: sensorialImage,
    alt: "Inspección sensorial del chasis y llantas",
    content: (
      <>
        Un inspector certificado evalúa visual y tácticamente{" "}
        <strong className="text-[#051923] dark:text-white font-bold">
          más de 75 posibles defectos
        </strong>{" "}
        normativos en la motocicleta. Esta rigurosa revisión abarca componentes
        críticos como el chasis, sistema de suspensión, estado del cableado,
        mangueras de fluidos, guayas, fijaciones mecánicas, presencia de
        rozaduras peligrosas y la profundidad de labrado de ambas llantas.
      </>
    ),
  },
  {
    id: "luces",
    tabLabel: "2. Luces",
    title: "Reglaje e Intensidad Lumínica",
    emoji: "💡",
    image: lucesImage,
    alt: "Medición de faros con Luxómetro",
    content: (
      <>
        Utilizamos un{" "}
        <strong className="text-[#006494] dark:text-[#00a6fb] font-semibold">
          Luxómetro de alta precisión
        </strong>{" "}
        para medir técnicamente tanto la intensidad de proyección como el ángulo
        exacto de inclinación del haz de luz. Esto asegura que cuentes con una
        visibilidad nocturna óptima y evita encandilar a los conductores que
        transitan en sentido contrario.
      </>
    ),
  },
  {
    id: "sonido",
    tabLabel: "3. Sonoridad",
    title: "Control de Emisiones Sonoras",
    emoji: "🔊",
    image: sonometriaImage,
    alt: "Prueba de decibeles con Sonómetro",
    content: (
      <>
        Realizamos la toma de muestreo acústico mediante un{" "}
        <strong className="text-[#006494] dark:text-[#00a6fb] font-semibold">
          Sonómetro homologado
        </strong>{" "}
        puesto cerca al escape. Con esto medimos los decibeles generados por el
        motor para certificar que la motocicleta no incurra en contaminación
        auditiva ni exceda los umbrales de ruido permitidos por la ley nacional.
      </>
    ),
  },
  {
    id: "gases",
    tabLabel: "4. Gases",
    title: "Análisis de Gases Contaminantes",
    emoji: "💨",
    image: gasesImage,
    alt: "Sonda del analizador de gases en el escape",
    content: (
      <>
        Conectamos la motocicleta a un{" "}
        <strong className="text-[#006494] dark:text-[#00a6fb] font-semibold">
          Analizador de gases computarizado
        </strong>{" "}
        que mide el nivel de monóxido de carbono, hidrocarburos y oxígeno
        expulsa­ dos. Es una prueba indispensable para validar que el motor
        opere eficientemente dentro de los límites ecológicos exigidos por las
        autoridades ambientales.
      </>
    ),
  },
  {
    id: "frenos",
    tabLabel: "5. Frenado",
    title: "Prueba Especializada de Frenado",
    emoji: "🛑",
    image: frenosImage,
    alt: "Motocicleta sobre los rodillos del frenómetro",
    content: (
      <>
        Sometemos el vehículo al rodillo del{" "}
        <strong className="text-[#006494] dark:text-[#00a6fb] font-semibold">
          Frenómetro electrónico
        </strong>{" "}
        . Esta prueba automatizada calcula la fuerza de frenado por eje y la
        eficacia total del sistema, garantizando que ante cualquier detención
        habitual o de emergencia en la vía, la motocicleta responda con firmeza,
        equilibrio y total control.
      </>
    ),
  },
];




const requisitosAsistencia = [
  {
    id: "01",
    titulo: "Vehículo Descargado",
    descripcion:
      "La motocicleta debe presentarse sin carga adicional, equipaje, alforjas pesadas o maleteros sobredimensionados.",
    imagen: motoDescargada,
  },
  {
    id: "02",
    titulo: "Condiciones de Limpieza",
    descripcion:
      "El vehículo debe estar limpio, libre de barro o grasa excesiva que impida la correcta inspección visual y sensorial.",
    imagen: motoLimpia,
  },
  {
    id: "03",
    titulo: "Presión de Llantas",
    descripcion:
      "Ambas ruedas deben contar con la presión de aire adecuada según la especificación técnica del fabricante.",
    imagen: motoBuenaPresion,
  },
  {
    id: "04",
    titulo: "Ejes Despejados",
    descripcion:
      "Retirar tapacubos, tapones de tuercas o sliders instalados en los ejes de las ruedas para permitir la sujeción e inspección.",
    imagen: motoSliders,
  },
  {
    id: "05",
    titulo: "Alarma Desactivada",
    descripcion:
      "Para las motocicletas que aplique, el sistema de alarma debe permanecer apagado para evitar bloqueos en la línea de prueba.",
    imagen: motoAlarma,
  },
  {
    id: "06",
    titulo: "Combustible Suficiente",
    descripcion:
      "Contar con al menos un cuarto (1/4) de tanque de combustible para poder realizar correctamente las pruebas dinámicas y de gases.",
    imagen: motoCombustible,
  },
  {
    id: "07",
    titulo: "Suspensión Libre",
    descripcion:
      "Sin abrazaderas fijas ni amarres improvisados en las cubiertas o fuelles de la suspensión delantera o trasera.",
    imagen: motoSuspencion,
  },
  {
    id: "08",
    titulo: "Escape sin Obstrucciones",
    descripcion:
      "El tubo de escape debe estar libre de aditamentos, mallas o deflectores que obstaculicen el ingreso de la sonda de gases.",
    imagen: motoRejilla,
  },
  {
    id: "09",
    titulo: "Soporte Central (Scooters)",
    descripcion:
      "Las motocicletas tipo scooter deben asistir obligatoriamente con su soporte central (gato) en perfecto estado funcional.",
    imagen: motoSoporte,
  },
];



export const tarifasServicios = [
  {
    id: "rtm",
    titulo: "Revisión Técnico-Mecánica",
    subtitulo: "Motos, Livianos, Pesados y Eléctricos",
    precio: "Desde $237.000",
    frecuencia: "Regulado por MinTransporte",
    destacado: true,
    detalles: [
      "Motos (2T/4T), Motocarros y Vehículos Eléctricos",
      "Vehículos Livianos y Pesados (Servicio Público/Particular)",
      "Prueba de emisiones, frenometría y holguras",
      "Sincronización e inspección directa en el RUNT",
      "Acreditación ONAC e inspección ISO/IEC 17020",
    ],
  },
  {
    id: "peritaje",
    titulo: "Peritaje Especializado",
    subtitulo: "Evaluación para Compra / Venta",
    precio: "Desde $80.000",
    frecuencia: "Por inspección voluntaria",
    destacado: false,
    detalles: [
      "Diagnóstico estructural de chasis y carrocería",
      "Medición de compresión de motor y escáner OBD",
      "Evaluación especial para baterías y motorización eléctrica",
      "Dictamen completo para flotas pesadas y motocarros",
      "Informe digital con registro fotográfico respaldado",
    ],
  },
  {
    id: "soat",
    titulo: "Seguro Obligatorio (SOAT)",
    subtitulo: "Tarifas Reguladas por SuperFinanciera",
    precio: "Según Categoría",
    frecuencia: "Renovación anual",
    destacado: false,
    esSoat: true,
    desgloseSoat: [
      { rango: "Motos (<100cc a >200cc)", valor: "Desde $256.200" },
      { rango: "Motocarros (Ciclomotores)", valor: "$343.300" },
      { rango: "Vehículos Eléctricos", valor: "Descuento del 10%" },
      { rango: "Pesados (Camiones/Buses)", valor: "Según TON / Pasajeros" },
    ],
    detalles: [
      "Expedición e impresión digital inmediata",
      "Descuento de ley aplicado para vehículos eléctricos",
      "Reporte directo en línea con la base de datos RUNT",
    ],
  },
];




const mediosPago = [
  {
    id: "efectivo",
    titulo: "Efectivo",
    imagen: medioPagoEfectivo,
  },
  {
    id: "tarjetas",
    titulo: "Tarjetas Débito y Crédito",
    imagen: medioPagoTarjeta,
  },
  {
    id: "sistecredito",
    titulo: "Sistecrédito",
    imagen: medioPagoSistecredito,
  },
  {
    id: "qr",
    titulo: "Código QR (Bancolombia / Nequi / Daviplata)",
    imagen: medioPagoQR,
  },
  {
    id: "transferencia",
    titulo: "Transferencia Bancaria",
    imagen: medioPagoTransferencia,
  },
];







const preguntasFrecuentes = [
  {
    id: "item-1",
    pregunta: "¿Qué es la RTM y EC?",
    respuesta:
      "Significa Revisión Técnico-Mecánica y de Emisiones Contaminantes. Es un proceso obligatorio en Colombia para todos los vehículos automotores. Su objetivo es verificar que cumplan rigurosamente con los estándares de seguridad vial, control ambiental y condiciones técnicas exigidas por la ley.",
  },
  {
    id: "item-2",
    pregunta: "¿Cuándo debo hacer la primera RTM y EC?",
    respuesta:
      "Los plazos legales vigentes dependen del tipo de servicio del vehículo y se cuentan a partir de su fecha de matrícula:",
    tieneLista: true,
    itemsLista: [
      {
        titulo: "Motocicletas",
        detalle: "A los 2 años después de la fecha de matrícula.",
      },
      {
        titulo: "Vehículos Livianos Particulares",
        detalle: "A los 5 años después de la fecha de matrícula.",
      },
      {
        titulo: "Vehículos Livianos Públicos",
        detalle: "A los 2 años después de la fecha de matrícula.",
      },
    ],
  },
  {
    id: "item-3",
    pregunta: "¿Venden el SOAT? ¿Es obligatorio para la RTM?",
    respuesta:
      "Sí, actualmente puedes renovar tu SOAT directamente con nosotros.",
    notaDestacada:
      "⚠️ Dato importante: NO es obligatorio contar con el SOAT vigente para presentarte a la revisión técnico-mecánica en el CDA, pero ten en cuenta los riesgos legales y comparendos que implica movilizar el vehículo por las vías públicas de la ciudad sin dicho seguro activo.",
  },
  {
    id: "item-4",
    pregunta: "¿Es necesario agendar cita previa para la RTM?",
    respuesta:
      "No, en nuestro CDA operamos por estricto orden de llegada, de modo que no es obligatorio contar con cita previa para ser atendido en la pista de diagnóstico. Sin embargo, si deseas coordinar tu tiempo o asegurar una atención preferente para el día, puedes comunicarte con nuestra línea +57 300 123 4567 para asegurar tu cupo.",
  },
  {
    id: "item-5",
    pregunta: "¿Cómo descargo mi certificado digital de RTM en el RUNT?",
    respuesta:
      "Aunque enviamos tu certificado aprobado directamente al WhatsApp y correo electrónico registrado, puedes descargarlo de la plataforma RUNT siguiendo estos pasos:",
    esRunt: true,
    pasosRunt: [
      "Ingresa la placa de tu vehículo y el número de documento del propietario registrado.",
      "Busca la pestaña 'Certificado de revisión técnico mecánica y de emisiones contaminantes (RTM)'. Allí podrás descargar el PDF oficial siempre que lo requieras.",
    ],
    enlaceRunt: "https://www.runt.com.co/consultaCiudadana/#/consultaVehiculo",
    notaAlerta:
      "Nota: Si el vehículo se encuentra matriculado bajo la figura de 'Persona Indeterminada', la plataforma RUNT bloqueará la expedición y consulta del certificado.",
  },
  {
    id: "item-6",
    pregunta: "¿Qué hago si mi vehículo sale rechazado en el diagnóstico?",
    respuesta:
      "De acuerdo con la resolución reglamentaria NTC 5375:2012, si el vehículo resulta reprobado, cuentas con un plazo de 15 días calendario contados desde el día del rechazo para subsanar los defectos mecánicos o de emisiones. Dentro de este término, puedes regresar al CDA para una única re-inspección sin costo adicional.",
  },
  {
    id: "item-7",
    pregunta: "¿Cuánto tiempo demora la revisión técnico-mecánica?",
    respuesta:
      "El tiempo promedio en la línea de pruebas varía entre 40 minutos y 1 hora desde que inicia formalmente el proceso en pista. Este tiempo puede verse incrementado por dos variables externas: el flujo de usuarios concurrentes en la misma franja horaria (picos de congestión) y la estabilidad de los servidores de entidades regulatorias externas obligatorias como el RUNT y el SICOV, los cuales en ocasiones sufren microcaídas o mantenimientos imprevistos durante la jornada.",
  },
  {
    id: "item-8",
    pregunta:
      "¿Por qué la moto no puede hacer su revisión con maletero o baúl instalado?",
    respuesta:
      "Según lo establecido formalmente por la norma técnica nacional NTC 5375:2012, se fija como criterio obligatorio de pre-revisión que todo vehículo ingrese a la pista de diagnóstico completamente descargado y vacío. En el caso particular de las motocicletas, los maleteros, baúles externos de carga o alforjas pesadas se consideran carga física adicional, la cual altera las mediciones de los equipos automáticos (frenómetros y de suspensión).",
  },
];





const imagenesInstalaciones = [
  { id: 1, src: instalaciones01, alt: "Instalaciones 01" },
  { id: 2, src: instalaciones02, alt: "Instalaciones 02" },
  { id: 3, src: instalaciones03, alt: "Instalaciones 03" },
  { id: 4, src: instalaciones04, alt: "Instalaciones 04" },
  { id: 5, src: instalaciones05, alt: "Instalaciones 05" },
 
];




const tramites = [
  {
    icono: "📢",
    titulo: "Quejas y Reclamos",
    descripcion:
      "Si tuviste algún inconveniente con nuestra atención o el proceso de tu revisión técnico-mecánica.",
  },
  {
    icono: "⚖️",
    titulo: "Apelaciones",
    descripcion:
      "Si no estás de acuerdo con los resultados técnicos arrojados en el diagnóstico de tu vehículo.",
  },
  {
    icono: "✨",
    titulo: "Felicitaciones",
    descripcion:
      "Queremos saber si tuviste una experiencia excelente. Tu opinión motiva a nuestro equipo técnico.",
  },
];



const navegación = [
  { name: "Inicio", href: "/" },
  { name: "Servicios", href: "#servicios" },
  { name: "Tarifas", href: "#precios" },
  { name: "Instalaciones", href: "#fotosSede" },
  { name: "Preguntas Frecuentes", href: "#preguntasFrecuentes" },
];

// Ícono SVG de WhatsApp
function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 2a10 10 0 0 0-8.528 15.228L2 22l4.896-1.285A10 10 0 1 0 12 2zm0 18a7.96 7.96 0 0 1-4.062-1.115l-.292-.173-3.018.792.806-2.942-.19-.302A7.962 7.962 0 1 1 12 20z" />
    </svg>
  );
}

// Ícono SVG de Instagram (reemplazo seguro sin fallos de importación)
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}




const WhatsApp = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const Facebook = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07" />
  </svg>
);

const Instagram = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M16.98 0a6.9 6.9 0 0 1 5.08 1.98A6.94 6.94 0 0 1 24 7.02v9.96c0 2.08-.68 3.87-1.98 5.13A7.14 7.14 0 0 1 16.94 24H7.06a7.06 7.06 0 0 1-5.03-1.89A6.96 6.96 0 0 1 0 16.94V7.02C0 2.8 2.8 0 7.02 0h9.96zm.05 2.23H7.06c-1.45 0-2.7.43-3.53 1.25a4.82 4.82 0 0 0-1.3 3.54v9.92c0 1.5.43 2.7 1.3 3.58a5 5 0 0 0 3.53 1.25h9.88a5 5 0 0 0 3.53-1.25 4.73 4.73 0 0 0 1.4-3.54V7.02a5 5 0 0 0-1.3-3.49 4.82 4.82 0 0 0-3.54-1.3zM12 5.76c3.39 0 6.2 2.8 6.2 6.2a6.2 6.2 0 0 1-12.4 0 6.2 6.2 0 0 1 6.2-6.2zm0 2.22a3.99 3.99 0 0 0-3.97 3.97A3.99 3.99 0 0 0 12 15.92a3.99 3.99 0 0 0 3.97-3.97A3.99 3.99 0 0 0 12 7.98zm6.44-3.77a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8z" />
  </svg>
);



export default function DemoLandingPage({
  currentTenant,
}: {
  currentTenant: string;
}) {




  const destinationUrl = `https://${currentTenant}.cda-app.com/peticiones-quejas-apelaciones-felicitaciones`;





  return (
    <>
      <main className="min-h-screen bg-background text-foreground">
        {/* NAVBAR */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-md">
          <nav className="flex h-16 w-full items-center justify-between pr-8">
            {/* 1. Logo a la izquierda con 5rem (ml-20) */}
            <div className="ml-20 flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src={demoLogo}
                  alt="CDA Demo Logo"
                  priority
                  className="h-10 w-auto object-contain"
                />
              </Link>
            </div>

           {/* 2. Centro: Menú de Navegación Lateral (Drawer de Shadcn) */}
<div className="flex items-center justify-center">
  <Drawer>
    <DrawerTrigger asChild>
      <Button
        variant="outline"
        size="default"
        className="border-[#15616d]/20 dark:border-[#ffecd1]/20 font-bold gap-2 shadow-sm text-[#001524] dark:text-[#ffecd1] hover:bg-[#ffecd1]/40 dark:hover:bg-white/10 transition-colors duration-200 cursor-pointer"
      >
        <Menu className="h-4 w-4 text-[#ff7d00]" />
        <span>Menú</span>
      </Button>
    </DrawerTrigger>

    <DrawerContent className="bg-white dark:bg-[#001524] border-t border-[#15616d]/20 dark:border-[#ffecd1]/20 p-6">
      <div className="mx-auto w-full max-w-sm flex flex-col space-y-6">
        {/* Encabezado del Drawer */}
        <DrawerHeader className="p-0 flex items-center justify-between border-b border-[#15616d]/10 dark:border-[#ffecd1]/10 pb-4">
          <DrawerTitle className="text-lg font-extrabold text-[#001524] dark:text-[#ffecd1] flex items-center gap-2">
            <span className="text-[#ff7d00]">📌</span> Navegación
          </DrawerTitle>
          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-[#15616d] dark:text-[#ffecd1]/80 hover:text-[#ff7d00] rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>

        {/* Lista de Botones / Enlaces por ID */}
        <nav className="flex flex-col space-y-2">
          <DrawerClose asChild>
            <Link
              href="#inicio"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#001524] dark:text-[#ffecd1] hover:bg-[#ffecd1]/50 dark:hover:bg-white/5 hover:text-[#ff7d00] dark:hover:text-[#ff7d00] transition-colors"
            >
              <Home className="h-4 w-4 text-[#ff7d00]" />
              <span>Inicio</span>
            </Link>
          </DrawerClose>

          <DrawerClose asChild>
            <Link
              href="#servicios"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#001524] dark:text-[#ffecd1] hover:bg-[#ffecd1]/50 dark:hover:bg-white/5 hover:text-[#ff7d00] dark:hover:text-[#ff7d00] transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-[#ff7d00]" />
              <span>Servicios y Cobertura</span>
            </Link>
          </DrawerClose>

          <DrawerClose asChild>
            <Link
              href="#fotosSede"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#001524] dark:text-[#ffecd1] hover:bg-[#ffecd1]/50 dark:hover:bg-white/5 hover:text-[#ff7d00] dark:hover:text-[#ff7d00] transition-colors"
            >
              <Building2 className="h-4 w-4 text-[#ff7d00]" />
              <span>Instalaciones</span>
            </Link>
          </DrawerClose>

          <DrawerClose asChild>
            <Link
              href="#contactoHorarios"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#001524] dark:text-[#ffecd1] hover:bg-[#ffecd1]/50 dark:hover:bg-white/5 hover:text-[#ff7d00] dark:hover:text-[#ff7d00] transition-colors"
            >
              <Phone className="h-4 w-4 text-[#ff7d00]" />
              <span>Contacto y Horarios</span>
            </Link>
          </DrawerClose>

          <DrawerClose asChild>
            <Link
              href="#preguntasFrecuentes"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#001524] dark:text-[#ffecd1] hover:bg-[#ffecd1]/50 dark:hover:bg-white/5 hover:text-[#ff7d00] dark:hover:text-[#ff7d00] transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-[#ff7d00]" />
              <span>Preguntas Frecuentes</span>
            </Link>
          </DrawerClose>

          <DrawerClose asChild>
            <Link
              href="#pqrsf"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#001524] dark:text-[#ffecd1] hover:bg-[#ffecd1]/50 dark:hover:bg-white/5 hover:text-[#ff7d00] dark:hover:text-[#ff7d00] transition-colors"
            >
              <FileText className="h-4 w-4 text-[#ff7d00]" />
              <span>PQRSF y Apelaciones</span>
            </Link>
          </DrawerClose>
        </nav>

        {/* Botón Destacado de Agendamiento en la Parte Inferior */}
        <div className="pt-2">
          <DrawerClose asChild>
            <Link
              href={""}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 flex items-center justify-center gap-2 bg-[#ff7d00] hover:bg-[#78290f] text-white rounded-xl text-sm font-extrabold tracking-tight shadow-md transition-colors"
            >
              <Calendar className="h-4 w-4" />
              <span>Agendar Revisión</span>
            </Link>
          </DrawerClose>
        </div>
      </div>
    </DrawerContent>
  </Drawer>
</div>

            {/* 3. Extremo derecho: Botones de acciones y redes */}
            <div className="flex items-center space-x-3">
              {/* Botón Tema */}
              <DemoModeToggle></DemoModeToggle>

              {/* Botón WhatsApp */}
              <Button
                variant="outline"
                nativeButton={false}
                size="icon"
                className="border-black border dark:border-white/80"
                title="WhatsApp"
                render={
                  <a
                    href="https://wa.me/573000000000"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <WhatsappIcon className="h-5 w-5" />
              </Button>

              {/* Botón Instagram */}
              <Button
                variant="outline"
                nativeButton={false}
                size="icon"
                className="border-black border dark:border-white/80"
                title="Instagram"
                render={
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <InstagramIcon className="h-5 w-5" />
              </Button>
            </div>
          </nav>
        </header>

        {/* CONTENIDO DE PRUEBA */}
        <section
          id="hero"
          className="w-full min-h-[85vh] flex items-center justify-center bg-[#ffecd1]/40 dark:bg-[#001524] px-6 py-12 md:px-12 select-none transition-colors duration-300"
        >
          <div className="max-w-6xl w-full flex flex-col md:flex-row gap-12 items-center justify-between">
            {/* Lado Izquierdo: Logo, Textos Demo y Botones */}
            <div className="flex flex-col items-center md:items-start space-y-6 max-w-2xl w-full md:w-[60%] text-center md:text-left">
              {/* 1. LOGO DEL ESTABLECIMIENTO */}
              {demoLogo && (
                <Image
                  src={demoLogo}
                  alt="Logo del CDA Demo"
                  width={220}
                  height={88}
                  priority
                  className="rounded-2xl object-contain border border-[#15616d]/30 dark:border-[#ffecd1]/20 dark:brightness-110"
                />
              )}

              {/* Textos principales explicativos de la Demo */}
              <div className="flex flex-col space-y-4">
                <span className="inline-block w-fit px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ff7d00]/15 text-[#ff7d00] dark:bg-[#ff7d00]/25 border border-[#ff7d00]/30 mx-auto md:mx-0">
                  Versión de Demostración
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1] lg:text-6xl">
                  Así lucirá la presencia digital de tu CDA
                </h1>
                <p className="text-lg md:text-xl font-normal text-[#15616d] dark:text-[#ffecd1]/80">
                  Plataforma web personalizada, optimizada para la conversión de
                  clientes, agenda de citas y cumplimiento normativo para
                  Centros de Diagnóstico Automotor.
                </p>
              </div>

              {/* Grupo de Botones */}
              <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                {/* Botón Principal: Solicitar Demo / Contratar */}
                <a
                  href="https://wa.me/573215224583"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-all bg-[#ff7d00] text-white hover:bg-[#78290f] dark:hover:bg-[#ff7d00]/90 h-11 px-8 shadow-md"
                >
                  Contratar para mi CDA
                  <span className="ml-2 text-base font-semibold transform -translate-y-px">
                    ↗
                  </span>
                </a>

                {/* Botón Secundario: Probar PQRSF Integrado */}
                <a
                  href="#pqrsf"
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors bg-[#15616d] text-[#ffecd1] hover:bg-[#001524] dark:bg-[#15616d] dark:hover:bg-[#15616d]/80 h-11 px-6 shadow-sm"
                >
                  Ver Módulo PQRSF
                </a>

                {/* Botón Terciario: Ver Características */}
                <a
                  href="#caracteristicas"
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors border-2 border-[#15616d] text-[#15616d] bg-transparent hover:bg-[#15616d]/10 dark:border-[#ffecd1] dark:text-[#ffecd1] dark:hover:bg-[#ffecd1]/10 h-11 px-6"
                >
                  Características
                </a>
              </div>
            </div>

            {/* Lado Derecho: Imagen Hero de la vista previa */}
            <div className="w-full md:w-[80%] flex min-h-96 md:min-h-112 relative rounded-xl overflow-hidden shadow-xl border border-[#15616d]/20 dark:border-[#ffecd1]/20">
              <Image
                src={hero}
                alt="Vista previa de la línea de inspección técnico mecánica para CDA"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>




<section
  id="quienesSomos"
  className="w-full flex items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300"
>
  <div className="max-w-6xl w-full flex flex-col md:flex-row gap-12 items-center justify-between">
    {/* Lado Izquierdo: Imagen Controlada */}
    <div className="w-full md:w-[45%] flex min-h-104 md:min-h-128 relative rounded-xl overflow-hidden shadow-lg border border-[#15616d]/20 dark:border-[#ffecd1]/20">
      <Image
        src={panoramico}
        alt="Instalaciones del CDA en vista panorámica"
        fill
        sizes="(max-width: 768px) 100vw, 45vw"
        className="object-cover"
      />
    </div>

    {/* Lado Derecho: Card estilo Shadcn UI */}
    <div className="w-full md:w-[55%] rounded-xl border border-[#15616d]/20 dark:border-[#ffecd1]/20 bg-white dark:bg-[#001524] text-[#001524] dark:text-[#ffecd1] shadow-md p-8 md:p-10 flex flex-col space-y-6">
      {/* Card Header */}
      <div className="flex flex-col space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#ff7d00] dark:text-[#ff7d00]">
          Sección Personalizable para tu CDA
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1]">
          Quiénes Somos
        </h2>
      </div>

      {/* Card Content (Reseña adaptada para la demo) */}
      <div className="text-base md:text-lg font-normal text-[#15616d] dark:text-[#ffecd1]/80 leading-relaxed space-y-4">
        <p>
          En esta sección, tu Centro de Diagnóstico Automotor proyecta la máxima
          confianza a sus clientes. Destacamos la historia de tu establecimiento,
          la cobertura territorial y tu compromiso inquebrantable con la
          seguridad vial y el control de emisiones.
        </p>
        <p>
          Ideal para exhibir cifras clave como más de{" "}
          <strong className="text-[#001524] dark:text-white font-bold">
            50,000 revisiones realizadas
          </strong>
          , años de experiencia en el sector y la capacidad de atención en tus
          líneas de inspección para livianos, pesados o motocicletas.
        </p>
        <p>
          Resaltamos la{" "}
          <strong className="text-[#15616d] dark:text-[#ff7d00] font-semibold">
            acreditación ONAC bajo ISO/IEC 17020
          </strong>{" "}
          y las autorizaciones del Ministerio de Transporte, garantizando a los
          usuarios la absoluta validez legal y transparencia de sus certificados
          RUNT.
        </p>
      </div>

      {/* Card Footer (Detalle de cumplimiento e identidad) */}
      <div className="pt-4 border-t border-[#15616d]/10 dark:border-[#ffecd1]/20 flex flex-wrap items-center gap-4 text-sm font-semibold text-[#15616d]/80 dark:text-[#ffecd1]/70">
        <div className="flex items-center gap-1.5">
          <span className="text-[#ff7d00] text-lg">✓</span> Acreditados ONAC
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#15616d]/30 dark:bg-[#ffecd1]/30"></div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#ff7d00] text-lg">✓</span> Integrado con RUNT
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#15616d]/30 dark:bg-[#ffecd1]/30"></div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#ff7d00] text-lg">✓</span> Colombia
        </div>
      </div>
    </div>
  </div>
</section>






<section
  id="servicios"
  className="w-full flex items-center justify-center bg-[#ffecd1]/30 dark:bg-[#001524]/60 px-6 py-16 md:px-12 select-none transition-colors duration-300"
>
  <div className="max-w-6xl w-full flex flex-col space-y-12">
    {/* Encabezado de la Sección */}
    <div className="flex flex-col space-y-3 text-center items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#ff7d00]">
        Catálogo de Servicios Adaptable
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1]">
        Servicios que Muestra tu CDA
      </h2>
      <p className="text-base md:text-lg font-normal text-[#15616d] dark:text-[#ffecd1]/80 max-w-2xl">
        Presenta de forma clara tu oferta comercial, desde revisiones
        obligatorias hasta servicios complementarios para todo tipo de vehículos.
      </p>
    </div>

    {/* Contenedor de Servicios con Flexbox */}
    <div className="w-full flex flex-col lg:flex-row gap-6 justify-between items-stretch">
      {/* Servicio 1: RTM (Destacado / Principal) */}
      <div className="flex-1 flex flex-col justify-between p-6 rounded-xl border-2 border-[#ff7d00] bg-white dark:bg-[#001524] text-[#001524] dark:text-[#ffecd1] shadow-md relative overflow-hidden">
        {/* Etiqueta de Obligatorio / Principal */}
        <div className="absolute top-0 right-0 bg-[#ff7d00] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg tracking-wider">
          Principal
        </div>

        <div className="flex flex-col space-y-4">
          <div className="w-12 h-12 rounded-lg bg-[#ff7d00]/10 flex items-center justify-center text-2xl text-[#ff7d00]">
            🛠️
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-[#001524] dark:text-[#ffecd1]">
              Revisión Técnico-Mecánica
            </h3>
            <p className="text-sm font-normal text-[#15616d] dark:text-[#ffecd1]/80 leading-relaxed">
              Inspección integral y control de emisiones contaminantes con
              pistas especializadas para motos, livianos o pesados, garantizando
              el cumplimiento normativo y expedición RUNT.
            </p>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-[#15616d]/20 dark:border-[#ffecd1]/20 flex items-center justify-between text-xs font-semibold text-[#ff7d00]">
          <span>Línea de inspección acreditada</span>
          <span>↗</span>
        </div>
      </div>

      {/* Servicio 2: Peritajes */}
      <div className="flex-1 flex flex-col justify-between p-6 rounded-xl border border-[#15616d]/20 dark:border-[#ffecd1]/20 bg-white dark:bg-[#001524] text-[#001524] dark:text-[#ffecd1] shadow-sm transition-all hover:border-[#15616d]/50 dark:hover:border-[#ffecd1]/50">
        <div className="flex flex-col space-y-4">
          <div className="w-12 h-12 rounded-lg bg-[#15616d]/10 flex items-center justify-center text-2xl text-[#15616d] dark:text-[#ffecd1]">
            🔍
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-[#001524] dark:text-[#ffecd1]">
              Peritaje Automotriz
            </h3>
            <p className="text-sm font-normal text-[#15616d] dark:text-[#ffecd1]/80 leading-relaxed">
              Diagnóstico exhaustivo del estado mecánico, chasis, pintura y
              sistemas de seguridad para compraventa con certificado respaldado
              por tu CDA.
            </p>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-[#15616d]/20 dark:border-[#ffecd1]/20 flex items-center justify-between text-xs font-semibold text-[#15616d] dark:text-[#ffecd1]/70">
          <span>Valoración técnica independiente</span>
          <span>↗</span>
        </div>
      </div>

      {/* Servicio 3: Venta de SOAT / Seguros */}
      <div className="flex-1 flex flex-col justify-between p-6 rounded-xl border border-[#15616d]/20 dark:border-[#ffecd1]/20 bg-white dark:bg-[#001524] text-[#001524] dark:text-[#ffecd1] shadow-sm transition-all hover:border-[#15616d]/50 dark:hover:border-[#ffecd1]/50">
        <div className="flex flex-col space-y-4">
          <div className="w-12 h-12 rounded-lg bg-[#78290f]/10 flex items-center justify-center text-2xl text-[#78290f] dark:text-[#ff7d00]">
            📄
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-[#001524] dark:text-[#ffecd1]">
              Expedición de SOAT
            </h3>
            <p className="text-sm font-normal text-[#15616d] dark:text-[#ffecd1]/80 leading-relaxed">
              Emisión inmediata del Seguro Obligatorio de Accidentes de
              Tránsito para que tus usuarios salgan de tus instalaciones con sus
              documentos al día.
            </p>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-[#15616d]/20 dark:border-[#ffecd1]/20 flex items-center justify-between text-xs font-semibold text-[#15616d] dark:text-[#ffecd1]/70">
          <span>Gestión digital y rápida</span>
          <span>↗</span>
        </div>
      </div>
    </div>
  </div>
</section>





<section
  id="consisteRTM"
  className="w-full flex items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300"
>
  <div className="max-w-5xl w-full flex flex-col space-y-10">
    {/* Encabezado */}
    <div className="flex flex-col space-y-3 text-center items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#ff7d00]">
        Flujo de Inspección Normativo
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1]">
        ¿En qué consiste la RTM en tu CDA?
      </h2>
      <p className="text-base md:text-lg font-normal text-[#15616d] dark:text-[#ffecd1]/80 max-w-2xl">
        Informa a tus usuarios sobre las 5 etapas reglamentarias que realiza tu
        equipo técnico en pista para garantizar una inspección transparente y
        segura.
      </p>
    </div>

    {/* Componente Tabs Oficial de Shadcn UI */}
    <Tabs
      defaultValue="sensorial"
      className="w-full flex flex-col space-y-6"
    >
      {/* Listado dinámico de pestañas */}
      <TabsList className="inline-flex h-12 w-full items-center justify-start rounded-xl bg-[#ffecd1]/50 dark:bg-[#001524]/80 p-1 text-[#15616d] dark:text-[#ffecd1]/70 overflow-x-auto overflow-y-hidden border border-[#15616d]/20 dark:border-[#ffecd1]/20">
        {rtmSteps.map((step) => (
          <TabsTrigger
            key={step.id}
            value={step.id}
            className="font-semibold tracking-tight data-[state=active]:bg-[#ff7d00] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
          >
            {step.tabLabel}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Contenidos dinámicos de las pestañas */}
      {rtmSteps.map((step) => (
        <TabsContent
          key={step.id}
          value={step.id}
          className="mt-0 focus-visible:outline-none"
        >
          <Card className="border-[#15616d]/20 dark:border-[#ffecd1]/20 bg-white dark:bg-[#001524] shadow-sm overflow-hidden">
            {/* Se conserva la clase mx-2 */}
            <div className="flex flex-col md:flex-row items-stretch justify-between mx-2">
              <div className="p-8 flex flex-col justify-center space-y-4 md:w-[60%]">
                <CardHeader className="p-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{step.emoji}</span>
                    <CardTitle className="text-xl font-bold text-[#001524] dark:text-[#ffecd1]">
                      {step.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0 text-base font-normal text-[#15616d] dark:text-[#ffecd1]/80 leading-relaxed">
                  {step.content}
                </CardContent>
              </div>
              <div className="w-full md:w-[40%] min-h-64 md:min-h-auto relative">
                <Image
                  src={step.image}
                  alt={step.alt}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  </div>
</section>





<section
  id="preparacionRTM"
  className="w-full flex flex-col items-center justify-center bg-[#ffecd1]/30 dark:bg-[#001524]/60 px-6 py-16 md:px-12 select-none transition-colors duration-300"
>
  <div className="max-w-6xl w-full flex flex-col space-y-12">
    {/* Encabezado */}
    <div className="flex flex-col space-y-3 text-center items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#ff7d00]">
        Educación al Usuario
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1]">
        Requisitos de Asistencia al CDA
      </h2>
      <p className="text-base md:text-lg font-normal text-[#15616d] dark:text-[#ffecd1]/80 max-w-2xl">
        Reduce las reinspecciones orientando a tus clientes previamente.
        Así le indicamos a los usuarios cómo deben presentar su vehículo antes
        de ingresar a tu pista.
      </p>
    </div>

    {/* Grid estructurado con Flexbox */}
    <div className="w-full flex flex-row flex-wrap gap-6 justify-center items-stretch">
      {requisitosAsistencia.map((requisito) => (
        <Card
          key={requisito.id}
          className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] flex flex-col justify-between overflow-hidden border-[#15616d]/20 dark:border-[#ffecd1]/20 bg-white dark:bg-[#001524] shadow-sm hover:shadow-md transition-all duration-300 group rounded-xl relative"
        >
          {/* Contenedor de la Imagen (Mitad Superior) */}
          <div className="w-full h-48 relative overflow-hidden bg-[#ffecd1]/40 dark:bg-[#001524]">
            <Image
              src={requisito.imagen}
              alt={requisito.titulo}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Degradado decorativo sobre la foto */}
            <div className="absolute inset-0 bg-linear-to-t from-[#001524]/60 via-transparent to-transparent" />

            {/* Adorno Elegante: Número Flotante de Identificación */}
            <span className="absolute top-3 right-3 text-xs font-black tracking-widest bg-white/95 dark:bg-[#001524]/90 text-[#15616d] dark:text-[#ffecd1] px-2.5 py-1 rounded-md shadow-xs">
              {requisito.id}
            </span>
          </div>

          {/* Contenido Técnico de la Card (Mitad Inferior) */}
          <div className="flex flex-col flex-1 p-6 space-y-2">
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1] group-hover:text-[#ff7d00] dark:group-hover:text-[#ff7d00] transition-colors duration-200">
                {requisito.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-sm font-normal text-[#15616d] dark:text-[#ffecd1]/80 leading-relaxed">
              {requisito.descripcion}
            </CardContent>
          </div>

          {/* Detalle visual sutil en el borde inferior */}
          <div className="w-full h-1 bg-transparent group-hover:bg-[#ff7d00] transition-colors duration-300" />
        </Card>
      ))}
    </div>
  </div>
</section>





<section
  id="precios"
  className="w-full flex flex-col items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300"
>
  <div className="max-w-6xl w-full flex flex-col space-y-12">
    {/* Encabezado */}
    <div className="flex flex-col space-y-3 text-center items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#ff7d00]">
        Módulo de Tarifas Reguladas
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1]">
        Precios y Tarifas Transparentes
      </h2>
      <p className="text-base md:text-lg font-normal text-[#15616d] dark:text-[#ffecd1]/80 max-w-2xl">
        Muestra tus valores oficializados con claridad. Diseñado para publicar
        los costos de RTM, SOAT y peritajes bajo la normativa del Ministerio de
        Transporte.
      </p>
    </div>

    {/* Contenedor de Tarjetas con Flexbox */}
    <div className="w-full flex flex-row flex-wrap gap-6 justify-center items-stretch">
      {tarifasServicios.map((tarifa) => (
        <Card
          key={tarifa.id}
          className={`w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] flex flex-col justify-between p-8 rounded-2xl transition-all duration-300 relative overflow-hidden ${
            tarifa.destacado
              ? "border-2 border-[#ff7d00] bg-white dark:bg-[#001524] shadow-md ring-4 ring-[#ff7d00]/10"
              : "border border-[#15616d]/20 dark:border-[#ffecd1]/20 bg-white dark:bg-[#001524] shadow-sm"
          }`}
        >
          {/* Etiqueta flotante para el servicio principal */}
          {tarifa.destacado && (
            <div className="absolute top-0 right-0 bg-[#ff7d00] text-white text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-bl-xl tracking-wider">
              Más Solicitado
            </div>
          )}

          {/* Contenido Superior: Títulos y Precio */}
          <div className="flex flex-col space-y-6">
            <CardHeader className="p-0 space-y-1">
              <CardTitle className="text-xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1]">
                {tarifa.titulo}
              </CardTitle>
              <CardDescription className="text-xs font-semibold text-[#15616d]/70 dark:text-[#ffecd1]/60 uppercase tracking-wider">
                {tarifa.subtitulo}
              </CardDescription>
            </CardHeader>

            {/* Sección del Valor Económico */}
            <div className="flex flex-col border-b border-[#15616d]/15 dark:border-[#ffecd1]/15 pb-6">
              <span className="text-4xl font-black tracking-tight text-[#001524] dark:text-[#ffecd1]">
                {tarifa.precio}
              </span>
              <span className="text-xs font-medium text-[#15616d] dark:text-[#ffecd1]/70 mt-1">
                {tarifa.frecuencia}
              </span>
            </div>

            {/* Condicional para el desglose específico del SOAT */}
            {tarifa.esSoat && tarifa.desgloseSoat && (
              <div className="flex flex-col space-y-2.5 bg-[#ffecd1]/40 dark:bg-white/5 p-4 rounded-xl border border-[#15616d]/10 dark:border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-[#15616d] dark:text-[#ffecd1]">
                  Tarifas según cilindrada:
                </span>
                <div className="flex flex-col space-y-1.5">
                  {tarifa.desgloseSoat.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-sm font-medium"
                    >
                      <span className="text-[#15616d]/90 dark:text-[#ffecd1]/80">
                        {item.rango}
                      </span>
                      <span className="font-bold text-[#001524] dark:text-[#ffecd1]">
                        {item.valor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listado de características y coberturas */}
            <CardContent className="p-0">
              <ul className="flex flex-col space-y-3">
                {tarifa.detalles.map((detalle, idx) => (
                  <li
                    key={idx}
                    className="flex items-start text-sm text-[#15616d] dark:text-[#ffecd1]/80 font-normal"
                  >
                    <span className="text-[#ff7d00] mr-2.5 font-bold">
                      ✓
                    </span>
                    {detalle}
                  </li>
                ))}
              </ul>
            </CardContent>
          </div>

          {/* Botón Decorativo de Acción */}
          <div className="mt-8 pt-4 border-t border-[#15616d]/10 dark:border-[#ffecd1]/10">
            <div
              className={`w-full py-3 px-4 rounded-xl text-center text-sm font-bold tracking-tight shadow-sm transition-all duration-200 cursor-pointer ${
                tarifa.destacado
                  ? "bg-[#ff7d00] hover:bg-[#78290f] text-white"
                  : "bg-[#15616d]/10 dark:bg-white/5 text-[#15616d] dark:text-[#ffecd1] hover:bg-[#15616d]/20 dark:hover:bg-white/10"
              }`}
            >
              Cotizar / Agendar Cupo
            </div>
          </div>
        </Card>
      ))}
    </div>

    {/* Nota aclaratoria legal al pie de los precios */}
    <p className="text-center text-xs font-normal text-[#15616d]/70 dark:text-[#ffecd1]/60 max-w-3xl mx-auto leading-relaxed">
      * El valor de la Revisión Técnico-Mecánica se encuentra regulado por el
      Ministerio de Transporte de Colombia. El precio final incluye los
      valores de recaudo de la Agencia Nacional de Seguridad Vial (ANSV), el
      Sistema de Control y Vigilancia (SICOV) y la tasa del Registro Único
      Nacional de Tránsito (RUNT). Las tarifas del SOAT corresponden a los
      valores fijados por la Superintendencia Financiera de Colombia.
    </p>
  </div>
</section>




<section
  id="mediosPagos"
  className="w-full flex flex-col items-center justify-center bg-[#ffecd1]/30 dark:bg-[#001524]/60 px-6 py-16 md:px-12 select-none transition-colors duration-300"
>
  <div className="max-w-6xl w-full flex flex-col space-y-12">
    {/* Encabezado */}
    <div className="flex flex-col space-y-3 text-center items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#ff7d00]">
        Facilidades de Recaudo
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1]">
        Métodos y Medios de Pago
      </h2>
      <p className="text-base md:text-lg font-normal text-[#15616d] dark:text-[#ffecd1]/80 max-w-2xl">
        Facilita la conversión de tus usuarios ofreciendo múltiples
        alternativas de pago presenciales y digitales para RTM, SOAT y
        peritajes.
      </p>
    </div>

    {/* Contenedor de Medios de Pago con Flexbox */}
    <div className="w-full flex flex-row flex-wrap gap-6 justify-center items-stretch">
      {mediosPago.map((medio) => (
        <Card
          key={medio.id}
          className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-20px)] min-w-50 flex flex-col overflow-hidden border border-[#15616d]/20 dark:border-[#ffecd1]/20 bg-white dark:bg-[#001524] shadow-sm hover:shadow-md transition-all duration-300 group rounded-xl"
        >
          {/* Espacio superior para la imagen */}
          <div className="w-full h-32 relative bg-[#ffecd1]/40 dark:bg-white/5 p-4 flex items-center justify-center border-b border-[#15616d]/10 dark:border-[#ffecd1]/10">
            <Image
              src={medio.imagen}
              alt={medio.titulo}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Título en la parte inferior */}
          <CardContent className="p-4 flex items-center justify-center text-center flex-1">
            <span className="text-sm font-bold tracking-tight text-[#001524] dark:text-[#ffecd1] group-hover:text-[#ff7d00] dark:group-hover:text-[#ff7d00] transition-colors duration-200">
              {medio.titulo}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
</section>




<section
  id="contactoHorarios"
  className="w-full flex flex-col items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300"
>
  <div className="max-w-5xl w-full flex flex-col space-y-12">
    {/* Encabezado */}
    <div className="flex flex-col space-y-3 text-center items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#ff7d00]">
        Módulo de Ubicación y Atención
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1]">
        Contacto y Horarios de Atención
      </h2>
      <p className="text-base md:text-lg font-normal text-[#15616d] dark:text-[#ffecd1]/80 max-w-2xl">
        Informa a tus clientes la ubicación exacta de tu sede, canales de
        contacto directo y los horarios de operación de tus líneas de inspección.
      </p>
    </div>

    {/* Contenedor Principal en Flexbox (Asimétrico) */}
    <div className="w-full flex flex-col md:flex-row gap-8 justify-between items-stretch">
      {/* Bloque Izquierdo: Datos de Contacto y Botón de Mapa */}
      <div className="flex-1 flex flex-col justify-between p-8 rounded-2xl border border-[#15616d]/20 dark:border-[#ffecd1]/20 bg-white dark:bg-[#001524] shadow-sm space-y-8">
        <div className="flex flex-col space-y-6">
          <h3 className="text-xl font-bold tracking-tight text-[#001524] dark:text-[#ffecd1]">
            Información de Contacto del CDA
          </h3>

          <div className="flex flex-col space-y-4">
            {/* Dirección */}
            <div className="flex items-start gap-3 text-sm font-normal text-[#15616d] dark:text-[#ffecd1]/80">
              <span className="text-xl text-[#ff7d00]">📍</span>
              <div>
                <p className="font-bold text-[#001524] dark:text-[#ffecd1]">
                  Dirección Principal
                </p>
                <p className="mt-0.5">
                  Calle / Carrera Principal #00-00, Ciudad, Colombia
                </p>
              </div>
            </div>

            {/* Teléfono / WhatsApp */}
            <div className="flex items-start gap-3 text-sm font-normal text-[#15616d] dark:text-[#ffecd1]/80">
              <span className="text-xl text-[#ff7d00]">📞</span>
              <div>
                <p className="font-bold text-[#001524] dark:text-[#ffecd1]">
                  Línea Telefónica y WhatsApp
                </p>
                <p className="mt-0.5">+57 (600) 000 0000 / +57 300 000 0000</p>
              </div>
            </div>

            {/* Correo Electrónico */}
            <div className="flex items-start gap-3 text-sm font-normal text-[#15616d] dark:text-[#ffecd1]/80">
              <span className="text-xl text-[#ff7d00]">✉️</span>
              <div>
                <p className="font-bold text-[#001524] dark:text-[#ffecd1]">
                  Correo Electrónico de Atención
                </p>
                <p className="mt-0.5 break-all">contacto@tucdaejemplo.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Redirección a Google Maps */}
        <Link
          href="https://maps.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-4 bg-[#ff7d00] hover:bg-[#78290f] text-white rounded-xl text-center text-sm font-bold tracking-tight shadow-sm transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Abrir Ubicación en Google Maps / Waze</span>
          <span className="transform group-hover:translate-x-1 transition-transform duration-200">
            ➔
          </span>
        </Link>
      </div>

      {/* Bloque Derecho: Tabla de Horarios */}
      <div className="flex-1 flex flex-col p-8 rounded-2xl border-2 border-[#ff7d00] bg-white dark:bg-[#001524] shadow-md ring-4 ring-[#ff7d00]/10 justify-center">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">⏰</span>
            <h3 className="text-xl font-bold tracking-tight text-[#001524] dark:text-[#ffecd1]">
              Horarios de Operación
            </h3>
          </div>

          <div className="flex flex-col space-y-3">
            {/* Lunes a Viernes */}
            <div className="flex justify-between items-center py-2.5 border-b border-[#15616d]/15 dark:border-[#ffecd1]/15 text-sm">
              <span className="font-bold text-[#001524] dark:text-[#ffecd1]">
                Lunes a Viernes
              </span>
              <span className="font-semibold text-[#15616d] dark:text-[#ffecd1] bg-[#ffecd1]/50 dark:bg-white/5 px-3 py-1 rounded-lg">
                7:00 AM – 6:00 PM
              </span>
            </div>

            {/* Sábados */}
            <div className="flex justify-between items-center py-2.5 border-b border-[#15616d]/15 dark:border-[#ffecd1]/15 text-sm">
              <span className="font-bold text-[#001524] dark:text-[#ffecd1]">
                Sábados
              </span>
              <span className="font-semibold text-[#15616d] dark:text-[#ffecd1] bg-[#ffecd1]/50 dark:bg-white/5 px-3 py-1 rounded-lg">
                7:00 AM – 3:00 PM
              </span>
            </div>

            {/* Domingos y Festivos */}
            <div className="flex justify-between items-center py-2.5 text-sm">
              <span className="font-bold text-[#15616d]/60 dark:text-[#ffecd1]/50">
                Domingos y Festivos
              </span>
              <span className="font-bold text-red-500 bg-red-500/10 px-3 py-1 rounded-lg uppercase text-xs tracking-wider">
                Según Disponibilidad
              </span>
            </div>
          </div>

          {/* Nota Recordatorio */}
          <p className="text-xs font-normal text-[#15616d] dark:text-[#ffecd1]/80 bg-[#ffecd1]/40 dark:bg-white/5 p-4 rounded-xl border border-[#15616d]/15 dark:border-white/10 leading-relaxed">
            📢{" "}
            <strong className="text-[#001524] dark:text-[#ffecd1] font-bold">
              Atención por orden de llegada o agendamiento:
            </strong>{" "}
            Los usuarios pueden ingresar sus vehículos (motos, livianos, pesados o
            eléctricos) directamente a las líneas de revisión según la capacidad
            operativa de la sede.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>






<section
  id="preguntasFrecuentes"
  className="w-full flex flex-col items-center justify-center bg-[#ffecd1]/30 dark:bg-[#001524]/60 px-6 py-16 md:px-12 select-none transition-colors duration-300"
>
  <div className="max-w-4xl w-full flex flex-col space-y-12">
    {/* Encabezado */}
    <div className="flex flex-col space-y-3 text-center items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#ff7d00]">
        Resuelve tus dudas
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1]">
        Preguntas Frecuentes (FAQ)
      </h2>
      <p className="text-base md:text-lg font-normal text-[#15616d] dark:text-[#ffecd1]/80 max-w-2xl">
        Encuentra respuestas rápidas a las consultas más comunes sobre la
        Revisión Técnico-Mecánica, normativas, tiempos y trámites en nuestro
        CDA.
      </p>
    </div>

    {/* Acordeón dinámico mediante mapeo del objeto */}
    <Accordion className="w-full space-y-4">
      {preguntasFrecuentes.map((faq) => (
        <AccordionItem
          key={faq.id}
          value={faq.id}
          className="border border-[#15616d]/20 dark:border-[#ffecd1]/20 bg-white dark:bg-[#001524] rounded-xl px-6 shadow-sm overflow-hidden"
        >
          <AccordionTrigger className="text-base font-bold tracking-tight text-[#001524] dark:text-[#ffecd1] hover:text-[#ff7d00] dark:hover:text-[#ff7d00] hover:no-underline py-4 text-left transition-colors duration-200">
            {faq.pregunta}
          </AccordionTrigger>

          <AccordionContent className="text-sm font-normal text-[#15616d] dark:text-[#ffecd1]/80 leading-relaxed pb-4 border-t border-[#15616d]/10 dark:border-[#ffecd1]/10 pt-3 space-y-3">
            <p>{faq.respuesta}</p>

            {/* Renderizado condicional si incluye lista de tiempos */}
            {faq.tieneLista && faq.itemsLista && (
              <div className="mt-3 flex flex-col space-y-2">
                {faq.itemsLista.map((item, index) => (
                  <p key={index}>
                    •{" "}
                    <strong className="text-[#001524] dark:text-[#ffecd1]">
                      {item.titulo}:
                    </strong>{" "}
                    <span className="text-[#15616d] dark:text-[#ffecd1]/90">
                      {item.detalle.includes("A los ")
                        ? `A los `
                        : item.detalle}
                    </span>
                    {item.detalle.includes("A los ") && (
                      <strong className="text-[#ff7d00] font-bold">
                        {item.detalle.split("A los ")[1]}
                      </strong>
                    )}
                  </p>
                ))}
              </div>
            )}

            {/* Renderizado condicional si incluye nota destacada (SOAT) */}
            {faq.notaDestacada && (
              <span className="block bg-[#ffecd1]/40 dark:bg-white/5 p-3 rounded-lg border border-[#15616d]/10 dark:border-white/10 mt-2 text-xs font-medium text-[#15616d] dark:text-[#ffecd1]/90">
                {faq.notaDestacada}
              </span>
            )}

            {/* Renderizado condicional si incluye los pasos del RUNT */}
            {faq.esRunt && faq.pasosRunt && (
              <>
                <ol className="list-decimal pl-5 space-y-1.5 mt-2">
                  <li>
                    Ingresa al portal de consulta ciudadana:{" "}
                    <Link
                      href={faq.enlaceRunt || "https://www.runt.gov.co"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ff7d00] font-semibold hover:underline break-all"
                    >
                      runt.gov.co/consultaCiudadana
                    </Link>
                  </li>
                  {faq.pasosRunt.map((paso, index) => (
                    <li key={index}>{paso}</li>
                  ))}
                </ol>

                {faq.notaAlerta && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold bg-red-500/10 dark:bg-red-500/20 p-2.5 rounded-lg border border-red-500/20 mt-3">
                    {faq.notaAlerta}
                  </p>
                )}
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </div>
</section>



<section
  id="fotosSede"
  className="w-full flex flex-col items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300"
>
  <div className="max-w-6xl w-full flex flex-col space-y-12">
    {/* Encabezado */}
    <div className="flex flex-col space-y-3 text-center items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#ff7d00]">
        Infraestructura y Tecnología
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1]">
        Instalaciones y Pistas de Inspección
      </h2>
      <p className="text-base md:text-lg font-normal text-[#15616d] dark:text-[#ffecd1]/80 max-w-2xl">
        Incluye fotos de alta resolucion de tu centro de diagnostico automotor para que tus clientes conoscan tus instalaciones.
      </p>
    </div>

    {/* Contenedor del Carrusel de Shadcn */}
    <div className="w-full flex justify-center px-4 md:px-10">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full max-w-5xl relative"
      >
        <CarouselContent className="-ml-4">
          {imagenesInstalaciones.map((img) => (
            <CarouselItem
              key={img.id}
              className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
            >
              <div className="p-1">
                <Card className="overflow-hidden border border-[#15616d]/20 dark:border-[#ffecd1]/20 bg-white dark:bg-[#001524] shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl group">
                  <CardContent className="p-0 flex aspect-4/3 relative w-full items-center justify-center">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Controles de navegación */}
        <CarouselPrevious
          disabled={false}
          className="flex -left-7.5 sm:-left-12 border-[#15616d]/20 dark:border-[#ffecd1]/30 bg-white dark:bg-[#001524] text-[#001524] dark:text-[#ffecd1] hover:bg-[#ff7d00] hover:text-white dark:hover:bg-[#ff7d00] dark:hover:text-white hover:border-[#ff7d00] transition-colors duration-200"
        />
        <CarouselNext
          disabled={false}
          className="flex -right-7.5 sm:-right-12 border-[#15616d]/20 dark:border-[#ffecd1]/30 bg-white dark:bg-[#001524] text-[#001524] dark:text-[#ffecd1] hover:bg-[#ff7d00] hover:text-white dark:hover:bg-[#ff7d00] dark:hover:text-white hover:border-[#ff7d00] transition-colors duration-200"
        />
      </Carousel>
    </div>
  </div>
</section>







<section
  id="CTA"
  className="w-full flex items-center justify-center bg-[#ffecd1]/30 dark:bg-[#001524]/60 px-6 py-20 md:px-12 select-none transition-colors duration-300"
>
  <div className="max-w-5xl w-full rounded-3xl border border-[#15616d]/20 dark:border-[#ffecd1]/20 bg-white dark:bg-[#001524] p-8 md:p-14 shadow-xl flex flex-col md:flex-row gap-10 items-center justify-between relative overflow-hidden">
    {/* Efecto decorativo de fondo sutil al estilo Shadcn */}
    <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff7d00]/10 dark:bg-[#ff7d00]/15 rounded-full blur-3xl pointer-events-none -z-10" />

    {/* Lado Izquierdo: Textos e Interacción */}
    <div className="w-full md:w-[60%] flex flex-col space-y-6 text-center md:text-left items-center md:items-start">
      <div className="flex flex-col space-y-2">
        <span className="text-xs font-black uppercase tracking-widest text-[#ff7d00]">
          ¿Tu revisión técnico-mecánica está por vencer?
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1] leading-tight">
          Transita seguro y al día por las vías del país
        </h2>
      </div>

      <p className="text-base md:text-lg font-normal text-[#15616d] dark:text-[#ffecd1]/80 max-w-lg leading-relaxed">
        Ingresa hoy mismo tu vehículo (moto, motocarro, liviano, pesado o eléctrico) a
        nuestras pistas especializadas o escríbenos directamente para resolver
        tus inquietudes de forma ágil y rápida.
      </p>

      {/* Botones de Acción */}
      <div className="w-full flex flex-col sm:flex-row gap-4 pt-2 justify-center md:justify-start">
        <Link
          href={"https://www.cda-app.com"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-[#ff7d00] hover:bg-[#78290f] text-white text-sm font-bold tracking-tight shadow transition-all duration-200 px-8 group gap-2 cursor-pointer"
        >
          <span>Agendar Inspección</span>
          <span className="transform group-hover:translate-x-0.5 transition-transform">
            📅
          </span>
        </Link>

        <Link
          href={"https://www.cda-app.com"}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center rounded-xl border border-[#15616d]/20 dark:border-[#ffecd1]/30 bg-white/50 dark:bg-transparent text-[#001524] dark:text-[#ffecd1] hover:bg-[#ffecd1]/50 dark:hover:bg-white/5 text-sm font-bold tracking-tight transition-all duration-200 px-8 gap-2 cursor-pointer"
        >
          <span>Contacto Directo</span>
          <span>💬</span>
        </Link>
      </div>
    </div>

    {/* Lado Derecho: Contenedor con la imagen grande del logo */}
    <div className="w-full md:w-[35%] flex justify-center items-center relative aspect-square max-w-60 md:max-w-none">
      <div className="w-full h-full relative p-6 bg-[#ffecd1]/40 dark:bg-white/5 rounded-2xl border border-[#15616d]/10 dark:border-white/5 flex items-center justify-center shadow-inner group">
        <Image
          src={demoLogo}
          alt="Logo Oficial del CDA Demo"
          fill
          sizes="(max-width: 768px) 240px, 320px"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 rounded-2xl"
          priority
        />
      </div>
    </div>
  </div>
</section>





<section
  id="pqrsf"
  className="w-full flex flex-col items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300"
>
  <div className="max-w-5xl w-full flex flex-col space-y-12">
    {/* Encabezado */}
    <div className="flex flex-col space-y-3 text-center items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#ff7d00]">
        Tu opinión nos importa
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#001524] dark:text-[#ffecd1]">
        Peticiones, Quejas, Reclamos o Apelaciones
      </h2>
      <p className="text-base md:text-lg font-normal text-[#15616d] dark:text-[#ffecd1]/80 max-w-2xl">
        Operamos bajo los lineamientos de la norma ISO/IEC 17020 para
        garantizar imparcialidad, transparencia y calidad en el servicio. Si deseas
        manifestar una inconformidad o radicar una solicitud, estamos a tu disposición.
      </p>
    </div>

    {/* Bloque de opciones en rejilla */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {tramites.map((item, index) => (
        <Card
          key={index}
          className="border border-[#15616d]/20 dark:border-[#ffecd1]/20 bg-white dark:bg-[#001524] shadow-sm rounded-2xl overflow-hidden hover:border-[#ff7d00]/50 transition-colors duration-200"
        >
          <CardContent className="p-6 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
            <span className="text-3xl">{item.icono}</span>
            <h3 className="text-lg font-bold text-[#001524] dark:text-[#ffecd1]">
              {item.titulo}
            </h3>
            <p className="text-sm font-normal text-[#15616d] dark:text-[#ffecd1]/70 leading-relaxed">
              {item.descripcion}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Botón de llamado a la acción hacia el formulario */}
    <div className="w-full flex justify-center pt-2">
      <div className="relative group w-full sm:w-auto inline-block">
        {/* Efecto de resplandor / aura trasera animada */}
        <div className="absolute -inset-1 bg-linear-to-r from-[#ff7d00] via-[#ffecd1] to-[#ff7d00] rounded-2xl blur-lg opacity-60 group-hover:opacity-90 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

        {/* Botón Principal */}
        <Link
          href={destinationUrl}
          className="relative w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center gap-3 bg-linear-to-r from-[#ff7d00] via-[#78290f] to-[#ff7d00] text-white text-base font-extrabold tracking-wide rounded-2xl border border-white/20 shadow-2xl transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.98] cursor-pointer text-center"
        >
          {/* Icono de documento */}
          <FileText className="w-5 h-5 shrink-0 animate-bounce group-hover:animate-none" />

          <span>Radicar Solicitud Oficial (PQRSF)</span>

          {/* Flecha interactiva con desplazamiento */}
          <ArrowRight className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
        </Link>
      </div>
    </div>
  </div>
</section>



<footer className="w-full px-6 md:px-12 bg-white dark:bg-[#001524] border-t border-[#15616d]/15 dark:border-[#ffecd1]/10 transition-colors duration-300">
  {/* CONTENEDOR PRINCIPAL */}
  <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-10 py-12">
    {/* COLUMNA 1: LOGO E INFO DEL CDA DEMO */}
    <div className="flex flex-col max-w-md space-y-4">
      <div className="w-fit">
        <Link prefetch={true} href="/" className="flex items-center">
          <Image
            src={demoLogo}
            alt="Logo Oficial CDA Demo"
            priority
            className="block dark:hidden w-auto h-20 object-contain rounded-2xl"
          />
          <Image
            src={demoLogo}
            alt="Logo Oficial CDA Demo"
            priority
            className="hidden dark:block w-auto h-20 object-contain rounded-2xl"
          />
        </Link>
      </div>

      <p className="text-sm font-normal text-[#15616d] dark:text-[#ffecd1]/80 leading-relaxed">
        Plataforma demo especializada para Centros de Diagnóstico Automotor (CDA).
        Acreditados bajo norma ISO/IEC 17020 para la Revisión Técnico-Mecánica y de
        Emisiones Contaminantes de vehículos livianos, pesados, motocicletas y
        eléctricos.
      </p>

      <div className="space-y-1.5 text-sm text-[#15616d] dark:text-[#ffecd1]/80">
        <p>
          <span className="font-bold text-[#001524] dark:text-[#ffecd1]">
            Ubicación:
          </span>{" "}
          Calle / Carrera Principal #00-00, Ciudad, Colombia
        </p>
        <p>
          <span className="font-bold text-[#001524] dark:text-[#ffecd1]">
            Contacto / WhatsApp:
          </span>{" "}
          +57 (300) 000 0000
        </p>
      </div>
    </div>

    {/* COLUMNA 2: NAVEGACIÓN */}
    <div className="flex flex-col sm:min-w-37.5">
      <span className="text-xs font-black tracking-wider uppercase text-[#ff7d00] mb-4">
        Navegación
      </span>
      <div className="flex flex-col space-y-2.5">
        {navegación.map((item, index) => (
          <Link
            key={index}
            href={item.href}
            className="text-sm font-medium text-[#15616d] dark:text-[#ffecd1]/70 hover:text-[#ff7d00] dark:hover:text-[#ff7d00] transition-colors w-fit"
          >
            {item.name}
          </Link>
        ))}
      </div>
    </div>

    {/* COLUMNA 3: REDES SOCIALES */}
    <div className="flex flex-col sm:min-w-37.5">
      <span className="text-xs font-black tracking-wider uppercase text-[#ff7d00] mb-4">
        Redes Sociales
      </span>
      <div className="flex items-center space-x-5 text-[#15616d]/70 dark:text-[#ffecd1]/60">
        <a
          href="https://wa.me/573000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#ff7d00] dark:hover:text-[#ff7d00] transition-colors"
          aria-label="WhatsApp"
        >
          <WhatsApp size={22} />
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#ff7d00] dark:hover:text-[#ff7d00] transition-colors"
          aria-label="Facebook"
        >
          <Facebook size={22} />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#ff7d00] dark:hover:text-[#ff7d00] transition-colors"
          aria-label="Instagram"
        >
          <Instagram size={22} />
        </a>
      </div>
    </div>
  </div>

  {/* COPYRIGHT */}
  <div className="py-8 text-xs font-medium text-center text-[#15616d]/70 dark:text-[#ffecd1]/50 border-t border-[#15616d]/10 dark:border-[#ffecd1]/10">
    Copyright ©{" "}
    <Suspense fallback={<span>2026</span>}>
      <DynamicYear />
    </Suspense>{" "}
    CDA Demo. Hecho con ♥ por Juan Aristizabal.
  </div>
</footer>




      </main>
    </>
  );
}
