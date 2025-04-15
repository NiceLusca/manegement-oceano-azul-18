
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DepartmentProgress } from '@/components/dashboard/DepartmentProgress';

interface DepartmentProgressSectionProps {
  departmentStats: {
    department: string;
    tasksCompleted: number;
    tasksTotal: number;
    color: string;
  }[];
}

export const DepartmentProgressSection: React.FC<DepartmentProgressSectionProps> = ({
  departmentStats
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso por Departamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {departmentStats.map(dept => (
          <DepartmentProgress 
            key={dept.department} 
            department={dept.department} 
            tasksCompleted={dept.tasksCompleted} 
            tasksTotal={dept.tasksTotal} 
            color={dept.color} 
          />
        ))}
        {departmentStats.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            Nenhum departamento encontrado.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
