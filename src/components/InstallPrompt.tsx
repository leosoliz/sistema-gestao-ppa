
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWA } from "@/hooks/usePWA";

export const InstallPrompt = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button 
        onClick={installApp}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
      >
        <Download className="h-4 w-4 mr-2" />
        Instalar App
      </Button>
    </div>
  );
};
