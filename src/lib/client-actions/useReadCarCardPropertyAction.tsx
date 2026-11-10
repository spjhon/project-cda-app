"use client";

import { useState } from "react";
import { GoogleGenAI, Type } from "@google/genai";

// ============================================================
// Tipos
// ============================================================

export interface VehicleData {
  placa: string | null;
  nombre: string | null;
  cedula: string | null;
  marca: string | null;
  linea: string | null;
  modelo: string | null;
  clase_vehiculo: string | null;
  combustible: string | null;
  servicio: string | null;
}

// Interfaz para los datos ya normalizados (opcional, pero útil)
export interface NormalizedVehicleData {
  placa: string | null;
  nombre: string | null;
  cedula: string | null;
  marca: string | null;
  linea: string | null;
  modelo: string | null;
  clase: string; // Normalizado
  combustible: string; // Normalizado
  tipo_servicio_vehiculo: string; // Normalizado
}

// ============================================================
// Funciones de Normalización (Privadas del Hook)
// ============================================================

function normalizeCombustible(text: string | null): string {
  if (!text) return "";
  const t = text.toLowerCase();
  if (t.includes("gasolina")) return "gasolina";
  if (t.includes("gas natural") || t.includes("gnv")) return "gas_natural_vehicular";
  if (t.includes("diesel") || t.includes("acpm")) return "diesel";
  if (t.includes("hibrido")) return "hibrido";
  if (t.includes("electrico")) return "electrico";
  if (t.includes("etanol")) return "etanol";
  if (t.includes("biodiesel")) return "biodiesel";
  if (t.includes("hidrogeno")) return "hidrogeno";
  if (t.includes("gas")) return "gas_gasolina";
  return "gasolina"; // Default
}

function normalizeClaseVehiculo(text: string | null): string {
  if (!text) return "sin_clase";
  const t = text.toLowerCase().trim();
  
  if (t.includes("automovil")) return "automovil";
  if (t.includes("camioneta")) return "camioneta";
  if (t.includes("campero")) return "campero";
  if (t.includes("microbus")) return "microbus";
  if (t.includes("buseta")) return "buseta";
  if (t.includes("bus")) return "bus";
  if (t.includes("camion")) return "camion";
  if (t.includes("tractocamion")) return "tractocamion";
  if (t.includes("motocicleta")) return "motocicleta";
  if (t.includes("motocarro")) return "motocarro";
  if (t.includes("mototriciclo")) return "mototriciclo";
  if (t.includes("cuatrimoto")) return "cuatrimoto";
  if (t.includes("remolque")) return "remolque";
  if (t.includes("semiremolque")) return "semiremolque";
  if (t.includes("volqueta")) return "volqueta";
  if (t.includes("maquinaria")) return "maquinaria_construccion_o_minera";
  if (t.includes("ciclomotor")) return "ciclomotor";
  if (t.includes("tricimoto")) return "tricimoto";
  if (t.includes("cuadriciclo")) return "cuadriciclo";
  
  return "sin_clase";
}

function normalizeTipoServicio(text: string | null): string {
  if (!text) return "particular";
  const t = text.toLowerCase().trim();

  if (t.includes("particular")) return "particular";
  if (t.includes("enseñanza") || t.includes("ensenanza")) return "enseñanza";
  if (t.includes("oficial")) return "oficial";
  if (t.includes("publico") || t.includes("público")) return "publico"; 
  if (t.includes("diplomatico") || t.includes("diplomático")) return "diplomático"; 
  if (t.includes("especial")) return "especial";
  
  return "particular";
}

// ============================================================
// Hook
// ============================================================

export function useExtractVehicleData() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractData = async (imageSource: File | string): Promise<NormalizedVehicleData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No se encontró la API Key de Gemini.");
      }

      const ai = new GoogleGenAI({ apiKey });

      let base64Data = "";
      let mimeType = "image/jpeg";

      if (imageSource instanceof File) {
        mimeType = imageSource.type || "image/jpeg";
        
        const buffer = await imageSource.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        base64Data = window.btoa(binary);
      } else {
        base64Data = imageSource.includes(",")
          ? imageSource.split(",")[1]
          : imageSource;
        
        if (imageSource.includes("data:image/")) {
          mimeType = imageSource.substring(5, imageSource.indexOf(";"));
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite", 
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Analiza la imagen de esta tarjeta de tránsito o licencia de vehículo y extrae los datos solicitados. Si un dato no aparece o no es legible, devuélvelo como null. No inventes información.",
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              placa: { type: Type.STRING, description: "Placa del vehículo" },
              nombre: { type: Type.STRING, description: "Nombre completo del propietario" },
              cedula: { type: Type.STRING, description: "Número de cédula o identificación" },
              marca: { type: Type.STRING, description: "Marca del vehículo" },
              linea: { type: Type.STRING, description: "Línea del vehículo" },
              modelo: { type: Type.STRING, description: "Año o modelo del vehículo" },
              clase_vehiculo: { type: Type.STRING, description: "Clase de vehículo (Ej: MOTOCICLETA, AUTOMOVIL)" },
              combustible: { type: Type.STRING, description: "Tipo de combustible (Ej: GASOLINA, DIESEL)" },
              servicio: { type: Type.STRING, description: "Tipo de servicio (Ej: PARTICULAR, PUBLICO)" },
            },
            required: [
              "placa", "nombre", "cedula", "marca", "linea", "modelo", "clase_vehiculo", "combustible", "servicio"
            ],
          },
        },
      });

      const text = response.text?.trim() ?? "{}";
      const parsedData: VehicleData = JSON.parse(text);

      // Retornamos los datos ya normalizados para que el componente solo los asigne
      return {
        placa: parsedData.placa ? parsedData.placa.toUpperCase() : null,
        nombre: parsedData.nombre,
        cedula: parsedData.cedula,
        marca: parsedData.marca,
        linea: parsedData.linea,
        modelo: parsedData.modelo,
        clase: normalizeClaseVehiculo(parsedData.clase_vehiculo),
        combustible: normalizeCombustible(parsedData.combustible),
        tipo_servicio_vehiculo: normalizeTipoServicio(parsedData.servicio),
      };

    } catch (err: unknown) {
      console.error("Error extrayendo datos:", err);
      
      const message =
        err instanceof Error ? err.message : "Error al extraer los datos del vehículo";
      
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    extractData,
    isLoading,
    error,
  };
}