
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { EditMemberFormData } from '@/hooks/useTeamMembers';

interface EditMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEditMember: () => void;
  editMembro: EditMemberFormData;
  setEditMembro: React.Dispatch<React.SetStateAction<EditMemberFormData>>;
  departamentos: Array<{ id: string; nome: string }>;
  userAccess?: string;
}

export const EditMemberDialog: React.FC<EditMemberDialogProps> = ({
  open,
  onOpenChange,
  onEditMember,
  editMembro,
  setEditMembro,
  departamentos,
  userAccess = 'user'
}) => {
  const canEditAccessLevel = userAccess === 'SuperAdmin' || userAccess === 'Admin';
  
  // SuperAdmin pode editar todos os níveis, Admin não pode promover para SuperAdmin
  const canPromoteToSuperAdmin = userAccess === 'SuperAdmin';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Membro</DialogTitle>
          <DialogDescription>
            Atualize as informações do membro da equipe.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-nome" className="text-right">
              Nome
            </Label>
            <Input
              id="edit-nome"
              value={editMembro.nome}
              onChange={(e) => setEditMembro({...editMembro, nome: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-cargo" className="text-right">
              Cargo
            </Label>
            <Input
              id="edit-cargo"
              value={editMembro.cargo}
              onChange={(e) => setEditMembro({...editMembro, cargo: e.target.value})}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-avatar" className="text-right">
              URL Avatar
            </Label>
            <Input
              id="edit-avatar"
              type="url"
              value={editMembro.avatar_url}
              onChange={(e) => setEditMembro({...editMembro, avatar_url: e.target.value})}
              className="col-span-3"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-departamento" className="text-right">
              Departamento
            </Label>
            <Select
              value={editMembro.departamento}
              onValueChange={(value) => setEditMembro({...editMembro, departamento: value})}
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
          
          {canEditAccessLevel && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-nivel-acesso" className="text-right">
                Nível de Acesso
              </Label>
              <Select
                value={editMembro.nivel_acesso}
                onValueChange={(value: 'SuperAdmin' | 'Admin' | 'Supervisor' | 'user') => 
                  setEditMembro({...editMembro, nivel_acesso: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o nível de acesso" />
                </SelectTrigger>
                <SelectContent>
                  {canPromoteToSuperAdmin && (
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onEditMember}>
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
