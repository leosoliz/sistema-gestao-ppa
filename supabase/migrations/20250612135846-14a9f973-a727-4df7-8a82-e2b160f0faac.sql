
-- Adicionar campo is_used na tabela ideas para controlar se está sendo utilizada
ALTER TABLE public.ideas 
ADD COLUMN is_used BOOLEAN NOT NULL DEFAULT false;

-- Criar índice para melhor performance nas consultas
CREATE INDEX idx_ideas_is_used ON public.ideas (is_used);

-- Atualizar ideias existentes que já estão sendo usadas
-- Buscar ideias que têm nome/produto correspondente nas ações
UPDATE public.ideas 
SET is_used = true 
WHERE EXISTS (
  SELECT 1 
  FROM public.actions a
  JOIN public.programs p ON a.program_id = p.id
  WHERE LOWER(TRIM(a.nome)) = LOWER(TRIM(ideas.titulo))
    AND (
      (COALESCE(a.produto, '') = '' AND COALESCE(ideas.descricao, '') = '') OR
      (LOWER(TRIM(COALESCE(a.produto, ''))) = LOWER(TRIM(COALESCE(ideas.descricao, ''))))
    )
);
