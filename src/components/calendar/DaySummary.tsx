
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Task } from '@/types';
import { CalendarIcon, CheckSquare, User, Clock } from 'lucide-react';

interface DaySummaryProps {
  date: Date;
  tasksForDate: Task[];
}

export const DaySummary: React.FC<DaySummaryProps> = ({ date, tasksForDate }) => {
  return (
    <div className="mt-6">
      <h3 className="font-medium mb-2">Resumo do Dia</h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            Data:
          </span>
          <span className="font-medium">{format(date, 'PPP', { locale: ptBR })}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            Total de tarefas:
          </span>
          <span className="font-medium">{tasksForDate.length}</span>
        </div>
        {tasksForDate.length > 0 && (
          <>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Responsáveis:
              </span>
              <span className="font-medium">
                {Array.from(new Set(tasksForDate.map(t => t.assigneeId))).length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Concluídas:
              </span>
              <span className="font-medium">
                {tasksForDate.filter(t => t.status === 'completed').length} de {tasksForDate.length}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
