/**
 * Login Page
 * Public page for user authentication
 */

import { useState, useEffect, useRef } from "react";
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
import { checkRateLimit } from "~/lib/security/rateLimit";
import { sanitizeEmail } from "~/lib/security/sanitize";
import { checkRoutePermission } from "~/lib/utils/routePermissions";

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
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const hasJustLoggedIn = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Handle navigation after login success using useEffect
  // This takes priority over the isAuthenticated redirect
  useEffect(() => {
    if (pendingRedirect) {
      // Use requestAnimationFrame to ensure navigation happens after DOM is ready
      // This prevents issues when component unmounts during navigation
      const rafId = requestAnimationFrame(() => {
        navigate(pendingRedirect, { replace: true });
        setPendingRedirect(null); // Clear after navigation
        hasJustLoggedIn.current = false; // Reset flag after navigation
      });

      return () => cancelAnimationFrame(rafId);
    }
    return undefined;
  }, [pendingRedirect, navigate]);

  // Handle redirect if already authenticated when page loads (not after login)
  // Only execute if user was already authenticated (not just logged in)
  useEffect(() => {
    if (isAuthenticated && !pendingRedirect && !hasJustLoggedIn.current) {
      const redirectParam = searchParams.get("redirect");
      let targetPath = "/dashboard";
      if (redirectParam) {
        // Check if user has permission for the redirect route
        const hasPermission = checkRoutePermission(
          redirectParam,
          user?.permissions || []
        );

        if (!hasPermission) {
          targetPath = `/unauthorized?attempted=${encodeURIComponent(redirectParam)}`;
        } else {
          targetPath = redirectParam;
        }
      }

      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams, user, pendingRedirect]);

  // Early return if authenticated (but hooks must be called first)
  // Don't return early if we have a pendingRedirect - let the navigation complete
  if (isAuthenticated && !pendingRedirect) {
    return null;
  }

  const onSubmit = async (data: LoginFormData, e?: React.BaseSyntheticEvent) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'login.tsx:onSubmit',
        message: 'onSubmit function called',
        data: { email: data.email, hasPassword: !!data.password },
        timestamp: Date.now(),
        sessionId: 'login-debug'
      })
    }).catch(() => {});
    // #endregion

    // Prevent default form submission (handleSubmit already does this, but be explicit)
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    console.debug("[Login] onSubmit called with data:", { email: data.email, hasPassword: !!data.password });

    setIsLoading(true);
    setError(null);

    // Sanitize email input
    const sanitizedEmail = sanitizeEmail(data.email);
    if (!sanitizedEmail) {
      setError("Email inválido");
      setIsLoading(false);
      return;
    }

    try {
      const result = await login({
        ...data,
        email: sanitizedEmail,
      });

      if (result.success) {
        // Successful logins should not count towards rate limiting
        // No need to reset - we never increment for successful logins
        // This ensures rate limiting only applies to failed attempts

        // Successful login - no rate limit increment needed

        // Set loading to false
        setIsLoading(false);

        // Schedule navigation for after render completes using useEffect
        // Get user from store after login (it's been updated by useAuth().login())
        const loggedInUser = useAuthStore.getState().user;
        const redirectParam = searchParams.get("redirect");

        let targetPath = "/dashboard";
        if (redirectParam) {
          // Check if user has permission for the redirect route
          const userPermissions = loggedInUser?.permissions || [];
          const hasPermission = checkRoutePermission(
            redirectParam,
            userPermissions
          );

          if (!hasPermission) {
            targetPath = `/unauthorized?attempted=${encodeURIComponent(redirectParam)}`;
          } else {
            targetPath = redirectParam;
          }
        }

        hasJustLoggedIn.current = true; // Mark that we just logged in
        setPendingRedirect(targetPath);
      } else {
        // Handle login error
        let errorMessage = "Error al iniciar sesión. Por favor verifica tus credenciales.";

        // Check for specific error codes and messages from backend
        if (
          result.error &&
          typeof result.error === "object" &&
          "response" in result.error
        ) {
          const axiosError = result.error as {
            response?: {
              status?: number;
              data?: {
                error?: { code?: string; message?: string };
                detail?: string | { error?: { code?: string; message?: string } };
                message?: string;
              }
            }
          };

          const statusCode = axiosError.response?.status;
          // FastAPI puts error in detail field, which can be a string or an object
          const detailData = axiosError.response?.data?.detail;
          const errorCode =
            (typeof detailData === 'object' && detailData?.error?.code) ||
            axiosError.response?.data?.error?.code;
          const errorMsg =
            (typeof detailData === 'object' && detailData?.error?.message) ||
            axiosError.response?.data?.error?.message;
          const detail = typeof detailData === 'string' ? detailData : undefined;
          const responseMessage = axiosError.response?.data?.message;

          // Handle specific error codes
          if (errorCode === "AUTH_RATE_LIMIT_EXCEEDED" || statusCode === 429) {
            // Backend rate limit exceeded - increment frontend counter for consistency
            checkRateLimit("login", { maxRequests: 5, windowMs: 60000 });
            setError("Demasiados intentos. Por favor espera un momento antes de intentar nuevamente.");
            setIsLoading(false);
            return;
          } else if (errorCode === "AUTH_INVALID_CREDENTIALS" || statusCode === 401) {
            // 401 Unauthorized - invalid credentials (FAILED ATTEMPT)
            // Increment rate limit counter for failed login attempt
            checkRateLimit("login", { maxRequests: 5, windowMs: 60000 });
            const invalidCredsMessage = errorMsg || detail || responseMessage || "Credenciales inválidas. Por favor verifica tu email y contraseña.";
            setError(invalidCredsMessage);
            setIsLoading(false);
            return;
          } else if (statusCode === 500) {
            // Server error - show more detailed message
            errorMessage = detail || responseMessage || errorMsg || "Error del servidor. Por favor contacta al administrador o verifica que el backend esté funcionando correctamente.";
            console.error("Login error 500:", axiosError.response?.data);
          } else if (errorMsg || detail || responseMessage) {
            errorMessage = errorMsg || detail || responseMessage || errorMessage;
          } else if (result.error instanceof Error) {
            errorMessage = result.error.message;
          }
        } else if (result.error instanceof Error) {
          errorMessage = result.error.message;
        }

        setError(errorMessage);
        setIsLoading(false);
      }
    } catch {
      setError("Error inesperado. Por favor intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicLayout title="Iniciar Sesión">
      <form
        onSubmit={(e) => {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/bd91a56b-aa7d-44fb-ac11-0977789d60c5', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              location: 'login.tsx:form.onSubmit',
              message: 'Form onSubmit triggered',
              data: { target: e?.target?.constructor?.name },
              timestamp: Date.now(),
              sessionId: 'login-debug'
            })
          }).catch(() => {});
          // #endregion
          handleSubmit(onSubmit)(e);
        }}
        method="post"
        className="space-y-6"
      >
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


