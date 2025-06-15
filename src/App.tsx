
import { Toaster } from "@/components/ui/toaster"; // Componente para exibir notificações (toast) tradicionais.
import { Toaster as Sonner } from "@/components/ui/sonner"; // Componente para exibir notificações (toast) mais modernas (Sonner).
import { TooltipProvider } from "@/components/ui/tooltip"; // Provedor para habilitar tooltips em toda a aplicação.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Ferramentas para gerenciamento de estado de servidor (fetching, caching, etc.).
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Componentes para gerenciar o roteamento da aplicação.
import Index from "./pages/Index"; // A página principal da aplicação.
import NotFound from "./pages/NotFound"; // A página exibida para rotas não encontradas (404).

// Cria uma instância do QueryClient para ser usada pelo React Query.
// Esta instância gerencia o cache e as configurações de todas as queries.
const queryClient = new QueryClient();

/**
 * Componente raiz da aplicação.
 * Responsável por configurar os provedores globais (React Query, Tooltip, Roteador)
 * e definir as rotas principais da aplicação.
 */
const App = () => (
  // O QueryClientProvider disponibiliza o cliente React Query para todos os componentes filhos.
  <QueryClientProvider client={queryClient}>
    {/* O TooltipProvider permite que os componentes `Tooltip` do shadcn funcionem. */}
    <TooltipProvider>
      {/* Container onde as notificações do `useToast` serão renderizadas. */}
      <Toaster />
      {/* Container para as notificações do Sonner. */}
      <Sonner />
      {/* O BrowserRouter habilita o roteamento baseado em URL no navegador. */}
      <BrowserRouter>
        {/* O componente Routes age como um contêiner para todas as rotas individuais. */}
        <Routes>
          {/* Define a rota para a página inicial ('/'), que renderiza o componente Index. */}
          <Route path="/" element={<Index />} />
          {/* Rota "catch-all": qualquer caminho que não corresponda às rotas acima */}
          {/* renderizará o componente NotFound. É importante que seja a última rota. */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
