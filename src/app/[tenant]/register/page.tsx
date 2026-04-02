import { SignUpForm } from "@/features/register/components/SignUpForm";
import { fetchTenantDataCached } from "@/lib/dbFunctions/fetch_tenant_domain_cached";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";


/**
 * 
 * @param param0 The parameters that arrive via the URL
 * @returns The register page.
 */
export default async function RegisterPage({ params }: { params: Promise<{ tenant: string }>; }) {
    const { tenant } = await params;

    //This code is a security check to ensure that the tenant you are trying to register is the correct one. 
    // If there are no security issues, you could allow reading the tenant from the client component.
    const { data: tenantData, error: errorFetchingTenantData } = await fetchTenantDataCached(tenant);

    if (!tenantData || errorFetchingTenantData) {
        const errorMessage = typeof errorFetchingTenantData === "string"
            ? errorFetchingTenantData
            : errorFetchingTenantData?.message || "Tenant no encontrado";

        redirect(`/error?type=${encodeURIComponent(errorMessage)}`);
    }

    const tenantDomain = tenantData.domain;

    const information = [
        {
            quote: "El sistema de registro envia un correo por medio del servicio RESEND, si no se verifica el email no se puede hacer login.",
            author: "Requerimiento de validacion de correo electrónico.",
            role: "Anti Spam",
            avatar: "01"
        },
        {
            quote: "Gracias al servicio de Supabase cloud, tu correo esta seguro contra filtración de información.",
            author: "Supabase Cloud",
            role: "Tu correo seguro",
            avatar: "02"
        },
        {
            quote: "El sistema actual como esta configurado, solo permite un correo electrónico por organización.",
            author: "Independencia por tenant",
            role: "Una cuenta por organización",
            avatar: "03"
        }
    ];

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">

            {/* REGISTRATION SECTION: Top on mobile, Left on desktop */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 bg-white relative">
                
                <Link
                 prefetch={false}
                    href="https://cda-app.com/"
                    className="absolute left-8 top-[1.6rem] flex items-center text-sm text-black hover:opacity-70 transition-colors font-medium z-20"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Regresar al Landing Page
                </Link>

                <div className="">
                   
                    <h2 className="text-center text-3xl font-bold tracking-tight text-black">
                        {"SupaSass"}
                    </h2>
                    <p className="mt-2 text-center text-sm text-black/60">
                        Crear cuenta para la organización: {" "} {tenantData.name || "your organization"}
                    </p>
                </div>

                <div className="w-100 self-center my-5">
                    <SignUpForm tenant={tenantDomain} />
                </div>
            </div>

            {/* INFO SECTION: Bottom on mobile, Right on desktop */}
            <div className="flex w-full lg:w-1/2 bg-linear-to-br from-primary-600 to-primary-800 ">
                <div className="w-full flex items-center justify-center p-8 sm:p-12">
                    <div className="space-y-6 max-w-lg">
                        <h3 className="text-2xl font-bold mb-8 ">
                            Registra un email valido si deseas probar el sistema de activacion de correo.
                        </h3>
                        
                        {information.map((info, index) => (
                            <div
                                key={index}
                                className="relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 shadow-xl"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-primary-400/30 flex items-center justify-center  font-semibold">
                                            {info.avatar}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm mb-2 font-light leading-relaxed ">
                                            &#34;{info.quote}&#34;
                                        </p>
                                        <div className="mt-3">
                                            <p className="text-sm font-medium ">
                                                {info.author}
                                            </p>
                                            <p className="text-sm text-primary-200">
                                                {info.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="mt-8 text-center">
                            <p className="text-primary-100 text-sm">
                                La correo NO se utiliza para nada mas allá que la demostracion que este DEMO ofrece
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}