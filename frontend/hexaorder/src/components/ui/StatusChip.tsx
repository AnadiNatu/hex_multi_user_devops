import { CheckCircle2, Clock3, XCircle } from 'lucide-react';

interface Props {
  status: 'success' | 'warning' | 'danger';
  text: string;
}

export default function StatusChip({
  status,
  text,
}: Props) {

  const styles = {

    success:
      'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',

    warning:
      'bg-amber-500/15 text-amber-400 border-amber-500/30',

    danger:
      'bg-red-500/15 text-red-400 border-red-500/30',

  };

  const icons = {

    success: CheckCircle2,

    warning: Clock3,

    danger: XCircle,

  };

  const Icon = icons[status];

  return (

    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-semibold
        ${styles[status]}
      `}
    >

      <Icon className="w-3.5 h-3.5" />

      {text}

    </span>

  );

}