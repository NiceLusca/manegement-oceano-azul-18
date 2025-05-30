
import { AlertTriangle, Info } from "lucide-react";

interface PermissionAlertProps {
  show: boolean;
  errorType?: "permission" | null;
}

export function PermissionAlert({ show, errorType = null }: PermissionAlertProps) {
  if (!show && !errorType) return null;
  
  // Alert for standard permission warnings
  if (show) {
    return (
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-700">
          Apenas administradores podem alterar cargos e níveis de acesso. As alterações que você fizer em campos restritos não serão salvas.
        </p>
      </div>
    );
  }
  
  return null;
}
