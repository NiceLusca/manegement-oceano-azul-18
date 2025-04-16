
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DepartmentForm } from './DepartmentForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Department {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string | null;
  created_at: string | null;
  memberCount?: number;
}

export function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      // Get departments
      const { data: depsData, error: depsError } = await supabase
        .from('departamentos')
        .select('*')
        .order('nome');
        
      if (depsError) throw depsError;
      
      // Get member count for each department
      const { data: membersData, error: membersError } = await supabase
        .from('team_by_department')
        .select('department_id, member_count');
        
      if (membersError) throw membersError;
      
      // Combine the data
      const departmentsWithCount = depsData.map(dept => {
        const memberInfo = membersData.find(m => m.department_id === dept.id);
        return {
          ...dept,
          memberCount: memberInfo?.member_count || 0
        };
      });
      
      setDepartments(departmentsWithCount);
    } catch (error: any) {
      console.error('Erro ao buscar departamentos:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os departamentos: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (departmentId: string) => {
    setDeleting(departmentId);
    try {
      // Check if there are members in the department
      const { data, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('departamento_id', departmentId);
        
      if (countError) throw countError;
      
      if (data && data.length > 0) {
        toast({
          title: "Ação não permitida",
          description: "Não é possível excluir um departamento que possui membros.",
          variant: "destructive"
        });
        return;
      }
      
      const { error } = await supabase
        .from('departamentos')
        .delete()
        .eq('id', departmentId);
        
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Departamento excluído com sucesso",
        variant: "default"
      });
      
      // Refresh list
      fetchDepartments();
    } catch (error: any) {
      console.error('Erro ao excluir departamento:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o departamento: " + error.message,
        variant: "destructive"
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Departamentos</CardTitle>
          <CardDescription>
            Gerencie os departamentos da sua empresa
          </CardDescription>
        </div>
        <DepartmentForm 
          mode="create" 
          onSuccess={fetchDepartments} 
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4 p-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[100px] ml-auto" />
              </div>
            ))}
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-6 flex flex-col items-center gap-3">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">Nenhum departamento encontrado</p>
            <p className="text-sm text-muted-foreground">
              Crie seu primeiro departamento para começar a organizar sua equipe
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Departamento</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Membros</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: department.cor || '#94a3b8' }}
                      />
                      <span className="font-medium">{department.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {department.descricao || <span className="text-muted-foreground text-sm">Sem descrição</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {department.memberCount} {department.memberCount === 1 ? 'membro' : 'membros'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DepartmentForm
                        mode="edit"
                        initialData={{
                          id: department.id,
                          nome: department.nome,
                          descricao: department.descricao || '',
                          cor: department.cor || '#3b82f6'
                        }}
                        onSuccess={fetchDepartments}
                      />
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                            disabled={department.memberCount! > 0 || deleting === department.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir departamento</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o departamento <strong>{department.nome}</strong>?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDelete(department.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
