
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AddTeamMemberForm } from './AddTeamMemberForm';

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
  useEffect(() => {
    const fetchUserAccess = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('nivel_acesso')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          if (data) {
            setCurrentUserAccess(data.nivel_acesso || null);
          }
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
      // Generate a UUID for the new member
      const newMemberId = crypto.randomUUID();
      
      // Insert with explicit ID to fix TypeScript error
      const memberData = {
        id: newMemberId,
        nome: novoMembro.nome,
        cargo: novoMembro.cargo || 'Colaborador',
        departamento_id: novoMembro.departamento || null,
        avatar_url: novoMembro.avatar_url || null,
        nivel_acesso: novoMembro.nivel_acesso
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([memberData])
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
        
        <AddTeamMemberForm
          novoMembro={novoMembro}
          setNovoMembro={setNovoMembro}
          departamentos={departamentos}
          canManageAccessLevels={canManageAccessLevels}
          currentUserAccess={currentUserAccess}
        />
        
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
