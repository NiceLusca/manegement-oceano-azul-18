
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Check, Eye, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMemberOverviewProps {
  member: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    department: string;
    status: string;
  };
  departmentColor: string | null;
  tasks: {
    id: string;
    title: string;
    status: string;
  }[];
  isAdmin: boolean;
  isManager: boolean;
  teamLeads: Set<string>;
}

export const TeamMemberOverview: React.FC<TeamMemberOverviewProps> = ({
  member,
  departmentColor,
  tasks,
  isAdmin,
  isManager,
  teamLeads
}) => {
  const tasksCount = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const progress = tasksCount > 0 ? (completedTasks / tasksCount) * 100 : 0;
  
  return (
    <div className="space-y-2">
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
};
