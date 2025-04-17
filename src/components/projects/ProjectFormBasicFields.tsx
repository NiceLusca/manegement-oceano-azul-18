
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TeamMember } from '@/types';

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
  };
  setNovaTarefa: React.Dispatch<React.SetStateAction<any>>;
  departamentos: { id: string; nome: string; }[];
  membrosFiltrados: TeamMember[];
  onDepartmentChange: (departmentId: string) => void;
}

export const ProjectFormBasicFields: React.FC<ProjectFormBasicFieldsProps> = ({
  novaTarefa,
  setNovaTarefa,
  departamentos,
  membrosFiltrados,
  onDepartmentChange,
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
            {departamentos.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.nome}
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
          disabled={!novaTarefa.departamento}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Selecione um responsável" />
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
        <Label htmlFor="dataVencimento" className="text-right">
          Data de Vencimento
        </Label>
        <Input
          id="dataVencimento"
          type="date"
          value={novaTarefa.dataVencimento}
          onChange={(e) => setNovaTarefa({ ...novaTarefa, dataVencimento: e.target.value })}
          className="col-span-2"
        />
        <Input
          type="time"
          value={novaTarefa.dataHora || ''}
          onChange={(e) => setNovaTarefa({ ...novaTarefa, dataHora: e.target.value })}
        />
      </div>
    </>
  );
};
