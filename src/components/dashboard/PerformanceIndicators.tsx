
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, AlertTriangle } from 'lucide-react';

export const PerformanceIndicators: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Indicadores de Desempenho</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            <span>Produtividade da Equipe</span>
          </div>
          <span className="font-bold">92%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-blue-500" />
            <span>Metas Atingidas</span>
          </div>
          <span className="font-bold">78%</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            <span>Tarefas em Atraso</span>
          </div>
          <span className="font-bold">5</span>
        </div>
      </CardContent>
    </Card>
  );
};
