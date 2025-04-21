
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RecurringTasksHeader } from './RecurringTasksHeader';
import { RecurringTaskForm } from './RecurringTaskForm';
import { RecurringTasksContainer } from './RecurringTasksContainer';
import { useRecurringTasks, useTaskInstances } from './RecurringTasksFetchHooks';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const { recurringTasks, setRecurringTasks, isLoading, setIsLoading, fetchRecurringTasks } = useRecurringTasks();
  const { taskInstances, setTaskInstances, fetchTaskInstances } = useTaskInstances();
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

  useEffect(() => {
    fetchRecurringTasks();
    fetchTaskInstances();
    // eslint-disable-next-line
  }, []);

  const onSubmit = async (values: RecurringTaskFormValues) => {
    try {
      const { error } = await supabase.from('recurring_tasks').insert({
        title: values.title,
        description: values.description || null,
        assignee_id: values.assigneeId,
        recurrence_type: values.recurrenceType,
        start_date: values.startDate,
        end_date: values.endDate || null,
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'Tarefa recorrente criada com sucesso',
      });

      setShowForm(false);
      form.reset();
      setIsLoading(true);
      fetchRecurringTasks();
      fetchTaskInstances();
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
        setIsLoading={setIsLoading}
        recurringTasks={recurringTasks}
        setRecurringTasks={setRecurringTasks}
        taskInstances={taskInstances}
        setTaskInstances={setTaskInstances}
      />
    </div>
  );
};
