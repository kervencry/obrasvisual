export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      aprovacoes: {
        Row: {
          aprovado: boolean
          assinatura: string | null
          comentario: string | null
          created_at: string
          etapa: Database["public"]["Enums"]["etapa_id"]
          id: string
          ip: string | null
          obra_id: string
          user_id: string
        }
        Insert: {
          aprovado?: boolean
          assinatura?: string | null
          comentario?: string | null
          created_at?: string
          etapa: Database["public"]["Enums"]["etapa_id"]
          id?: string
          ip?: string | null
          obra_id: string
          user_id: string
        }
        Update: {
          aprovado?: boolean
          assinatura?: string | null
          comentario?: string | null
          created_at?: string
          etapa?: Database["public"]["Enums"]["etapa_id"]
          id?: string
          ip?: string | null
          obra_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aprovacoes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_etapa: {
        Row: {
          concluido: boolean
          concluido_em: string | null
          concluido_por: string | null
          created_at: string
          etapa_id: string
          id: string
          item: string
          obra_id: string
          ordem: number
        }
        Insert: {
          concluido?: boolean
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          etapa_id: string
          id?: string
          item: string
          obra_id: string
          ordem?: number
        }
        Update: {
          concluido?: boolean
          concluido_em?: string | null
          concluido_por?: string | null
          created_at?: string
          etapa_id?: string
          id?: string
          item?: string
          obra_id?: string
          ordem?: number
        }
        Relationships: [
          {
            foreignKeyName: "checklist_etapa_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_etapa_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      diario_obra: {
        Row: {
          clima: string | null
          conteudo: string
          created_at: string
          data: string
          id: string
          obra_id: string
          titulo: string | null
          trabalhadores: number | null
          user_id: string
        }
        Insert: {
          clima?: string | null
          conteudo: string
          created_at?: string
          data?: string
          id?: string
          obra_id: string
          titulo?: string | null
          trabalhadores?: number | null
          user_id: string
        }
        Update: {
          clima?: string | null
          conteudo?: string
          created_at?: string
          data?: string
          id?: string
          obra_id?: string
          titulo?: string | null
          trabalhadores?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diario_obra_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      etapas: {
        Row: {
          created_at: string
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio: string | null
          etapa: Database["public"]["Enums"]["etapa_id"]
          id: string
          obra_id: string
          observacoes: string | null
          ordem: number
          percentual: number
          status: Database["public"]["Enums"]["etapa_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          etapa: Database["public"]["Enums"]["etapa_id"]
          id?: string
          obra_id: string
          observacoes?: string | null
          ordem: number
          percentual?: number
          status?: Database["public"]["Enums"]["etapa_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          etapa?: Database["public"]["Enums"]["etapa_id"]
          id?: string
          obra_id?: string
          observacoes?: string | null
          ordem?: number
          percentual?: number
          status?: Database["public"]["Enums"]["etapa_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "etapas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      financeiro: {
        Row: {
          categoria: string | null
          created_at: string
          data: string
          descricao: string
          etapa: Database["public"]["Enums"]["etapa_id"] | null
          id: string
          nota_fiscal_url: string | null
          obra_id: string
          tipo: Database["public"]["Enums"]["fin_tipo"]
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data?: string
          descricao: string
          etapa?: Database["public"]["Enums"]["etapa_id"] | null
          id?: string
          nota_fiscal_url?: string | null
          obra_id: string
          tipo: Database["public"]["Enums"]["fin_tipo"]
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data?: string
          descricao?: string
          etapa?: Database["public"]["Enums"]["etapa_id"] | null
          id?: string
          nota_fiscal_url?: string | null
          obra_id?: string
          tipo?: Database["public"]["Enums"]["fin_tipo"]
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      fotos: {
        Row: {
          created_at: string
          etapa: Database["public"]["Enums"]["etapa_id"] | null
          id: string
          legenda: string | null
          obra_id: string
          tipo: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          etapa?: Database["public"]["Enums"]["etapa_id"] | null
          id?: string
          legenda?: string | null
          obra_id: string
          tipo?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          etapa?: Database["public"]["Enums"]["etapa_id"] | null
          id?: string
          legenda?: string | null
          obra_id?: string
          tipo?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fotos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          conteudo: string
          created_at: string
          etapa: Database["public"]["Enums"]["etapa_id"] | null
          id: string
          obra_id: string
          para_cliente: boolean
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          etapa?: Database["public"]["Enums"]["etapa_id"] | null
          id?: string
          obra_id: string
          para_cliente?: boolean
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          etapa?: Database["public"]["Enums"]["etapa_id"] | null
          id?: string
          obra_id?: string
          para_cliente?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string
          id: string
          lida: boolean
          link: string | null
          mensagem: string | null
          obra_id: string | null
          tipo: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem?: string | null
          obra_id?: string | null
          tipo?: string | null
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lida?: boolean
          link?: string | null
          mensagem?: string | null
          obra_id?: string | null
          tipo?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      obra_members: {
        Row: {
          created_at: string
          id: string
          obra_id: string
          papel: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          obra_id: string
          papel: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          obra_id?: string
          papel?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "obra_members_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      obras: {
        Row: {
          capa_url: string | null
          created_at: string
          data_fim_prevista: string | null
          data_inicio: string | null
          descricao: string | null
          endereco: string | null
          etapa_atual: Database["public"]["Enums"]["etapa_id"]
          id: string
          latitude: number | null
          longitude: number | null
          nome: string
          owner_id: string
          percentual: number
          publico_token: string
          status: Database["public"]["Enums"]["obra_status"]
          tipo: Database["public"]["Enums"]["obra_tipo"]
          updated_at: string
          valor_previsto: number | null
        }
        Insert: {
          capa_url?: string | null
          created_at?: string
          data_fim_prevista?: string | null
          data_inicio?: string | null
          descricao?: string | null
          endereco?: string | null
          etapa_atual?: Database["public"]["Enums"]["etapa_id"]
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome: string
          owner_id: string
          percentual?: number
          publico_token?: string
          status?: Database["public"]["Enums"]["obra_status"]
          tipo?: Database["public"]["Enums"]["obra_tipo"]
          updated_at?: string
          valor_previsto?: number | null
        }
        Update: {
          capa_url?: string | null
          created_at?: string
          data_fim_prevista?: string | null
          data_inicio?: string | null
          descricao?: string | null
          endereco?: string | null
          etapa_atual?: Database["public"]["Enums"]["etapa_id"]
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string
          owner_id?: string
          percentual?: number
          publico_token?: string
          status?: Database["public"]["Enums"]["obra_status"]
          tipo?: Database["public"]["Enums"]["obra_tipo"]
          updated_at?: string
          valor_previsto?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          empresa: string | null
          id: string
          nome: string | null
          plano: string
          preferencias: Json
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          empresa?: string | null
          id: string
          nome?: string | null
          plano?: string
          preferencias?: Json
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          empresa?: string | null
          id?: string
          nome?: string | null
          plano?: string
          preferencias?: Json
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resumos_semanais: {
        Row: {
          conteudo: string
          created_at: string
          id: string
          obra_id: string
          periodo_fim: string
          periodo_inicio: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          id?: string
          obra_id: string
          periodo_fim: string
          periodo_inicio: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          id?: string
          obra_id?: string
          periodo_fim?: string
          periodo_inicio?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resumos_semanais_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      tarefas_obra: {
        Row: {
          concluida_em: string | null
          created_at: string
          criado_por: string
          descricao: string | null
          foto_url: string | null
          id: string
          obra_id: string
          prazo: string | null
          responsavel_id: string | null
          status: string
          titulo: string
          updated_at: string
        }
        Insert: {
          concluida_em?: string | null
          created_at?: string
          criado_por: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          obra_id: string
          prazo?: string | null
          responsavel_id?: string | null
          status?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          concluida_em?: string | null
          created_at?: string
          criado_por?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          obra_id?: string
          prazo?: string | null
          responsavel_id?: string | null
          status?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarefas_obra_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      timeline_eventos: {
        Row: {
          created_at: string
          descricao: string
          id: string
          metadata: Json | null
          obra_id: string
          tipo: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          metadata?: Json | null
          obra_id: string
          tipo: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          metadata?: Json | null
          obra_id?: string
          tipo?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "timeline_eventos_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      buscar_usuario_por_email: {
        Args: { _email: string }
        Returns: {
          id: string
          nome: string
        }[]
      }
      get_obra_publica: { Args: { _id: string; _token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_obra_editor: {
        Args: { _obra: string; _user: string }
        Returns: boolean
      }
      is_obra_member: {
        Args: { _obra: string; _user: string }
        Returns: boolean
      }
      is_obra_owner: {
        Args: { _obra: string; _user: string }
        Returns: boolean
      }
      vincular_obra_por_token: { Args: { _token: string }; Returns: Json }
    }
    Enums: {
      app_role:
        | "admin"
        | "cliente"
        | "engenheiro"
        | "arquiteto"
        | "mestre_obras"
      etapa_id:
        | "terreno"
        | "fundacao"
        | "estrutura"
        | "alvenaria"
        | "cobertura"
        | "instalacoes"
        | "acabamento"
        | "entregue"
      etapa_status: "nao_iniciado" | "em_andamento" | "concluido" | "aprovado"
      fin_tipo: "orcamento" | "gasto"
      obra_status:
        | "planejamento"
        | "em_andamento"
        | "pausada"
        | "concluida"
        | "cancelada"
      obra_tipo: "casa" | "predio" | "reforma" | "comercial" | "outro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "cliente", "engenheiro", "arquiteto", "mestre_obras"],
      etapa_id: [
        "terreno",
        "fundacao",
        "estrutura",
        "alvenaria",
        "cobertura",
        "instalacoes",
        "acabamento",
        "entregue",
      ],
      etapa_status: ["nao_iniciado", "em_andamento", "concluido", "aprovado"],
      fin_tipo: ["orcamento", "gasto"],
      obra_status: [
        "planejamento",
        "em_andamento",
        "pausada",
        "concluida",
        "cancelada",
      ],
      obra_tipo: ["casa", "predio", "reforma", "comercial", "outro"],
    },
  },
} as const
