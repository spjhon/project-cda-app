import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Suspense } from "react";


export default function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<div className="h-64 w-full animate-pulse bg-zinc-100 rounded-lg" />}>
          <ForgotPasswordForm paramsPromise={params} />
        </Suspense>
      </div>
    </div>
  );
}