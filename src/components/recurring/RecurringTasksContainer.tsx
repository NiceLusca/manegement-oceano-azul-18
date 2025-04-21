
import React from 'react';
import { RecurringTask, TaskInstance } from '@/types';
import { RecurringTasksList } from './RecurringTasksList';
import { TaskInstancesList } from './TaskInstancesList';

interface RecurringTasksContainerProps {
  isLoading: boolean;
  recurringTasks: RecurringTask[];
  taskInstances: TaskInstance[];
  refreshData: () => void;
}

export const RecurringTasksContainer: React.FC<RecurringTasksContainerProps> = ({
  isLoading, recurringTasks, taskInstances, refreshData
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecurringTasksList 
        recurringTasks={recurringTasks} 
        isLoading={isLoading} 
      />
      <TaskInstancesList 
        taskInstances={taskInstances} 
        isLoading={isLoading} 
        onStatusChange={refreshData}
      />
    </div>
  );
};
