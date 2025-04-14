
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { teamMembers, getTasksByAssignee } from '@/data/mock-data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Mail, Phone } from 'lucide-react';

const TeamPage = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Membros da Equipe</h1>
            <p className="text-muted-foreground">Gerencie os membros da sua equipe e suas funções.</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Adicionar Membro
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teamMembers.map((member) => {
            const tasks = getTasksByAssignee(member.id);
            const tasksCount = tasks.length;
            const completedTasks = tasks.filter(task => task.status === 'completed').length;
            
            return (
              <Card key={member.id} className="hover-scale">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold">{member.name}</h3>
                    <p className="text-muted-foreground">{member.role}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Badge variant="outline">{member.department}</Badge>
                    </div>
                    <div className="w-full mt-4 border-t pt-4">
                      <div className="flex justify-between text-sm">
                        <span>Tarefas:</span>
                        <span>{completedTasks} / {tasksCount}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="w-full">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm" className="w-full">
                        <Phone className="h-4 w-4 mr-2" />
                        Ligar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default TeamPage;
