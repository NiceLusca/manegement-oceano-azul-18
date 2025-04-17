
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Check, Settings, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DashboardConfig({ open, onOpenChange }: DashboardConfigProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  // Config states
  const [showProjects, setShowProjects] = useState(true);
  const [showTeam, setShowTeam] = useState(true);
  const [showMetrics, setShowMetrics] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5);
  
  const handleSave = () => {
    setSaving(true);
    
    // Simulate saving configuration
    setTimeout(() => {
      setSaving(false);
      onOpenChange(false);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações do dashboard foram atualizadas com sucesso.",
        icon: <Check className="h-4 w-4" />,
      });
    }, 800);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Dashboard
          </DialogTitle>
          <DialogDescription>
            Personalize os componentes e o comportamento do seu dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="widgets">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="widgets">Componentes</TabsTrigger>
            <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          </TabsList>
          
          <TabsContent value="widgets" className="py-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-projects" className="font-medium">Projetos</Label>
                  <p className="text-sm text-muted-foreground">Exibir resumo de projetos e carrossel</p>
                </div>
                <Switch id="show-projects" checked={showProjects} onCheckedChange={setShowProjects} />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-team" className="font-medium">Equipe</Label>
                  <p className="text-sm text-muted-foreground">Exibir informações sobre a equipe</p>
                </div>
                <Switch id="show-team" checked={showTeam} onCheckedChange={setShowTeam} />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-metrics" className="font-medium">Métricas</Label>
                  <p className="text-sm text-muted-foreground">Exibir indicadores de performance</p>
                </div>
                <Switch id="show-metrics" checked={showMetrics} onCheckedChange={setShowMetrics} />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-activity" className="font-medium">Atividades Recentes</Label>
                  <p className="text-sm text-muted-foreground">Exibir feed de atividades recentes</p>
                </div>
                <Switch id="show-activity" checked={showActivity} onCheckedChange={setShowActivity} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="behavior" className="py-4 space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-refresh" className="font-medium">Atualização Automática</Label>
                  <p className="text-sm text-muted-foreground">Atualizar dados automaticamente</p>
                </div>
                <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>
              
              {autoRefresh && (
                <>
                  <Separator />
                  
                  <div className="space-y-2">
                    <Label htmlFor="refresh-interval" className="font-medium">Intervalo de Atualização</Label>
                    <div className="flex space-x-2">
                      <Button 
                        variant={refreshInterval === 1 ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setRefreshInterval(1)}
                      >
                        1 min
                      </Button>
                      <Button 
                        variant={refreshInterval === 5 ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setRefreshInterval(5)}
                      >
                        5 min
                      </Button>
                      <Button 
                        variant={refreshInterval === 15 ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setRefreshInterval(15)}
                      >
                        15 min
                      </Button>
                      <Button 
                        variant={refreshInterval === 30 ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setRefreshInterval(30)}
                      >
                        30 min
                      </Button>
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex items-center space-x-2 rounded-md border border-amber-200/30 bg-amber-50/10 p-3 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <p className="text-amber-400">A atualização em tempo real consome mais recursos de rede.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
