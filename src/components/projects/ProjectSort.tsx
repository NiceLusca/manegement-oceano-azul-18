
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowUpDown } from 'lucide-react';

type ProjectSortProps = {
  sortBy: 'name' | 'deadline' | 'progress';
  sortDirection: 'asc' | 'desc';
  onSort: (field: 'name' | 'deadline' | 'progress') => void;
};

export function ProjectSort({ sortBy, sortDirection, onSort }: ProjectSortProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[180px]">
          <ArrowUpDown className="h-4 w-4 mr-2" />
          Ordenar por
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onSort('name')}>
          Nome {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort('deadline')}>
          Prazo {sortBy === 'deadline' && (sortDirection === 'asc' ? '↑' : '↓')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort('progress')}>
          Progresso {sortBy === 'progress' && (sortDirection === 'asc' ? '↑' : '↓')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
