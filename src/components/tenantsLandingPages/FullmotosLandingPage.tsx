import { Navbar } from "../tenantsLandingPages/TenantLandingPageNavBar/Navbar";
import logo from "../../../public/tenantsLanding/fullmotosla25/fullmotos_logo.jpg"
import hero from "../../../public/tenantsLanding/fullmotosla25/hero.webp"
import panoramico from "../../../public/tenantsLanding/fullmotosla25/fullmotos_panoramico.png"
import DynamicYear from "../landingPage/DynamicYear";



//Imagenes de la rtm de ejemplo
import sensorialImage from "../../../public/tenantsLanding/fullmotosla25/pasosRTM_sensorial_reziced.webp"
import lucesImage from "../../../public/tenantsLanding/fullmotosla25/pasosRTM_luces_reziced.webp"
import gasesImage from "../../../public/tenantsLanding/fullmotosla25/pasosRTM_gasesreziced.webp"
import sonometriaImage from "../../../public/tenantsLanding/fullmotosla25/sensorial_sonometro_reziced.jpg"
import frenosImage from "../../../public/tenantsLanding/fullmotosla25/pasosRTM_frenos_reziced.webp"


//Imagenes condicones para la inspeccion
import motoDescargada from "../../../public/tenantsLanding/fullmotosla25/condicionesEntrada_MotoDescargada.webp"
import motoLimpia from "../../../public/tenantsLanding/fullmotosla25/condiconesEntrada_MotoLimpia.jpg"
import motoBuenaPresion from "../../../public/tenantsLanding/fullmotosla25/condiconesEntrada_presionllantas.jpg"
import motoSliders from "../../../public/tenantsLanding/fullmotosla25/condicnoesEntrada_sliders.webp"
import motoAlarma from "../../../public/tenantsLanding/fullmotosla25/condicionesEntrada_alarma.jpg"
import motoCombustible from "../../../public/tenantsLanding/fullmotosla25/condicionesEntrada_combustible.jpg"
import motoSuspencion from "../../../public/tenantsLanding/fullmotosla25/condicionesEntrada_suspencion.avif"
import motoRejilla from "../../../public/tenantsLanding/fullmotosla25/condicionesEntrada_rejilla-1.webp"
import motoSoporte from "../../../public/tenantsLanding/fullmotosla25/condicionesEntrada_soporteCentral.jpg"



//Imagenes para los medios de pago
import medioPagoEfectivo from "../../../public/tenantsLanding/fullmotosla25/MediosPago_Efectivo.jpg"
import medioPagoTarjeta from "../../../public/tenantsLanding/fullmotosla25/MediosPago_Targeta.jpg"
import medioPagoSistecredito from "../../../public/tenantsLanding/fullmotosla25/MediosPago_Sistecredito.jpg"
import medioPagoQR from "../../../public/tenantsLanding/fullmotosla25/MedioPago_QR.avif"
import medioPagoTransferencia from "../../../public/tenantsLanding/fullmotosla25/MedioPago_Transferencia.jpg"



//Imagenes de las instalaciones
import instalaciones01 from "../../../public/tenantsLanding/fullmotosla25/Instalaciones_01.jpg";
import instalaciones02 from "../../../public/tenantsLanding/fullmotosla25/Instalaciones_02.jpg";
import instalaciones03 from "../../../public/tenantsLanding/fullmotosla25/Instalaciones_03.jpg";
import instalaciones04 from "../../../public/tenantsLanding/fullmotosla25/Instalaciones_04.jpg";
import instalaciones05 from "../../../public/tenantsLanding/fullmotosla25/Instalaciones_05.jpg";
import instalaciones06 from "../../../public/tenantsLanding/fullmotosla25/Instalaciones_06.jpg";
import instalaciones07 from "../../../public/tenantsLanding/fullmotosla25/Instalaciones_07.jpg";
import instalaciones08 from "../../../public/tenantsLanding/fullmotosla25/Instalaciones_08.jpg";
import instalaciones09 from "../../../public/tenantsLanding/fullmotosla25/Instalaciones_09.jpg";






import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";


import { Suspense } from "react";

import PqrsfModal from "./modal/Pqrsf";



const colorPalette = {
  freshSky: '#00a6fb',       // Cyan vivo (Acentos / Destacados en oscuro)
  steelBlue: '#0582ca',      // Azul profesional (Hover / Secundarios)
  balticBlue: '#006494',     // Azul oceánico (Bordes / Detalles)
  deepSpaceBlue: '#003554',  // Azul cosmos oscuro (Textos claros en oscuro / Fondos parciales)
  inkBlack: '#051923'        // Negro tinta ultra oscuro (Texto principal en claro / Fondo en oscuro)
};



const requisitosAsistencia = [
  {
    id: "01",
    titulo: "Vehículo Descargado",
    descripcion: "La motocicleta debe presentarse sin carga adicional, equipaje, alforjas pesadas o maleteros sobredimensionados.",
    imagen: motoDescargada
  },
  {
    id: "02",
    titulo: "Condiciones de Limpieza",
    descripcion: "El vehículo debe estar limpio, libre de barro o grasa excesiva que impida la correcta inspección visual y sensorial.",
    imagen: motoLimpia
  },
  {
    id: "03",
    titulo: "Presión de Llantas",
    descripcion: "Ambas ruedas deben contar con la presión de aire adecuada según la especificación técnica del fabricante.",
    imagen: motoBuenaPresion
  },
  {
    id: "04",
    titulo: "Ejes Despejados",
    descripcion: "Retirar tapacubos, tapones de tuercas o sliders instalados en los ejes de las ruedas para permitir la sujeción e inspección.",
    imagen: motoSliders
  },
  {
    id: "05",
    titulo: "Alarma Desactivada",
    descripcion: "Para las motocicletas que aplique, el sistema de alarma debe permanecer apagado para evitar bloqueos en la línea de prueba.",
    imagen: motoAlarma
  },
  {
    id: "06",
    titulo: "Combustible Suficiente",
    descripcion: "Contar con al menos un cuarto (1/4) de tanque de combustible para poder realizar correctamente las pruebas dinámicas y de gases.",
    imagen: motoCombustible
  },
  {
    id: "07",
    titulo: "Suspensión Libre",
    descripcion: "Sin abrazaderas fijas ni amarres improvisados en las cubiertas o fuelles de la suspensión delantera o trasera.",
    imagen: motoSuspencion
  },
  {
    id: "08",
    titulo: "Escape sin Obstrucciones",
    descripcion: "El tubo de escape debe estar libre de aditamentos, mallas o deflectores que obstaculicen el ingreso de la sonda de gases.",
    imagen: motoRejilla
  },
  {
    id: "09",
    titulo: "Soporte Central (Scooters)",
    descripcion: "Las motocicletas tipo scooter deben asistir obligatoriamente con su soporte central (gato) en perfecto estado funcional.",
    imagen: motoSoporte
  }
];



