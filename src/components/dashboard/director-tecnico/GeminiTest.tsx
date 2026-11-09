
"use client";

// ============================================================
// Imports
// ============================================================

import { useMutation } from "@tanstack/react-query";
import { GoogleGenAI } from "@google/genai";

import { Button } from "@/components/ui/button";

// ============================================================
// Componente
// ============================================================

export function GeminiTest() {
  // ==========================================================
  // Mutation
  // ==========================================================

  const geminiMutation = useMutation({
    mutationFn: async () => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!apiKey) {
        throw new Error("No se encontró la API Key de Gemini.");
      }

      const ai = new GoogleGenAI({ apiKey });

      // Base64 de la imagen
      const image = `aqui seria el texto base64`;

      // Tipo MIME de la imagen
      const mimeType = "image/png";

      // Si viene como Data URL, retiramos el encabezado.
      // Ejemplo: data:image/png;base64,XXXXX
      const base64Data = image.includes(",")
        ? image.split(",")[1]
        : image;

      // Enviamos el texto y la imagen como partes independientes.
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "¿Qué letras ves en esta imagen? Transcribe exactamente las letras que aparecen.",
              },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      });

      return response.text ?? "Gemini no devolvió respuesta.";
    },
  });

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={() => geminiMutation.mutate()}
        disabled={geminiMutation.isPending}
      >
        {geminiMutation.isPending
          ? "Consultando Gemini..."
          : "Consultar Gemini"}
      </Button>

      <div className="min-h-20 whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4">
        {geminiMutation.isPending &&
          "Esperando respuesta de Gemini..."}

        {geminiMutation.data}

        {geminiMutation.isError && (
          <p className="text-destructive">
            {geminiMutation.error.message}
          </p>
        )}
      </div>
    </div>
  );
}
