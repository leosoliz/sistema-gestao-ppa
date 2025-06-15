
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Função utilitária para combinar classes do Tailwind CSS de forma condicional e inteligente.
 * É uma prática comum em projetos que usam shadcn/ui e Tailwind.
 *
 * @param inputs - Uma lista de classes CSS. Podem ser strings, objetos ou arrays.
 *   - `clsx` primeiro processa os inputs para gerar uma string de classes,
 *     permitindo condicionais (ex: `cn('p-4', { 'font-bold': isBold })`).
 *   - `twMerge` então resolve conflitos de classes do Tailwind. Por exemplo,
 *     `twMerge('p-2 p-4')` resultará em `'p-4'`, pois a última classe de padding prevalece.
 * @returns Uma string de classes CSS otimizada e sem conflitos.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
