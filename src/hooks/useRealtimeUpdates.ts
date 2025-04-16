
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useRealtimeUpdates(
  onTasksUpdate: () => void,
  onTeamUpdate: () => void,
  onCustomersUpdate: () => void
) {
  const { toast } = useToast();

  useEffect(() => {
    // Inscrever-se para atualizações em tempo real da tabela tasks
    const tasksSubscription = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          const taskTitle = payload.new && 'title' in payload.new ? payload.new.title : 'Uma tarefa';
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: 'Nova tarefa adicionada',
              description: `"${taskTitle}" foi adicionada ao sistema`,
              variant: 'default',
            });
          } else if (payload.eventType === 'UPDATE') {
            toast({
              title: 'Tarefa atualizada',
              description: `"${taskTitle}" foi atualizada`,
              variant: 'default',
            });
          } else if (payload.eventType === 'DELETE') {
            toast({
              title: 'Tarefa removida',
              description: 'Uma tarefa foi removida do sistema',
              variant: 'default',
            });
          }

          // Atualizar a lista de tarefas
          onTasksUpdate();
        }
      )
      .subscribe();

    // Inscrever-se para atualizações em tempo real da tabela profiles (membros da equipe)
    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        () => {
          // Atualizar a lista de membros da equipe
          onTeamUpdate();
        }
      )
      .subscribe();

    // Inscrever-se para atualizações em tempo real da tabela customers (clientes/CRM)
    const customersSubscription = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
        },
        () => {
          // Atualizar a lista de clientes
          onCustomersUpdate();
        }
      )
      .subscribe();

    // Limpar as inscrições ao desmontar o componente
    return () => {
      supabase.removeChannel(tasksSubscription);
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(customersSubscription);
    };
  }, [onTasksUpdate, onTeamUpdate, onCustomersUpdate, toast]);
}
