
import { Shield } from "lucide-react";
import { useFormField } from "@/components/ui/form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

interface AccessLevelFieldProps {
  form: UseFormReturn<any>;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
}

export function AccessLevelField({ form, isAdmin, isSuperAdmin, isLoading }: AccessLevelFieldProps) {
  if (!isAdmin) return null;
  
  return (
    <FormField
      control={form.control}
      name="nivel_acesso"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Nível de Acesso</FormLabel>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível de acesso" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isSuperAdmin && (
                <SelectItem value="SuperAdmin">Super Administrador</SelectItem>
              )}
              <SelectItem value="Admin">Administrador</SelectItem>
              <SelectItem value="Supervisor">Supervisor</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            Define o nível de permissões do usuário no sistema.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
