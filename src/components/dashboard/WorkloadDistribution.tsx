
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamMember } from '@/types';
import { Badge } from '@/components/ui/badge';
import { InfoCircle } from 'lucide-react';

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
    // Generate chart data with consistent colors
    const predefinedColors = [
      '#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', 
      '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad'
    ];
    
    const data = teamMembers.map((member, index) => {
      const tasks = getTasksByAssignee(member.id);
      return {
        name: member.name,
        value: tasks.length,
        id: member.id,
        color: predefinedColors[index % predefinedColors.length]
      };
    }).filter(item => item.value > 0);
    
    setChartData(data);
  }, [teamMembers, getTasksByAssignee]);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 shadow-md rounded-md text-sm border border-border/50">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-muted-foreground">{payload[0].value} tarefas</p>
        </div>
      );
    }
    
    return null;
  };
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={chartData[index]?.color} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    );
  };
  
  return (
    <Card className="col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          Distribuição de Tarefas
          <Badge variant="outline" className="text-xs font-normal">
            Por membro
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center h-[260px] w-full">
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
                  labelLine={false}
                  label={renderCustomizedLabel}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
              <InfoCircle className="h-12 w-12 text-muted-foreground/50" />
              <p>Sem dados de tarefas para exibir</p>
              <p className="text-xs">Atribua tarefas aos membros da equipe para visualizar a distribuição</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
