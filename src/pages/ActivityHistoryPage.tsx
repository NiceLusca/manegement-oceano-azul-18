
import React from 'react';
import { Layout } from '@/components/Layout';
import { TeamActivityHistory } from '@/components/team/TeamActivityHistory';

const ActivityHistoryPage = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Atividades</h1>
          <p className="text-muted-foreground">
            Acompanhe as atividades concluídas por cada membro da equipe.
          </p>
        </div>
        
        <TeamActivityHistory />
      </div>
    </Layout>
  );
};

export default ActivityHistoryPage;