const tarifasServicios = [
  {
    id: "rtm",
    titulo: "Revisión Técnico-Mecánica",
    subtitulo: "Emisiones y Seguridad Vial",
    precio: "$237.000",
    frecuencia: "Obligatorio anual",
    destacado: true,
    detalles: [
      "Aplica para motocicletas de 2T y 4T",
      "Diagnóstico sistematizado en pista",
      "Cargue inmediato del certificado en el RUNT",
      "Servicio avalado por la ONAC"
    ]
  },
  {
    id: "peritaje",
    titulo: "Peritaje Especializado",
    subtitulo: "Inspección de Compra/Venta",
    precio: "$60.000",
    frecuencia: "Por evento",
    destacado: false,
    detalles: [
      "Válido para cualquier tipo de moto",
      "Evaluación estructural del chasis",
      "Revisión de compresión y motor",
      "Informe físico y digital del estado"
    ]
  },
  {
    id: "soat",
    titulo: "Seguro Obligatorio (SOAT)",
    subtitulo: "Tarifas Oficiales Reguladas",
    precio: "Desde $256.200",
    frecuencia: "Vigencia de 1 año",
    destacado: false,
    esSoat: true,
    desgloseSoat: [
      { rango: "Menos de 100 c.c.", valor: "$256.200" },
      { rango: "De 100 c.c. a 200 c.c.", valor: "$343.300" },
      { rango: "Más de 200 c.c.", valor: "$761.400" }
    ],
    detalles: [
      "Expedición e impresión inmediata",
      "Reporte directo a la plataforma RUNT",
      "Cobertura nacional de accidentes"
    ]
  }
];





const mediosPago = [
  {
    id: "efectivo",
    titulo: "Efectivo",
    imagen: medioPagoEfectivo
  },
  {
    id: "tarjetas",
    titulo: "Tarjetas Débito y Crédito",
    imagen: medioPagoTarjeta
  },
  {
    id: "sistecredito",
    titulo: "Sistecrédito",
    imagen: medioPagoSistecredito
  },
  {
    id: "qr",
    titulo: "Código QR (Bancolombia / Nequi / Daviplata)",
    imagen: medioPagoQR
  },
  {
    id: "transferencia",
    titulo: "Transferencia Bancaria",
    imagen: medioPagoTransferencia
  }
];



const preguntasFrecuentes = [
  {
    id: "item-1",
    pregunta: "¿Qué es la RTM y EC?",
    respuesta: "Significa Revisión Técnico-Mecánica y de Emisiones Contaminantes. Es un proceso obligatorio en Colombia para todos los vehículos automotores. Su objetivo es verificar que cumplan rigurosamente con los estándares de seguridad vial, control ambiental y condiciones técnicas exigidas por la ley."
  },
  {
    id: "item-2",
    pregunta: "¿Cuándo debo hacer la primera RTM y EC?",
    respuesta: "Los plazos legales vigentes dependen del tipo de servicio del vehículo y se cuentan a partir de su fecha de matrícula:",
    tieneLista: true,
    itemsLista: [
      { titulo: "Motocicletas", detalle: "A los 2 años después de la fecha de matrícula." },
      { titulo: "Vehículos Livianos Particulares", detalle: "A los 5 años después de la fecha de matrícula." },
      { titulo: "Vehículos Livianos Públicos", detalle: "A los 2 años después de la fecha de matrícula." }
    ]
  },
  {
    id: "item-3",
    pregunta: "¿Venden el SOAT? ¿Es obligatorio para la RTM?",
    respuesta: "Sí, actualmente puedes renovar tu SOAT directamente con nosotros.",
    notaDestacada: "⚠️ Dato importante: NO es obligatorio contar con el SOAT vigente para presentarte a la revisión técnico-mecánica en el CDA, pero ten en cuenta los riesgos legales y comparendos que implica movilizar el vehículo por las vías públicas de la ciudad sin dicho seguro activo."
  },
  {
    id: "item-4",
    pregunta: "¿Es necesario agendar cita previa para la RTM?",
    respuesta: "No, en nuestro CDA operamos por estricto orden de llegada, de modo que no es obligatorio contar con cita previa para ser atendido en la pista de diagnóstico. Sin embargo, si deseas coordinar tu tiempo o asegurar una atención preferente para el día, puedes comunicarte con nuestra línea 323 3303659 para asegurar tu cupo."
  },
  {
    id: "item-5",
    pregunta: "¿Cómo descargo mi certificado digital de RTM en el RUNT?",
    respuesta: "Aunque enviamos tu certificado aprobado directamente al WhatsApp y correo electrónico registrado, puedes descargarlo de la plataforma RUNT siguiendo estos pasos:",
    esRunt: true,
    pasosRunt: [
      "Ingresa la placa de tu vehículo y el número de documento del propietario registrado.",
      "Busca la pestaña 'Certificado de revisión técnico mecánica y de emisiones contaminantes (RTM)'. Allí podrás descargar el PDF oficial siempre que lo requieras."
    ],
    enlaceRunt: "https://www.runt.com.co/consultaCiudadana/#/consultaVehiculo",
    notaAlerta: "Nota: Si el vehículo se encuentra matriculado bajo la figura de 'Persona Indeterminada', la plataforma RUNT bloqueará la expedición y consulta del certificado."
  },
  {
    id: "item-6",
    pregunta: "¿Qué hago si mi vehículo sale rechazado en el diagnóstico?",
    respuesta: "De acuerdo con la resolución reglamentaria NTC 5375:2012, si el vehículo resulta reprobado, cuentas con un plazo de 15 días calendario contados desde el día del rechazo para subsanar los defectos mecánicos o de emisiones. Dentro de este término, puedes regresar al CDA para una única re-inspección sin costo adicional."
  },
  {
    id: "item-7",
    pregunta: "¿Cuánto tiempo demora la revisión técnico-mecánica?",
    respuesta: "El tiempo promedio en la línea de pruebas varía entre 40 minutos y 1 hora desde que inicia formalmente el proceso en pista. Este tiempo puede verse incrementado por dos variables externas: el flujo de usuarios concurrentes en la misma franja horaria (picos de congestión) y la estabilidad de los servidores de entidades regulatorias externas obligatorias como el RUNT y el SICOV, los cuales en ocasiones sufren microcaídas o mantenimientos imprevistos durante la jornada."
  },
  {
    id: "item-8",
    pregunta: "¿Por qué la moto no puede hacer su revisión con maletero o baúl instalado?",
    respuesta: "Según lo establecido formalmente por la norma técnica nacional NTC 5375:2012, se fija como criterio obligatorio de pre-revisión que todo vehículo ingrese a la pista de diagnóstico completamente descargado y vacío. En el caso particular de las motocicletas, los maleteros, baúles externos de carga o alforjas pesadas se consideran carga física adicional, la cual altera las mediciones de los equipos automáticos (frenómetros y de suspensión)."
  }
];



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
        que mide el nivel de monóxido de carbono, hidrocarburos y oxígeno expulsa­
        dos. Es una prueba indispensable para validar que el motor opere eficientemente
        dentro de los límites ecológicos exigidos por las autoridades ambientales.
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
        . Esta prueba automatizada calcula la fuerza de frenado por eje y la eficacia
        total del sistema, garantizando que ante cualquier detención habitual o de
        emergencia en la vía, la motocicleta responda con firmeza, equilibrio y total
        control.
      </>
    ),
  },
];


