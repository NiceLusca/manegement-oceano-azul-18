
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Search, Mail, Phone, FileEdit, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Customer, TeamMember } from '@/types';

const CustomersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'lead',
    notes: '',
    assignedTo: '',
    value: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
    fetchTeamMembers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*');

      if (error) throw error;
      
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar clientes:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;
      
      // Adaptar o formato dos dados do Supabase para o formato esperado pelo componente
      const formattedMembers = data.map(profile => ({
        id: profile.id,
        name: profile.nome || 'Sem nome',
        role: profile.cargo || 'Colaborador',
        email: '',  // O Supabase não armazena emails no perfil
        avatar: profile.avatar_url || '',
        department: '',  // Poderia buscar o departamento também
        status: 'active',
        joinedDate: profile.created_at
      }));
      
      setTeamMembers(formattedMembers);
    } catch (error: any) {
      console.error('Erro ao buscar equipe:', error.message);
    }
  };

  const handleAddCustomer = async () => {
    if (!novoCliente.name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do cliente é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([
          {
            name: novoCliente.name,
            company: novoCliente.company,
            email: novoCliente.email,
            phone: novoCliente.phone,
            status: novoCliente.status,
            notes: novoCliente.notes,
            assigned_to: novoCliente.assignedTo || null,
            value: novoCliente.value || 0
          }
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Cliente adicionado com sucesso!",
        variant: "default"
      });

      // Adicionar o novo cliente à lista local
      if (data && data.length > 0) {
        setCustomers(prev => [...prev, data[0] as Customer]);
      }

      // Limpar o formulário e fechar o diálogo
      setNovoCliente({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'lead',
        notes: '',
        assignedTo: '',
        value: 0
      });
      setOpenDialog(false);
    } catch (error: any) {
      console.error('Erro ao adicionar cliente:', error.message);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o cliente: " + error.message,
        variant: "destructive"
      });
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'lead': return 'lead';
      case 'prospect': return 'prospecto';
      case 'customer': return 'cliente';
      case 'churned': return 'perdido';
      default: return status;
    }
  };

  const filteredCustomers = customers.filter(customer => 
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead': return 'bg-yellow-100 text-yellow-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-green-100 text-green-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus relacionamentos com clientes</p>
          </div>
          
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes para adicionar um novo cliente ao sistema.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Nome</Label>
                  <Input
                    id="name"
                    value={novoCliente.name}
                    onChange={(e) => setNovoCliente({...novoCliente, name: e.target.value})}
                    className="col-span-3"
                    placeholder="Nome do cliente ou empresa"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="company" className="text-right">Empresa</Label>
                  <Input
                    id="company"
                    value={novoCliente.company}
                    onChange={(e) => setNovoCliente({...novoCliente, company: e.target.value})}
                    className="col-span-3"
                    placeholder="Nome da empresa"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={novoCliente.email}
                    onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                    className="col-span-3"
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Telefone</Label>
                  <Input
                    id="phone"
                    value={novoCliente.phone}
                    onChange={(e) => setNovoCliente({...novoCliente, phone: e.target.value})}
                    className="col-span-3"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                  <Select
                    value={novoCliente.status}
                    onValueChange={(value) => setNovoCliente({...novoCliente, status: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="prospect">Prospecto</SelectItem>
                      <SelectItem value="customer">Cliente</SelectItem>
                      <SelectItem value="churned">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="value" className="text-right">Valor (R$)</Label>
                  <Input
                    id="value"
                    type="number"
                    value={novoCliente.value.toString()}
                    onChange={(e) => setNovoCliente({...novoCliente, value: parseFloat(e.target.value) || 0})}
                    className="col-span-3"
                    placeholder="0,00"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignedTo" className="text-right">Responsável</Label>
                  <Select
                    value={novoCliente.assignedTo}
                    onValueChange={(value) => setNovoCliente({...novoCliente, assignedTo: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Atribuir a um membro da equipe" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="notes" className="text-right pt-2">Observações</Label>
                  <Textarea
                    id="notes"
                    value={novoCliente.notes}
                    onChange={(e) => setNovoCliente({...novoCliente, notes: e.target.value})}
                    className="col-span-3"
                    rows={4}
                    placeholder="Adicione informações relevantes sobre o cliente"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddCustomer}>
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar clientes..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'} 
                  onClick={() => setViewMode('grid')}
                  size="sm"
                >
                  Cards
                </Button>
                <Button 
                  variant={viewMode === 'table' ? 'default' : 'outline'} 
                  onClick={() => setViewMode('table')}
                  size="sm"
                >
                  Tabela
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando clientes...</p>
          </div>
        ) : viewMode === 'table' ? (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Último Contato</TableHead>
                    <TableHead>Responsável</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        Nenhum cliente encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => {
                      const assignedTeamMember = teamMembers.find(member => member.id === customer.assignedTo);
                      
                      return (
                        <TableRow key={customer.id}>
                          <TableCell className="font-medium">{customer.name}</TableCell>
                          <TableCell>{customer.company || '-'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(customer.status)}>
                              {translateStatus(customer.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {customer.email ? (
                              <a href={`mailto:${customer.email}`} className="hover:underline flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{customer.email}</span>
                              </a>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {customer.phone ? (
                              <a href={`tel:${customer.phone}`} className="hover:underline flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{customer.phone}</span>
                              </a>
                            ) : '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {typeof customer.value === 'number' ? `R$ ${customer.value.toLocaleString()}` : '-'}
                          </TableCell>
                          <TableCell>
                            {customer.lastContact ? new Date(customer.lastContact).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            {assignedTeamMember ? (
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={assignedTeamMember.avatar} />
                                  <AvatarFallback>{assignedTeamMember.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{assignedTeamMember.name}</span>
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <FileEdit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => {
              const assignedTeamMember = teamMembers.find(member => member.id === customer.assignedTo);
              const statusColor = getStatusColor(customer.status);
              
              return (
                <Card key={customer.id} className="hover-scale">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{customer.name}</CardTitle>
                      <Badge variant="outline" className={statusColor}>
                        {translateStatus(customer.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-2">{customer.company || 'Sem empresa'}</p>
                    
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        {customer.email ? (
                          <a href={`mailto:${customer.email}`} className="text-sm hover:underline">
                            {customer.email}
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">Email não informado</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {customer.phone ? (
                          <a href={`tel:${customer.phone}`} className="text-sm hover:underline">
                            {customer.phone}
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">Telefone não informado</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">Último Contato</span>
                        <span className="text-sm">
                          {customer.lastContact ? new Date(customer.lastContact).toLocaleDateString() : 'Não registrado'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Valor</span>
                        <span className="text-sm font-semibold">
                          {typeof customer.value === 'number' ? `R$ ${customer.value.toLocaleString()}` : 'R$ 0,00'}
                        </span>
                      </div>
                    </div>
                    
                    {assignedTeamMember && (
                      <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={assignedTeamMember.avatar} />
                            <AvatarFallback>{assignedTeamMember.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">Responsável</p>
                            <p className="text-xs text-muted-foreground">{assignedTeamMember.name}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <FileEdit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CustomersPage;
