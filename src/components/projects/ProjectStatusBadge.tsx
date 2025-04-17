
import React from 'react';

type StatusProps = {
  status: 'planning' | 'in-progress' | 'review' | 'completed';
};

export function ProjectStatusBadge({ status }: StatusProps) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs ${
      status === 'planning' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
      status === 'in-progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
      status === 'review' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }`}>
      {status === 'planning' ? 'Planejamento' :
       status === 'in-progress' ? 'Em Progresso' :
       status === 'review' ? 'Em Revisão' : 
       'Concluído'}
    </span>
  );
}
