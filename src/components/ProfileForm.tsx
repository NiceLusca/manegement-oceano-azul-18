
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DepartmentSelector } from "@/components/DepartmentSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, AlertTriangle } from "lucide-react";

const profileFormSchema = z.object({
  nome: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  cargo: z.string().min(2, {
    message: "O cargo deve ter pelo menos 2 caracteres.",
  }),
  departamento_id: z.string().uuid().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  nivel_acesso: z.enum(["admin", "manager", "user"]).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  userId: string;
  initialData?: ProfileFormValues;
  onSuccess?: () => void;
}

export function ProfileForm({ userId, initialData, onSuccess }: ProfileFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("nivel_acesso")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        setUserProfile(data);
        setIsAdmin(data?.nivel_acesso === "admin");
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const defaultValues: Partial<ProfileFormValues> = {
    nome: initialData?.nome || "",
    cargo: initialData?.cargo || "",
    departamento_id: initialData?.departamento_id || null,
    avatar_url: initialData?.avatar_url || null,
    nivel_acesso: initialData?.nivel_acesso || "user",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true);
      
      // Construir objeto de atualização
      const updateData: any = {
        id: userId,
        nome: data.nome,
      };
      
      // Apenas incluir estes campos se o usuário for admin
      if (isAdmin || user?.id !== userId) {
        updateData.cargo = data.cargo;
        updateData.departamento_id = data.departamento_id;
        updateData.nivel_acesso = data.nivel_acesso;
      }
      
      if (data.avatar_url) {
        updateData.avatar_url = data.avatar_url;
      }
      
      const { error } = await supabase
        .from("profiles")
        .upsert(updateData);

      if (error) {
        throw error;
      }

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentUser = user?.id === userId;
  const canEditProtectedFields = isAdmin || !isCurrentUser;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        {isCurrentUser && !isAdmin && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">
              Apenas administradores podem alterar cargos e níveis de acesso. As alterações que você fizer em campos restritos não serão salvas.
            </p>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            
            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Cargo</FormLabel>
                    {!canEditProtectedFields && (
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="Seu cargo na empresa" 
                      {...field} 
                      disabled={!canEditProtectedFields}
                    />
                  </FormControl>
                  <FormDescription>
                    Cargo ou função que você exerce na empresa.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="departamento_id"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Departamento</FormLabel>
                    {!canEditProtectedFields && (
                      <Shield className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <FormControl>
                    <DepartmentSelector 
                      value={field.value} 
                      onChange={field.onChange} 
                      disabled={isLoading || !canEditProtectedFields}
                    />
                  </FormControl>
                  <FormDescription>
                    Selecione o departamento ao qual você pertence.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {canEditProtectedFields && (
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
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
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
            )}
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
