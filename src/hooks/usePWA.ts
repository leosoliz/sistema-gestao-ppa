
import { useState, useEffect } from 'react';

/**
 * Interface para tipar o evento `beforeinstallprompt`, que não é padrão
 * em todas as definições de tipo de evento do DOM.
 */
interface BeforeInstallPromptEvent extends Event {
  /** Mostra o diálogo de instalação para o usuário. */
  prompt(): Promise<void>;
  /** 
   * Retorna uma promessa que resolve com a escolha do usuário
   * ('accepted' ou 'dismissed').
   */
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Hook customizado para gerenciar a lógica de instalação de um Progressive Web App (PWA).
 * Ele lida com o evento `beforeinstallprompt`, verifica se o app já está instalado
 * e fornece uma função para iniciar o processo de instalação.
 * 
 * @returns Um objeto com:
 *  - `isInstallable`: `true` se o app pode ser instalado (o prompt de instalação está disponível).
 *  - `isInstalled`: `true` se o app já está rodando em modo standalone.
 *  - `installApp`: Uma função para acionar o prompt de instalação.
 */
export const usePWA = () => {
  // Estado para armazenar o evento `beforeinstallprompt` para uso posterior.
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  // Estado para indicar se o botão de instalação deve ser exibido.
  const [isInstallable, setIsInstallable] = useState(false);
  // Estado para verificar se o app já foi instalado.
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se o app já está instalado ao checar o modo de exibição.
    // 'standalone' geralmente indica que foi instalado na tela inicial.
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    /**
     * Manipulador para o evento `beforeinstallprompt`.
     * Este evento é disparado pelo navegador quando a PWA atende aos critérios de instalação.
     */
    const handleBeforeInstallPrompt = (e: Event) => {
      // Previne que o navegador mostre o mini-infobar de instalação automaticamente.
      e.preventDefault();
      // Armazena o evento para que possamos acioná-lo mais tarde, a partir de um botão na UI.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Indica que a instalação é possível.
      setIsInstallable(true);
    };

    /**
     * Manipulador para o evento `appinstalled`.
     * Este evento é disparado quando a PWA é instalada com sucesso.
     */
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Adiciona os ouvintes de evento.
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Função de limpeza para remover os ouvintes quando o componente for desmontado.
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Função para ser chamada pelo clique de um botão na UI para iniciar a instalação.
   */
  const installApp = async () => {
    // Se não houver prompt salvo, não faz nada.
    if (!deferredPrompt) return;

    // Mostra o diálogo de instalação para o usuário.
    deferredPrompt.prompt();
    // Aguarda a escolha do usuário.
    const { outcome } = await deferredPrompt.userChoice;
    
    // Se o usuário aceitou a instalação, limpa o prompt.
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return {
    isInstallable,
    isInstalled,
    installApp
  };
};
