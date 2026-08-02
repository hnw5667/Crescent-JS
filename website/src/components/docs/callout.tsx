import { AlertCircle, Info, Lightbulb, TriangleAlert } from 'lucide-react';

interface CalloutProps {
  type?: 'note' | 'warning' | 'tip' | 'info';
  title?: string;
  children: React.ReactNode;
}

const styles = {
  note: {
    container: 'border-purple-400/30 bg-purple-500/5',
    iconColor: 'text-purple-400',
    title: 'text-purple-300',
    icon: Info,
  },
  info: {
    container: 'border-sky-400/30 bg-sky-500/5',
    iconColor: 'text-sky-400',
    title: 'text-sky-300',
    icon: AlertCircle,
  },
  warning: {
    container: 'border-amber-400/30 bg-amber-500/5',
    iconColor: 'text-amber-400',
    title: 'text-amber-300',
    icon: TriangleAlert,
  },
  tip: {
    container: 'border-emerald-400/30 bg-emerald-500/5',
    iconColor: 'text-emerald-400',
    title: 'text-emerald-300',
    icon: Lightbulb,
  },
};

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const config = styles[type];
  const Icon = config.icon;

  return (
    <div
      className={`my-6 flex gap-3 rounded-xl border p-4 ${config.container}`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconColor}`} />
      <div className="min-w-0">
        {(title || type !== 'note') && (
          <p className={`mb-1 text-sm font-semibold ${config.title}`}>
            {title || type.charAt(0).toUpperCase() + type.slice(1)}
          </p>
        )}
        <div className="text-sm leading-relaxed text-slate-400 [&_code]:text-[13px]">
          {children}
        </div>
      </div>
    </div>
  );
}
