import { supabase } from "@/integrations/supabase/client";

export type Plano = "gratuito" | "profissional" | "construtora";

export interface PlanoConfig {
  id: Plano;
  nome: string;
  preco: string;
  maxObras: number | null; // null = ilimitado
  maxMembros: number | null;
  features: {
    relatorioPDF: boolean;
    financeiro: boolean;
    aprovacaoDigital: boolean;
    chat: boolean;
    vista3d: boolean;
    portalCliente: boolean;
    diario: boolean;
    suportePrioritario: boolean;
    portfolioPublico: boolean;
  };
  destaque?: boolean;
}

export const PLANOS: Record<Plano, PlanoConfig> = {
  gratuito: {
    id: "gratuito",
    nome: "Gratuito",
    preco: "R$ 0",
    maxObras: 1,
    maxMembros: 2,
    features: {
      relatorioPDF: false,
      financeiro: false,
      aprovacaoDigital: false,
      chat: true,
      vista3d: false,
      portalCliente: true,
      diario: true,
      suportePrioritario: false,
      portfolioPublico: false,
    },
  },
  profissional: {
    id: "profissional",
    nome: "Profissional",
    preco: "R$ 97",
    maxObras: 10,
    maxMembros: 10,
    features: {
      relatorioPDF: true,
      financeiro: true,
      aprovacaoDigital: true,
      chat: true,
      vista3d: true,
      portalCliente: true,
      diario: true,
      suportePrioritario: true,
      portfolioPublico: true,
    },
    destaque: true,
  },
  construtora: {
    id: "construtora",
    nome: "Construtora",
    preco: "R$ 247",
    maxObras: null,
    maxMembros: null,
    features: {
      relatorioPDF: true,
      financeiro: true,
      aprovacaoDigital: true,
      chat: true,
      vista3d: true,
      portalCliente: true,
      diario: true,
      suportePrioritario: true,
      portfolioPublico: true,
    },
  },
};

export async function getPlanoDoUsuario(userId: string): Promise<Plano> {
  const { data } = await supabase
    .from("profiles")
    .select("plano" as any)
    .eq("id", userId)
    .maybeSingle();
  const p = (data as any)?.plano as Plano | undefined;
  return p ?? "gratuito";
}

export async function contarObrasDoUsuario(userId: string): Promise<number> {
  const { count } = await supabase
    .from("obras")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId);
  return count ?? 0;
}

export async function podeFeature(userId: string, feature: keyof PlanoConfig["features"]): Promise<boolean> {
  const plano = await getPlanoDoUsuario(userId);
  return PLANOS[plano].features[feature];
}