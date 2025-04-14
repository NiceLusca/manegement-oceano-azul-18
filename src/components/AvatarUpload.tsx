
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string | null;
  onUploadComplete: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function AvatarUpload({ 
  userId, 
  avatarUrl, 
  onUploadComplete, 
  size = 'md',
  disabled = false 
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  const avatarSizes = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };
  
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você precisa selecionar uma imagem para fazer upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Gerar URL pública para a imagem
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualizar o perfil do usuário
      await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId);

      onUploadComplete(data.publicUrl);
      
      toast({
        title: "Imagem atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível fazer o upload da imagem. Tente novamente.",
        variant: "destructive",
      });
      console.error('Erro ao fazer upload:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getInitials = (name: string) => {
    return name?.substring(0, 2).toUpperCase() || 'US';
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className={`${avatarSizes[size]} relative group`}>
        <AvatarImage src={avatarUrl || ''} alt="Avatar" />
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials(userId)}
        </AvatarFallback>
        
        {!disabled && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <Camera className="h-6 w-6 text-white" />
          </div>
        )}
      </Avatar>
      
      {!disabled && (
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={uploadAvatar}
            className="hidden"
            ref={fileInputRef}
            disabled={uploading || disabled}
          />
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || disabled}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Alterar foto
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
