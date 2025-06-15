
import * as React from "react"

// Define o ponto de quebra (breakpoint) para considerar um dispositivo como "móvel".
// Telas com largura menor que 768px serão consideradas móveis.
const MOBILE_BREAKPOINT = 768

/**
 * Hook customizado para detectar se a aplicação está sendo visualizada em um dispositivo móvel.
 * Ele utiliza a API `matchMedia` do navegador para verificar a largura da tela.
 *
 * @returns `true` se a largura da tela for menor que o `MOBILE_BREAKPOINT`, `false` caso contrário.
 * O valor inicial pode ser `undefined` antes da primeira verificação do lado do cliente.
 */
export function useIsMobile() {
  // Estado para armazenar o resultado da verificação.
  // Inicia como `undefined` para evitar problemas de hidratação em SSR (Server-Side Rendering),
  // pois o tamanho da tela só pode ser conhecido no cliente.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // `matchMedia` cria um objeto de consulta de mídia que pode ser usado para verificar
    // se o documento corresponde a uma media query.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Função `onChange` que será chamada sempre que o status da media query mudar
    // (por exemplo, quando o usuário redimensiona a janela do navegador).
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Adiciona o listener para o evento 'change' da media query.
    mql.addEventListener("change", onChange)
    
    // Realiza uma verificação inicial assim que o componente é montado no cliente.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Função de limpeza: remove o listener quando o componente é desmontado.
    // Isso evita vazamentos de memória.
    return () => mql.removeEventListener("change", onChange)
  }, []) // O array de dependências vazio `[]` garante que este efeito rode apenas uma vez.

  // Retorna o valor booleano. `!!isMobile` converte `undefined` para `false`.
  return !!isMobile
}
