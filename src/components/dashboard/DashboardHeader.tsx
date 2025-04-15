
import React from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from '@/components/ui/menubar';

interface DashboardHeaderProps {
  nivelAcesso: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ nivelAcesso }) => {
  return (
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
  );
};
