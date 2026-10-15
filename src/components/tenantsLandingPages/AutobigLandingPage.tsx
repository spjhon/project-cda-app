import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer";
import { Button } from "../ui/button";
import { ArrowRight, Building2, Car, CheckCircle2, CreditCard, DollarSign, FileCheck, FileText, Home, ImageIcon, Menu, MessageSquare, Phone, ShieldCheck, Wind, Wrench, X } from "lucide-react";
import { ModeToggle } from "./TenantLandingPageNavBar/mode-toggle";
import { Suspense } from "react";
import DynamicYear from "../landingPage/DynamicYear";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "../ui/carousel";

import Link from "next/link";
import Image from "next/image";

const colorPalette = {
  dustGrey: "#ccdbdc",
  frostedBlueLight: "#9ad1d4",
  frostedBlue: "#80ced7",
  cerulean: "#007ea7",
  deepSpaceBlue: "#003249",
  greenAccent: "#55a630",
  greenAccentHover: "#438424",
};

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


import logo from "../../../public/tenantsLanding/autobig/autobig-logo.png";
import hero from "../../../public/tenantsLanding/autobig/hero2.jpg";
import panoramico from "../../../public/tenantsLanding/autobig/quienesSomos.jpg";
import cintas from "../../../public/tenantsLanding/tecnofresno/cintas.webp";
import placas from "../../../public/tenantsLanding/tecnofresno/placas.jpg";

// Imágenes para la RTM
import sensorialImage from "../../../public/tenantsLanding/autobig/pasosRTMSensorial.webp";
import lucesImage from "../../../public/tenantsLanding/autobig/pasosRTMLuces.jpg";
import gasesImage from "../../../public/tenantsLanding/autobig/pasosRTMGases.jpg";
import sonometriaImage from "../../../public/tenantsLanding/autobig/pasosRTMSonometria.jpg";
import frenosImage from "../../../public/tenantsLanding/autobig/pasosRTMFrenos.jpg";
import alineacionImage from "../../../public/tenantsLanding/autobig/pasosRTMAlineacion.jpg";
import suspencionImage from "../../../public/tenantsLanding/autobig/pasosRTMSuspencion.jpg";
import taximetroImage from "../../../public/tenantsLanding/autobig/pasosRTMTaximetro.jpg";

// Imágenes de requisitos corregidas para vehículos livianos y pesados
import requisitoDescargado from "../../../public/tenantsLanding/tecnofresno/requisitoDescargado.jpg";
import requisitoLimpio from "../../../public/tenantsLanding/tecnofresno/requisitoLimpio.jpg";
import requisitoSinTapacubos from "../../../public/tenantsLanding/tecnofresno/requisitoSinTapacubos.webp";
import requisitoBateria from "../../../public/tenantsLanding/tecnofresno/requisitoBateria.jpg";
import requisitoLlantaRepuesto from "../../../public/tenantsLanding/tecnofresno/requisitoLlantaRepuesto.jpg";
import requisitoCombustible from "../../../public/tenantsLanding/tecnofresno/requisitoCombustible.jpg";
import requisitoCinturones from "../../../public/tenantsLanding/tecnofresno/requisitoCinturones.jpg";
import requisitoSinElementosValor from "../../../public/tenantsLanding/tecnofresno/requisitoSinElementosValor.jpg";
import requisitoAlMenosUnaLuz from "../../../public/tenantsLanding/tecnofresno/requisitoAlMenosUnaLuz.jpg";
import requisitoElectronicaApagada from "../../../public/tenantsLanding/tecnofresno/requisitoElectronicaApagada.jpg";
import requisitoFallaMotor from "../../../public/tenantsLanding/tecnofresno/requisitoFallaMotor.jpg";
import requisitoCarpa from "../../../public/tenantsLanding/tecnofresno/requisitoCarpa.jpg";

//Imagenes para los medios de pago
import medioPagoEfectivo from "../../../public/tenantsLanding/fullmotosla25/MediosPago_Efectivo.jpg";
import medioPagoTarjeta from "../../../public/tenantsLanding/fullmotosla25/MediosPago_Targeta.jpg";
import medioPagoSistecredito from "../../../public/tenantsLanding/fullmotosla25/MediosPago_Sistecredito.jpg";
import medioPagoQR from "../../../public/tenantsLanding/fullmotosla25/MedioPago_QR.webp";
import medioPagoTransferencia from "../../../public/tenantsLanding/fullmotosla25/MedioPago_Transferencia.jpg";

//fotos instalacioens
import instalaciones01 from "../../../public/tenantsLanding/autobig/Instalaciones01.jpg";
import instalaciones02 from "../../../public/tenantsLanding/autobig/Instalaciones02.jpg";
import instalaciones03 from "../../../public/tenantsLanding/autobig/Instalaciones03.jpg";
import instalaciones04 from "../../../public/tenantsLanding/autobig/Instalaciones04.jpg";
import instalaciones05 from "../../../public/tenantsLanding/autobig/Instalaciones05.jpg";
import instalaciones06 from "../../../public/tenantsLanding/autobig/Instalaciones06.jpg";
import instalaciones07 from "../../../public/tenantsLanding/autobig/Instalaciones07.jpg";
import instalaciones08 from "../../../public/tenantsLanding/autobig/Instalaciones08.jpg";


const navegación = [
  { name: "Inicio", href: "#hero", icon: Home },
  { name: "Quiénes Somos", href: "#quienesSomos", icon: Building2 },
  { name: "Servicios", href: "#servicios", icon: Wrench },
  { name: "¿Qué es la RTM?", href: "#consisteRTM", icon: FileCheck },
  { name: "Preparación", href: "#preparacionRTM", icon: CheckCircle2 },
  { name: "Cintas", href: "#cintas-retroreflectivas", icon: ShieldCheck },
  { name: "Placas", href: "#placas", icon: CreditCard },
  { name: "Tarifas", href: "#precios", icon: DollarSign },
  { name: "Instalaciones", href: "#fotosSede", icon: ImageIcon },
  { name: "PQAF", href: "#PQAF", icon: MessageSquare },
  { name: "Contacto", href: "#contactoHorarios", icon: Phone },
];

// Objeto con la información de los servicios especializados
const serviciosList = [
  {
    id: "rtm",
    titulo: "Revisión Técnico-Mecánica",
    subtitulo: "Línea de diagnóstico experta",
    descripcion: "Evaluación completa y control de emisiones contaminantes avalado por la ONAC. Diseñado con pistas especializadas para vehículos livianos y pesados, garantizando agilidad, cobertura y precisión.",
    icono: Wrench,
    destacado: true,
    etiqueta: "Obligatorio",
  },
  {
    id: "preventiva",
    titulo: "Revisión Preventiva",
    subtitulo: "Seguridad vial anticipada",
    descripcion: "Inspección anticipada de los sistemas críticos de frenos, suspensión y gases para asegurar que tu vehículo liviano o pesado transite sin contratiempos ni sorpresas mecánicas en la vía.",
    icono: ShieldCheck,
    destacado: false,
  },
  {
    id: "viajero",
    titulo: "Revisión Preventiva Viajero",
    subtitulo: "Listos para carretera",
    descripcion: "Chequeo integral enfocado en los puntos críticos de desgaste y seguridad de tu vehículo para garantizar un viaje largo seguro, cómodo y sin imprevistos por las carreteras del país.",
    icono: Car,
    destacado: false,
  },
  {
    id: "gases-comparendo",
    titulo: "Certificado de Gases por Comparendo",
    subtitulo: "Solución legal inmediata",
    descripcion: "Prueba rápida y diagnóstico de emisiones contaminantes ideal para cumplir con los requerimientos exigidos tras un comparendo ambiental, asegurando el reporte directo en las plataformas de tránsito.",
    icono: Wind,
    destacado: false,
  },
  {
    id: "soat",
    titulo: "Venta de SOAT",
    subtitulo: "Expedición inmediata",
    descripcion: "Evita multas y rueda protegido. Tramitamos tu Seguro Obligatorio de Accidentes de Tránsito de manera digital y rápida para que mantengas tus documentos al día sin salir del CDA.",
    icono: FileText,
    destacado: false,
  },
];

