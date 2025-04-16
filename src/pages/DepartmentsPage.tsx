
import React from 'react';
import { Layout } from '@/components/Layout';
import { DepartmentList } from '@/components/department/DepartmentList';
import { Helmet } from 'react-helmet-async';

export default function DepartmentsPage() {
  return (
    <Layout>
      <Helmet>
        <title>Departamentos | Oceano Azul</title>
      </Helmet>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Departamentos</h1>
          <p className="text-muted-foreground">
            Crie e gerencie departamentos para organizar sua equipe
          </p>
        </div>
        
        <DepartmentList />
      </div>
    </Layout>
  );
}
