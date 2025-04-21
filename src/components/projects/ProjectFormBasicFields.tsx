
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ProjectFormBasicFieldsProps {
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
  departamentos: { id: string, nome: string }[];
  membrosFiltrados: { id: string, name: string }[];
  onDepartmentChange: (departmentId: string) => void;
}

export const ProjectFormBasicFields: React.FC<ProjectFormBasicFieldsProps> = ({
  novaTarefa,
  setNovaTarefa,
  departamentos,
  membrosFiltrados,
  onDepartmentChange
}) => {
  return (
    <>
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
            <SelectValue placeholder="Selecione uma prioridade" />
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
          Departamento
        </Label>
        <Select
          value={novaTarefa.departamento}
          onValueChange={(value) => {
            setNovaTarefa({ ...novaTarefa, departamento: value, responsavel: '' });
            onDepartmentChange(value);
          }}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Selecione um departamento" />
          </SelectTrigger>
          <SelectContent>
            {departamentos.map((depto) => (
              <SelectItem key={depto.id} value={depto.id}>
                {depto.nome}
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
          disabled={membrosFiltrados.length === 0}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder={membrosFiltrados.length === 0 ? "Selecione um departamento primeiro" : "Selecione um responsável"} />
          </SelectTrigger>
          <SelectContent>
            {membrosFiltrados.map((membro) => (
              <SelectItem key={membro.id} value={membro.id}>
                {membro.name}
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
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="dataHora" className="text-right">
          Hora
        </Label>
        <Input
          id="dataHora"
          type="time"
          value={novaTarefa.dataHora || ''}
          onChange={(e) => setNovaTarefa({ ...novaTarefa, dataHora: e.target.value })}
          className="col-span-3"
        />
      </div>
      
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">
          Tarefa Recorrente
        </Label>
        <div className="flex items-center space-x-2 col-span-3">
          <Checkbox 
            id="isRecurring" 
            checked={novaTarefa.isRecurring || false}
            onCheckedChange={(checked) => 
              setNovaTarefa({ 
                ...novaTarefa, 
                isRecurring: !!checked,
                recurrenceType: checked ? 'daily' : undefined,
                endDate: checked ? '' : undefined,
                customDays: checked ? [] : undefined 
              })
            }
          />
          <Label htmlFor="isRecurring">Esta é uma tarefa recorrente</Label>
        </div>
      </div>
    </>
  );
};
