
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { format, startOfDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

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
      if (!taskPriorities[dateKey] || 
          (task.priority === 'high' && taskPriorities[dateKey] !== 'high') || 
          (task.priority === 'medium' && taskPriorities[dateKey] === 'low')) {
        taskPriorities[dateKey] = task.priority;
      }
    });
    return taskPriorities;
  };
  const taskPriorityColors = getTaskPriorityColors();

  // Get color based on priority
  const getPriorityColor = (dateKey: string) => {
    const priority = taskPriorityColors[dateKey];
    if (priority === 'high') return 'bg-red-500/30 text-red-500';
    if (priority === 'medium') return 'bg-amber-500/30 text-amber-500';
    return 'bg-blue-500/30 text-blue-500';
  };

  return (
    <div className="bg-[#0c0e16] rounded-lg shadow-sm border border-[#202330]/50">
      <Calendar
        mode="single"
        selected={date}
        onSelect={newDate => newDate && setDate(newDate)}
        locale={ptBR}
        classNames={{
          months: "flex flex-col space-y-4",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center px-10",
          caption_label: "text-sm font-medium text-white",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 hover:bg-[#202330] rounded-full text-white",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-white/50",
          row: "flex w-full mt-2",
          cell: "text-center text-sm p-0 relative h-9 w-9 focus-within:relative focus-within:z-20",
          day: "h-9 w-9 p-0 font-normal text-white hover:bg-[#202330] rounded-full",
          day_selected: "bg-purple-500 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-500 focus:text-white",
          day_today: "bg-[#202330] text-white",
          day_outside: "text-white/30 opacity-50",
          day_disabled: "text-white/30 opacity-50",
          day_hidden: "invisible",
        }}
        components={{
          Day: ({ date: day, ...props }) => (
            <button
              {...props}
              className={cn(
                "calendar-cell w-9 h-9 p-0 rounded-full hover:bg-[#202330] focus:outline-none",
                isSameDay(day, date) && "bg-purple-500 text-white hover:bg-purple-600"
              )}
            >
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <time dateTime={format(day, 'yyyy-MM-dd')} className="text-xs sm:text-sm">
                  {format(day, 'd')}
                </time>
                {allTasks.some(task => isSameDay(new Date(task.dueDate), day)) && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "h-1.5 w-1.5 p-0 rounded-full",
                        getPriorityColor(startOfDay(day).toISOString())
                      )} 
                    />
                  </div>
                )}
              </div>
            </button>
          )
        }}
      />
    </div>
  );
};
