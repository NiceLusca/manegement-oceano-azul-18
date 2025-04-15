
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AddMemberDialog } from '@/components/team/AddMemberDialog';

interface TeamPageHeaderProps {
  userAccess: string | null;
  error: string | null;
  canAddMembers: () => boolean;
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  novoMembro: any;
  setNovoMembro: React.Dispatch<React.SetStateAction<any>>;
  departamentos: any[];
}

export const TeamPageHeader: React.FC<TeamPageHeaderProps> = ({
  userAccess,
  error,
  canAddMembers,
  openDialog,
  setOpenDialog,
  novoMembro,
  setNovoMembro,
  departamentos
}) => {
  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Membros da Equipe</h1>
          <p className="text-muted-foreground">Gerencie os membros da sua equipe e suas funções.</p>
        </div>
        {canAddMembers() && (
          <AddMemberDialog
            open={openDialog}
            onOpenChange={setOpenDialog}
            onAddMember={() => {}}
            novoMembro={novoMembro}
            setNovoMembro={setNovoMembro}
            departamentos={departamentos}
          />
        )}
      </div>
      
      {userAccess === 'user' && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Limitado</AlertTitle>
          <AlertDescription>
            Como usuário regular, você só tem acesso para visualizar seu próprio perfil. 
            Para visualizar outros membros da equipe, você precisa de um nível de acesso mais alto.
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
