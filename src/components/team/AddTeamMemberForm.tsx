
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface AddTeamMemberFormProps {
  novoMembro: {
    nome: string;
    cargo: string;
    departamento: string;
    email: string;
    avatar_url: string;
    nivel_acesso: 'SuperAdmin' | 'Admin' | 'Supervisor' | 'user';
  };
  setNovoMembro: React.Dispatch<React.SetStateAction<{
    nome: string;
    cargo: string;
    departamento: string;
    email: string;
    avatar_url: string;
    nivel_acesso: 'SuperAdmin' | 'Admin' | 'Supervisor' | 'user';
  }>>;
  departamentos: Array<{ id: string; nome: string }>;
  canManageAccessLevels: boolean;
  currentUserAccess: string | null;
}

export const AddTeamMemberForm: React.FC<AddTeamMemberFormProps> = ({
  novoMembro,
  setNovoMembro,
  departamentos,
  canManageAccessLevels,
  currentUserAccess
}) => {
  return (
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
  );
};
