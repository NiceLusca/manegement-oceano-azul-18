
import React from 'react';
import { PerformanceIndicators } from './PerformanceIndicators';
import { WorkloadDistribution } from './WorkloadDistribution';

interface MetricsCardsProps {
  teamMembers: any[];
  getTasksByAssignee: (id: string) => any[];
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ 
  teamMembers,
  getTasksByAssignee 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <PerformanceIndicators />
      <WorkloadDistribution teamMembers={teamMembers} getTasksByAssignee={getTasksByAssignee} />
    </div>
  );
};
