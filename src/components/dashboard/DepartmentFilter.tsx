
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DepartmentFilterProps {
  departments: string[];
  selectedDepartment: string | null;
  onDepartmentChange: (department: string | null) => void;
}

export const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  departments,
  selectedDepartment,
  onDepartmentChange
}) => {
  return (
    <Select 
      value={selectedDepartment || "all"} 
      onValueChange={value => onDepartmentChange(value === "all" ? null : value)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Todos os departamentos" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todos os departamentos</SelectItem>
        {departments.map(dept => (
          <SelectItem key={dept} value={dept}>{dept}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
