
import React from 'react';
import { TeamMember } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProjectFormBasicFields } from './ProjectFormBasicFields';
import { ProjectFormRecurringFields } from './ProjectFormRecurringFields';

interface ProjectFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMembers: TeamMember[];
  departamentos: { id: string, nome: string }[];
  membrosFiltrados: TeamMember[];
  onDepartmentChange: (departmentId: string) => void;
  onSubmit: () => void;
  novaTarefa: {
    titulo: string;
    descricao: string;
    status: string;
    prioridade: string;
    responsavel: string;
    departamento: string;
    dataVencimento: string;
    dataHora?: string;
    isRecurring?: boolean;
    recurrenceType?: string;
    endDate?: string;
    customDays?: number[];
  };
  setNovaTarefa: React.Dispatch<React.SetStateAction<{
    titulo: string;
    descricao: string;
    status: string;
    prioridade: string;
    responsavel: string;
    departamento: string;
    dataVencimento: string;
    dataHora?: string;
    isRecurring?: boolean;
    recurrenceType?: string;
    endDate?: string;
    customDays?: number[];
  }>>;
}

export const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({
  open,
  onOpenChange,
  teamMembers,
  departamentos,
  membrosFiltrados,
  onDepartmentChange,
  onSubmit,
  novaTarefa,
  setNovaTarefa
}) => {
  const handleRecurringChange = (checked: boolean) => {
    setNovaTarefa({
      ...novaTarefa,
      isRecurring: checked,
      recurrenceType: checked ? 'daily' : undefined,
      endDate: checked ? '' : undefined,
      customDays: checked ? [] : undefined
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para criar uma nova tarefa.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ProjectFormBasicFields 
            novaTarefa={novaTarefa}
            setNovaTarefa={setNovaTarefa}
            departamentos={departamentos}
            membrosFiltrados={membrosFiltrados}
            onDepartmentChange={onDepartmentChange}
          />
          
          <ProjectFormRecurringFields
            novaTarefa={novaTarefa}
            setNovaTarefa={setNovaTarefa}
            onRecurringChange={handleRecurringChange}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" onClick={onSubmit}>
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