const imagenesInstalaciones = [
  { id: 1, src: instalaciones01, alt: "Instalaciones 01" },
  { id: 2, src: instalaciones02, alt: "Instalaciones 02" },
  { id: 3, src: instalaciones03, alt: "Instalaciones 03" },
  { id: 4, src: instalaciones04, alt: "Instalaciones 04" },
  { id: 5, src: instalaciones05, alt: "Instalaciones 05" },
  { id: 6, src: instalaciones06, alt: "Instalaciones 06" },
  { id: 7, src: instalaciones07, alt: "Instalaciones 07" },
  { id: 8, src: instalaciones08, alt: "Instalaciones 08" },
  { id: 9, src: instalaciones09, alt: "Instalaciones 09" }
];


const navegación = [
    { name: "Inicio", href: "/" },
    { name: "Servicios", href: "#servicios" },
    { name: "Tarifas", href: "#precios" },
    { name: "Instalaciones", href: "#fotosSede" },
    { name: "Preguntas Frecuentes", href: "#preguntasFrecuentes" }
  ];

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



const numeroWhatsApp = "573233303659";
  const enlaceAgenda = `https://wa.me/${numeroWhatsApp}?text=Hola%20CDA%20Fullmotos%20la%2025%2C%20quiero%20asegurar%20un%20cupo%20para%20la%20revisi%C3%B3n%20t%C3%A9cnico-mec%C3%A1nica%20de%20mi%20moto.`;
  const enlaceContacto = `https://wa.me/${numeroWhatsApp}?text=Hola%20CDA%20Fullmotos%20la%2025%2C%20tengo%20una%20consulta%20sobre%20sus%20servicios%20y%20tarifas.`;

//Props para la barra de navegacion
export interface RouteProps {
  href: string;
  label: string;
}



//Props para la barra de navegacion
export interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
  
    label: "Inicio",
    href: "#hero"
  },
  {
    
    label: "Quiénes Somos",
    href: "#quienesSomos"
  },
  {
   
    label: "Servicios",
    href: "#servicios"
  },
  {
    
    label: "¿En qué consiste?",
    href: "#consisteRTM"
  },
  {
   
    label: "Preparación",
    href: "#preparacionRTM"
  },
  {
    
    label: "Precios y Tarifas",
    href: "#precios"
  },
  {
    
    label: "Medios de Pago",
    href: "#mediosPagos"
  },
  {
    
    label: "Contacto y Horarios",
    href: "#contactoHorarios"
  },
  {
   
    label: "Preguntas Frecuentes",
    href: "#preguntasFrecuentes"
  },
  {
   
    label: "Nuestra Sede",
    href: "#fotosSede"
  }
];

const tramites = [
    {
      icono: "📢",
      titulo: "Quejas y Reclamos",
      descripcion: "Si tuviste algún inconveniente con nuestra atención o el proceso de tu revisión técnico-mecánica."
    },
    {
      icono: "⚖️",
      titulo: "Apelaciones",
      descripcion: "Si no estás de acuerdo con los resultados técnicos arrojados en el diagnóstico de tu vehículo."
    },
    {
      icono: "✨",
      titulo: "Felicitaciones",
      descripcion: "Queremos saber si tuviste una experiencia excelente. Tu opinión motiva a nuestro equipo técnico."
    }
  ];

