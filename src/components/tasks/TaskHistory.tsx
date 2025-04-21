
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, RotateCcw, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HistoryEntry {
  id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  action: string;
  details: string;
  created_at: string;
}

interface TaskHistoryProps {
  taskId: string;
}

export function TaskHistory({ taskId }: TaskHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [taskId]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('team_activity_view')
        .select('*')
        .eq('entity_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Buscar também histórico na descrição da tarefa
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('description, updated_at')
        .eq('id', taskId)
        .single();
        
      if (!taskError && taskData?.description && taskData.description.includes('update_status')) {
        // Tentar extrair histórico da descrição
        try {
          const descLines = taskData.description.split('\n');
          const statusUpdates = descLines
            .filter(line => line.includes('update_status'))
            .map(line => {
              const parts = line.match(/update_status - (.*?) \((.*?)\)/);
              if (parts) {
                try {
                  const details = JSON.parse(parts[1]);
                  const timestamp = new Date(parts[2]);
                  
                  return {
                    id: `desc-${Math.random().toString(36).substring(2)}`,
                    user_id: 'system',
                    user_name: 'Sistema',
                    action: 'update_status',
                    details: `Status alterado de "${details.oldStatus}" para "${details.newStatus}"`,
                    created_at: timestamp.toISOString()
                  };
                } catch (e) {
                  console.error('Erro ao processar linha de histórico:', e);
                  return null;
                }
              }
              return null;
            })
            .filter(Boolean);
            
          if (statusUpdates.length > 0) {
            setHistory(prev => [...(data || []), ...statusUpdates]);
            setLoading(false);
            return;
          }
        } catch (parseError) {
          console.error('Erro ao processar histórico da descrição:', parseError);
        }
      }
      
      setHistory(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'update_status':
      case 'update_task_status':
        return <RotateCcw className="h-4 w-4 text-blue-500" />;
      case 'complete_task':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'edit_task':
        return <Edit className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'update_status':
      case 'update_task_status':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'complete_task':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'edit_task':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };
  
  const formatDetails = (details: string, action: string) => {
    if (action === 'update_status' && details.includes('{')) {
      try {
        const data = JSON.parse(details);
        return `Status alterado de "${
          data.oldStatus === 'todo' ? 'A Fazer' :
          data.oldStatus === 'in-progress' ? 'Em Progresso' :
          data.oldStatus === 'review' ? 'Em Revisão' :
          data.oldStatus === 'completed' ? 'Concluído' : 
          data.oldStatus
        }" para "${
          data.newStatus === 'todo' ? 'A Fazer' :
          data.newStatus === 'in-progress' ? 'Em Progresso' :
          data.newStatus === 'review' ? 'Em Revisão' :
          data.newStatus === 'completed' ? 'Concluído' : 
          data.newStatus
        }"`;
      } catch {
        return details;
      }
    }
    return details;
  };

  return (
    <div className="p-4 space-y-4">
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="h-10 w-10 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : history.length === 0 ? (
        <p className="text-center py-8 text-sm text-muted-foreground">
          Nenhuma atividade registrada para esta tarefa
        </p>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={entry.user_avatar} />
                <AvatarFallback>
                  {entry.user_name?.substring(0, 2).toUpperCase() || 'UN'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-medium text-sm">
                      {entry.user_name || 'Usuário'}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`ml-2 ${getActionColor(entry.action)}`}
                    >
                      <span className="flex items-center gap-1">
                        {getActionIcon(entry.action)}
                        {entry.action === 'update_status' ? 'Atualizou status' :
                         entry.action === 'update_task_status' ? 'Atualizou status' :
                         entry.action === 'complete_task' ? 'Completou tarefa' :
                         entry.action === 'edit_task' ? 'Editou tarefa' :
                         'Outra ação'}
                      </span>
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {formatDetails(entry.details, entry.action)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
