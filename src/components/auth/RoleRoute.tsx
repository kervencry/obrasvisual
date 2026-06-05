import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { homeForRole, type Role } from "@/lib/rbac";

export default function RoleRoute({
  children,
  allow,
}: {
  children: ReactNode;
  allow?: Role[];
}) {
  const { user, loading, role } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (allow && role && !allow.includes(role as Role)) {
    return <Navigate to={homeForRole(role as Role)} replace />;
  }
  return <>{children}</>;
}

export function RoleRedirect() {
  const { user, loading, role } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Carregando...
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  return <Navigate to={homeForRole(role as Role)} replace />;
}