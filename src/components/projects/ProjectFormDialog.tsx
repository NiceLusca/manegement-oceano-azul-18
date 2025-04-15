
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
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
    isRecurring?: boolean;
    recurrenceType?: string;
    endDate?: string;
    customDays?: number[];
    customMonths?: number[];
  };
  setNovaTarefa: React.Dispatch<React.SetStateAction<{
    titulo: string;
    descricao: string;
    status: string;
    prioridade: string;
    responsavel: string;
    departamento: string;
    dataVencimento: string;
    isRecurring?: boolean;
    recurrenceType?: string;
    endDate?: string;
    customDays?: number[];
    customMonths?: number[];
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
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);

  // Business days (Monday to Friday) for the workweek option
  const businessDays = [1, 2, 3, 4, 5]; // Monday to Friday

  const handleRecurringChange = (checked: boolean) => {
    setShowRecurringOptions(checked);
    setNovaTarefa({
      ...novaTarefa,
      isRecurring: checked,
      recurrenceType: checked ? 'daily' : undefined,
      endDate: checked ? '' : undefined,
      customDays: checked ? [] : undefined,
      customMonths: checked ? [] : undefined
    });
  };

  const handleWorkweekSelection = () => {
    setNovaTarefa({
      ...novaTarefa,
      recurrenceType: 'workweek',
      customDays: businessDays
    });
  };

  const daysOfWeek = [
    { value: 0, label: "Domingo" },
    { value: 1, label: "Segunda" },
    { value: 2, label: "Terça" },
    { value: 3, label: "Quarta" },
    { value: 4, label: "Quinta" },
    { value: 5, label: "Sexta" },
    { value: 6, label: "Sábado" }
  ];

  const monthsOfYear = [
    { value: 0, label: "Janeiro" },
    { value: 1, label: "Fevereiro" },
    { value: 2, label: "Março" },
    { value: 3, label: "Abril" },
    { value: 4, label: "Maio" },
    { value: 5, label: "Junho" },
    { value: 6, label: "Julho" },
    { value: 7, label: "Agosto" },
    { value: 8, label: "Setembro" },
    { value: 9, label: "Outubro" },
    { value: 10, label: "Novembro" },
    { value: 11, label: "Dezembro" }
  ];

  const toggleDay = (day: number) => {
    const currentDays = novaTarefa.customDays || [];
    if (currentDays.includes(day)) {
      setNovaTarefa({
        ...novaTarefa,
        customDays: currentDays.filter(d => d !== day)
      });
    } else {
      setNovaTarefa({
        ...novaTarefa,
        customDays: [...currentDays, day]
      });
    }
  };

  const toggleMonth = (month: number) => {
    const currentMonths = novaTarefa.customMonths || [];
    if (currentMonths.includes(month)) {
      setNovaTarefa({
        ...novaTarefa,
        customMonths: currentMonths.filter(m => m !== month)
      });
    } else {
      setNovaTarefa({
        ...novaTarefa,
        customMonths: [...currentMonths, month]
      });
    }
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
          
          {/* Opção de Recorrência */}
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right">
              <Label htmlFor="isRecurring">Tarefa Recorrente</Label>
            </div>
            <div className="flex items-center space-x-2 col-span-3">
              <Checkbox 
                id="isRecurring" 
                checked={novaTarefa.isRecurring || false}
                onCheckedChange={(checked) => handleRecurringChange(checked as boolean)}
              />
              <Label htmlFor="isRecurring">Esta é uma tarefa recorrente</Label>
            </div>
          </div>
          
          {/* Opções de recorrência */}
          {showRecurringOptions && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recurrenceType" className="text-right">
                  Tipo de Recorrência
                </Label>
                <RadioGroup
                  value={novaTarefa.recurrenceType}
                  onValueChange={(value) => setNovaTarefa({ ...novaTarefa, recurrenceType: value })}
                  className="col-span-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="daily" id="daily" />
                    <Label htmlFor="daily">Diária</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="workweek" id="workweek" onClick={handleWorkweekSelection} />
                    <Label htmlFor="workweek">Dias úteis (Seg-Sex)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="weekly" id="weekly" />
                    <Label htmlFor="weekly">Semanal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="monthly" id="monthly" />
                    <Label htmlFor="monthly">Mensal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom">Personalizada</Label>
                  </div>
                </RadioGroup>
              </div>

              {novaTarefa.recurrenceType === 'weekly' && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">
                    Dia da Semana
                  </Label>
                  <div className="flex flex-wrap gap-2 col-span-3">
                    {daysOfWeek.map(day => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`day-${day.value}`} 
                          checked={(novaTarefa.customDays || []).includes(day.value)}
                          onCheckedChange={() => toggleDay(day.value)}
                        />
                        <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {novaTarefa.recurrenceType === 'monthly' && (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right mt-2">
                    Dia do Mês
                  </Label>
                  <div className="col-span-3">
                    <Input 
                      type="number" 
                      min="1" 
                      max="31" 
                      placeholder="Dia do mês (1-31)" 
                      onChange={(e) => {
                        const day = parseInt(e.target.value);
                        if (day >= 1 && day <= 31) {
                          setNovaTarefa({
                            ...novaTarefa,
                            customDays: [day]
                          });
                        }
                      }}
                      value={(novaTarefa.customDays || [])[0] || ''}
                    />
                  </div>
                </div>
              )}

              {novaTarefa.recurrenceType === 'custom' && (
                <>
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right mt-2">
                      Dias da Semana
                    </Label>
                    <div className="flex flex-wrap gap-2 col-span-3">
                      {daysOfWeek.map(day => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`day-${day.value}`} 
                            checked={(novaTarefa.customDays || []).includes(day.value)}
                            onCheckedChange={() => toggleDay(day.value)}
                          />
                          <Label htmlFor={`day-${day.value}`}>{day.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right mt-2">
                      Meses
                    </Label>
                    <div className="flex flex-wrap gap-2 col-span-3">
                      {monthsOfYear.map(month => (
                        <div key={month.value} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`month-${month.value}`} 
                            checked={(novaTarefa.customMonths || []).includes(month.value)}
                            onCheckedChange={() => toggleMonth(month.value)}
                          />
                          <Label htmlFor={`month-${month.value}`}>{month.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  Data de Término
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={novaTarefa.endDate || ''}
                  onChange={(e) => setNovaTarefa({ ...novaTarefa, endDate: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </>
          )}
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
