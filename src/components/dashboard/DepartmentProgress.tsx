
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface DepartmentProgressProps {
  department: string;
  tasksCompleted: number;
  tasksTotal: number;
  color: string;
}

export function DepartmentProgress({
  department,
  tasksCompleted,
  tasksTotal,
  color
}: DepartmentProgressProps) {
  const progress = tasksTotal > 0 ? Math.round(tasksCompleted / tasksTotal * 100) : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{department}</span>
        <span className="text-sm text-muted-foreground">{tasksCompleted}/{tasksTotal}</span>
      </div>
      <Progress value={progress} className="h-2" indicatorClassName={color} />
    </div>
  );
}
