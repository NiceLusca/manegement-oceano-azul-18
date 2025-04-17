
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, RotateCcw, CheckCircle2, Clock } from 'lucide-react';

interface ActivityEntryProps {
  entry: {
    id: string;
    user_name?: string;
    user_avatar?: string;
    action: string;
    details: string;
    created_at: string;
  };
}

export function ActivityEntry({ entry }: ActivityEntryProps) {
  const getActionIcon = (action: string) => {
    switch (action) {
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

  return (
    <div className="flex items-start gap-3">
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
                {entry.action === 'update_task_status' ? 'Atualizou status' :
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
          {entry.details}
        </p>
      </div>
    </div>
  );
}
