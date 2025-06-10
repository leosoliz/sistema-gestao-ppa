
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Program } from "@/pages/Index";

interface ProgramInfoTabProps {
  program: Program;
}

export const ProgramInfoTab = ({ program }: ProgramInfoTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Dados Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Secretaria</h4>
              <p className="text-gray-600">{program.secretaria || "Não informado"}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Departamento</h4>
              <p className="text-gray-600">{program.departamento || "Não informado"}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Eixo</h4>
              <p className="text-gray-600">{program.eixo || "Não informado"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-green-900">Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {program.descricao || "Nenhuma descrição fornecida."}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-orange-900">Justificativa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {program.justificativa || "Nenhuma justificativa fornecida."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-purple-900">Objetivos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">
              {program.objetivos || "Nenhum objetivo definido."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-indigo-900">Diretrizes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap">
            {program.diretrizes || "Nenhuma diretriz definida."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
