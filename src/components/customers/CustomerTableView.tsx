
import React from 'react';
import { Mail, Phone, FileEdit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Customer, TeamMember } from '@/types';

interface CustomerTableViewProps {
  customers: Customer[];
  teamMembers: TeamMember[];
  getStatusColor: (status: string) => string;
  translateStatus: (status: string) => string;
}

const CustomerTableView: React.FC<CustomerTableViewProps> = ({ customers, teamMembers, getStatusColor, translateStatus }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Origem</TableHead>
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
        {customers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8">
              Nenhum cliente encontrado
            </TableCell>
          </TableRow>
        ) : (
          customers.map((customer) => {
            const assignedTeamMember = teamMembers.find(member => member.id === customer.assignedTo);
            
            return (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.name}</TableCell>
                <TableCell>{customer.origem || '-'}</TableCell>
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
  );
};

export default CustomerTableView;
