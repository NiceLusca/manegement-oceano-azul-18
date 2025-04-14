
import { AlertTriangle, Info } from "lucide-react";

interface PermissionAlertProps {
  show: boolean;
  errorType?: "permission" | "recursion" | null;
}

export function PermissionAlert({ show, errorType = null }: PermissionAlertProps) {
  if (!show && !errorType) return null;
  
  // Alert for standard permission warnings
  if (show && !errorType) {
    return (
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          Apenas administradores podem alterar cargos e níveis de acesso. As alterações que você fizer em campos restritos não serão salvas.
        </p>
      </div>
    );
  }
  
  // Alert for recursion errors in RLS policies
  if (errorType === "recursion") {
    return (
      <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-700">
          <p className="font-medium mb-1">Erro de configuração do banco de dados</p>
          <p>Foi detectada uma recursão infinita nas políticas de segurança da tabela "profiles".</p>
          <p className="mt-2">Este erro ocorre quando uma política RLS referencia a própria tabela que está protegendo. Entre em contato com o administrador para corrigir as políticas de segurança no Supabase.</p>
        </div>
      </div>
    );
  }
  
  return null;
}
