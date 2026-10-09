"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useState } from "react";


export function PromotionalEmailForm() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsSending(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();

      const { data, error } = await supabase.functions.invoke(
        "send-promotional-email",
        {
          body: {
            email,
          },
        },
      );

      if (error || !data) {
        console.error("Error enviando correo promocional:", error);

        setMessage("No se pudo enviar el correo.");
        return;
      }

      console.log("Respuesta Edge Function:", data);

      setMessage("Correo enviado correctamente.");
      setEmail("");
    } catch (error) {
      console.error("Error inesperado:", error);
      setMessage("Ocurrió un error al enviar el correo.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="correo@cda.com"
          required
          disabled={isSending}
          className="min-w-0 flex-1 rounded-md border px-3 py-2"
        />

        <button
          type="submit"
          disabled={isSending}
          className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {isSending ? "Enviando..." : "Enviar"}
        </button>
      </div>

      {message && (
        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </form>
  );
}