export default function FullmotosLandingPage({ currentTenant }: { currentTenant: string }) {
  return (
    <>
      <Navbar routeList={routeList} logo={logo} currentTenant={currentTenant}></Navbar>
      <section id="hero" className="w-full min-h-[85vh] flex items-center justify-center bg-[#00a6fb]/5 dark:bg-[#051923] px-6 py-12 md:px-12 select-none transition-colors duration-300">
  <div className="max-w-6xl w-full flex flex-col md:flex-row gap-12 items-center justify-between">
    
    {/* Lado Izquierdo: Logo, Textos y Botones */}
    <div className="flex flex-col items-center md:items-start space-y-6 max-w-2xl w-full md:w-[60%] text-center md:text-left">
  
  {/* 1. LOGO DEL ESTABLECIMIENTO (CENTRADO Y SIN CONTENEDOR RELATIVE) */}
  {logo && (
    <Image
      src={logo}
      alt="Logo del Establecimiento"
      width={220}   // Tamaño grandecito y fijo
      height={88}   // Proporcional
      priority
      className="rounded-2xl object-contain border border-black dark:brightness-110 dark:border-none"
    />
  )}

  {/* Textos principales */}
  <div className="flex flex-col space-y-4">
    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb] lg:text-6xl">
      Tu seguridad, nuestra prioridad
    </h1>
    <p className="text-lg md:text-xl font-normal text-[#003554]/90 dark:text-white/80">
      Revisión técnico mecánica y de emisiones contaminantes exclusivo para motocicletas en la ciudad de Manizales.
    </p>
  </div>

  {/* Grupo de Botones */}
  <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
    {/* Botón Principal: WhatsApp */}
    <a 
      href="https://wa.me/+573233303659" 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-all bg-[#00a6fb] text-[#051923] hover:bg-[#0582ca] hover:text-white dark:hover:bg-[#0582ca] h-11 px-8 shadow-sm"
    >
      Contáctanos 
      <span className="ml-2 text-base font-semibold transform -translate-y-px">↗</span>
    </a>

    {/* Botón Secundario: Agendar Cita */}
    <a 
      href="https://wa.me/+573233303659" 
      target="_blank" 
      rel="noopener noreferrer" 
      className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors bg-[#003554] text-white hover:bg-[#003554]/90 dark:bg-[#006494] dark:hover:bg-[#0582ca] h-11 px-6 shadow-sm"
    >
      Agendar Cita
    </a>

    {/* Botón Terciario: Ver Tarifas */}
    <a 
      href="#precios" 
      className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors border-2 border-[#006494] text-[#006494] bg-transparent hover:bg-[#006494]/10 dark:border-[#00a6fb] dark:text-[#00a6fb] dark:hover:bg-[#00a6fb]/10 h-11 px-6"
    >
      Ver Tarifas
    </a>
  </div>
</div>

    {/* Lado Derecho: Imagen Hero */}
    <div className="w-full md:w-[80%] flex min-h-96 md:min-h-112 relative rounded-xl overflow-hidden shadow-lg border border-[#006494]/20 dark:border-[#00a6fb]/30">
      <Image 
        src={hero} 
        alt="Motocicleta en línea de diagnóstico del CDA"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 40vw"
        className="object-cover"
      />
    </div>

  </div>
</section>



      <section id="quienesSomos" className="w-full flex items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300">
  <div className="max-w-6xl w-full flex flex-col md:flex-row gap-12 items-center justify-between">
    
    {/* Lado Izquierdo: Imagen Controlada */}
    <div className="w-full md:w-[45%] flex min-h-104 md:min-h-128 relative rounded-xl overflow-hidden shadow-lg border border-[#006494]/20 dark:border-[#00a6fb]/30">
      <Image 
        src={panoramico}
        alt="Instalaciones del CDA Fullmotos la 25 en Manizales"
        fill
        sizes="(max-width: 768px) 100vw, 45vw"
        className="object-cover"
      />
    </div>

    {/* Lado Derecho: Card estilo Shadcn UI */}
    <div className="w-full md:w-[55%] rounded-xl border border-[#006494]/20 dark:border-[#00a6fb]/30 bg-white dark:bg-[#051923] text-[#051923] dark:text-white shadow-md p-8 md:p-10 flex flex-col space-y-6">
      
      {/* Card Header */}
      <div className="flex flex-col space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#006494] dark:text-[#00a6fb]">
          Trayectoria y Confianza
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb]">
          Quiénes Somos
        </h2>
      </div>

      {/* Card Content (Reseña mejorada) */}
      <div className="text-base md:text-lg font-normal text-[#003554]/90 dark:text-white/80 leading-relaxed space-y-4">
        <p>
          Desde el año 2022, nos hemos consolidado en la ciudad de Manizales como el Centro de Diagnóstico Automotor líder y exclusivo para motocicletas de 2 y 4 tiempos. Nacimos bajo la firme premisa de proteger la vida en las vías, transformando la revisión técnico-mecánica en un pilar fundamental para la seguridad vial de nuestra región.
        </p>
        <p>
          Con más de <strong className="text-[#051923] dark:text-white font-bold">20,000 revisiones exitosas</strong>, nuestra trayectoria es sinónimo de categoría, respaldo y confianza. Nos enfocamos rigurosamente en la calidad técnica y el estado óptimo de cada vehículo, garantizando que ruede con total tranquilidad por calles y carreteras.
        </p>
        <p>
          Contamos con la prestigiosa <strong className="text-[#006494] dark:text-[#00a6fb] font-semibold">acreditación ONAC</strong>, lo que certifica la transparencia e imparcialidad de todos nuestros procesos. Esto, sumado a un equipo técnico altamente especializado y en constante capacitación, nos permite ofrecer un diagnóstico preciso, ágil y con los más altos estándares tecnológicos del sector.
        </p>
      </div>

      {/* Card Footer (Detalle de calidad institucional) */}
      <div className="pt-4 border-t border-[#006494]/10 dark:border-[#00a6fb]/20 flex items-center gap-4 text-sm font-semibold text-[#003554]/70 dark:text-white/60">
        <div className="flex items-center gap-1.5">
          <span className="text-[#00a6fb] text-lg">✓</span> Acreditados ONAC
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-[#006494]/30 dark:bg-[#00a6fb]/30"></div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#00a6fb] text-lg">✓</span> Manizales, Caldas
        </div>
      </div>

    </div>

  </div>
</section>


<section id="servicios" className="w-full flex items-center justify-center bg-[#00a6fb]/5 dark:bg-[#051923]/40 px-6 py-16 md:px-12 select-none transition-colors duration-300">
  <div className="max-w-6xl w-full flex flex-col space-y-12">
    
    {/* Encabezado de la Sección */}
    <div className="flex flex-col space-y-3 text-center items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#006494] dark:text-[#00a6fb]">
        Nuestras Soluciones
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb]">
        Servicios Especializados
      </h2>
      <p className="text-base md:text-lg font-normal text-[#003554]/80 dark:text-white/70 max-w-2xl">
        Equipamiento con tecnología de punta y personal experto para garantizar la máxima seguridad y cumplimiento legal de tu motocicleta.
      </p>
    </div>

    {/* Contenedor de Servicios con Flexbox */}
    <div className="w-full flex flex-col lg:flex-row gap-6 justify-between items-stretch">
      
      {/* Servicio 1: Revisión Técnico-Mecánica (Destacado / Principal) */}
      <div className="flex-1 flex flex-col justify-between p-6 rounded-xl border-2 border-[#00a6fb] bg-white dark:bg-[#051923] text-[#051923] dark:text-white shadow-md relative overflow-hidden">
        {/* Etiqueta de Obligatorio / Principal */}
        <div className="absolute top-0 right-0 bg-[#00a6fb] text-[#051923] text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg tracking-wider">
          Obligatorio
        </div>
        
        <div className="flex flex-col space-y-4">
          <div className="w-12 h-12 rounded-lg bg-[#00a6fb]/10 flex items-center justify-center text-2xl text-[#00a6fb]">
            🛠️
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-[#051923] dark:text-[#00a6fb]">
              Revisión Técnico-Mecánica
            </h3>
            <p className="text-sm font-normal text-[#003554]/80 dark:text-white/70 leading-relaxed">
              Evaluación completa y control de emisiones contaminantes avalado por la ONAC. Diseñado con pistas exclusivas para motocicletas de 2 y 4 tiempos, garantizando agilidad y precisión.
            </p>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-[#006494]/10 dark:border-[#00a6fb]/20 flex items-center justify-between text-xs font-semibold text-[#006494] dark:text-[#00a6fb]">
          <span>Línea de diagnóstico experta</span>
          <span>↗</span>
        </div>
      </div>

      {/* Servicio 2: Peritajes */}
      <div className="flex-1 flex flex-col justify-between p-6 rounded-xl border border-[#006494]/20 bg-white dark:bg-[#051923] text-[#051923] dark:text-white shadow-sm transition-all hover:border-[#006494]/50 dark:hover:border-[#00a6fb]/50">
        <div className="flex flex-col space-y-4">
          <div className="w-12 h-12 rounded-lg bg-[#0582ca]/10 flex items-center justify-center text-2xl text-[#0582ca]">
            🔍
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-[#051923] dark:text-[#00a6fb]">
              Peritaje Especializado
            </h3>
            <p className="text-sm font-normal text-[#003554]/80 dark:text-white/70 leading-relaxed">
              ¿Vas a comprar o vender? Inspeccionamos minuciosamente el estado mecánico, estructural y estético de motocicletas de 2T y 4T para que realices un negocio transparente y con total seguridad.
            </p>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-[#006494]/10 dark:border-[#00a6fb]/20 flex items-center justify-between text-xs font-semibold text-[#003554]/70 dark:text-white/60">
          <span>Compra y venta segura</span>
          <span>↗</span>
        </div>
      </div>

      {/* Servicio 3: Venta de SOAT */}
      <div className="flex-1 flex flex-col justify-between p-6 rounded-xl border border-[#006494]/20 bg-white dark:bg-[#051923] text-[#051923] dark:text-white shadow-sm transition-all hover:border-[#006494]/50 dark:hover:border-[#00a6fb]/50">
        <div className="flex flex-col space-y-4">
          <div className="w-12 h-12 rounded-lg bg-[#006494]/10 flex items-center justify-center text-2xl text-[#006494]">
            📄
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight text-[#051923] dark:text-[#00a6fb]">
              Venta de SOAT
            </h3>
            <p className="text-sm font-normal text-[#003554]/80 dark:text-white/70 leading-relaxed">
              Evita multas y rueda protegido. Tramitamos tu Seguro Obligatorio de Accidentes de Tránsito de manera digital y rápida para que mantengas tus documentos al día sin salir del CDA.
            </p>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-[#006494]/10 dark:border-[#00a6fb]/20 flex items-center justify-between text-xs font-semibold text-[#003554]/70 dark:text-white/60">
          <span>Expedición inmediata</span>
          <span>↗</span>
        </div>
      </div>

    </div>
  </div>
</section>






<section id="consisteRTM" className="w-full flex items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300">
  <div className="max-w-5xl w-full flex flex-col space-y-10">
    
    {/* Encabezado */}
    <div className="flex flex-col space-y-3 text-center items-center">
      <span className="text-xs font-bold uppercase tracking-wider text-[#006494] dark:text-[#00a6fb]">
        Inspección paso a paso
      </span>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb]">
        ¿En qué consiste la Revisión Técnico-Mecánica?
      </h2>
      <p className="text-base md:text-lg font-normal text-[#003554]/80 dark:text-white/70 max-w-2xl">
        Conoce las 5 etapas reglamentarias que realizamos en nuestra pista especializada para garantizar el estado óptimo de tu motocicleta.
      </p>
    </div>

    {/* Componente Tabs Oficial de Shadcn UI */}
    <Tabs defaultValue="sensorial" className="w-full flex flex-col space-y-6">
      
      {/* Listado dinámico de pestañas */}
      <TabsList className="inline-flex h-12 w-full items-center justify-start rounded-xl bg-[#006494]/5 dark:bg-[#051923]/60 p-1 text-[#003554]/70 dark:text-white/60 overflow-x-auto overflow-y-hidden border border-[#006494]/10 dark:border-[#00a6fb]/20">
        {rtmSteps.map((step) => (
          <TabsTrigger 
            key={step.id}
            value={step.id} 
            className="font-semibold tracking-tight data-[state=active]:bg-white data-[state=active]:dark:bg-[#003554] data-[state=active]:text-[#051923] data-[state=active]:dark:text-[#00a6fb]"
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
          <Card className="border-[#006494]/20 dark:border-[#00a6fb]/30 bg-white dark:bg-[#051923] shadow-sm overflow-hidden">
            {/* Aquí se conserva el mx-2 que solicitaste para todas las vistas */}
            <div className="flex flex-col md:flex-row items-stretch justify-between mx-2">
              <div className="p-8 flex flex-col justify-center space-y-4 md:w-[60%]">
                <CardHeader className="p-0 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{step.emoji}</span>
                    <CardTitle className="text-xl font-bold text-[#051923] dark:text-[#00a6fb]">
                      {step.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0 text-base font-normal text-[#003554]/90 dark:text-white/80 leading-relaxed">
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









<section id="preparacionRTM" className="w-full flex flex-col items-center justify-center bg-[#00a6fb]/5 dark:bg-[#051923]/40 px-6 py-16 md:px-12 select-none transition-colors duration-300">
      <div className="max-w-6xl w-full flex flex-col space-y-12">
        
        {/* Encabezado */}
        <div className="flex flex-col space-y-3 text-center items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006494] dark:text-[#00a6fb]">
            Preparación para tu RTM
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb]">
            ¿Cómo debe asistir tu motocicleta?
          </h2>
          <p className="text-base md:text-lg font-normal text-[#003554]/80 dark:text-white/70 max-w-2xl">
            Para garantizar un proceso ágil y evitar rechazos preventivos, asegúrate de que tu vehículo cumpla con las siguientes condiciones antes de ingresar a la pista.
          </p>
        </div>

        {/* Grid estructurado con Flexbox */}
        <div className="w-full flex flex-row flex-wrap gap-6 justify-center items-stretch">
          {requisitosAsistencia.map((requisito) => (
            <Card 
              key={requisito.id} 
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] flex flex-col justify-between overflow-hidden border-[#006494]/10 dark:border-[#00a6fb]/20 bg-white dark:bg-[#051923] shadow-sm hover:shadow-md transition-all duration-300 group rounded-xl relative"
            >
              {/* Contenedor de la Imagen (Mitad Superior) */}
              <div className="w-full h-48 relative overflow-hidden bg-[#006494]/5">
                <Image 
                  src={requisito.imagen} 
                  alt={requisito.titulo}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Degradado decorativo sobre la foto */}
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                
                {/* Adorno Elegante: Número Flotante de Identificación */}
                <span className="absolute top-3 right-3 text-xs font-black tracking-widest bg-white/90 dark:bg-[#051923]/90 text-[#006494] dark:text-[#00a6fb] px-2 py-1 rounded md:shadow-sm">
                  {requisito.id}
                </span>
              </div>

              {/* Contenido Técnico de la Card (Mitad Inferior) */}
              <div className="flex flex-col flex-1 p-6 space-y-2">
                <CardHeader className="p-0">
                  <CardTitle className="text-lg font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb] group-hover:text-[#00a6fb] dark:group-hover:text-[#0582ca] transition-colors duration-200">
                    {requisito.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 text-sm font-normal text-[#003554]/80 dark:text-white/70 leading-relaxed">
                  {requisito.descripcion}
                </CardContent>
              </div>

              {/* Detalle visual sutil en el borde inferior */}
              <div className="w-full h-0.75 bg-transparent group-hover:bg-[#00a6fb] transition-colors duration-300" />
            </Card>
          ))}
        </div>

      </div>
    </section>








<section id="precios" className="w-full flex flex-col items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300">
      <div className="max-w-6xl w-full flex flex-col space-y-12">
        
        {/* Encabezado */}
        <div className="flex flex-col space-y-3 text-center items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006494] dark:text-[#00a6fb]">
            Tarifas Transparentes
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb]">
            Precios y Tarifas Vigentes
          </h2>
          <p className="text-base md:text-lg font-normal text-[#003554]/80 dark:text-white/70 max-w-2xl">
            Consulta los costos oficiales de nuestros servicios. Operamos bajo las regulaciones de ley sin cobros adicionales ni sorpresas.
          </p>
        </div>

        {/* Contenedor de Tarjetas con Flexbox */}
        <div className="w-full flex flex-row flex-wrap gap-6 justify-center items-stretch">
          {tarifasServicios.map((tarifa) => (
            <Card
              key={tarifa.id}
              className={`w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] flex flex-col justify-between p-8 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                tarifa.destacado
                  ? "border-2 border-[#00a6fb] bg-white dark:bg-[#051923] shadow-md ring-4 ring-[#00a6fb]/10"
                  : "border border-[#006494]/10 dark:border-[#00a6fb]/20 bg-white dark:bg-[#051923] shadow-sm"
              }`}
            >
              {/* Etiqueta flotante para el servicio principal */}
              {tarifa.destacado && (
                <div className="absolute top-0 right-0 bg-[#00a6fb] text-[#051923] text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-bl-xl tracking-wider">
                  Más Solicitado
                </div>
              )}

              {/* Contenido Superior: Títulos y Precio */}
              <div className="flex flex-col space-y-6">
                <CardHeader className="p-0 space-y-1">
                  <CardTitle className="text-xl font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb]">
                    {tarifa.titulo}
                  </CardTitle>
                  <CardDescription className="text-xs font-semibold text-[#003554]/60 dark:text-white/50 uppercase tracking-wider">
                    {tarifa.subtitulo}
                  </CardDescription>
                </CardHeader>

                {/* Sección del Valor Económico */}
                <div className="flex flex-col border-b border-[#006494]/10 dark:border-[#00a6fb]/10 pb-6">
                  <span className="text-4xl font-black tracking-tight text-[#051923] dark:text-white">
                    {tarifa.precio}
                  </span>
                  <span className="text-xs font-medium text-[#003554]/70 dark:text-white/60 mt-1">
                    {tarifa.frecuencia}
                  </span>
                </div>

                {/* Condicional para el desglose específico del SOAT */}
                {tarifa.esSoat && tarifa.desgloseSoat && (
                  <div className="flex flex-col space-y-2.5 bg-[#006494]/5 dark:bg-white/5 p-4 rounded-xl border border-[#006494]/10 dark:border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#003554] dark:text-[#00a6fb]">Tarifas según cilindrada:</span>
                    <div className="flex flex-col space-y-1.5">
                      {tarifa.desgloseSoat.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm font-medium">
                          <span className="text-[#003554]/80 dark:text-white/70">{item.rango}</span>
                          <span className="font-bold text-[#051923] dark:text-white">{item.valor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Listado de características y coberturas */}
                <CardContent className="p-0">
                  <ul className="flex flex-col space-y-3">
                    {tarifa.detalles.map((detalle, idx) => (
                      <li key={idx} className="flex items-start text-sm text-[#003554]/90 dark:text-white/80 font-normal">
                        <span className="text-[#00a6fb] mr-2.5 font-bold">✓</span>
                        {detalle}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>

              {/* Botón Decorativo de Acción o Enlace */}
              <div className="mt-8 pt-4 border-t border-[#006494]/5 dark:border-[#00a6fb]/10">
                <div className={`w-full py-3 px-4 rounded-xl text-center text-sm font-bold tracking-tight shadow-sm transition-all duration-200 cursor-pointer ${
                  tarifa.destacado
                    ? "bg-[#00a6fb] hover:bg-[#0582ca] text-[#051923] hover:text-white"
                    : "bg-[#006494]/10 dark:bg-white/5 text-[#006494] dark:text-[#00a6fb] hover:bg-[#006494]/20 dark:hover:bg-white/10"
                }`}>
                  Cotizar / Agendar Cupo
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Nota aclaratoria legal al pie de los precios */}
        <p className="text-center text-xs font-normal text-[#003554]/60 dark:text-white/40 max-w-3xl mx-auto leading-relaxed">
          * El valor de la Revisión Técnico-Mecánica se encuentra regulado por el Ministerio de Transporte de Colombia. El precio final incluye los valores de recaudo de la Agencia Nacional de Seguridad Vial (ANSV), el Sistema de Control y Vigilancia (SICOV) y la tasa del Registro Único Nacional de Tránsito (RUNT). Las tarifas del SOAT corresponden a los valores fijados por la Superintendencia Financiera de Colombia.
        </p>

      </div>
    </section>





<section id="mediosPagos" className="w-full flex flex-col items-center justify-center bg-[#00a6fb]/5 dark:bg-[#051923]/40 px-6 py-16 md:px-12 select-none transition-colors duration-300">
      <div className="max-w-6xl w-full flex flex-col space-y-12">
        
        {/* Encabezado */}
        <div className="flex flex-col space-y-3 text-center items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006494] dark:text-[#00a6fb]">
            Facilidades para ti
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb]">
            Métodos y Medios de Pago
          </h2>
          <p className="text-base md:text-lg font-normal text-[#003554]/80 dark:text-white/70 max-w-2xl">
            Te ofrecemos múltiples alternativas financieras y digitales para que realices el pago de tus servicios de forma rápida y segura.
          </p>
        </div>

        {/* Contenedor de Medios de Pago con Flexbox */}
        <div className="w-full flex flex-row flex-wrap gap-6 justify-center items-stretch">
          {mediosPago.map((medio) => (
            <Card
              key={medio.id}
              className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-20px)] min-w-50 flex flex-col overflow-hidden border border-[#006494]/10 dark:border-[#00a6fb]/20 bg-white dark:bg-[#051923] shadow-sm hover:shadow-md transition-all duration-300 group rounded-xl"
            >
              {/* Espacio superior para la imagen */}
              <div className="w-full h-32 relative bg-[#006494]/5 p-4 flex items-center justify-center border-b border-[#006494]/10 dark:border-[#00a6fb]/20">
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
                <span className="text-sm font-bold tracking-tight text-[#051923] dark:text-white group-hover:text-[#00a6fb] transition-colors duration-200">
                  {medio.titulo}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>







<section id="contactoHorarios" className="w-full flex flex-col items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300">
      <div className="max-w-5xl w-full flex flex-col space-y-12">
        
        {/* Encabezado */}
        <div className="flex flex-col space-y-3 text-center items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006494] dark:text-[#00a6fb]">
            ¿Dónde encontrarnos?
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb]">
            Contacto y Horarios de Atención
          </h2>
          <p className="text-base md:text-lg font-normal text-[#003554]/80 dark:text-white/70 max-w-2xl">
            Visítanos en nuestra sede en Manizales o comunícate con nosotros para resolver cualquier inquietud sobre la revisión de tu motocicleta.
          </p>
        </div>

        {/* Contenedor Principal en Flexbox (Asimétrico) */}
        <div className="w-full flex flex-col md:flex-row gap-8 justify-between items-stretch">
          
          {/* Bloque Izquierdo: Datos de Contacto y Botón de Mapa */}
          <div className="flex-1 flex flex-col justify-between p-8 rounded-2xl border border-[#006494]/10 dark:border-[#00a6fb]/20 bg-white dark:bg-[#051923] shadow-sm space-y-8">
            <div className="flex flex-col space-y-6">
              <h3 className="text-xl font-bold tracking-tight text-[#051923] dark:text-[#00a6fb]">
                Información de Contacto
              </h3>
              
              <div className="flex flex-col space-y-4">
                {/* Dirección */}
                <div className="flex items-start gap-3 text-sm font-normal text-[#003554]/90 dark:text-white/80">
                  <span className="text-xl text-[#00a6fb]">📍</span>
                  <div>
                    <p className="font-bold text-[#051923] dark:text-white">Dirección de la Sede</p>
                    <p className="mt-0.5">Cra. 25 #17-66, Manizales, Caldas</p>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex items-start gap-3 text-sm font-normal text-[#003554]/90 dark:text-white/80">
                  <span className="text-xl text-[#00a6fb]">📞</span>
                  <div>
                    <p className="font-bold text-[#051923] dark:text-white">Línea Telefónica / WhatsApp</p>
                    <p className="mt-0.5">323 3303659</p>
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div className="flex items-start gap-3 text-sm font-normal text-[#003554]/90 dark:text-white/80">
                  <span className="text-xl text-[#00a6fb]">✉️</span>
                  <div>
                    <p className="font-bold text-[#051923] dark:text-white">Correo Electrónico Oficial</p>
                    <p className="mt-0.5 break-all">cdafullmotosla25@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de Redirección a Google Maps */}
            <Link 
              href="https://www.google.com/maps/place/CDA+Fullmotos+la+25+Manizales/@5.0655516,-75.5201943,1092m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8e476ff941c58493:0xc5b94947862a79dc!8m2!3d5.0655516!4d-75.5201943!16s%2Fg%2F11h55z4xsv!5m1!1e2?entry=ttu&g_ep=EgoyMDI2MDcwOC4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 bg-[#00a6fb] hover:bg-[#0582ca] text-[#051923] hover:text-white rounded-xl text-center text-sm font-bold tracking-tight shadow-sm transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <span>Ver Ubicación en Google Maps</span>
              <span className="transform group-hover:translate-x-1 transition-transform duration-200">➔</span>
            </Link>
          </div>

          {/* Bloque Derecho: Tabla de Horarios */}
          <div className="flex-1 flex flex-col p-8 rounded-2xl border-2 border-[#00a6fb] bg-white dark:bg-[#051923] shadow-md ring-4 ring-[#00a6fb]/10 justify-center">
            <div className="flex flex-col space-y-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">⏰</span>
                <h3 className="text-xl font-bold tracking-tight text-[#051923] dark:text-[#00a6fb]">
                  Horarios de Operación
                </h3>
              </div>

              <div className="flex flex-col space-y-3">
                {/* Lunes a Viernes */}
                <div className="flex justify-between items-center py-2.5 border-b border-[#006494]/10 dark:border-white/10 text-sm">
                  <span className="font-bold text-[#051923] dark:text-white">Lunes a Viernes</span>
                  <span className="font-semibold text-[#006494] dark:text-[#00a6fb] bg-[#006494]/5 dark:bg-white/5 px-3 py-1 rounded-lg">
                    7:00 AM – 6:00 PM
                  </span>
                </div>

                {/* Sábados */}
                <div className="flex justify-between items-center py-2.5 border-b border-[#006494]/10 dark:border-white/10 text-sm">
                  <span className="font-bold text-[#051923] dark:text-white">Sábados</span>
                  <span className="font-semibold text-[#006494] dark:text-[#00a6fb] bg-[#006494]/5 dark:bg-white/5 px-3 py-1 rounded-lg">
                    7:00 AM – 3:00 PM
                  </span>
                </div>

                {/* Domingos y Festivos */}
                <div className="flex justify-between items-center py-2.5 text-sm">
                  <span className="font-bold text-[#003554]/60 dark:text-white/40">Domingos y Festivos</span>
                  <span className="font-bold text-red-500 bg-red-500/5 dark:bg-red-500/10 px-3 py-1 rounded-lg uppercase text-xs tracking-wider">
                    Cerrado
                  </span>
                </div>
              </div>

              {/* Nota Recordatorio */}
              <p className="text-xs font-normal text-[#003554]/70 dark:text-white/60 bg-[#006494]/5 dark:bg-white/5 p-4 rounded-xl border border-[#006494]/10 dark:border-white/10 leading-relaxed">
                📢 <strong className="text-[#051923] dark:text-white font-bold">Atención sin citas:</strong> Recuerda asistir dentro de estos horarios para ingresar tu motocicleta a las líneas de diagnóstico técnico-mecánico. El cierre de la pista se realiza puntualmente.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>





<section id="preguntasFrecuentes" className="w-full flex flex-col items-center justify-center bg-[#00a6fb]/5 dark:bg-[#051923]/40 px-6 py-16 md:px-12 select-none transition-colors duration-300">
      <div className="max-w-4xl w-full flex flex-col space-y-12">
        
        {/* Encabezado */}
        <div className="flex flex-col space-y-3 text-center items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006494] dark:text-[#00a6fb]">
            Resuelve tus dudas
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb]">
            Preguntas Frecuentes (FAQ)
          </h2>
          <p className="text-base md:text-lg font-normal text-[#003554]/80 dark:text-white/70 max-w-2xl">
            Encuentra respuestas rápidas a las consultas más comunes sobre la Revisión Técnico-Mecánica, normativas, tiempos y trámites en nuestro CDA.
          </p>
        </div>

        {/* Acordeón dinámico mediante mapeo del objeto */}
        <Accordion className="w-full space-y-4">
          {preguntasFrecuentes.map((faq) => (
            <AccordionItem 
              key={faq.id} 
              value={faq.id} 
              className="border border-[#006494]/10 dark:border-[#00a6fb]/20 bg-white dark:bg-[#051923] rounded-xl px-6 shadow-sm"
            >
              <AccordionTrigger className="text-base font-bold tracking-tight text-[#051923] dark:text-[#00a6fb] hover:no-underline py-4 text-left">
                {faq.pregunta}
              </AccordionTrigger>
              
              <AccordionContent className="text-sm font-normal text-[#003554]/80 dark:text-white/70 leading-relaxed pb-4 border-t border-[#006494]/5 dark:border-white/5 pt-3 space-y-3">
                <p>{faq.respuesta}</p>

                {/* Renderizado condicional si incluye lista de tiempos */}
                {faq.tieneLista && faq.itemsLista && (
                  <div className="mt-3 flex flex-col space-y-2">
                    {faq.itemsLista.map((item, index) => (
                      <p key={index}>
                        • <strong className="text-[#051923] dark:text-white">{item.titulo}:</strong> A los <strong className="text-[#006494] dark:text-[#00a6fb]">{item.detalle.split("A los ")[1]}</strong>
                      </p>
                    ))}
                  </div>
                )}

                {/* Renderizado condicional si incluye nota destacada (SOAT) */}
                {faq.notaDestacada && (
                  <span className="block bg-[#006494]/5 dark:bg-white/5 p-3 rounded-lg border border-[#006494]/10 dark:border-white/10 mt-2">
                    {faq.notaDestacada}
                  </span>
                )}

                {/* Renderizado condicional si incluye los pasos del RUNT */}
                {faq.esRunt && faq.pasosRunt && (
                  <>
                    <ol className="list-decimal pl-5 space-y-1.5">
                      <li>
                        Ingresa al portal de consulta ciudadana:{" "}
                        <Link 
                          href={faq.enlaceRunt || "#"} 
                          target="_blank" 
                          className="text-[#00a6fb] font-semibold hover:underline break-all"
                        >
                          runt.com.co/consultaCiudadana
                        </Link>
                      </li>
                      {faq.pasosRunt.map((paso, index) => (
                        <li key={index}>{paso}</li>
                      ))}
                    </ol>
                    
                    {faq.notaAlerta && (
                      <p className="text-xs text-red-500 font-semibold bg-red-500/5 dark:bg-red-500/10 p-2.5 rounded-lg border border-red-500/10 mt-3">
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






<section id="fotosSede" className="w-full flex flex-col items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300">
      <div className="max-w-6xl w-full flex flex-col space-y-12">
        
        {/* Encabezado */}
        <div className="flex flex-col space-y-3 text-center items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006494] dark:text-[#00a6fb]">
            Conoce nuestra sede
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb]">
            Un vistazo a nuestras instalaciones
          </h2>
          <p className="text-base md:text-lg font-normal text-[#003554]/80 dark:text-white/70 max-w-2xl">
            Contamos con equipos de última tecnología y espacios diseñados para ofrecerte un servicio de revisión técnico-mecánica ágil, cómodo y confiable.
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
                    <Card className="overflow-hidden border border-[#006494]/10 dark:border-[#00a6fb]/20 bg-white dark:bg-[#051923] shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl">
                      <CardContent className="p-0 flex aspect-4/3 relative w-full items-center justify-center">
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          sizes="(max-w-768px) 100vw, (max-w-1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            
            {/* Controles de navegación */}
            <CarouselPrevious className="hidden md:flex -left-12 border-[#006494]/20 dark:border-[#00a6fb]/30 bg-white dark:bg-[#051923] text-[#051923] dark:text-[#00a6fb] hover:bg-[#00a6fb]/10" />
            <CarouselNext className="hidden md:flex -right-12 border-[#006494]/20 dark:border-[#00a6fb]/30 bg-white dark:bg-[#051923] text-[#051923] dark:text-[#00a6fb] hover:bg-[#00a6fb]/10" />
          </Carousel>
        </div>

      </div>
    </section>





<section id="CTA" className="w-full flex items-center justify-center bg-[#00a6fb]/5 dark:bg-[#051923]/40 px-6 py-20 md:px-12 select-none transition-colors duration-300">
      <div className="max-w-5xl w-full rounded-3xl border border-[#006494]/20 dark:border-[#00a6fb]/30 bg-white dark:bg-[#051923] p-8 md:p-14 shadow-xl flex flex-col md:flex-row gap-10 items-center justify-between relative overflow-hidden">
        
        {/* Efecto decorativo de fondo sutil al estilo Shadcn */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#00a6fb]/5 dark:bg-[#00a6fb]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Lado Izquierdo: Textos e Interacción */}
        <div className="w-full md:w-[60%] flex flex-col space-y-6 text-center md:text-left items-center md:items-start">
          <div className="flex flex-col space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#006494] dark:text-[#00a6fb]">
              ¿Tu técnico-mecánica está por vencer?
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#051923] dark:text-white leading-tight">
              Rueda seguro y sin preocupaciones por Manizales
            </h2>
          </div>
          
          <p className="text-base md:text-lg font-normal text-[#003554]/80 dark:text-white/70 max-w-lg leading-relaxed">
            Pasa hoy mismo por nuestra pista especializada o escríbenos directamente a nuestra línea de atención para coordinar tu servicio. Recuerda que trabajamos de forma ágil y eficiente.
          </p>

          {/* Botones de Acción */}
          <div className="w-full flex flex-col sm:flex-row gap-4 pt-2 justify-center md:justify-start">
            <Link
              href={enlaceAgenda}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#00a6fb] hover:bg-[#0582ca] text-[#051923] hover:text-white text-sm font-bold tracking-tight shadow transition-all duration-200 px-8 group gap-2"
            >
              <span>Agendar Cupo</span>
              <span className="transform group-hover:translate-x-0.5 transition-transform">📅</span>
            </Link>
            
            <Link
              href={enlaceContacto}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#006494]/20 dark:border-[#00a6fb]/30 bg-white/50 dark:bg-transparent text-[#003554] dark:text-[#00a6fb] hover:bg-[#006494]/5 dark:hover:bg-white/5 text-sm font-bold tracking-tight transition-all duration-200 px-8 gap-2"
            >
              <span>Contáctanos</span>
              <span>💬</span>
            </Link>
          </div>
        </div>

        {/* Lado Derecho: Contenedor con la imagen grande del logo */}
        <div className="w-full md:w-[35%] flex justify-center items-center relative aspect-square max-w-60 md:max-w-none">
          <div className="w-full h-full relative p-6 bg-[#006494]/5 dark:bg-white/5 rounded-2xl border border-[#006494]/10 dark:border-white/5 flex items-center justify-center shadow-inner group">
            <Image
              src={logo}
              alt="Logo Oficial de CDA Fullmotos la 25"
              fill
              sizes="(max-width: 768px) 240px, 320px"
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-105 rounded-2xl"
              priority
            />
          </div>
        </div>

      </div>
    </section>





    <section id="pqrsf" className="w-full flex flex-col items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300">
      <div className="max-w-5xl w-full flex flex-col space-y-12">
        
        {/* Encabezado */}
        <div className="flex flex-col space-y-3 text-center items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#006494] dark:text-[#00a6fb]">
            Tu opinión nos importa
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#051923] dark:text-[#00a6fb]">
            Quejas, Apelaciones o Felicitaciones
          </h2>
          <p className="text-base md:text-lg font-normal text-[#003554]/80 dark:text-white/70 max-w-2xl">
            En el CDA Fullmotos la 25 trabajamos bajo la norma ISO 17020 para garantizar transparencia. Si deseas manifestar una inconformidad o dejarnos un reconocimiento, estamos listos para atenderte.
          </p>
        </div>

        {/* Bloque de opciones en rejilla */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {tramites.map((item, index) => (
            <Card key={index} className="border border-[#006494]/10 dark:border-[#00a6fb]/20 bg-white dark:bg-[#051923] shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-6 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                <span className="text-3xl">{item.icono}</span>
                <h3 className="text-lg font-bold text-[#051923] dark:text-white">
                  {item.titulo}
                </h3>
                <p className="text-sm font-normal text-[#003554]/70 dark:text-white/60 leading-relaxed">
                  {item.descripcion}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botón de llamado a la acción hacia el formulario */}
        <div className="w-full flex justify-center pt-2">
          
         <PqrsfModal tenant={currentTenant}></PqrsfModal>
         
        </div>

      </div>
    </section>





 <footer className="w-full px-6 md:px-12 bg-white dark:bg-[#051923] border-t border-[#006494]/10 dark:border-white/5 transition-colors duration-300">
      
      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-10 py-12">
        
        {/* COLUMNA 1: LOGO E INFO DEL CDA */}
        <div className="flex flex-col max-w-md space-y-4">
          <div className="w-fit">
            <Link prefetch={true} href="/" className="flex items-center">
              <Image
                src={logo}
                alt="CDA Fullmotos la 25 Logo"
                priority
                className="block dark:hidden w-auto h-20 object-contain rounded-2xl"
              />
              <Image
                src={logo}
                alt="CDA Fullmotos la 25 Logo"
                priority
                className="hidden dark:block w-auto h-20 object-contain rounded-2xl"
              />
            </Link>
          </div>

          <p className="text-sm font-normal text-[#003554]/70 dark:text-white/60 leading-relaxed">
            CDA especializado en la Revisión Técnico-Mecánica y de Emisiones Contaminantes para motocicletas 2 y 4 tiempos en Manizales. Comprometidos con tu seguridad vial.
          </p>
          
          <div className="space-y-1.5 text-sm text-[#003554]/80 dark:text-white/70">
            <p><span className="font-bold text-[#051923] dark:text-[#00a6fb]">Dirección:</span> Calle 25, Manizales, Caldas</p>
            <p><span className="font-bold text-[#051923] dark:text-[#00a6fb]">Celular / WhatsApp:</span> +57 323 330 3659</p>
          </div>
        </div>

        {/* COLUMNA 2: NAVEGACIÓN */}
        <div className="flex flex-col sm:min-w-37.5">
          <span className="text-xs font-black tracking-wider uppercase text-[#051923] dark:text-[#00a6fb] mb-4">
            Enlaces
          </span>
          <div className="flex flex-col space-y-2.5">
            {navegación.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className="text-sm font-medium text-[#003554]/70 dark:text-white/60 hover:text-[#00a6fb] dark:hover:text-[#00a6fb] transition-colors w-fit"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        {/* COLUMNA 3: REDES SOCIALES */}
        <div className="flex flex-col sm:min-w-37.5">
          <span className="text-xs font-black tracking-wider uppercase text-[#051923] dark:text-[#00a6fb] mb-4">
            Síguenos en
          </span>
          <div className="flex items-center space-x-5 text-[#003554]/60 dark:text-white/50">
            <a
              href="https://wa.me/573233303659"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00a6fb] transition-colors"
              aria-label="WhatsApp"
            >
              <WhatsApp size={22} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00a6fb] transition-colors"
              aria-label="Facebook"
            >
              <Facebook size={22} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#00a6fb] transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={22} />
            </a>
          </div>
        </div>
      </div>

      {/* COPYRIGHT */}
      <div className="py-8 text-xs font-medium text-center text-[#003554]/50 dark:text-white/40 border-t border-[#006494]/10 dark:border-white/5">
        Copyright ©{" "}
        <Suspense fallback={<span>2026</span>}>
          <DynamicYear />
        </Suspense>{" "}
        CDA Fullmotos la 25. Hecho con ♥ por Juan Aristizabal.
      </div>
    </footer>

    </>
  )
}