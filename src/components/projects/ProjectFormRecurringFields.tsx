
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ProjectFormRecurringFieldsProps {
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
  }>>;
  onRecurringChange: (checked: boolean) => void;
}

export const ProjectFormRecurringFields: React.FC<ProjectFormRecurringFieldsProps> = ({
  novaTarefa,
  setNovaTarefa,
  onRecurringChange
}) => {
  // Business days (Monday to Friday) for the workweek option
  const businessDays = [1, 2, 3, 4, 5]; // Monday to Friday

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
        customDays: [...currentDays, day].sort()
      });
    }
  };

  if (!novaTarefa.isRecurring) return null;

  return (
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
  );
};
