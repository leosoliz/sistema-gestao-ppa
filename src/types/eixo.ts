
/**
 * Define a estrutura de dados para um "Eixo Temático".
 * Eixos temáticos são categorias de alto nível usadas para agrupar programas relacionados.
 */
export interface Eixo {
  /** O identificador único do eixo, geralmente um UUID gerado pelo banco de dados. */
  id: string;
  
  /** O nome do eixo temático (ex: "Desenvolvimento Social", "Infraestrutura Urbana"). */
  nome: string;
  
  /** Uma descrição detalhada sobre o que este eixo temático abrange. */
  descricao: string;
  
  /** 
   * Um campo opcional para rastrear se o eixo está sendo utilizado por algum programa.
   * Pode ser útil para lógica de UI, como desabilitar a exclusão de eixos em uso.
   */
  isUsed?: boolean;
  
  /** A data e hora em que o registro do eixo foi criado. */
  createdAt: Date;
}
