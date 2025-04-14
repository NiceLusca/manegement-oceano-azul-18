
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { AvatarUpload } from "@/components/AvatarUpload";
import { PermissionAlert } from "@/components/profile/PermissionAlert";
import { NameField } from "@/components/profile/NameField";
import { RoleField } from "@/components/profile/RoleField";
import { DepartmentField } from "@/components/profile/DepartmentField";
import { AccessLevelField } from "@/components/profile/AccessLevelField";

const profileFormSchema = z.object({
  nome: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres.",
  }),
  cargo: z.string().min(2, {
    message: "O cargo deve ter pelo menos 2 caracteres.",
  }).optional().nullable(),
  departamento_id: z.string().uuid().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  nivel_acesso: z.enum(["SuperAdmin", "Admin", "Supervisor", "user"]).optional(),
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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData?.avatar_url || null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("nivel_acesso, avatar_url")
          .eq("id", user.id)
          .single();
          
        if (error) throw error;
        
        setUserProfile(data);
        setIsAdmin(data?.nivel_acesso === "Admin" || data?.nivel_acesso === "SuperAdmin");
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  const defaultValues: Partial<ProfileFormValues> = {
    nome: initialData?.nome || "",
    cargo: initialData?.cargo || null,
    departamento_id: initialData?.departamento_id || null,
    avatar_url: avatarUrl || null,
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
        avatar_url: avatarUrl,
      };
      
      // Apenas incluir estes campos se o usuário for admin
      if (isAdmin || user?.id !== userId) {
        updateData.cargo = data.cargo;
        updateData.departamento_id = data.departamento_id;
        updateData.nivel_acesso = data.nivel_acesso;
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
  const isSuperAdmin = userProfile?.nivel_acesso === 'SuperAdmin';

  const handleAvatarUpload = (url: string) => {
    setAvatarUrl(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <PermissionAlert show={isCurrentUser && !isAdmin} />
        
        <div className="flex justify-center mb-8">
          <AvatarUpload
            userId={userId}
            avatarUrl={avatarUrl}
            onUploadComplete={handleAvatarUpload}
            size="lg"
          />
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <NameField form={form} />
            <RoleField form={form} canEdit={canEditProtectedFields} />
            <DepartmentField form={form} canEdit={canEditProtectedFields} isLoading={isLoading} />
            <AccessLevelField 
              form={form} 
              isAdmin={canEditProtectedFields} 
              isSuperAdmin={isSuperAdmin} 
              isLoading={isLoading} 
            />
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar alterações"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
