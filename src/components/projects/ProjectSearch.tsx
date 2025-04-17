
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

type ProjectSearchProps = {
  searchTerm: string;
  statusFilter: string | null;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
};

export function ProjectSearch({ searchTerm, statusFilter, onSearchChange, onStatusFilterChange }: ProjectSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar tarefas..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select
        value={statusFilter || "all"}
        onValueChange={(value) => onStatusFilterChange(value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Todos os status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="planning">Planejamento</SelectItem>
          <SelectItem value="in-progress">Em Progresso</SelectItem>
          <SelectItem value="review">Em Revisão</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
