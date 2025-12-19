/**
 * Login Page
 * Public page for user authentication
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { useAuthStore } from "~/stores/authStore";
import { PublicLayout } from "~/components/public/PublicLayout";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { loginSchema, type LoginFormData } from "~/lib/validations/auth.schema";
import { Loader2 } from "lucide-react";

export function meta() {
  return [
    { title: "Iniciar Sesión - AiutoX ERP" },
    { name: "description", content: "Inicia sesión en tu cuenta de AiutoX ERP" },
  ];
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    const redirectTo = searchParams.get("redirect") || "/";
    navigate(redirectTo, { replace: true });
    return null;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await login(data);

      if (result.success) {
        // Redirect to original route or home
        const redirectTo = searchParams.get("redirect") || "/";
        navigate(redirectTo, { replace: true });
      } else {
        // Handle login error
        const errorMessage =
          result.error instanceof Error
            ? result.error.message
            : "Error al iniciar sesión. Por favor verifica tus credenciales.";

        // Check for specific error codes
        if (
          result.error &&
          typeof result.error === "object" &&
          "response" in result.error
        ) {
          const axiosError = result.error as { response?: { data?: { error?: { code?: string; message?: string } } } };
          const errorCode = axiosError.response?.data?.error?.code;
          const errorMsg = axiosError.response?.data?.error?.message;

          if (errorCode === "AUTH_RATE_LIMIT_EXCEEDED") {
            setError("Demasiados intentos. Por favor espera un momento antes de intentar nuevamente.");
          } else if (errorCode === "AUTH_INVALID_CREDENTIALS") {
            setError("Credenciales inválidas. Por favor verifica tu email y contraseña.");
          } else {
            setError(errorMsg || errorMessage);
          }
        } else {
          setError(errorMessage);
        }
      }
    } catch {
      setError("Error inesperado. Por favor intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout title="Iniciar Sesión">
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

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register("password")}
            disabled={isLoading}
            className={errors.password ? "border-red-500" : ""}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-[#2EA3F2] hover:text-[#023E87] transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </Link>
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
              Iniciando sesión...
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </Button>
      </form>
    </PublicLayout>
  );
}


