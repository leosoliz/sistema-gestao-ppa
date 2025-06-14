
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, EyeOff } from "lucide-react";

interface IdeasFilterControlsProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterCategory: string;
  setFilterCategory: (value: string) => void;
  categories: string[];
  onSyncUsage?: () => void;
  showUsedIdeas: boolean;
  setShowUsedIdeas: (value: boolean) => void;
}

export const IdeasFilterControls = ({
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  categories,
  onSyncUsage,
  showUsedIdeas,
  setShowUsedIdeas,
}: IdeasFilterControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar ideias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      <Select value={filterCategory} onValueChange={setFilterCategory}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filtrar por categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categories.sort((a,b) => a.localeCompare(b)).map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {onSyncUsage && (
        <Button variant="outline" onClick={onSyncUsage} className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sincronizar
        </Button>
      )}
      <Button
        variant={showUsedIdeas ? "default" : "outline"}
        onClick={() => setShowUsedIdeas(!showUsedIdeas)}
        className="w-full sm:w-auto"
      >
        <EyeOff className="h-4 w-4 mr-2" />
        {showUsedIdeas ? "Ocultar Usadas" : "Mostrar Usadas"}
      </Button>
    </div>
  );
};
