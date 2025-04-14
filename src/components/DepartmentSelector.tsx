
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type Department = {
  id: string;
  nome: string;
  descricao: string | null;
  cor: string | null;
};

interface DepartmentSelectorProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export function DepartmentSelector({ value, onChange, disabled = false }: DepartmentSelectorProps) {
  const [open, setOpen] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const selectedDepartment = departments.find((dept) => dept.id === value);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("departamentos")
          .select("*")
          .order("nome");
        
        if (error) {
          throw error;
        }
        
        setDepartments(data || []);
      } catch (error: any) {
        toast({
          title: "Erro ao carregar departamentos",
          description: error.message || "Ocorreu um erro ao buscar a lista de departamentos.",
          variant: "destructive",
        });
        // Make sure departments is never undefined
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [toast]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || loading}
        >
          {loading ? (
            "Carregando departamentos..."
          ) : selectedDepartment ? (
            <div className="flex items-center">
              {selectedDepartment.cor && (
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: selectedDepartment.cor }}
                />
              )}
              {selectedDepartment.nome}
            </div>
          ) : (
            "Selecione um departamento"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[300px]">
        <Command>
          <CommandInput placeholder="Buscar departamento..." />
          <CommandList>
            <CommandEmpty>Nenhum departamento encontrado.</CommandEmpty>
            <CommandGroup>
              {departments.map((dept) => (
                <CommandItem
                  key={dept.id}
                  value={dept.nome}
                  onSelect={() => {
                    onChange(dept.id === value ? null : dept.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    {dept.cor && (
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: dept.cor }}
                      />
                    )}
                    {dept.nome}
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === dept.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