const rtmSteps = [
  {
    id: "sensorial",
    tabLabel: "1. Sensorial",
    title: "Inspección Sensorial Minuciosa",
    emoji: "👀",
    image: sensorialImage,
    alt: "Inspección sensorial del vehículo",
    content: (
      <>
        Un inspector certificado evalúa visual y tácticamente{" "}
        <strong className="text-[#003249] dark:text-white font-bold">
          más de 150 posibles defectos
        </strong>{" "}
        normativos en el vehículo. Esta rigurosa revisión abarca componentes
        críticos como la carrocería, chasis, sistema de suspensión, estado del cableado,
        mangueras, elementos de seguridad y componentes estructurales externos.
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
        <strong className="text-[#007ea7] dark:text-[#80ced7] font-semibold">
          Luxómetro de alta precisión
        </strong>{" "}
        para medir técnicamente tanto la intensidad de proyección como el ángulo
        exacto de inclinación de los faros delanteros, asegurando una visibilidad
        nocturna óptima sin encandilar a los demás conductores en la vía.
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
        <strong className="text-[#007ea7] dark:text-[#80ced7] font-semibold">
          Sonómetro homologado
        </strong>{" "}
        cerca al sistema de escape para certificar que el vehículo no supere
        los umbrales de ruido permitidos por la normatividad ambiental nacional.
      </>
    ),
  },
  {
    id: "gases",
    tabLabel: "4. Gases",
    title: "Análisis de Gases Contaminantes",
    emoji: "💨",
    image: gasesImage,
    alt: "Analizador de gases",
    content: (
      <>
        Conectamos el vehículo a un{" "}
        <strong className="text-[#007ea7] dark:text-[#80ced7] font-semibold">
          Analizador de gases computarizado
        </strong>{" "}
        para medir los niveles de emisiones contaminantes, validando que el motor
        opere eficientemente dentro de los límites ecológicos exigidos por la ley.
      </>
    ),
  },
  {
    id: "frenos",
    tabLabel: "5. Frenado",
    title: "Prueba Especializada de Frenado",
    emoji: "🛑",
    image: frenosImage,
    alt: "Frenómetro electrónico",
    content: (
      <>
        Sometemos el vehículo al rodillo del{" "}
        <strong className="text-[#007ea7] dark:text-[#80ced7] font-semibold">
          Frenómetro electrónico
        </strong>{" "}
        para calcular la fuerza de frenado por eje y la eficacia total del sistema,
        garantizando una respuesta firme y segura ante cualquier detención.
      </>
    ),
  },
  {
    id: "alineacion",
    tabLabel: "6. Alineación",
    title: "Prueba de Alineación al Paso",
    emoji: "↔️",
    image: alineacionImage,
    alt: "Placa de alineación",
    content: (
      <>
        Evaluamos el comportamiento de la dirección mediante la{" "}
        <strong className="text-[#007ea7] dark:text-[#80ced7] font-semibold">
          placa de alineación al paso
        </strong>
        , detectando desviaciones axiales que puedan comprometer la estabilidad
        del vehículo liviano o pesado y el desgaste prematuro de las llantas.
      </>
    ),
  },
  {
    id: "suspension",
    tabLabel: "7. Suspensión",
    title: "Prueba de Suspensión (Eusama)",
    emoji: "〰️",
    image: suspencionImage,
    alt: "Banco de suspensión",
    content: (
      <>
        Mide la eficacia de la adherencia de las ruedas al piso mediante el{" "}
        <strong className="text-[#007ea7] dark:text-[#80ced7] font-semibold">
          método Eusama
        </strong>
        , analizando el estado de los amortiguadores y elementos elásticos para
        garantizar el confort y el control dinámico en carretera.
      </>
    ),
  },
  {
    id: "taximetro",
    tabLabel: "8. Taxímetro",
    title: "Verificación de Taxímetro",
    emoji: "🚖",
    image: taximetroImage,
    alt: "Calibración de taxímetro",
    content: (
      <>
        Exclusivo para vehículos de servicio público (taxis). Verificamos
        técnicamente la correcta calibración y el registro de pulsos del{" "}
        <strong className="text-[#007ea7] dark:text-[#80ced7] font-semibold">
          aparato taxímetro
        </strong>{" "}
        conforme a las tarifas y normatividades de transporte vigentes.
      </>
    ),
  },
];

