import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  redirects: async () => [
    {
      //esta esa una redicreecin para cuando se ejecuta el route sin javascritp, entonces este es el que hace la redireccion
      ///:tenant es un parámetro dinámico de ruta, igual que [tenant] en la carpeta app/. “Aquí va cualquier valor, captúralo y reutilízalo”.
      source: "/logout",
      destination: "/auth/logout",
      permanent: true,
    },
  ],
   allowedDevOrigins: ['127.0.0.1', 'cda-app', '*.cda-app',],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '**.cda-app', 
        port: '3000',
      },
      // 2. Para Producción: Permite CUALQUIER subdominio de tu dominio real
      {
        protocol: 'https',
        hostname: '**.cda-app.com',
      },
      // 3. PARA SUPABASE (Muy importante para que carguen tus PDFs/Images)
      {
        protocol: 'https',
        hostname: 'lyktizihszlbmzzjrqye.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },

      // 4. Si usas Google Auth, necesitas permitir sus fotos de perfil
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  
};

export default nextConfig;

