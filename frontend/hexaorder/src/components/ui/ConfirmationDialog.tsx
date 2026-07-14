import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface Props {
  open: boolean;

  title: string;

  description: string;

  confirmText: string;

  cancelText?: string;

  confirmVariant?: 'primary' | 'danger' | 'success';

  loading?: boolean;

  onConfirm: () => void;

  onCancel: () => void;
}

export default function ConfirmationDialog({
  open,
  title,
  description,
  confirmText,
  cancelText = 'Cancel',
  // confirmVariant = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">

      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={!loading ? onCancel : undefined}
      />

      {/* Dialog */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-7 shadow-2xl animate-scale-in">

        <div className="flex items-start gap-4">

          <div className="w-12 h-12 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>

          <div className="flex-1">

            <h2 className="text-xl font-bold text-white">
              {title}
            </h2>

            <p className="text-slate-400 mt-2">
              {description}
            </p>

          </div>

        </div>

        <div className="flex justify-end gap-3 mt-8">

          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>

          <Button
            variant="primary"
            isLoading={loading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>

        </div>

      </div>

    </div>
  );
}