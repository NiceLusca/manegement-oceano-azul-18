
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

interface NameFieldProps {
  form: UseFormReturn<any>;
}

export function NameField({ form }: NameFieldProps) {
  return (
    <FormField
      control={form.control}
      name="nome"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nome</FormLabel>
          <FormControl>
            <Input placeholder="Seu nome completo" {...field} />
          </FormControl>
          <FormDescription>
            Este é o seu nome que será exibido para outros usuários.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
