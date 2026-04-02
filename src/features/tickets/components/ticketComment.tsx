"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {  urlPath } from "@/utils/url-helpers";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";


function getRandomHexString() {
return Math.random().toString(16).slice(2);
}


const getFormattedDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}${hours}${minutes}`;
};


type Comment_Attachment = {
  id: string,
  
  comment_id: string,
  tenant_id: string,
  file_path: string,
  created_at: string,
  updated_at: string
}


export type TicketComment = {
  
    id: string,
    tenant_id: string,
    ticket_id: string,
    created_at: string,
    created_by: string,
    updated_at: string,
    author_name: string,
    comment_text: string,
    comment_attachments: Comment_Attachment[]
}

type TicketCommentsProps = {
  ticket_id: string;
  comments: TicketComment[];
  tenant_id: string;
  tenantName: string;
};

const TicketComments = ({ticket_id, comments, tenant_id, tenantName}: TicketCommentsProps) => {


  const supabaseBrowser = createSupabaseBrowserClient()
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsState, setComments] = useState<TicketComment[]>(comments || []);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileList, setFileList] = useState<FileList | null>(null);




  // Sincronizar estado si las props cambian al navegar
  useEffect(() => {
    setComments(comments || []);
  }, [comments]);



  useEffect(() => {

    const subscription = supabaseBrowser
    .channel("realtime_comments")
    .on("postgres_changes", {event: "INSERT", schema: "public", table: "comments", filter: `ticket_id=eq.${ticket_id}`}, async (payload) => {
      console.log("se recibio el event correctamente: ")
      console.log(payload.eventType)

      // 1. Obtenemos el comentario nuevo
      const newComment = payload.new as TicketComment;

  
      const { data: attachments, error: errorFetchngNewComment } = await supabaseBrowser
      .from("comment_attachments")
      .select("*")
      .eq("comment_id", newComment.id);

      if (errorFetchngNewComment){
      alert("error trallendo los adjuntos, lo siento: " + errorFetchngNewComment.message)
      }
       
        

      


      const commentWithAttachments: TicketComment = {
          ...newComment,
          comment_attachments: attachments || []
        };

      
      setComments((prev) => [...prev, commentWithAttachments]) })
    .subscribe((status) => console.log('connection status', status))


    return () => {supabaseBrowser.removeChannel(subscription);} //supabaseBrowser.removeChannel(channel);

  }, [ticket_id])




async function onClickHandlerButtonDownload (path: string){
  const {data, error: errorDownloading} = await supabaseBrowser.storage
  .from("comments-attachments")
  .createSignedUrl(path, 60, {download: false})

  if (errorDownloading) {
    console.log("error descargando el archivo: " + errorDownloading.message)
    return
  }
  
  window.open(data?.signedUrl, "_blank");

}
  



 
  async function handleOnChange (event: React.ChangeEvent<HTMLInputElement>){
    setFileList(event.target.files);
  }




  async function handleSubmit (event: React.FormEvent<HTMLFormElement>) {

    event.preventDefault();
    alert("Se ha agregado el comentario");

    let uploadedFiles: { path: string }[] = [];
    let commentIDforDeleteInCaseOfError;

    const comment_text = textareaRef.current?.value.trim();
    if (!comment_text) return alert("Por favor insertar un comentario");

    setIsSubmitting(true);

    if (fileList && fileList.length > 0) {
      // Ahora TypeScript sabe que si llega aquí, fileList no es null
      console.log("Archivos listos para subir:", fileList.length);
    }

    
    try {
      
      
      //Intento de subida de archivos si es que los hay
      if (fileList && fileList.length > 0) {
        const uploadPromises = Array.from(fileList).map(async (file) => {

          const filePath = `${tenant_id}/${ticket_id}/${getFormattedDate()}/${getRandomHexString()}_${file.name}`;

          const { data, error: errorUploadingFiles } = await supabaseBrowser.storage
          .from("comments-attachments")
          .upload(filePath, file);
        
          if (errorUploadingFiles) {throw {
            contexto: "Error al insertar archivos en el bucket", // Tu mensaje personalizado
            supabaseError: errorUploadingFiles // El objeto completo de Supabase
          }};
          
          return { path: data.path };

        });

        //este codigo es para decir que se va a esperar a que el codigo de arriba se ejecute antes de continuar
        uploadedFiles = await Promise.all(uploadPromises);
      }


      //Intento de creacion de un comentario para un ticket con una asercion, lo voy a dejar asi
      const { data: commentData, error: errorCreatingComment } = await supabaseBrowser
      .from("comments")
      .insert({
        ticket_id,
        comment_text
        // Nota: No enviamos tenant_id, created_by ni author_name.
        // Los triggers se encargan de eso automáticamente.
      } as never)
      .select()
      .single()


      if (errorCreatingComment) throw {
        contexto: "Error al insertar en la tabla de comentarios", // Tu mensaje personalizado
        supabaseError: errorCreatingComment // El objeto completo de Supabase
      };

      
      commentIDforDeleteInCaseOfError = commentData.id;



      if (uploadedFiles.length > 0) {
        const { error: attachError } = await supabaseBrowser
          .from("comment_attachments")
          .insert(
            uploadedFiles.map((file) => ({
              comment_id: commentData.id, // ID del comentario recién creado
              file_path: file.path,
              tenant_id: tenant_id,
            }))
          );

        if (attachError) {throw {
          contexto: "Error al crear la relacion en la tabla comment_attachments", // Tu mensaje personalizado
          supabaseError: attachError // El objeto completo de Supabase
        };
      }}






      // Limpiar el textarea solo si la inserción fue exitosa
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }

      setFileList(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }


    } catch (err: unknown) {

     // console.log(err instanceof Error ? err.message : "An unexpected error occurred")
      console.log(err);
      console.log("esta es la variable commentIDforDeleteInCaseOfError: " + commentIDforDeleteInCaseOfError)
      

      //borra el comentario en caso de error, OJO SI FALLA POR RLS, NO VA A MOSTRAR ERROR, EL ERROR DE RLS SOLO APARECE EN INSERT
      //sin embargo se puede pedir el dato despues para saber si si o no.
      if (commentIDforDeleteInCaseOfError) {
        const {data: dataDeletingComment, error: errorDeletingComment} = await supabaseBrowser
          .from("comments")
          .delete()
          .eq("id", commentIDforDeleteInCaseOfError);
        
        console.log("se activo el dataDeletingComment: " + dataDeletingComment)
        if(dataDeletingComment) console.log("Se borro el comentario correctamente");
        if(errorDeletingComment){console.log(errorDeletingComment.message + "Error borrando el comentario")}
      }

      //borra los atachment en caso de error
      if (uploadedFiles.length > 0) {
        const pathsToDelete = uploadedFiles.map(f => f.path);
        const{data: deletingAttachmentsData, error: errorDeletingAttachments} = await supabaseBrowser.storage
          .from("comments-attachments")
          .remove(pathsToDelete);
        
        if(deletingAttachmentsData) console.log("se borraron los attachments correctamente");
        if(errorDeletingAttachments) console.log("error en el borrado de attachments" + errorDeletingAttachments)
        
      }
 
      

      
      alert("Error al guardar el comentario o la subida de archivos. Se han limpiado los archivos temporales.");


    } finally {
      setIsSubmitting(false);
    }

  }


  
  return (
  <footer className="mt-8 space-y-10">
    <div className="flex items-center gap-3">
      <h4 className="text-lg font-bold text-slate-900">Comentarios</h4>
      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
        {commentsState.length}
      </span>
    </div>

    {/* Formulario de Comentario */}
<form onSubmit={handleSubmit} className="relative group">
  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all shadow-sm">
    <textarea
      ref={textareaRef}
      placeholder="Escribe un comentario..."
      disabled={isSubmitting}
      className="block w-full resize-none border-0 bg-transparent p-4 text-slate-900 placeholder:text-slate-400 focus:ring-0 sm:text-sm min-h-25"
    />

    {/* VISUALIZADOR DE ADJUNTOS PRE-ENVÍO */}
    {fileInputRef.current?.files && fileInputRef.current.files.length > 0 && (
      <div className="px-4 pb-3 flex flex-wrap gap-2">
        <div className="w-full mb-1">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            Archivos seleccionados ({fileInputRef.current.files.length})
          </span>
        </div>
        {Array.from(fileInputRef.current.files).map((file, index) => (
          <div 
            key={index} 
            className="flex items-center gap-2 px-2 py-1 bg-blue-50 border border-blue-100 rounded-md text-[11px] text-blue-700 font-medium"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="max-w-37.5 truncate">{file.name}</span>
          </div>
        ))}
      </div>
    )}

    <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 p-3">
      <div className="flex items-center">
        <label
          htmlFor="file"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-200/50 cursor-pointer transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span className="text-xs font-semibold">
            {fileInputRef.current?.files?.length ? "Añadir más" : "Adjuntar"}
          </span>
          <input 
            type="file" 
            id="file" 
            name="file" 
            multiple 
            ref={fileInputRef} 
            onChange={handleOnChange} 
            className="hidden" 
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md active:scale-95"
      >
        {isSubmitting ? (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Subiendo...</span>
          </div>
        ) : (
          "Publicar comentario"
        )}
      </button>
    </div>
  </div>
</form>

    {/* Lista de Comentarios */}
    <section className="space-y-8 relative">
      {/* Línea vertical de la línea de tiempo */}
      <div className="absolute left-6 top-2 bottom-2 w-px bg-slate-100 hidden sm:block" />

      {commentsState.map((comment) => (
        <article key={comment.id} className="relative flex gap-4">
          {/* Avatar simple */}
          <div className="relative flex-none hidden sm:block">
            <div className="h-12 w-12 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-slate-500 font-bold text-sm">
              {comment.author_name.charAt(0)}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-baseline justify-between">
              <h5 className="text-sm font-bold text-slate-900">{comment.author_name}</h5>
              <time className="text-xs text-slate-400 tracking-wide font-medium">
                {new Date(comment.created_at).toLocaleString("es-ES", { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </time>
            </div>

            <div className="text-sm text-slate-600 leading-relaxed bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              {comment.comment_text}

              {comment.comment_attachments?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Archivos adjuntos</span>
                  <div className="flex flex-wrap gap-3">
                    {comment.comment_attachments.map((attachment) => (
                      <div key={attachment.id} className="group relative">
                        <button
                          onClick={() => onClickHandlerButtonDownload(attachment.file_path)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all max-w-50 truncate"
                        >
                          <svg className="w-3 h-3 flex-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span className="truncate">{attachment.file_path.split("/").pop()}</span>
                        </button>

                        {attachment.file_path.endsWith(".png") && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-slate-200">
                            <Image
                              alt="thumbnail"
                              src={urlPath(`/cdn/api?image=${attachment.file_path}`, tenantName)}
                              width={120}
                              height={120}
                              unoptimized
                              className="object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </section>
  </footer>
);
};

export default TicketComments;
