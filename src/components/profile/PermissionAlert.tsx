
import { AlertTriangle } from "lucide-react";

interface PermissionAlertProps {
  show: boolean;
}

export function PermissionAlert({ show }: PermissionAlertProps) {
  if (!show) return null;
  
  return (
    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-700">
        Apenas administradores podem alterar cargos e níveis de acesso. As alterações que você fizer em campos restritos não serão salvas.
      </p>
    </div>
  );
}
