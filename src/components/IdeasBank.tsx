
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Idea } from "@/pages/Index";
import { AddIdeaForm } from "./ideas/AddIdeaForm";
import { IdeasFilterControls } from "./ideas/IdeasFilterControls";
import { IdeaCard } from "./ideas/IdeaCard";

interface IdeasBankProps {
  ideas: Idea[];
  onAdd: (idea: Omit<Idea, "id" | "createdAt" | "isUsed">) => void;
  onDelete: (ideaId: string) => void;
  onUpdate?: (ideaId: string, idea: Omit<Idea, "id" | "createdAt" | "isUsed">) => void;
  onMarkAsUsed?: (ideaId: string, isUsed: boolean) => void;
  onSyncUsage?: () => void;
}

export const IdeasBank = ({ 
  ideas, 
  onAdd, 
  onDelete, 
  onUpdate,
  onMarkAsUsed,
  onSyncUsage 
}: IdeasBankProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showUsedIdeas, setShowUsedIdeas] = useState(false);

  const categories = Array.from(new Set(ideas.map(idea => idea.categoria).filter(Boolean)));
  
  const availableIdeas = ideas.filter(idea => !idea.isUsed);
  const ideasToShow = showUsedIdeas ? ideas : availableIdeas;

  const filteredIdeas = ideasToShow
    .filter(idea => {
      const matchesSearch = idea.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (idea.produto && idea.produto.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === "all" || idea.categoria === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const usedIdeasCount = ideas.filter(idea => idea.isUsed).length;

  return (
    <div className="space-y-6">
      <AddIdeaForm onAdd={onAdd} />

      <IdeasFilterControls 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCategory={filterCategory}
        setFilterCategory={setFilterCategory}
        categories={categories}
        onSyncUsage={onSyncUsage}
        showUsedIdeas={showUsedIdeas}
        setShowUsedIdeas={setShowUsedIdeas}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            {showUsedIdeas ? `Todas as Ideias (${filteredIdeas.length})` : `Ideias Disponíveis (${filteredIdeas.length})`}
          </h3>
          {usedIdeasCount > 0 && !showUsedIdeas && (
            <p className="text-sm text-gray-600">
              {usedIdeasCount} ideia{usedIdeasCount > 1 ? 's' : ''} em uso (oculta{usedIdeasCount > 1 ? 's' : ''})
            </p>
          )}
        </div>
        
        {filteredIdeas.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                {ideas.length === 0 
                  ? "Nenhuma ideia cadastrada ainda." 
                  : "Nenhuma ideia encontrada com os filtros aplicados."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredIdeas.map((idea) => (
              <IdeaCard 
                key={idea.id}
                idea={idea}
                onDelete={onDelete}
                onUpdate={onUpdate}
                onMarkAsUsed={onMarkAsUsed}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
