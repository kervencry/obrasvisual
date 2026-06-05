export type Role = "cliente" | "engenheiro" | "arquiteto" | "mestre_obras" | "admin";

export type Permission =
  | "criar_obra"
  | "editar_obra"
  | "excluir_obra"
  | "ver_todas_obras"
  | "gerar_token"
  | "upload_foto"
  | "registrar_diario"
  | "aprovar_revisao"
  | "upload_documento"
  | "ver_financeiro"
  | "gerenciar_usuarios"
  | "ver_admin";

const PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    "criar_obra","editar_obra","excluir_obra","ver_todas_obras","gerar_token",
    "upload_foto","registrar_diario","aprovar_revisao","upload_documento",
    "ver_financeiro","gerenciar_usuarios","ver_admin",
  ],
  engenheiro: [
    "criar_obra","editar_obra","excluir_obra","gerar_token","upload_foto",
    "registrar_diario","aprovar_revisao","upload_documento","ver_financeiro",
  ],
  arquiteto: [
    "editar_obra","upload_documento","aprovar_revisao","upload_foto",
  ],
  mestre_obras: [
    "editar_obra","upload_foto","registrar_diario","upload_documento",
  ],
  cliente: [],
};

export function can(role: Role | null | undefined, perm: Permission): boolean {
  if (!role) return false;
  return PERMISSIONS[role]?.includes(perm) ?? false;
}

export function homeForRole(role: Role | null | undefined): string {
  switch (role) {
    case "admin": return "/app/admin";
    case "engenheiro": return "/app/engenheiro";
    case "arquiteto": return "/app/arquiteto";
    case "mestre_obras": return "/app/mestre";
    case "cliente": return "/app/cliente";
    default: return "/app/cliente";
  }
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrador",
  engenheiro: "Engenheiro",
  arquiteto: "Arquiteto",
  mestre_obras: "Mestre de Obras",
  cliente: "Cliente",
};