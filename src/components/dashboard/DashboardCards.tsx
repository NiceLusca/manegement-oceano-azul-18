
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Users, Calendar, Settings, TrendingUp, Target, AlertTriangle } from 'lucide-react';

interface DashboardCardsProps {
  teamMembers: any[];
  getTasksByAssignee: (id: string) => any[];
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ 
  teamMembers,
  getTasksByAssignee
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="ocean-card">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="h-5 w-5 text-oceano-medio" /> Projetos
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total de Projetos</span>
              <span className="font-bold text-foreground">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Em Andamento</span>
              <span className="font-bold text-primary">7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Concluídos este mês</span>
              <span className="font-bold text-oceano-escuro">3</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary">Ver todos os projetos</Button>
        </CardContent>
      </Card>
      
      <Card className="ocean-card">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-oceano-medio" /> Equipe
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Membros Ativos</span>
              <span className="font-bold text-foreground">15</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Membros de Férias</span>
              <span className="font-bold text-oceano-escuro">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxa de Produtividade</span>
              <span className="font-bold text-primary">87%</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary">Gerenciar equipe</Button>
        </CardContent>
      </Card>
      
      <Card className="ocean-card">
        <CardHeader className="border-b border-border/20">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-oceano-medio" /> Agenda
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reuniões Hoje</span>
              <span className="font-bold text-primary">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Próximas Entregas</span>
              <span className="font-bold text-foreground">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Eventos esta Semana</span>
              <span className="font-bold text-oceano-escuro">8</span>
            </div>
          </div>
          <Button variant="outline" className="w-full mt-4 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary">Ver calendário</Button>
        </CardContent>
      </Card>
    </div>
  );
};
