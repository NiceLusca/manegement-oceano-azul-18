
import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from './StatCard';
import { DepartmentProgressSection } from './DepartmentProgressSection';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function PerformanceIndicators() {
  const { user } = useAuth();
  const [totalTeamMembers, setTotalTeamMembers] = useState(0);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Count team members
        const { count: teamCount, error: teamError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        if (teamError) throw teamError;
        
        // Count departments
        const { count: deptCount, error: deptError } = await supabase
          .from('departamentos')
          .select('*', { count: 'exact', head: true });
          
        if (deptError) throw deptError;
        
        setTotalTeamMembers(teamCount || 0);
        setTotalDepartments(deptCount || 0);
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, [user]);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Indicadores de Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard 
            title="Membros da Equipe"
            value={loading ? '...' : totalTeamMembers.toString()}
            description="Total de colaboradores"
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard 
            title="Departamentos"
            value={loading ? '...' : totalDepartments.toString()}
            description="Setores ativos"
            icon={<Activity className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        
        <DepartmentProgressSection />
      </CardContent>
    </Card>
  );
}
