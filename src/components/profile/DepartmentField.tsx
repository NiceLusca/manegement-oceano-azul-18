
import { Shield } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { DepartmentSelector } from "@/components/DepartmentSelector";

interface DepartmentFieldProps {
  form: UseFormReturn<any>;
  canEdit: boolean;
  isLoading: boolean;
}

export function DepartmentField({ form, canEdit, isLoading }: DepartmentFieldProps) {
  return (
    <FormField
      control={form.control}
      name="departamento_id"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Departamento</FormLabel>
            {!canEdit && (
              <Shield className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <FormControl>
            <DepartmentSelector 
              value={field.value} 
              onChange={field.onChange} 
              disabled={isLoading || !canEdit}
            />
          </FormControl>
          <FormDescription>
            Selecione o departamento ao qual você pertence.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
