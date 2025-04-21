
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface RecurringTasksHeaderProps {
  onNewTask: () => void;
  showForm: boolean;
}

export const RecurringTasksHeader: React.FC<RecurringTasksHeaderProps> = ({
  onNewTask,
  showForm
}) => (
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold">Tarefas Recorrentes</h1>
      <p className="text-muted-foreground">Gerencie tarefas periódicas para sua equipe</p>
    </div>
    <Button
      className="flex items-center gap-2"
      onClick={onNewTask}
    >
      <Plus className="h-4 w-4" />
      {showForm ? 'Fechar' : 'Nova Tarefa Recorrente'}
    </Button>
  </div>
);
