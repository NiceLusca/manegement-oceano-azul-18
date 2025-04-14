
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

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
  };
  setNovaTarefa: React.Dispatch<React.SetStateAction<{
    titulo: string;
    descricao: string;
    status: string;
    prioridade: string;
    responsavel: string;
    departamento: string;
    dataVencimento: string;
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para criar uma nova tarefa.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="titulo" className="text-right">
              Título
            </Label>
            <Input
              id="titulo"
              value={novaTarefa.titulo}
              onChange={(e) => setNovaTarefa({ ...novaTarefa, titulo: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="descricao" className="text-right">
              Descrição
            </Label>
            <Textarea
              id="descricao"
              value={novaTarefa.descricao}
              onChange={(e) => setNovaTarefa({ ...novaTarefa, descricao: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={novaTarefa.status}
              onValueChange={(value) => setNovaTarefa({ ...novaTarefa, status: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">A Fazer</SelectItem>
                <SelectItem value="in-progress">Em Progresso</SelectItem>
                <SelectItem value="review">Em Revisão</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="prioridade" className="text-right">
              Prioridade
            </Label>
            <Select
              value={novaTarefa.prioridade}
              onValueChange={(value) => setNovaTarefa({ ...novaTarefa, prioridade: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Baixa</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="departamento" className="text-right">
              Equipe/Departamento
            </Label>
            <Select
              value={novaTarefa.departamento}
              onValueChange={(value) => {
                setNovaTarefa({ ...novaTarefa, departamento: value });
                onDepartmentChange(value);
              }}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um departamento" />
              </SelectTrigger>
              <SelectContent>
                {departamentos.map((dep) => (
                  <SelectItem key={dep.id} value={dep.id}>
                    {dep.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="responsavel" className="text-right">
              Responsável
            </Label>
            <Select
              value={novaTarefa.responsavel}
              onValueChange={(value) => setNovaTarefa({ ...novaTarefa, responsavel: value })}
              disabled={!novaTarefa.departamento || membrosFiltrados.length === 0}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue
                  placeholder={
                    !novaTarefa.departamento
                      ? "Selecione um departamento primeiro"
                      : membrosFiltrados.length === 0
                        ? "Sem membros neste departamento"
                        : "Selecione um responsável"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {membrosFiltrados.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dataVencimento" className="text-right">
              Data de Vencimento
            </Label>
            <Input
              id="dataVencimento"
              type="date"
              value={novaTarefa.dataVencimento}
              onChange={(e) => setNovaTarefa({ ...novaTarefa, dataVencimento: e.target.value })}
              className="col-span-3"
            />
          </div>
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
