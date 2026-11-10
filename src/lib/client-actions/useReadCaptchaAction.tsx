"use client";

import { useState } from "react";
import { GoogleGenAI } from "@google/genai";

export function useReadCaptchaAction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const readCaptcha = async (base64Image: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No se encontró la API Key de Gemini.");
      }

      const ai = new GoogleGenAI({ apiKey });

      // Limpiamos el prefijo si viene como Data URL
      const base64Data = base64Image.includes(",")
        ? base64Image.split(",")[1]
        : base64Image;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Transcribe exactamente las letras y números que aparecen en esta imagen de captcha diferencinado correctamente entre mayusculas y minusculas. Devuelve únicamente el texto, sin espacios ni explicaciones.",
              },
              {
                inlineData: {
                  mimeType: "image/png", // Ajusta a "image/jpeg" si el RUNT manda jpg
                  data: base64Data,
                },
              },
            ],
          },
        ],
      });

      const text = response.text?.trim() ?? "";
      return text;

    } catch (err: unknown) {
      console.error("Error leyendo captcha:", err);
      
      // Validamos el tipo de error de forma segura
      const message =
        err instanceof Error ? err.message : "Error al leer el captcha";
      
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    readCaptcha, // Función que llamas con await
    isLoading,   // Estado de carga
    error,       // Estado de error
  };
}