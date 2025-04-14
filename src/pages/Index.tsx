
import React from 'react';
import { Layout } from '@/components/Layout';
import { DashboardStats } from '@/components/DashboardStats';
import { RecentActivity } from '@/components/RecentActivity';
import { ProjectsOverview } from '@/components/ProjectsOverview';
import { TeamOverview } from '@/components/TeamOverview';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger
} from '@/components/ui/menubar';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Briefcase, Users, Bell, Calendar, Settings, ChevronDown } from 'lucide-react';

const Index = () => {
  const [nivelAcesso] = React.useState("admin"); // Em uma aplicação real, viria de um contexto de autenticação
  
  const isAdmin = nivelAcesso === "admin";
  const isManager = nivelAcesso === "admin" || nivelAcesso === "manager";
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo ao seu painel de gerenciamento de equipe.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger className="gap-1">
                  <Bell className="h-4 w-4" />
                  <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center">
                    3
                  </Badge>
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Novo comentário em Projeto A</MenubarItem>
                  <MenubarItem>2 tarefas atrasadas</MenubarItem>
                  <MenubarItem>Maria adicionou novo documento</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Ver todas as notificações</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
            
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger className="gap-1">
                  Usuário <ChevronDown className="h-4 w-4" />
                </MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>Perfil</MenubarItem>
                  <MenubarItem>Configurações</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    Nível de Acesso: 
                    <Badge className="ml-2">
                      {nivelAcesso === "admin" ? "Administrador" : 
                       nivelAcesso === "manager" ? "Gerente" : "Usuário"}
                    </Badge>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>Sair</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>
        
        <DashboardStats />
        
        {isAdmin && (
          <div className="relative px-4 -mx-4">
            <h2 className="text-xl font-semibold mb-4">Resumo de Projetos em Destaque</h2>
            <Carousel className="w-full">
              <CarouselContent>
                {[1, 2, 3, 4].map((item) => (
                  <CarouselItem key={item} className="basis-full sm:basis-1/2 lg:basis-1/3">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Projeto {item}</CardTitle>
                        <CardDescription>Descrição breve do projeto</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Progresso:</span>
                            <span className="text-sm">{65 + item * 5}%</span>
                          </div>
                          <Progress value={65 + item * 5} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Prazo: 15 dias</span>
                            <span>12/18 tarefas</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectsOverview />
          <div className="space-y-6">
            <TeamOverview />
            <RecentActivity />
          </div>
        </div>
        
        {isManager && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" /> Projetos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total de Projetos</span>
                    <span className="font-bold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Em Andamento</span>
                    <span className="font-bold">7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Concluídos este mês</span>
                    <span className="font-bold">3</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">Ver todos os projetos</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Equipe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Membros Ativos</span>
                    <span className="font-bold">15</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Membros de Férias</span>
                    <span className="font-bold">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de Produtividade</span>
                    <span className="font-bold">87%</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">Gerenciar equipe</Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" /> Agenda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Reuniões Hoje</span>
                    <span className="font-bold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Próximas Entregas</span>
                    <span className="font-bold">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Eventos esta Semana</span>
                    <span className="font-bold">8</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">Ver calendário</Button>
              </CardContent>
            </Card>
          </div>
        )}
        
        {isAdmin && (
          <div className="flex justify-end">
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" /> Configurar Dashboard
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Index;
