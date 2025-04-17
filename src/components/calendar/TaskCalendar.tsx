import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, startOfDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Task } from '@/types';
interface TaskCalendarProps {
  date: Date;
  setDate: (date: Date) => void;
  allTasks: Task[];
}
export const TaskCalendar: React.FC<TaskCalendarProps> = ({
  date,
  setDate,
  allTasks
}) => {
  // Get dates with tasks for highlighting in calendar
  const getDatesWithTasks = () => {
    const datesWithTasks = allTasks.reduce<{
      [key: string]: number;
    }>((acc, task) => {
      const dateKey = startOfDay(new Date(task.dueDate)).toISOString();
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});
    return datesWithTasks;
  };
  const datesWithTasks = getDatesWithTasks();

  // Get priority colors for tasks
  const getTaskPriorityColors = () => {
    const taskPriorities: {
      [key: string]: string;
    } = {};
    allTasks.forEach(task => {
      const dateKey = startOfDay(new Date(task.dueDate)).toISOString();

      // Determine highest priority for the day
      if (!taskPriorities[dateKey] || task.priority === 'high' && taskPriorities[dateKey] !== 'high' || task.priority === 'medium' && taskPriorities[dateKey] === 'low') {
        taskPriorities[dateKey] = task.priority;
      }
    });
    return taskPriorities;
  };
  const taskPriorityColors = getTaskPriorityColors();

  // Get color based on priority
  const getPriorityColor = (dateKey: string) => {
    const priority = taskPriorityColors[dateKey];
    if (priority === 'high') return 'bg-red-500';
    if (priority === 'medium') return 'bg-amber-500';
    return 'bg-blue-500';
  };

  // Custom day renderer for the calendar
  const renderDay = (day: Date) => {
    const dateKey = startOfDay(day).toISOString();
    const taskCount = datesWithTasks[dateKey] || 0;
    const priorityColor = getPriorityColor(dateKey);
    return <div className="relative p-0 calendar-day w-full h-full flex flex-col items-center justify-center">
        <time dateTime={format(day, 'yyyy-MM-dd')} className="text-xs sm:text-sm">
          {format(day, 'd')}
        </time>
        {taskCount > 0 && <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1 items-center">
            <Badge variant="outline" className={`h-1.5 w-1.5 p-0 rounded-full ${priorityColor}`} />
            {taskCount > 1 && <span className="text-[10px] font-medium">{taskCount}</span>}
          </div>}
      </div>;
  };
  return <Calendar mode="single" selected={date} onSelect={newDate => newDate && setDate(newDate)} locale={ptBR} modifiers={{
    today: new Date()
  }} modifiersStyles={{
    today: {
      fontWeight: 'bold',
      color: 'hsl(var(--primary))'
    }
  }} components={{
    Day: ({
      date: day,
      ...props
    }) => <button {...props} className="calendar-cell w-7 h-7 p-0 sm:w-8 sm:h-8 md:w-9 md:h-9">
            {renderDay(day)}
          </button>
  }} className="rounded-md border p-3 bg-card/50 border-border/50 pointer-events-auto px-0" />;
};