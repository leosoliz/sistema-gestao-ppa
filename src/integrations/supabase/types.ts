export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      actions: {
        Row: {
          created_at: string
          fonte: string | null
          id: string
          meta_fisica: string
          meta_fisica_2026: string | null
          meta_fisica_2027: string | null
          meta_fisica_2028: string | null
          meta_fisica_2029: string | null
          nome: string
          orcamento: string | null
          orcamento_2026: string | null
          orcamento_2027: string | null
          orcamento_2028: string | null
          orcamento_2029: string | null
          produto: string | null
          program_id: string
          unidade_medida: string
        }
        Insert: {
          created_at?: string
          fonte?: string | null
          id?: string
          meta_fisica: string
          meta_fisica_2026?: string | null
          meta_fisica_2027?: string | null
          meta_fisica_2028?: string | null
          meta_fisica_2029?: string | null
          nome: string
          orcamento?: string | null
          orcamento_2026?: string | null
          orcamento_2027?: string | null
          orcamento_2028?: string | null
          orcamento_2029?: string | null
          produto?: string | null
          program_id: string
          unidade_medida: string
        }
        Update: {
          created_at?: string
          fonte?: string | null
          id?: string
          meta_fisica?: string
          meta_fisica_2026?: string | null
          meta_fisica_2027?: string | null
          meta_fisica_2028?: string | null
          meta_fisica_2029?: string | null
          nome?: string
          orcamento?: string | null
          orcamento_2026?: string | null
          orcamento_2027?: string | null
          orcamento_2028?: string | null
          orcamento_2029?: string | null
          produto?: string | null
          program_id?: string
          unidade_medida?: string
        }
        Relationships: [
          {
            foreignKeyName: "actions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      eixos: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          is_used: boolean
          nome: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          is_used?: boolean
          nome: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          is_used?: boolean
          nome?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          categoria: string | null
          created_at: string
          descricao: string | null
          id: string
          is_used: boolean
          titulo: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          is_used?: boolean
          titulo: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          is_used?: boolean
          titulo?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          departamento: string | null
          descricao: string | null
          diretrizes: string | null
          eixo: string | null
          id: string
          justificativa: string | null
          objetivos: string | null
          programa: string
          secretaria: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          departamento?: string | null
          descricao?: string | null
          diretrizes?: string | null
          eixo?: string | null
          id?: string
          justificativa?: string | null
          objetivos?: string | null
          programa: string
          secretaria?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          departamento?: string | null
          descricao?: string | null
          diretrizes?: string | null
          eixo?: string | null
          id?: string
          justificativa?: string | null
          objetivos?: string | null
          programa?: string
          secretaria?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
