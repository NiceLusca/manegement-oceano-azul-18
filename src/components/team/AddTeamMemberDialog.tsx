
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departamentos: Array<{ id: string; nome: string }>;
}

export const AddTeamMemberDialog: React.FC<AddTeamMemberDialogProps> = ({
  open,
  onOpenChange,
  departamentos
}) => {
  const [novoMembro, setNovoMembro] = useState({
    nome: '',
    cargo: '',
    departamento: '',
    email: '',
    avatar_url: '',
    nivel_acesso: 'user' as 'SuperAdmin' | 'Admin' | 'Supervisor' | 'user'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentUserAccess, setCurrentUserAccess] = useState<string | null>(null);

  // Buscar nível de acesso do usuário atual
  React.useEffect(() => {
    const fetchUserAccess = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('nivel_acesso')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          setCurrentUserAccess(data?.nivel_acesso || null);
        } catch (error) {
          console.error('Erro ao buscar nível de acesso:', error);
        }
      }
    };
    
    fetchUserAccess();
  }, [user]);

  const handleAddMember = async () => {
    // Validate required fields
    if (!novoMembro.nome.trim() || !novoMembro.email.trim()) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Insert directly into profiles with a generated UUID
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            nome: novoMembro.nome,
            cargo: novoMembro.cargo || 'Colaborador',
            departamento_id: novoMembro.departamento || null,
            avatar_url: novoMembro.avatar_url || null,
            nivel_acesso: novoMembro.nivel_acesso
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Novo membro adicionado com sucesso!",
        variant: "default"
      });

      // Limpa os campos e fecha o diálogo
      setNovoMembro({
        nome: '',
        cargo: '',
        departamento: '',
        email: '',
        avatar_url: '',
        nivel_acesso: 'user'
      });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erro ao adicionar membro:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o membro: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Verificar se o usuário atual tem acesso para alterar nível de acesso
  const canManageAccessLevels = currentUserAccess === 'SuperAdmin' || currentUserAccess === 'Admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Membro</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para adicionar um novo membro à equipe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nome" className="text-right">
              Nome
            </Label>
            <Input
              id="nome"
              value={novoMembro.nome}
              onChange={(e) => setNovoMembro({...novoMembro, nome: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={novoMembro.email}
              onChange={(e) => setNovoMembro({...novoMembro, email: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cargo" className="text-right">
              Cargo
            </Label>
            <Input
              id="cargo"
              value={novoMembro.cargo}
              onChange={(e) => setNovoMembro({...novoMembro, cargo: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="avatar" className="text-right">
              URL Avatar
            </Label>
            <Input
              id="avatar"
              type="url"
              value={novoMembro.avatar_url}
              onChange={(e) => setNovoMembro({...novoMembro, avatar_url: e.target.value})}
              className="col-span-3"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="departamento" className="text-right">
              Departamento
            </Label>
            <Select
              value={novoMembro.departamento}
              onValueChange={(value) => setNovoMembro({...novoMembro, departamento: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione um departamento" />
              </SelectTrigger>
              <SelectContent>
                {departamentos.map((dep) => (
                  <SelectItem key={dep.id} value={dep.id}>
                    {dep.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {canManageAccessLevels && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nivel_acesso" className="text-right">
                Nível de Acesso
              </Label>
              <Select
                value={novoMembro.nivel_acesso}
                onValueChange={(value: 'SuperAdmin' | 'Admin' | 'Supervisor' | 'user') => 
                  setNovoMembro({...novoMembro, nivel_acesso: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o nível de acesso" />
                </SelectTrigger>
                <SelectContent>
                  {currentUserAccess === 'SuperAdmin' && (
                    <SelectItem value="SuperAdmin">Super Administrador</SelectItem>
                  )}
                  <SelectItem value="Admin">Administrador</SelectItem>
                  <SelectItem value="Supervisor">Supervisor</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleAddMember} disabled={isSubmitting}>
            {isSubmitting ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
