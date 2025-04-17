
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

  const getTaskPriorityColors = () => {
    const taskPriorities: {
      [key: string]: string;
    } = {};
    allTasks.forEach(task => {
      const dateKey = startOfDay(new Date(task.dueDate)).toISOString();

      if (!taskPriorities[dateKey] || 
          (task.priority === 'high' && taskPriorities[dateKey] !== 'high') || 
          (task.priority === 'medium' && taskPriorities[dateKey] === 'low')) {
        taskPriorities[dateKey] = task.priority;
      }
    });
    return taskPriorities;
  };
  const taskPriorityColors = getTaskPriorityColors();

  const getPriorityColor = (dateKey: string) => {
    const priority = taskPriorityColors[dateKey];
    if (priority === 'high') return 'bg-[#EF4444]/40 text-[#EF4444] border border-[#EF4444]/30 dark:bg-red-500/40 dark:text-red-600 dark:border-red-500/30';
    if (priority === 'medium') return 'bg-[#FACC15]/40 text-[#B45309] border border-[#FACC15]/30 dark:bg-amber-500/40 dark:text-amber-600 dark:border-amber-500/30';
    return 'bg-[#10B981]/40 text-[#047857] border border-[#10B981]/30 dark:bg-blue-500/40 dark:text-blue-600 dark:border-blue-500/30';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] dark:bg-[#0c0e16] dark:border-[#202330]/50 overflow-hidden transition-all duration-200">
      <Calendar
        mode="single"
        selected={date}
        onSelect={newDate => newDate && setDate(newDate)}
        locale={ptBR}
        classNames={{
          months: "flex flex-col space-y-4",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center px-10",
          caption_label: "text-sm font-medium text-[#005B99] dark:text-white",
          nav: "space-x-1 flex items-center",
          nav_button: "h-7 w-7 bg-transparent p-0 hover:bg-[#D0E9FF] dark:hover:bg-[#202330] rounded-full text-[#005B99] dark:text-white transition-colors duration-200",
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-[#6B7280] rounded-md w-9 font-normal text-[0.8rem] dark:text-white/50",
          row: "flex w-full mt-2",
          cell: "text-center text-sm p-0 relative h-9 w-9 hover:bg-[#D0E9FF]/50 dark:hover:bg-[#202330]/50 transition-colors duration-200 focus-within:relative focus-within:z-20",
          day: "h-9 w-9 p-0 font-normal text-[#6B7280] dark:text-white hover:bg-[#D0E9FF] dark:hover:bg-[#202330] rounded-full transition-colors duration-200",
          day_selected: "bg-[#005B99] text-white hover:bg-[#00487A] hover:text-white focus:bg-[#005B99] focus:text-white dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700",
          day_today: "bg-[#D0E9FF] text-[#005B99] ring-2 ring-[#005B99]/50 dark:bg-[#202330] dark:text-white dark:ring-purple-500/50",
          day_outside: "text-[#6B7280]/30 dark:text-white/30 opacity-50",
          day_disabled: "text-[#6B7280]/30 dark:text-white/30 opacity-50",
          day_hidden: "invisible",
        }}
        components={{
          Day: ({ date: day, ...props }) => (
            <button
              {...props}
              className={cn(
                "calendar-cell w-9 h-9 p-0 rounded-full hover:bg-[#D0E9FF] dark:hover:bg-[#202330] focus:outline-none transition-all duration-200",
                isSameDay(day, date) && "bg-[#005B99] text-white hover:bg-[#00487A] dark:bg-purple-500 dark:text-white dark:hover:bg-purple-600"
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
                        "h-1.5 w-1.5 p-0 rounded-full animate-pulse",
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
