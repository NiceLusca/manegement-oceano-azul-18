
import React from 'react';
import { Layout } from '@/components/Layout';
import { DashboardStats } from '@/components/DashboardStats';
import { RecentActivity } from '@/components/RecentActivity';
import { ProjectsOverview } from '@/components/ProjectsOverview';
import { TeamOverview } from '@/components/TeamOverview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from '@/components/ui/menubar';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-lg bg-secondary/50 p-4">
          <div>
            <h1 className="text-3xl font-bold ocean-text-gradient">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo ao seu painel de gerenciamento de equipe.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Menubar className="border-border/30 bg-background/80 backdrop-blur-sm">
              <MenubarMenu>
                <MenubarTrigger className="gap-1 text-primary hover:bg-primary/10">
                  <Bell className="h-4 w-4" />
                  <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center border-primary/30 text-primary">
                    3
                  </Badge>
                </MenubarTrigger>
                <MenubarContent className="bg-background/95 backdrop-blur-md border-border/30">
                  <MenubarItem>Novo comentário em Projeto A</MenubarItem>
                  <MenubarItem>2 tarefas atrasadas</MenubarItem>
                  <MenubarItem>Maria adicionou novo documento</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem className="text-primary font-medium">Ver todas as notificações</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
            
            <Menubar className="border-border/30 bg-background/80 backdrop-blur-sm">
              <MenubarMenu>
                <MenubarTrigger className="gap-1 text-foreground hover:bg-primary/10">
                  Usuário <ChevronDown className="h-4 w-4" />
                </MenubarTrigger>
                <MenubarContent className="bg-background/95 backdrop-blur-md border-border/30">
                  <MenubarItem>Perfil</MenubarItem>
                  <MenubarItem>Configurações</MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem>
                    Nível de Acesso: 
                    <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">
                      {nivelAcesso === "admin" ? "Administrador" : nivelAcesso === "manager" ? "Gerente" : "Usuário"}
                    </Badge>
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem className="text-destructive">Sair</MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>
        
        <DashboardStats />
        
        {isAdmin && <div className="relative px-4 -mx-4">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Resumo de Projetos em Destaque</h2>
            <Carousel className="w-full">
              <CarouselContent>
                {[1, 2, 3, 4].map(item => <CarouselItem key={item} className="basis-full sm:basis-1/2 lg:basis-1/3">
                    <Card className="ocean-card">
                      <CardHeader className="pb-2 border-b border-border/20">
                        <CardTitle className="text-lg text-foreground">Projeto {item}</CardTitle>
                        <CardDescription>Descrição breve do projeto</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-foreground">Progresso:</span>
                            <span className="text-sm text-primary font-semibold">{65 + item * 5}%</span>
                          </div>
                          <Progress value={65 + item * 5} className="h-2" />
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>Prazo: 15 dias</span>
                            <span>12/18 tarefas</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>)}
              </CarouselContent>
              <CarouselPrevious className="left-0 bg-background/90 border-border/30 text-primary hover:bg-primary/10 hover:text-primary" />
              <CarouselNext className="right-0 bg-background/90 border-border/30 text-primary hover:bg-primary/10 hover:text-primary" />
            </Carousel>
          </div>}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProjectsOverview />
          <div className="space-y-6">
            <TeamOverview />
            <RecentActivity />
          </div>
        </div>
        
        {isManager && <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>}
        
        {isAdmin && <div className="flex justify-end mt-8">
            <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary">
              <Settings className="h-4 w-4" /> Configurar Dashboard
            </Button>
          </div>}
      </div>
    </Layout>
  );
};

export default Index;
