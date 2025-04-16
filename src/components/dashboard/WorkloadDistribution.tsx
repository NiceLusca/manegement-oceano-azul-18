
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamMember } from '@/types';

interface WorkloadDistributionProps {
  teamMembers: TeamMember[];
  getTasksByAssignee: (id: string) => any[];
}

export function WorkloadDistribution({ 
  teamMembers,
  getTasksByAssignee 
}: WorkloadDistributionProps) {
  const [chartData, setChartData] = useState<{ name: string; value: number; id: string; color: string }[]>([]);
  
  useEffect(() => {
    // Generate chart data
    const data = teamMembers.map((member) => {
      const tasks = getTasksByAssignee(member.id);
      return {
        name: member.name,
        value: tasks.length,
        id: member.id,
        color: getRandomColor(member.id)
      };
    }).filter(item => item.value > 0);
    
    setChartData(data);
  }, [teamMembers, getTasksByAssignee]);
  
  // Generate a repeatable color based on string
  const getRandomColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 shadow-sm rounded-sm text-xs">
          <p>{`${payload[0].name}: ${payload[0].value} tarefas`}</p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Distribuição de Tarefas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center h-[220px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Sem dados de tarefas para exibir
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
