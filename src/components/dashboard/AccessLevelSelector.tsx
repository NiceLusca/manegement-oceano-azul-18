
import React, { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AccessLevelSelectorProps {
  accessLevel: string;
  onAccessLevelChange: (level: string) => void;
}

export const AccessLevelSelector: React.FC<AccessLevelSelectorProps> = ({
  accessLevel,
  onAccessLevelChange
}) => {
  const { user } = useAuth();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkPermissions = async () => {
      if (!user?.id) return;
      
      try {
        // Check access level
        const { data: accessLevel, error } = await supabase
          .rpc('get_user_nivel_acesso', { user_id: user.id });
          
        if (error) {
          console.error('Error checking access level:', error);
          return;
        }
          
        if (accessLevel === 'SuperAdmin') {
          setIsSuperAdmin(true);
          setIsAdmin(true);
          return;
        }
        
        setIsAdmin(accessLevel === 'Admin');
      } catch (error) {
        console.error('Error checking permissions:', error);
      }
    };
    
    checkPermissions();
  }, [user]);

  return (
    <Select value={accessLevel} onValueChange={onAccessLevelChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Nível de acesso" />
      </SelectTrigger>
      <SelectContent>
        {isSuperAdmin && (
          <SelectItem value="SuperAdmin">Administrador</SelectItem>
        )}
        <SelectItem value="Admin">Gerente</SelectItem>
        <SelectItem value="Supervisor">Supervisor</SelectItem>
        <SelectItem value="user">Usuário</SelectItem>
      </SelectContent>
    </Select>
  );
};
