import React, { useState } from 'react';
import { Mail, Phone, FileEdit, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
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

const CustomerTableView: React.FC<CustomerTableViewProps> = ({ 
  customers: initialCustomers, 
  teamMembers, 
  getStatusColor, 
  translateStatus 
}) => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Customer | '';
    direction: 'asc' | 'desc';
  }>({ key: '', direction: 'asc' });

  const handleSort = (key: keyof Customer) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    const sortedCustomers = [...customers].sort((a, b) => {
      if (key === 'status') {
        const statusOrder = { lead: 1, prospect: 2, customer: 3, churned: 4 };
        const aValue = statusOrder[a[key] as keyof typeof statusOrder] || 0;
        const bValue = statusOrder[b[key] as keyof typeof statusOrder] || 0;
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (key === 'value') {
        return direction === 'asc' ? 
          (a[key] || 0) - (b[key] || 0) : 
          (b[key] || 0) - (a[key] || 0);
      }

      const aValue = String(a[key] || '').toLowerCase();
      const bValue = String(b[key] || '').toLowerCase();
      return direction === 'asc' ? 
        aValue.localeCompare(bValue) : 
        bValue.localeCompare(aValue);
    });

    setCustomers(sortedCustomers);
  };

  const getSortIcon = (key: keyof Customer) => {
    return sortConfig.key === key ? (
      <ArrowUpDown className={cn(
        "ml-2 h-4 w-4",
        sortConfig.direction === 'desc' ? "transform rotate-180" : ""
      )} />
    ) : (
      <ArrowUpDown className="ml-2 h-4 w-4 opacity-20" />
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead onClick={() => handleSort('name')} className="cursor-pointer hover:text-white/80">
            Nome {getSortIcon('name')}
          </TableHead>
          <TableHead onClick={() => handleSort('origem')} className="cursor-pointer hover:text-white/80">
            Origem {getSortIcon('origem')}
          </TableHead>
          <TableHead onClick={() => handleSort('status')} className="cursor-pointer hover:text-white/80">
            Status {getSortIcon('status')}
          </TableHead>
          <TableHead onClick={() => handleSort('email')} className="cursor-pointer hover:text-white/80">
            Email {getSortIcon('email')}
          </TableHead>
          <TableHead onClick={() => handleSort('phone')} className="cursor-pointer hover:text-white/80">
            Telefone {getSortIcon('phone')}
          </TableHead>
          <TableHead onClick={() => handleSort('value')} className="cursor-pointer hover:text-white/80">
            Valor {getSortIcon('value')}
          </TableHead>
          <TableHead onClick={() => handleSort('lastContact')} className="cursor-pointer hover:text-white/80">
            Último Contato {getSortIcon('lastContact')}
          </TableHead>
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
