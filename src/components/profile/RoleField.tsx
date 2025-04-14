
import { Shield } from "lucide-react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface RoleFieldProps {
  form: UseFormReturn<any>;
  canEdit: boolean;
}

export function RoleField({ form, canEdit }: RoleFieldProps) {
  return (
    <FormField
      control={form.control}
      name="cargo"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Cargo</FormLabel>
            {!canEdit && (
              <Shield className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <FormControl>
            <Input 
              placeholder="Seu cargo na empresa" 
              {...field} 
              value={field.value || ''} 
              disabled={!canEdit}
            />
          </FormControl>
          <FormDescription>
            Cargo ou função que você exerce na empresa.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
