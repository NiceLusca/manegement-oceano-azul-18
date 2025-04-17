
import React from 'react';
import { Button } from '@/components/ui/button';
import { BadgeAlert, Plus, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AddMemberDialog } from '@/components/team/AddMemberDialog';
import { Department, MemberFormData } from '@/hooks/useTeamMembers';

interface TeamPageHeaderProps {
  userAccess: string | null;
  error: string | null;
  canAddMembers: boolean; // Boolean flag
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  novoMembro: MemberFormData;
  setNovoMembro: React.Dispatch<React.SetStateAction<MemberFormData>>;
  departamentos: Department[];
  onAddMember: () => void; // Add this prop
}

export const TeamPageHeader: React.FC<TeamPageHeaderProps> = ({
  userAccess,
  error,
  canAddMembers,
  openDialog,
  setOpenDialog,
  novoMembro,
  setNovoMembro,
  departamentos,
  onAddMember // Add this prop
}) => {
  if (error) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Equipe</h1>
          <p className="text-destructive flex items-center gap-2">
            <BadgeAlert className="h-4 w-4" />
            {error}
          </p>
        </div>
      </div>
    );
  }

  const isAdminOrHigher = userAccess === 'Admin' || userAccess === 'SuperAdmin';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold mb-2">Equipe</h1>
        <p className="text-muted-foreground">
          Gerencie os membros da sua equipe e seus departamentos
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to="/departments">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Departamentos
          </Button>
        </Link>
        
        {canAddMembers && (
          <AddMemberDialog
            open={openDialog}
            onOpenChange={setOpenDialog}
            onAddMember={onAddMember} // Pass the function here
            novoMembro={novoMembro}
            setNovoMembro={setNovoMembro}
            departamentos={departamentos}
          />
        )}
      </div>
    </div>
  );
};