const requisitosAsistencia = [
  {
    id: "01",
    titulo: "Vehículo Totalmente Descargado",
    descripcion:
      "Vacío, sin elementos al interior del habitáculo de pasajeros y baúl que impidan realizar la labor de inspección.",
    imagen: requisitoDescargado,
  },
  {
    id: "02",
    titulo: "Óptimas Condiciones de Limpieza",
    descripcion:
      "El vehículo debe estar limpio, permitiendo la correcta labor de inspección visual de sus componentes.",
    imagen: requisitoLimpio,
  },
  {
    id: "03",
    titulo: "Sin Tapacubos (Copas)",
    descripcion:
      "La presencia de los mismos en cualquiera de las llantas de servicio del vehículo impedirá la correcta inspección de rines y pernos.",
    imagen: requisitoSinTapacubos,
  },
  {
    id: "04",
    titulo: "Batería Accesible",
    descripcion:
      "De acuerdo al tipo de vehículo, asegúrese de que la ubicación de la batería permita el acceso y retire las tapas o accesorios que obstaculicen la inspección.",
    imagen: requisitoBateria,
  },
  {
    id: "05",
    titulo: "Llanta de Repuesto Accesible",
    descripcion:
      "La llanta de repuesto debe estar accesible, libre de tapas o protectores que dificulten su revisión.",
    imagen: requisitoLlantaRepuesto,
  },
  {
    id: "06",
    titulo: "Combustible Suficiente",
    descripcion:
      "El medidor de combustible del vehículo indique un nivel no inferior al 50% del total de llenado del tanque para garantizar la realización de la RTM y EC.",
    imagen: requisitoCombustible,
  },
  {
    id: "07",
    titulo: "Cinturones de Seguridad Accesibles",
    descripcion:
      "En vehículos modelo 2004 y posteriores, los cinturones de seguridad traseros deben encontrarse accesibles para la realización de la inspección.",
    imagen: requisitoCinturones,
  },
  {
    id: "08",
    titulo: "Sin Elementos de Valor",
    descripcion:
      "Asegúrese de que no se encuentren elementos de valor tales como dinero, joyas, entre otros, al interior del vehículo.",
    imagen: requisitoSinElementosValor,
  },
  {
    id: "09",
    titulo: "Al Menos Una Luz Funcional",
    descripcion:
      "Que al menos una de las luces (direccionales, altas, bajas, exploradoras) sea completamente funcional.",
    imagen: requisitoAlMenosUnaLuz,
  },
  {
    id: "10",
    titulo: "Equipos Eléctricos Apagados",
    descripcion:
      "Que no se encuentre encendido ningún tipo de dispositivo o accesorio eléctrico en el vehículo (aire acondicionado, radio, etc.).",
    imagen: requisitoElectronicaApagada,
  },
  {
    id: "11",
    titulo: "Tablero de Instrumentos Visible",
    descripcion:
      "El tablero de instrumentos debe permitir visualizar sin obstrucciones los indicadores de falla del motor.",
    imagen: requisitoFallaMotor,
  },
  {
    id: "12",
    titulo: "Carpa Libre (Suelta)",
    descripcion:
      "Que la carpa del vehículo se encuentre libre (sin asegurar) para garantizar la correcta labor de inspección. Aplica para vehículos con carrocería tipo estacas.",
    imagen: requisitoCarpa,
  },
];
const tarifasServicios = [
  {
    id: "rtm-liviano",
    titulo: "RTM Vehículos Livianos",
    subtitulo: "Emisiones y Seguridad Vial",
    precio: "$327.000",
    frecuencia: "Obligatorio anual",
    destacado: true,
    detalles: [
      "Aplica para automóviles, camperos y camionetas",
      "Diagnóstico sistematizado en pista especializada",
      "Cargue inmediato del certificado en el RUNT",
      "Servicio avalado por la ONAC",
    ],
  },
  {
    id: "rtm-pesado",
    titulo: "RTM Vehículos Pesados",
    subtitulo: "Emisiones y Seguridad Vial",
    precio: "$485.000",
    frecuencia: "Obligatorio anual",
    destacado: false,
    detalles: [
      "Aplica para camiones, buses, busetas y tractocamiones",
      "Línea de pruebas adaptada para carga pesada",
      "Cargue inmediato del certificado en el RUNT",
      "Servicio avalado por la ONAC",
    ],
  },
  {
    id: "preventiva-publicos",
    titulo: "Revisión Preventiva Públicos",
    subtitulo: "Control y Mantenimiento",
    precio: "$80.000",
    frecuencia: "Requerimiento periódico",
    destacado: false,
    detalles: [
      "Enfocado en vehículos de servicio público",
      "Inspección de sistemas de frenos y suspensión",
      "Verificación de seguridad para operación legal",
      "Informe técnico detallado",
    ],
  },
  {
    id: "preventiva-viajeros",
    titulo: "Revisión Preventiva Viajeros",
    subtitulo: "Listos para Carretera",
    precio: "$130.000",
    frecuencia: "Por evento / Viaje",
    destacado: false,
    detalles: [
      "Chequeo integral de puntos críticos de desgaste",
      "Revisión de luces, fluidos, llantas y frenos",
      "Ideal para trayectos largos y vacaciones",
      "Tranquilidad y seguridad en carretera",
    ],
  },
  {
    id: "gases-comparendo",
    titulo: "Certificado de Gases por Comparendo",
    subtitulo: "Solución Vial Inmediata",
    precio: "$100.000",
    frecuencia: "Por evento",
    destacado: false,
    detalles: [
      "Diagnóstico rápido de emisiones contaminantes",
      "Ideal para trámites de salida de patios o comparendos",
      "Reporte directo en plataformas de tránsito",
      "Atención ágil sin esperas",
    ],
  },
  {
    id: "soat",
    titulo: "Seguro Obligatorio (SOAT)",
    subtitulo: "Tarifas Oficiales Reguladas",
    precio: "Desde $245.000",
    frecuencia: "Vigencia de 1 año",
    destacado: false,
    esSoat: true,
    desgloseSoat: [
      { rango: "Vehículos Familiares / Livianos", valor: "Según Cilindrada" },
      { rango: "Vehículos de Carga / Pesados", valor: "Según Tonelaje" },
      { rango: "Servicio Público", valor: "Tarifa Diferencial" },
    ],
    detalles: [
      "Expedición e impresión inmediata",
      "Reporte directo a la plataforma RUNT",
      "Cobertura nacional de accidentes",
      "⚠️ Sujeto a disponibilidad y cupos diarios limitados",
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
      "No, en nuestro CDA operamos por estricto orden de llegada, de modo que no es obligatorio contar con cita previa para ser atendido en la pista de diagnóstico. Sin embargo, si deseas coordinar tu tiempo o asegurar una atención preferente para el día, puedes comunicarte con nuestra línea 323 3303659 para asegurar tu cupo.",
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
  {
    id: 1,
    src: instalaciones01,
    alt: "Fachada principal e ingreso al CDA Autobig",
  },
  {
    id: 2,
    src: instalaciones02,
    alt: "Pista técnica de diagnóstico y equipos especializados",
  },
  {
    id: 3,
    src: instalaciones03,
    alt: "Instalaciones y áreas operativas del CDA Autobig",
  },
  {
    id: 4,
    src: instalaciones04,
    alt: "Zona de revisión técnico-mecánica para vehículos",
  },
  {
    id: 5,
    src: instalaciones05,
    alt: "Equipamiento tecnológico en la línea de inspección",
  },
  {
    id: 6,
    src: instalaciones06,
    alt: "Áreas de servicio y atención en la sede",
  },
  {
    id: 7,
    src: instalaciones07,
    alt: "Infraestructura y espacios de diagnóstico vehicular",
  },
  {
    id: 8,
    src: instalaciones08,
    alt: "Instalaciones generales del CDA Autobig en Manizales",
  },
];



const numeroWhatsApp = "573103820752";
const enlaceContacto = `https://wa.me/${numeroWhatsApp}?text=Hola%20CDA%20Autobig%2C%20tengo%20una%20consulta%20sobre%20sus%20servicios%20y%20tarifas%20para%20veh%C3%ADculos%20livianos%20y%20pesados.`;

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






























export default function AutobigLandingPage({
  currentTenant,
}: {
  currentTenant: string;
}) {

    const destinationUrl = `https://${currentTenant}.cda-app.com/peticiones-quejas-apelaciones-felicitaciones`;
  
  
    return (
    <>
      {/* ── HEADER ── */}
      <header className="bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-0 sticky border-b border-[#007ea7]/20 dark:border-[#9ad1d4]/20 top-0 z-40 bg-[#ccdbdc]/30 dark:bg-[#003249]/80 transition-colors duration-300">
        <div className="container flex flex-row justify-between items-center mx-auto px-3 relative h-15 md:h-20">
          <Link
            prefetch={true}
            rel="noreferrer noopener"
            href="/"
            className="ml-2 flex items-center"
          >
            <Image
              src={logo}
              alt="CDA Autobig Logo"
              priority
              className="block dark:hidden w-auto h-15 md:h-20 rounded-xl object-contain"
            />
            <Image
              src={logo}
              alt="CDA Autobig Logo"
              priority
              className="hidden dark:block w-auto h-15 md:h-20 rounded-xl object-contain"
            />
          </Link>

          <div className="flex items-center justify-center">
            <Drawer>
              <DrawerTrigger asChild>
               <Button
                variant="outline"
                className="h-14 px-8 text-base border-2 border-[#007ea7]/30 dark:border-[#9ad1d4]/30 font-extrabold gap-3 shadow-md text-[#003249] dark:text-[#ccdbdc] hover:bg-[#007ea7]/10 dark:hover:bg-[#007ea7]/30 transition-colors duration-200 cursor-pointer bg-[#ccdbdc]"
                >
                <Menu className="h-6 w-6 text-[#55a630] dark:text-[#80ced7]" />
                <span>Menú</span>
                </Button>
              </DrawerTrigger>

              <DrawerContent className="bg-[#ccdbdc] dark:bg-[#003249] border-t border-[#007ea7]/20 dark:border-[#9ad1d4]/20 max-h-[85dvh] flex flex-col p-0">
                <div className="mx-auto w-full max-w-sm flex flex-col h-full overflow-hidden p-6 pb-2">
                  <DrawerHeader className="p-0 flex items-center justify-between border-b border-[#007ea7]/20 dark:border-[#9ad1d4]/20 pb-4 shrink-0">
                    <DrawerTitle className="text-lg font-extrabold text-[#003249] dark:text-[#ccdbdc] flex items-center gap-2">
                      <span className="text-[#55a630]">📌</span> Navegación
                    </DrawerTitle>
                    <DrawerClose asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#007ea7] dark:text-[#80ced7] hover:text-[#55a630] dark:hover:text-[#ccdbdc] hover:bg-[#007ea7]/15 dark:hover:bg-[#007ea7]/30 rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </DrawerClose>
                  </DrawerHeader>

                  <div className="overflow-y-auto my-4 pr-1">
                    <nav className="flex flex-col space-y-1">
                    {navegación.map((item, idx) => {
                        const IconComponent = item.icon;
                        return (
                        <DrawerClose asChild key={idx}>
                            <Link
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#003249] dark:text-[#ccdbdc] hover:bg-[#007ea7]/10 dark:hover:bg-[#007ea7]/30 hover:text-[#007ea7] dark:hover:text-[#80ced7] transition-colors"
                            >
                            <IconComponent className="h-4 w-4 text-[#55a630] dark:text-[#80ced7]" />
                            <span>{item.name}</span>
                            </Link>
                        </DrawerClose>
                        );
                    })}
                    </nav>
                  </div>

               
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex items-center justify-center gap-4 py-2">
              <a
                rel="noreferrer noopener"
                href="https://wa.me/573103820752"
                target="_blank"
                className="flex items-center justify-center"
                aria-label="Contactar por WhatsApp"
              >
                <Button
                  variant="outline"
                  className="border border-[#007ea7]/40 p-3 bg-card hover:bg-[#007ea7]/10"
                >
                  <WhatsApp size={20} />
                </Button>
              </a>

              <a
                rel="noreferrer noopener"
                href="https://www.facebook.com/AutoBigManizales"
                target="_blank"
                className="flex items-center justify-center"
                aria-label="Ir a Facebook"
              >
                <Button
                  variant="outline"
                  className="border border-[#007ea7]/40 p-3 bg-card hover:bg-[#007ea7]/10"
                >
                  <Facebook size={20} />
                </Button>
              </a>

              <a
                rel="noreferrer noopener"
                href="https://www.instagram.com/cdaautobigmanizales"
                target="_blank"
                className="flex items-center justify-center"
                aria-label="Ir a Instagram"
              >
                <Button
                  variant="outline"
                  className="border border-[#007ea7]/40 p-3 bg-card hover:bg-[#007ea7]/10"
                >
                  <Instagram size={20} />
                </Button>
              </a>
            </div>

            <ModeToggle />
          </div>
        </div>
      </header>







{/* ── HERO ── */}
      <section
        id="hero"
        className="w-full min-h-[85vh] flex items-center justify-center bg-[#003249]/20 dark:bg-[#003249] px-6 py-12 md:px-12 select-none transition-colors duration-300"
      >
        <div className="max-w-6xl w-full flex flex-col md:flex-row gap-12 items-center justify-between">
          <div className="flex flex-col space-y-6 max-w-2xl w-full md:w-[60%]">
            <div className="flex flex-col space-y-4">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#003249] dark:text-[#ccdbdc] lg:text-6xl">
                Tu seguridad, nuestra prioridad
              </h1>
              <p className="text-lg md:text-xl font-normal text-[#003249]/90 dark:text-[#ccdbdc]/80">
                Revisión técnico mecánica y de emisiones contaminantes para
                vehículos livianos y pesados en la ciudad de Manizales.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              {/* Botón de WhatsApp */}
              <a
                href="https://wa.me/573103820752"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-all bg-[#55a630] text-white hover:bg-[#438424] h-11 px-6 shadow-sm gap-2"
              >
                <WhatsApp size={18} />
                <span>WhatsApp</span>
              </a>

              {/* Botón de Contacto */}
              <a
                href="#contactoHorarios"
                className="inline-flex items-center justify-center rounded-md text-sm font-bold transition-all bg-[#007ea7] text-white hover:bg-[#005f7d] h-11 px-6 shadow-sm"
              >
                Contáctanos
                <span className="ml-2 text-base font-semibold transform -translate-y-px">
                  ↗
                </span>
              </a>

              {/* Botón de Tarifas */}
              <a
                href="#precios"
                className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors border-2 border-[#007ea7] text-[#007ea7] bg-transparent hover:bg-[#007ea7]/10 dark:border-[#ccdbdc] dark:text-[#ccdbdc] dark:hover:bg-[#ccdbdc]/10 h-11 px-6"
              >
                Ver Tarifas
              </a>

              {/* Botón de PQAF */}
              <a
                href="#pqaf"
                className="inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors border-2 border-[#55a630] text-[#55a630] bg-transparent hover:bg-[#55a630]/10 dark:text-[#80ced7] dark:border-[#80ced7] dark:hover:bg-[#80ced7]/10 h-11 px-6 gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Radicar: Petición, Queja, Apelación o Felicitación</span>
              </a>
            </div>
          </div>

          <div className="w-full md:w-[80%] flex min-h-96 md:min-h-112 relative rounded-xl overflow-hidden shadow-lg border border-[#007ea7]/20 dark:border-[#ccdbdc]/30">
            <Image
              src={hero}
              alt="Vehículo en línea de diagnóstico del CDA"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>










      {/* ── QUIÉNES SOMOS ── */}
      <section
        id="quienesSomos"
        className="w-full flex items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300"
      >
        <div className="max-w-6xl w-full flex flex-col md:flex-row gap-12 items-center justify-between">
          <div className="w-full md:w-[45%] flex min-h-104 md:min-h-128 relative rounded-xl overflow-hidden shadow-lg border border-[#007ea7]/20 dark:border-[#ccdbdc]/30">
            <Image
              src={panoramico}
              alt="Instalaciones del CDA Autobig en Manizales, Caldas"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </div>

          <div className="w-full md:w-[55%] rounded-xl border border-[#007ea7]/20 dark:border-[#ccdbdc]/30 bg-white dark:bg-[#003249] text-[#003249] dark:text-[#ccdbdc] shadow-md p-8 md:p-10 flex flex-col space-y-6">
            <div className="flex flex-col space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#007ea7] dark:text-[#80ced7]">
                Trayectoria y Confianza
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#003249] dark:text-white">
                Quiénes Somos
              </h2>
            </div>

            <div className="text-base md:text-lg font-normal text-[#003249]/90 dark:text-[#ccdbdc]/80 leading-relaxed space-y-4">
              <p>
                Desde el año{" "}
                <strong className="text-[#003249] dark:text-white font-bold">
                  2015
                </strong>
                , nos hemos consolidado en la ciudad de{" "}
                <strong className="text-[#003249] dark:text-white font-bold">
                  Manizales, Caldas
                </strong>{" "}
                como el Centro de Diagnóstico Automotor de referencia para
                vehículos livianos y pesados. Nacimos con la convicción de
                proteger la vida en las vías, convirtiendo la revisión
                técnico-mecánica y de emisiones contaminantes en un pilar
                esencial para la seguridad vial de nuestra comunidad.
              </p>
              <p>
                Con una trayectoria sólida y miles de revisiones exitosas,
                nuestro nombre es sinónimo de{" "}
                <strong className="text-[#003249] dark:text-white font-bold">
                  categoría, respaldo y confianza
                </strong>
                . Nos enfocamos rigurosamente en la calidad técnica y el estado
                óptimo de cada automotor, garantizando que ruede con total
                tranquilidad por las carreteras de la región.
              </p>
              <p>
                Contamos con la prestigiosa{" "}
                <strong className="text-[#55a630] dark:text-[#55a630] font-semibold">
                  acreditación ONAC
                </strong>
                , lo que certifica la transparencia e imparcialidad de todos
                nuestros procesos. Esto, sumado a un equipo técnico altamente
                especializado y en constante capacitación, nos permite ofrecer
                un diagnóstico preciso, ágil y con los más altos estándares
                tecnológicos del sector.
              </p>
            </div>

            <div className="pt-4 border-t border-[#007ea7]/10 dark:border-[#ccdbdc]/20 flex items-center gap-4 text-sm font-semibold text-[#003249]/70 dark:text-[#ccdbdc]/60">
              <div className="flex items-center gap-1.5">
                <span className="text-[#55a630] text-lg">✓</span> Acreditados
                ONAC
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#007ea7]/30 dark:bg-[#ccdbdc]/30"></div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#55a630] text-lg">✓</span> Manizales, Caldas
              </div>
            </div>
          </div>
        </div>
      </section>
{/* ── SERVICIOS ESPECIALIZADOS ── */}
      <section
        id="servicios"
        className="w-full flex items-center justify-center bg-[#003249]/20 dark:bg-[#003249]/40 px-6 py-16 md:px-12 select-none transition-colors duration-300"
      >
        <div className="max-w-6xl w-full flex flex-col space-y-12">
          <div className="flex flex-col space-y-3 text-center items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#007ea7] dark:text-[#80ced7]">
              Nuestras Soluciones
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#003249] dark:text-white">
              Servicios Especializados
            </h2>
            <p className="text-base md:text-lg font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 max-w-2xl">
              Equipamiento con tecnología de punta y personal experto para
              garantizar la máxima seguridad y cumplimiento legal de tu
              vehículo liviano y pesado.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-stretch">
            {serviciosList.map((servicio) => {
              const IconComponent = servicio.icono;
              return (
                <div
                  key={servicio.id}
                  className={`flex flex-col justify-between p-6 rounded-xl bg-white dark:bg-[#003249] text-[#003249] dark:text-[#ccdbdc] shadow-sm transition-all relative overflow-hidden ${
                    servicio.destacado
                      ? "border-2 border-[#007ea7] shadow-md"
                      : "border border-[#007ea7]/20 dark:border-[#ccdbdc]/30 hover:border-[#007ea7]/50 dark:hover:border-[#ccdbdc]/50"
                  }`}
                >
                  {servicio.etiqueta && (
                    <div className="absolute top-0 right-0 bg-[#007ea7] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-bl-lg tracking-wider">
                      {servicio.etiqueta}
                    </div>
                  )}

                  <div className="flex flex-col space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-[#007ea7]/10 flex items-center justify-center text-[#007ea7] dark:text-[#80ced7]">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold tracking-tight text-[#003249] dark:text-white">
                        {servicio.titulo}
                      </h3>
                      <p className="text-sm font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 leading-relaxed">
                        {servicio.descripcion}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#007ea7]/10 dark:border-[#ccdbdc]/20 flex items-center justify-between text-xs font-semibold text-[#007ea7] dark:text-[#80ced7]">
                    <span>{servicio.subtitulo}</span>
                    <span>↗</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ¿QUÉ ES LO QUE SE MIDE? (CONSISTE RTM) ── */}
      <section
        id="consisteRTM"
        className="w-full flex items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300"
      >
        <div className="max-w-5xl w-full flex flex-col space-y-10">
          <div className="flex flex-col space-y-3 text-center items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#007ea7] dark:text-[#80ced7]">
              Inspección paso a paso
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#003249] dark:text-white">
              ¿En qué consiste la Revisión Técnico-Mecánica?
            </h2>
            <p className="text-base md:text-lg font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 max-w-2xl">
              Conoce las etapas reglamentarias que realizamos en nuestra pista
              especializada para garantizar el estado óptimo de tu vehículo
              liviano, pesado y taxi.
            </p>
          </div>

          <Tabs
            defaultValue="sensorial"
            className="w-full flex flex-col space-y-6"
          >
            <TabsList className="inline-flex h-12 w-full items-center justify-start rounded-xl bg-[#007ea7]/5 dark:bg-[#003249]/60 p-1 text-[#003249]/70 dark:text-[#ccdbdc]/60 overflow-x-auto overflow-y-hidden border border-[#007ea7]/10 dark:border-[#ccdbdc]/20">
              {rtmSteps.map((step) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  className="font-semibold tracking-tight data-[state=active]:bg-white data-[state=active]:dark:bg-[#004d6e] data-[state=active]:text-[#003249] data-[state=active]:dark:text-white"
                >
                  {step.tabLabel}
                </TabsTrigger>
              ))}
            </TabsList>

            {rtmSteps.map((step) => (
              <TabsContent
                key={step.id}
                value={step.id}
                className="mt-0 focus-visible:outline-none"
              >
                <Card className="border-[#007ea7]/20 dark:border-[#ccdbdc]/30 bg-white dark:bg-[#003249] shadow-sm overflow-hidden">
                  <div className="flex flex-col md:flex-row items-stretch justify-between mx-2">
                    <div className="p-8 flex flex-col justify-center space-y-4 md:w-[60%]">
                      <CardHeader className="p-0 space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{step.emoji}</span>
                          <CardTitle className="text-xl font-bold text-[#003249] dark:text-white">
                            {step.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 text-base font-normal text-[#003249]/90 dark:text-[#ccdbdc]/80 leading-relaxed">
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

      {/* ── PREPARACIÓN DEL VEHÍCULO (REQUISITOS) ── */}
      <section
        id="preparacionRTM"
        className="w-full flex flex-col items-center justify-center bg-[#003249]/10 dark:bg-[#003249]/40 px-6 py-16 md:px-12 select-none transition-colors duration-300"
      >
        <div className="max-w-6xl w-full flex flex-col space-y-12">
          <div className="flex flex-col space-y-3 text-center items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#007ea7] dark:text-[#80ced7]">
              Preparación para tu RTM
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#003249] dark:text-white">
              ¿Cómo debe asistir tu vehículo?
            </h2>
            <p className="text-base md:text-lg font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 max-w-2xl">
              Para garantizar un proceso ágil y evitar rechazos preventivos,
              asegúrate de que tu vehículo cumpla con las siguientes condiciones
              antes de ingresar a la pista.
            </p>
          </div>

          <div className="w-full flex flex-row flex-wrap gap-6 justify-center items-stretch">
            {requisitosAsistencia.map((requisito) => (
              <Card
                key={requisito.id}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] flex flex-col justify-between overflow-hidden border-[#007ea7]/20 dark:border-[#ccdbdc]/30 bg-white dark:bg-[#003249] shadow-sm hover:shadow-md transition-all duration-300 group rounded-xl relative"
              >
                <div className="w-full h-48 relative overflow-hidden bg-[#007ea7]/5">
                  <Image
                    src={requisito.imagen}
                    alt={requisito.titulo}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 text-xs font-black tracking-widest bg-white/90 dark:bg-[#003249]/90 text-[#007ea7] dark:text-[#80ced7] px-2 py-1 rounded shadow-sm">
                    {requisito.id}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-6 space-y-2">
                  <CardHeader className="p-0">
                    <CardTitle className="text-lg font-extrabold tracking-tight text-[#003249] dark:text-white group-hover:text-[#007ea7] dark:group-hover:text-[#80ced7] transition-colors duration-200">
                      {requisito.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 text-sm font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 leading-relaxed">
                    {requisito.descripcion}
                  </CardContent>
                </div>

                <div className="w-full h-0.75 bg-transparent group-hover:bg-[#007ea7] dark:group-hover:bg-[#80ced7] transition-colors duration-300" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── CINTAS RETROREFLECTIVAS ── */}
      <section
        id="cintas-retroreflectivas"
        className="bg-[#ccdbdc]/20 dark:bg-[#003249] py-24 transition-colors duration-300"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-[#007ea7]/10 dark:bg-[#007ea7]/20 px-4 py-1 text-sm font-semibold text-[#007ea7] dark:text-[#80ced7]">
              Información importante
            </span>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#003249] dark:text-white">
              Cintas retroreflectivas
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#003249]/80 dark:text-[#ccdbdc]/80">
              Antes de asistir a la revisión técnico-mecánica verifica que tu
              vehículo cuente con las cintas retroreflectivas exigidas por la
              normativa vigente y que se encuentren correctamente instaladas.
            </p>
          </div>

          <div className="mt-14 overflow-hidden rounded-3xl border border-[#007ea7]/30 dark:border-[#ccdbdc]/30 bg-white dark:bg-[#003249]/80 shadow-2xl">
            <Image
              src={cintas}
              alt="Guía de instalación de cintas retroreflectivas para vehículos"
              width={1400}
              height={1400}
              className="h-auto w-full object-cover"
              priority={false}
            />
          </div>
        </div>
      </section>

      {/* ── PLACAS SERVICIO PÚBLICO ── */}
      <section
        id="placas"
        className="bg-transparent py-24 transition-colors duration-300"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex rounded-full bg-[#007ea7]/10 dark:bg-[#007ea7]/20 px-4 py-1 text-sm font-semibold text-[#007ea7] dark:text-[#80ced7]">
              Información importante
            </span>

            <h2 className="mt-6 text-4xl font-bold tracking-tight text-[#003249] dark:text-white">
              Ubicación de Placas en Vehículos de Servicio Público
            </h2>

            <p className="mt-5 text-lg leading-8 text-[#003249]/80 dark:text-[#ccdbdc]/80">
              Antes de asistir a la revisión técnico-mecánica verifica que tu
              vehículo de placas públicas y de enseñanza se ajuste a lo exigido por
              la autoridad competente.
            </p>
          </div>

          <div className="mt-14 overflow-hidden rounded-3xl border border-[#007ea7]/30 dark:border-[#ccdbdc]/30 bg-white dark:bg-[#003249]/80 shadow-2xl">
            <Image
              src={placas}
              alt="Guía de ubicación de placas para vehículos de servicio público"
              width={1400}
              height={1400}
              className="h-auto w-full object-cover"
              priority={false}
            />
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#007ea7] dark:text-[#80ced7]">
              Tarifas Transparentes
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#003249] dark:text-white">
              Precios y Tarifas Vigentes
            </h2>
            <p className="text-base md:text-lg font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 max-w-2xl">
              Consulta los costos oficiales de nuestros servicios. Operamos bajo
              las regulaciones de ley sin cobros adicionales ni sorpresas.
            </p>
          </div>

          {/* Contenedor de Tarjetas con Flexbox */}
          <div className="w-full flex flex-row flex-wrap gap-6 justify-center items-stretch">
            {tarifasServicios.map((tarifa) => {
              const mensajeCotizacion = encodeURIComponent(
                `Hola CDA Autobig, deseo cotizar el servicio de ${tarifa.titulo} (${tarifa.precio}).`
              );
              const enlaceCotizar = `https://wa.me/${numeroWhatsApp}?text=${mensajeCotizacion}`;

              return (
                <Card
                  key={tarifa.id}
                  className={`w-full md:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] flex flex-col justify-between p-8 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                    tarifa.destacado
                      ? "border-2 border-[#007ea7] bg-white dark:bg-[#003249] shadow-md ring-4 ring-[#007ea7]/10"
                      : "border border-[#007ea7]/10 dark:border-[#ccdbdc]/20 bg-white dark:bg-[#003249] shadow-sm"
                  }`}
                >
                  {/* Etiqueta flotante para el servicio principal */}
                  {tarifa.destacado && (
                    <div className="absolute top-0 right-0 bg-[#007ea7] text-white text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-bl-xl tracking-wider">
                      Más Solicitado
                    </div>
                  )}

                  {/* Contenido Superior: Títulos y Precio */}
                  <div className="flex flex-col space-y-6">
                    <CardHeader className="p-0 space-y-1">
                      <CardTitle className="text-xl font-extrabold tracking-tight text-[#003249] dark:text-white">
                        {tarifa.titulo}
                      </CardTitle>
                      <CardDescription className="text-xs font-semibold text-[#003249]/60 dark:text-[#ccdbdc]/50 uppercase tracking-wider">
                        {tarifa.subtitulo}
                      </CardDescription>
                    </CardHeader>

                    {/* Sección del Valor Económico */}
                    <div className="flex flex-col border-b border-[#007ea7]/10 dark:border-[#ccdbdc]/10 pb-6">
                      <span className="text-4xl font-black tracking-tight text-[#003249] dark:text-white">
                        {tarifa.precio}
                      </span>
                      <span className="text-xs font-medium text-[#003249]/70 dark:text-[#ccdbdc]/60 mt-1">
                        {tarifa.frecuencia}
                      </span>
                    </div>

                    {/* Condicional para el desglose específico del SOAT */}
                    {tarifa.esSoat && tarifa.desgloseSoat && (
                      <div className="flex flex-col space-y-2.5 bg-[#007ea7]/5 dark:bg-[#ccdbdc]/5 p-4 rounded-xl border border-[#007ea7]/10 dark:border-[#ccdbdc]/10">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#003249] dark:text-white">
                          Tarifas según categoría:
                        </span>
                        <div className="flex flex-col space-y-1.5">
                          {tarifa.desgloseSoat.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-sm font-medium"
                            >
                              <span className="text-[#003249]/80 dark:text-[#ccdbdc]/70">
                                {item.rango}
                              </span>
                              <span className="font-bold text-[#003249] dark:text-white">
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
                            className="flex items-start text-sm text-[#003249]/90 dark:text-[#ccdbdc]/80 font-normal"
                          >
                            <span className="text-[#55a630] dark:text-[#55a630] mr-2.5 font-bold">
                              ✓
                            </span>
                            {detalle}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </div>

                  {/* Botón de Cotización a WhatsApp */}
                  <div className="mt-8 pt-4 border-t border-[#007ea7]/5 dark:border-[#ccdbdc]/10">
                    <Link
                      href={enlaceCotizar}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3 px-4 rounded-xl text-center text-sm font-bold tracking-tight shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                        tarifa.destacado
                          ? "bg-[#007ea7] hover:bg-[#005f7d] text-white"
                          : "bg-[#007ea7]/10 dark:bg-[#ccdbdc]/5 text-[#007ea7] dark:text-[#80ced7] hover:bg-[#007ea7]/20 dark:hover:bg-[#ccdbdc]/10"
                      }`}
                    >
                      <span>Cotizar</span>
                      <span>💬</span>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Nota aclaratoria legal al pie de los precios */}
          <p className="text-center text-xs font-normal text-[#003249]/60 dark:text-[#ccdbdc]/40 max-w-3xl mx-auto leading-relaxed">
            * El valor de la Revisión Técnico-Mecánica se encuentra regulado por
            el Ministerio de Transporte de Colombia. El precio final incluye los
            valores de recaudo de la Agencia Nacional de Seguridad Vial (ANSV),
            el Sistema de Control y Vigilancia (SICOV) y la tasa del Registro
            Único Nacional de Tránsito (RUNT). Las tarifas del SOAT corresponden
            a los valores fijados por la Superintendencia Financiera de
            Colombia.
          </p>
        </div>
      </section>
      
            <section
        id="mediosPagos"
        className="w-full flex flex-col items-center justify-center bg-[#003249]/20 dark:bg-[#003249]/40 px-6 py-16 md:px-12 select-none transition-colors duration-300"
      >
        <div className="max-w-6xl w-full flex flex-col space-y-12">
          {/* Encabezado */}
          <div className="flex flex-col space-y-3 text-center items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#007ea7] dark:text-[#80ced7]">
              Facilidades para ti
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#003249] dark:text-white">
              Métodos y Medios de Pago
            </h2>
            <p className="text-base md:text-lg font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 max-w-2xl">
              Te ofrecemos múltiples alternativas financieras y digitales para
              que realices el pago de tus servicios de forma rápida y segura.
            </p>
          </div>

          {/* Contenedor de Medios de Pago con Flexbox */}
          <div className="w-full flex flex-row flex-wrap gap-6 justify-center items-stretch">
            {mediosPago.map((medio) => (
              <Card
                key={medio.id}
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(20%-20px)] min-w-50 flex flex-col overflow-hidden border border-[#007ea7]/10 dark:border-[#ccdbdc]/20 bg-white dark:bg-[#003249] shadow-sm hover:shadow-md transition-all duration-300 group rounded-xl"
              >
                {/* Espacio superior para la imagen */}
                <div className="w-full h-32 relative bg-[#007ea7]/5 dark:bg-[#ccdbdc]/5 p-4 flex items-center justify-center border-b border-[#007ea7]/10 dark:border-[#ccdbdc]/20">
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
                  <span className="text-sm font-bold tracking-tight text-[#003249] dark:text-[#ccdbdc] group-hover:text-[#007ea7] dark:group-hover:text-[#80ced7] transition-colors duration-200">
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#007ea7] dark:text-[#80ced7]">
              ¿Dónde encontrarnos?
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#003249] dark:text-white">
              Contacto y Horarios de Atención
            </h2>
            <p className="text-base md:text-lg font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 max-w-2xl">
              Visítanos en nuestra sede en Manizales, Caldas o comunícate con
              nosotros para resolver cualquier inquietud sobre la revisión de tu
              vehículo liviano o pesado.
            </p>
          </div>

          {/* Contenedor Principal en Flexbox (Asimétrico) */}
          <div className="w-full flex flex-col md:flex-row gap-8 justify-between items-stretch">
            {/* Bloque Izquierdo: Datos de Contacto y Botón de Mapa */}
            <div className="flex-1 flex flex-col justify-between p-8 rounded-2xl border border-[#007ea7]/10 dark:border-[#ccdbdc]/20 bg-white dark:bg-[#003249] shadow-sm space-y-8">
              <div className="flex flex-col space-y-6">
                <h3 className="text-xl font-bold tracking-tight text-[#003249] dark:text-white">
                  Información de Contacto
                </h3>

                <div className="flex flex-col space-y-4">
                  {/* Dirección */}
                  <div className="flex items-start gap-3 text-sm font-normal text-[#003249]/90 dark:text-[#ccdbdc]/80">
                    <span className="text-xl text-[#007ea7]">📍</span>
                    <div>
                      <p className="font-bold text-[#003249] dark:text-white">
                        Dirección de la Sede
                      </p>
                      <p className="mt-0.5">
                        Cra. 10 #20-01, Manizales, Caldas
                      </p>
                    </div>
                  </div>

                  {/* Teléfono */}
                  <div className="flex items-start gap-3 text-sm font-normal text-[#003249]/90 dark:text-[#ccdbdc]/80">
                    <span className="text-xl text-[#007ea7]">📞</span>
                    <div>
                      <p className="font-bold text-[#003249] dark:text-white">
                        Línea Telefónica / WhatsApp
                      </p>
                      <p className="mt-0.5">+57 310 3820752</p>
                    </div>
                  </div>

                  {/* Correo Electrónico */}
                  <div className="flex items-start gap-3 text-sm font-normal text-[#003249]/90 dark:text-[#ccdbdc]/80">
                    <span className="text-xl text-[#007ea7]">✉️</span>
                    <div>
                      <p className="font-bold text-[#003249] dark:text-white">
                        Correo Electrónico Oficial
                      </p>
                      <p className="mt-0.5 break-all">
                        contacto@cdaautobig.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Redirección a Google Maps */}
              <Link
                href="https://www.google.com/maps/place/CDA+AUTOBIG+MANIZALES/@5.0757708,-75.5191671,1092m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8e476fe44a4827ef:0xec85950652e4256e!8m2!3d5.0757708!4d-75.5191671!16s%2Fg%2F11fqxxsc1q?entry=ttu&g_ep=EgoyMDI2MTAxMi4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 bg-[#007ea7] hover:bg-[#005f7d] text-white rounded-xl text-center text-sm font-bold tracking-tight shadow-sm transition-all duration-200 flex items-center justify-center gap-2 group"
              >
                <span>Ver Ubicación en Google Maps</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-200">
                  ➔
                </span>
              </Link>
            </div>

            {/* Bloque Derecho: Tabla de Horarios */}
            <div className="flex-1 flex flex-col p-8 rounded-2xl border-2 border-[#007ea7] bg-white dark:bg-[#003249] shadow-md ring-4 ring-[#007ea7]/10 justify-center">
              <div className="flex flex-col space-y-6">
                <div className="flex items-center gap-2">
                  <span className="text-xl">⏰</span>
                  <h3 className="text-xl font-bold tracking-tight text-[#003249] dark:text-white">
                    Horarios de Operación
                  </h3>
                </div>

                <div className="flex flex-col space-y-3">
                  {/* Lunes a Viernes */}
                  <div className="flex justify-between items-center py-2.5 border-b border-[#007ea7]/10 dark:border-[#ccdbdc]/10 text-sm">
                    <span className="font-bold text-[#003249] dark:text-white">
                      Lunes a Viernes
                    </span>
                    <span className="font-semibold text-[#007ea7] dark:text-[#80ced7] bg-[#007ea7]/5 dark:bg-[#ccdbdc]/5 px-3 py-1 rounded-lg">
                      7:00 AM – 6:00 PM
                    </span>
                  </div>

                  {/* Sábados */}
                  <div className="flex justify-between items-center py-2.5 border-b border-[#007ea7]/10 dark:border-[#ccdbdc]/10 text-sm">
                    <span className="font-bold text-[#003249] dark:text-white">
                      Sábados
                    </span>
                    <span className="font-semibold text-[#007ea7] dark:text-[#80ced7] bg-[#007ea7]/5 dark:bg-[#ccdbdc]/5 px-3 py-1 rounded-lg">
                      7:00 AM – 3:00 PM
                    </span>
                  </div>

                  {/* Domingos y Festivos */}
                  <div className="flex justify-between items-center py-2.5 text-sm">
                    <span className="font-bold text-[#003249]/60 dark:text-[#ccdbdc]/40">
                      Domingos y Festivos
                    </span>
                    <span className="font-bold text-[#007ea7] bg-[#007ea7]/5 dark:bg-[#007ea7]/10 px-3 py-1 rounded-lg uppercase text-xs tracking-wider">
                      Cerrado
                    </span>
                  </div>
                </div>

                {/* Nota Recordatorio */}
                <p className="text-xs font-normal text-[#003249]/70 dark:text-[#ccdbdc]/60 bg-[#007ea7]/5 dark:bg-[#ccdbdc]/5 p-4 rounded-xl border border-[#007ea7]/10 dark:border-[#ccdbdc]/10 leading-relaxed">
                  📢{" "}
                  <strong className="text-[#003249] dark:text-white font-bold">
                    Atención sin citas:
                  </strong>{" "}
                  Recuerda asistir dentro de estos horarios para ingresar tu
                  vehículo liviano o pesado a las líneas de diagnóstico
                  técnico-mecánico. El cierre de la pista se realiza
                  puntualmente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="preguntasFrecuentes"
        className="w-full flex flex-col items-center justify-center bg-[#003249]/20 dark:bg-[#003249]/40 px-6 py-16 md:px-12 select-none transition-colors duration-300"
      >
        <div className="max-w-4xl w-full flex flex-col space-y-12">
          {/* Encabezado */}
          <div className="flex flex-col space-y-3 text-center items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#007ea7] dark:text-[#80ced7]">
              Resuelve tus dudas
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#003249] dark:text-white">
              Preguntas Frecuentes (FAQ)
            </h2>
            <p className="text-base md:text-lg font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 max-w-2xl">
              Encuentra respuestas rápidas a las consultas más comunes sobre la
              Revisión Técnico-Mecánica, normativas, tiempos y trámites en
              nuestro CDA.
            </p>
          </div>

          {/* Acordeón dinámico mediante mapeo del objeto */}
          <Accordion className="w-full space-y-4">
            {preguntasFrecuentes.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="border border-[#007ea7]/10 dark:border-[#ccdbdc]/20 bg-white dark:bg-[#003249] rounded-xl px-6 shadow-sm"
              >
                <AccordionTrigger className="text-base font-bold tracking-tight text-[#003249] dark:text-white hover:no-underline py-4 text-left">
                  {faq.pregunta}
                </AccordionTrigger>

                <AccordionContent className="text-sm font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 leading-relaxed pb-4 border-t border-[#007ea7]/5 dark:border-[#ccdbdc]/5 pt-3 space-y-3">
                  <p>{faq.respuesta}</p>

                  {/* Renderizado condicional si incluye lista de tiempos */}
                  {faq.tieneLista && faq.itemsLista && (
                    <div className="mt-3 flex flex-col space-y-2">
                      {faq.itemsLista.map((item, index) => (
                        <p key={index}>
                          •{" "}
                          <strong className="text-[#003249] dark:text-white">
                            {item.titulo}:
                          </strong>{" "}
                          A los{" "}
                          <strong className="text-[#007ea7] dark:text-[#80ced7]">
                            {item.detalle.split("A los ")[1]}
                          </strong>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Renderizado condicional si incluye nota destacada */}
                  {faq.notaDestacada && (
                    <span className="block bg-[#007ea7]/5 dark:bg-[#ccdbdc]/5 p-3 rounded-lg border border-[#007ea7]/10 dark:border-[#ccdbdc]/10 mt-2">
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
                            className="text-[#007ea7] dark:text-[#80ced7] font-semibold hover:underline break-all"
                          >
                            runt.com.co/consultaCiudadana
                          </Link>
                        </li>
                        {faq.pasosRunt.map((paso, index) => (
                          <li key={index}>{paso}</li>
                        ))}
                      </ol>

                      {faq.notaAlerta && (
                        <p className="text-xs text-[#007ea7] dark:text-[#80ced7] font-semibold bg-[#007ea7]/5 dark:bg-[#ccdbdc]/10 p-2.5 rounded-lg border border-[#007ea7]/10 mt-3">
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#007ea7] dark:text-[#80ced7]">
              Conoce nuestra sede
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#003249] dark:text-white">
              Un vistazo a nuestras instalaciones
            </h2>
            <p className="text-base md:text-lg font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 max-w-2xl">
              Contamos con equipos de última tecnología y espacios diseñados
              para ofrecerte un servicio de revisión técnico-mecánica ágil,
              cómodo y confiable.
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
                      <Card className="overflow-hidden border border-[#007ea7]/10 dark:border-[#ccdbdc]/20 bg-white dark:bg-[#003249] shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl">
                        <CardContent className="p-0 flex aspect-4/3 relative w-full items-center justify-center">
                          <Image
                            src={img.src}
                            alt={img.alt}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
              <CarouselPrevious className="flex left-[-30] sm:-left-12 border-[#007ea7]/20 dark:border-[#ccdbdc]/30 bg-white dark:bg-[#003249] text-[#003249] dark:text-white hover:bg-[#007ea7]/10" />
              <CarouselNext className="flex right-[-30] sm:-right-12 border-[#007ea7]/20 dark:border-[#ccdbdc]/30 bg-white dark:bg-[#003249] text-[#003249] dark:text-white hover:bg-[#007ea7]/10" />
            </Carousel>
          </div>
        </div>
      </section>

      <section
        id="CTA"
        className="w-full flex items-center justify-center bg-[#003249]/20 dark:bg-[#003249]/40 px-6 py-20 md:px-12 select-none transition-colors duration-300"
      >
        <div className="max-w-5xl w-full rounded-3xl border border-[#007ea7]/20 dark:border-[#ccdbdc]/30 bg-white dark:bg-[#003249] p-8 md:p-14 shadow-xl flex flex-col md:flex-row gap-10 items-center justify-between relative overflow-hidden">
          {/* Efecto decorativo de fondo sutil */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#007ea7]/5 dark:bg-[#007ea7]/10 rounded-full blur-3xl pointer-events-none -z-10" />

          {/* Lado Izquierdo: Textos e Interacción */}
          <div className="w-full md:w-[60%] flex flex-col space-y-6 text-center md:text-left items-center md:items-start">
            <div className="flex flex-col space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#007ea7] dark:text-[#80ced7]">
                ¿Tu técnico-mecánica está por vencer?
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#003249] dark:text-white leading-tight">
                Rueda seguro y sin preocupaciones por Manizales
              </h2>
            </div>

            <p className="text-base md:text-lg font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 max-w-lg leading-relaxed">
              Pasa hoy mismo por nuestra pista especializada o escríbenos
              directamente a nuestra línea de atención para coordinar tu
              servicio. Recuerda que trabajamos de forma ágil y eficiente.
            </p>

            {/* Botones de Acción */}
            <div className="w-full flex flex-col sm:flex-row gap-4 pt-2 justify-center md:justify-start">
            <a
  href={enlaceContacto}
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex h-12 items-center justify-center rounded-xl bg-[#55a630] hover:bg-[#438424] text-white text-sm font-bold tracking-tight shadow transition-all duration-200 px-8 gap-2"
>
  <WhatsApp size={18} />
  <span>WhatsApp</span>
</a>
            </div>
          </div>

          {/* Lado Derecho: Contenedor con la imagen grande del logo */}
          <div className="w-full md:w-[35%] flex justify-center items-center relative aspect-square max-w-60 md:max-w-none">
            <div className="w-full h-full relative p-6 bg-[#007ea7]/5 dark:bg-[#ccdbdc]/5 rounded-2xl border border-[#007ea7]/10 dark:border-[#ccdbdc]/5 flex items-center justify-center shadow-inner group">
              <Image
                src={logo}
                alt="Logo Oficial de CDA Autobig"
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
        id="PQAF"
        className="w-full flex flex-col items-center justify-center bg-transparent px-6 py-16 md:px-12 select-none transition-colors duration-300"
      >
        <div className="max-w-5xl w-full flex flex-col space-y-12">
          {/* Encabezado */}
          <div className="flex flex-col space-y-3 text-center items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-[#007ea7] dark:text-[#80ced7]">
              Tu opinión nos importa
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#003249] dark:text-white">
              Quejas, Apelaciones o Felicitaciones
            </h2>
            <p className="text-base md:text-lg font-normal text-[#003249]/80 dark:text-[#ccdbdc]/70 max-w-2xl">
              En el CDA Autobig trabajamos bajo la norma ISO 17020 para
              garantizar transparencia. Si deseas manifestar una inconformidad o
              dejarnos un reconocimiento, estamos listos para atenderte.
            </p>
          </div>

          {/* Bloque de opciones en rejilla */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {tramites.map((item, index) => (
              <Card
                key={index}
                className="border border-[#007ea7]/10 dark:border-[#ccdbdc]/20 bg-white dark:bg-[#003249] shadow-sm rounded-2xl overflow-hidden"
              >
                <CardContent className="p-6 flex flex-col items-center md:items-start text-center md:text-left space-y-3">
                  <span className="text-3xl">{item.icono}</span>
                  <h3 className="text-lg font-bold text-[#003249] dark:text-white">
                    {item.titulo}
                  </h3>
                  <p className="text-sm font-normal text-[#003249]/70 dark:text-[#ccdbdc]/60 leading-relaxed">
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
              <div className="absolute -inset-1 bg-gradient-to-r from-[#007ea7] via-[#55a630] to-[#80ced7] rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>

              {/* Botón Principal */}
              <Link
                href={destinationUrl}
                className="relative w-full sm:w-auto h-14 px-8 inline-flex items-center justify-center gap-3 bg-[#003249] dark:bg-[#007ea7] text-white dark:text-white text-base font-extrabold tracking-wide rounded-2xl border border-white/10 dark:border-black/10 shadow-2xl transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.98] cursor-pointer text-center"
              >
                {/* Icono de documento */}
                <FileText className="w-5 h-5 shrink-0 animate-bounce group-hover:animate-none text-[#55a630] dark:text-[#ccdbdc]" />

                <span>Radicar Solicitud Oficial (PQRSF)</span>

                {/* Flecha interactiva con desplazamiento */}
                <ArrowRight className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full px-6 md:px-12 bg-white dark:bg-[#003249] border-t border-[#007ea7]/10 dark:border-[#ccdbdc]/5 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between gap-10 py-12">
          <div className="flex flex-col max-w-md space-y-4">
            <div className="w-fit">
              <Link prefetch={true} href="/" className="flex items-center">
                <Image
                  src={logo}
                  alt="CDA Autobig Logo"
                  priority
                  className="w-auto h-20 object-contain rounded-2xl"
                />
              </Link>
            </div>

            <p className="text-sm font-normal text-[#003249]/70 dark:text-[#ccdbdc]/60 leading-relaxed">
              CDA especializado en la Revisión Técnico-Mecánica y de Emisiones Contaminantes exclusivamente para vehículos livianos y pesados en Manizales, Caldas. Comprometidos con la seguridad vial y el transporte de la región.
            </p>

            <div className="space-y-1.5 text-sm text-[#003249]/80 dark:text-[#ccdbdc]/70">
              <p>
                <span className="font-bold text-[#003249] dark:text-white">
                  Dirección:
                </span>{" "}
                Cra. 10 #20-01, Manizales, Caldas
              </p>
              <p>
                <span className="font-bold text-[#003249] dark:text-white">
                  Teléfono Fijo:
                </span>{" "}
                (606) 8803400
              </p>
              <p>
                <span className="font-bold text-[#003249] dark:text-white">
                  Celulares / WhatsApp:
                </span>{" "}
                +57 310 3820752 / 312 2707590
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:min-w-37.5">
            <span className="text-xs font-black tracking-wider uppercase text-[#003249] dark:text-white mb-4">
              Enlaces
            </span>
            <div className="flex flex-col space-y-2.5">
              {navegación.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-sm font-medium text-[#003249]/70 dark:text-[#ccdbdc]/60 hover:text-[#007ea7] dark:hover:text-[#80ced7] transition-colors w-fit"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:min-w-37.5">
            <span className="text-xs font-black tracking-wider uppercase text-[#003249] dark:text-white mb-4">
              Síguenos en
            </span>
            <div className="flex items-center space-x-5 text-[#003249]/60 dark:text-[#ccdbdc]/50">
              <a
                href="https://wa.me/573103820752"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#007ea7] transition-colors"
                aria-label="WhatsApp"
              >
                <WhatsApp size={22} />
              </a>
              <a
                href="https://www.facebook.com/AutoBigManizales"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#007ea7] transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={22} />
              </a>
              <a
                href="https://www.instagram.com/cdaautobigmanizales/?hl=es"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#007ea7] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={22} />
              </a>
            </div>
          </div>
        </div>

        <div className="py-8 text-xs font-medium text-center text-[#003249]/50 dark:text-[#ccdbdc]/40 border-t border-[#007ea7]/10 dark:border-[#ccdbdc]/5">
          Copyright ©{" "}
          <Suspense fallback={<span>2026</span>}>
            <DynamicYear />
          </Suspense>{" "}
          CDA Autobig. Hecho con ♥ por Juan Aristizabal.
        </div>
      </footer>
    </>
  );
}