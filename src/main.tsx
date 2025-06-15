
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ponto de entrada da aplicação React.
// `createRoot` é a API moderna do React para renderização concorrente.
// Ela seleciona o elemento com o ID 'root' no `index.html` como o container.
// O operador '!' (non-null assertion) assume que o elemento sempre existirá.
// O método `render` inicia o processo de renderização do componente App dentro do container.
createRoot(document.getElementById("root")!).render(<App />);

// Lógica para registrar o Service Worker, que é uma parte essencial
// para transformar a aplicação em um Progressive Web App (PWA).
// O Service Worker permite funcionalidades offline, notificações push e caching de assets.
if ('serviceWorker' in navigator) {
  // Adiciona um ouvinte de evento que espera a página carregar completamente antes de registrar o SW.
  // Isso evita que o registro do SW atrase o carregamento inicial da página.
  window.addEventListener('load', () => {
    // Tenta registrar o arquivo do Service Worker localizado em '/sw.js'.
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // Log de sucesso caso o registro funcione.
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        // Log de erro caso o registro falhe.
        console.log('SW registration failed: ', registrationError);
      });
  });
}
