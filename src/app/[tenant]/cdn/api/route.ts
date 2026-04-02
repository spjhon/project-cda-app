import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildUrl, getHostnameAndPort } from "@/utils/url-helpers";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";


/**
 * This route handler is responsible for resizing the images uploaded to storage; these images are used as thumbnails in the comment renders.
 * @param request The request that is making this api request
 * @returns Redirections according to the URL structure in the request
 */
export async function GET(request: NextRequest) {
    
    //Extraction of request parameters.
  const { searchParams } = new URL(request.url);
  const imagePath = searchParams.get("image");

  

  const supabaseServer = await createSupabaseServerClient()
  const [hostname] = getHostnameAndPort(request);
  //We extract the tenant from the host found in the URL using a function in the helpers section.
  const tenant = hostname;


  
  if (!imagePath){
      return NextResponse.redirect(buildUrl(`/error?type=No hay imagen que procesar`, tenant, request), { status: 303 });
  }

  
  //The image is extracted from storage according to the path from the URL and the transformation is performed; the processed image is returned.
  const {data: immageUntransformed, error: errorTransformingTheImage } = await supabaseServer.storage
  .from("comments-attachments")
  .download(imagePath, {})

  if (errorTransformingTheImage){
      return NextResponse.redirect(buildUrl(`/error?type=${errorTransformingTheImage.message ?? "Error al tranformar la imagen"}`, tenant, request), { status: 303 });
  }

  //The sharp library is used; supabase has an image resizing system, but it is only for paid users.
  const buffer = await sharp(await immageUntransformed.arrayBuffer())
  .resize(100, 100, { fit: 'contain' })
  .jpeg({ quality: 70 })
  .toBuffer();


  return new Response(new Uint8Array(buffer), {headers: {"Content-Type": "image/jpeg",}});

}




  

