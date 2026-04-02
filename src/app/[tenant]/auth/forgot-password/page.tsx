
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const dynamic = 'force-static' 

/**
 * 
 * @param param0 The tenants.
 * @returns Only the recovery password form
 */
export default async function ForgotPasswordPage({params}: {params: Promise<{ tenant: string }>}) {

const { tenant } = await params;

  return (
    //2.
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm tenant={tenant} />
      </div>
    </div>
  );
}
