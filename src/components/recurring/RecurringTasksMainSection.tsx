
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RecurringTasksHeader } from './RecurringTasksHeader';
import { RecurringTaskForm } from './RecurringTaskForm';
import { RecurringTasksContainer } from './RecurringTasksContainer';
import { addRecurringTask } from '@/services/tasks';
import { useToast } from '@/components/ui/use-toast';
import { useRecurringTasksEnhanced } from '@/hooks/useTasks';

const recurringTaskFormSchema = z.object({
  title: z.string().min(3, 'O título precisa ter pelo menos 3 caracteres'),
  description: z.string().optional(),
  assigneeId: z.string().min(1, 'Selecione um responsável'),
  recurrenceType: z.enum(['daily', 'weekly', 'monthly', 'custom']),
  startDate: z.string(),
  endDate: z.string().optional(),
});
type RecurringTaskFormValues = z.infer<typeof recurringTaskFormSchema>;

export const RecurringTasksMainSection: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const { recurringTasks, taskInstances, isLoading, refreshData } = useRecurringTasksEnhanced();
  const { toast } = useToast();

  const form = useForm<RecurringTaskFormValues>({
    resolver: zodResolver(recurringTaskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      assigneeId: '',
      recurrenceType: 'daily',
      startDate: new Date().toISOString().substring(0, 10),
    }
  });

  const onSubmit = async (values: RecurringTaskFormValues) => {
    try {
      await addRecurringTask({
        title: values.title,
        description: values.description || '',
        assigneeId: values.assigneeId,
        recurrenceType: values.recurrenceType,
        startDate: values.startDate,
        endDate: values.endDate,
        priority: 'medium', // Default priority
        customDays: [] // Default empty custom days array
      });

      toast({
        title: 'Sucesso',
        description: 'Tarefa recorrente criada com sucesso',
      });

      setShowForm(false);
      form.reset();
      refreshData();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar a tarefa recorrente',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <RecurringTasksHeader
        onNewTask={() => setShowForm(prev => !prev)}
        showForm={showForm}
      />
      {showForm && (
        <RecurringTaskForm
          form={form}
          onSubmit={onSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
      <RecurringTasksContainer
        isLoading={isLoading}
        recurringTasks={recurringTasks}
        taskInstances={taskInstances}
        refreshData={refreshData}
      />
    </div>
  );
};
