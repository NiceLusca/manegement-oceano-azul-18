
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AccessLevelSelectorProps {
  accessLevel: string;
  onAccessLevelChange: (level: string) => void;
}

export const AccessLevelSelector: React.FC<AccessLevelSelectorProps> = ({
  accessLevel,
  onAccessLevelChange
}) => {
  return (
    <Select value={accessLevel} onValueChange={onAccessLevelChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Nível de acesso" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Administrador</SelectItem>
        <SelectItem value="manager">Gerente</SelectItem>
        <SelectItem value="user">Usuário</SelectItem>
      </SelectContent>
    </Select>
  );
};
