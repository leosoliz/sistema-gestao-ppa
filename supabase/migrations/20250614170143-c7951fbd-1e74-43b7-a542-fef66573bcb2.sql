
-- Adiciona campos de metas físicas e orçamentos específicos para cada ano
ALTER TABLE public.actions
  ADD COLUMN meta_fisica_2026 text,
  ADD COLUMN meta_fisica_2027 text,
  ADD COLUMN meta_fisica_2028 text,
  ADD COLUMN meta_fisica_2029 text,
  ADD COLUMN orcamento_2026 text,
  ADD COLUMN orcamento_2027 text,
  ADD COLUMN orcamento_2028 text,
  ADD COLUMN orcamento_2029 text;

-- Opcional: Esses campos antigos podem ser mantidos para retrocompatibilidade,
-- mas se quiser remover depois, use:
-- ALTER TABLE public.actions DROP COLUMN meta_fisica, DROP COLUMN orcamento;
