
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface KanbanHeaderProps {
  departments: {id: string, nome: string}[];
  departmentFilter: string | null;
  setDepartmentFilter: (value: string | null) => void;
}

export const KanbanHeader: React.FC<KanbanHeaderProps> = ({
  departments,
  departmentFilter,
  setDepartmentFilter
}) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-bold">Quadro de Tarefas</h2>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filtrar por departamento:</span>
        <Select
          value={departmentFilter || "all"}
          onValueChange={(value) => setDepartmentFilter(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Todos os departamentos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os departamentos</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>{dept.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
