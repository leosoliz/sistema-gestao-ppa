
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

/**
 * Componente para a página de erro 404 (Não Encontrado).
 * É exibido quando um usuário tenta acessar uma rota que não existe na aplicação.
 */
const NotFound = () => {
  // `useLocation` é um hook do React Router que retorna o objeto de localização atual.
  // Usamos isso para obter o caminho da URL que o usuário tentou acessar.
  const location = useLocation();

  // `useEffect` é usado para executar um efeito colateral após a renderização.
  // Neste caso, queremos registrar um erro no console para fins de depuração,
  // informando qual rota inexistente foi acessada.
  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname // O caminho da URL que causou o erro 404.
    );
  }, [location.pathname]); // O efeito será re-executado se o caminho mudar.

  // A renderização da página 404.
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! A página não foi encontrada.</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Voltar para o Início
        </a>
      </div>
    </div>
  );
};

export default NotFound;
