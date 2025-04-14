
import React from 'react';
import { Button } from '@/components/ui/button';

interface CalendarFiltersProps {
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
}

export const CalendarFilters: React.FC<CalendarFiltersProps> = ({ 
  activeFilter, 
  setActiveFilter 
}) => {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-2">Filtrar por status</h3>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={activeFilter === null ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveFilter(null)}
          className="text-xs"
        >
          Todos
        </Button>
        <Button 
          variant={activeFilter === 'todo' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveFilter('todo')}
          className="text-xs"
        >
          A Fazer
        </Button>
        <Button 
          variant={activeFilter === 'in-progress' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveFilter('in-progress')}
          className="text-xs"
        >
          Em Progresso
        </Button>
        <Button 
          variant={activeFilter === 'completed' ? "default" : "outline"} 
          size="sm"
          onClick={() => setActiveFilter('completed')}
          className="text-xs"
        >
          Concluídas
        </Button>
      </div>
    </div>
  );
};
