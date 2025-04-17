
import React from 'react';
import { Button } from '@/components/ui/button';
import { BadgeAlert, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Department } from '@/hooks/useTeamMembers';

interface TeamPageHeaderProps {
  userAccess: string | null;
  error: string | null;
}

export const TeamPageHeader: React.FC<TeamPageHeaderProps> = ({
  userAccess,
  error
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
      </div>
    </div>
  );
};
