
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { teamMembers, getTasksByAssignee } from '@/data/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, Eye, Plus, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from "@/integrations/supabase/client";

type Departamento = {
  id: string;
  nome: string;
  cor: string | null;
};

export function TeamOverview() {
  const [nivelAcesso] = React.useState("admin"); // Em uma aplicação real, viria de um contexto de autenticação
  const [showAll, setShowAll] = React.useState(false);
  const [departamentos, setDepartamentos] = useState<Record<string, Departamento>>({});
  
  const filteredMembers = teamMembers
    .filter(member => member.status === 'active')
    .slice(0, showAll ? undefined : 5);
    
  const isAdmin = nivelAcesso === "admin";
  const isManager = nivelAcesso === "admin" || nivelAcesso === "manager";
  
  // Mapeamento dos membros da equipe que são líderes (para exibir o ícone de estrela)
  const teamLeads = new Set(teamMembers.filter(member => member.role.toLowerCase().includes('lead')).map(member => member.id));
  
  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        const { data } = await supabase
          .from('departamentos')
          .select('*');
        
        if (data) {
          const depMap = data.reduce((acc: Record<string, Departamento>, dep) => {
            acc[dep.id] = dep;
            return acc;
          }, {});
          setDepartamentos(depMap);
        }
      } catch (error) {
        console.error('Erro ao buscar departamentos:', error);
      }
    };

    fetchDepartamentos();
  }, []);

  // Função para obter a cor do departamento
  const getDepartmentColor = (departmentName: string) => {
    const department = Object.values(departamentos).find(d => d.nome === departmentName);
    return department?.cor || null;
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Membros da Equipe</CardTitle>
        {isAdmin && (
          <Button variant="outline" size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-1" /> Adicionar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredMembers.map((member) => {
            const assignedTasks = getTasksByAssignee(member.id);
            const tasksCount = assignedTasks.length;
            const completedTasks = assignedTasks.filter(task => task.status === 'completed').length;
            const progress = tasksCount > 0 ? (completedTasks / tasksCount) * 100 : 0;
            const departmentColor = getDepartmentColor(member.department);
            
            return (
              <div key={member.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-1">
                        {member.name}
                        {teamLeads.has(member.id) && <Star className="h-3 w-3 text-amber-500" fill="currentColor" />}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.role}
                        <span className="inline-block ml-2">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] py-0 h-4",
                              departmentColor 
                                ? { backgroundColor: `${departmentColor}20`, borderColor: `${departmentColor}40`, color: departmentColor } 
                                : {
                                    "bg-blue-100 text-blue-800 border-blue-200": member.department === "Desenvolvimento",
                                    "bg-pink-100 text-pink-800 border-pink-200": member.department === "Design",
                                    "bg-green-100 text-green-800 border-green-200": member.department === "Marketing",
                                    "bg-orange-100 text-orange-800 border-orange-200": member.department === "Vendas",
                                    "bg-purple-100 text-purple-800 border-purple-200": member.department === "Recursos Humanos",
                                  }
                            )}
                          >
                            {member.department}
                          </Badge>
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{completedTasks}/{tasksCount}</p>
                    <p className="text-xs text-muted-foreground">Tarefas</p>
                  </div>
                </div>
                
                {isManager && (
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className="h-2 flex-1" />
                    <div className="flex items-center gap-1">
                      {isAdmin && (
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600">
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {teamMembers.filter(member => member.status === 'active').length > 5 && (
            <Button 
              variant="ghost" 
              className="w-full text-muted-foreground" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Mostrar menos" : "Ver todos os membros"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
