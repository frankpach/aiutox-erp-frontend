/**
 * Forgot Password Page
 * Public page for requesting password recovery
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import { PublicLayout } from "~/components/public/PublicLayout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "~/lib/validations/auth.schema";
import { forgotPassword } from "~/lib/api/auth.api";
import { Loader2, CheckCircle2 } from "lucide-react";

export function meta() {
  return [
    { title: "Recuperar Contraseña - AiutoX ERP" },
    {
      name: "description",
      content: "Solicita un enlace para restablecer tu contraseña",
    },
  ];
}

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      await forgotPassword(data.email);
      setIsSuccess(true);
    } catch {
      // Handle error - show generic message (don't reveal if email exists)
      setError(
        "Si el email existe en nuestro sistema, recibirás un enlace de recuperación."
      );
      // Also set success to show the message (security best practice)
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout
      title="Recuperar Contraseña"
      description="Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña"
    >
      {isSuccess ? (
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-[#121212]">
              Enlace Enviado
            </h3>
            <p className="text-sm text-[#3C3A47]">
              Si el email existe en nuestro sistema, recibirás un enlace de
              recuperación en tu bandeja de entrada.
            </p>
          </div>
          <div className="pt-4">
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Volver al inicio de sesión</Link>
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              {...register("email")}
              disabled={isLoading}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#023E87] hover:bg-[#023E87]/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              "Enviar Enlace"
            )}
          </Button>

          {/* Back to Login */}
          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-[#2EA3F2] hover:text-[#023E87] transition-colors"
            >
              ← Volver al inicio de sesión
            </Link>
          </div>
        </form>
      )}
    </PublicLayout>
  );
}


