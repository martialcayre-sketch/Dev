import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  helper?: string;
  variant?: "primary" | "accent" | "neutral";
}

const variants = {
  primary: "from-nn-primary-500/20 via-nn-primary-500/10 to-transparent border-nn-primary-500/30",
  accent: "from-nn-accent-500/20 via-nn-accent-500/10 to-transparent border-nn-accent-500/30",
  neutral: "from-white/10 via-white/5 to-transparent border-white/10",
};

export function StatCard({ icon: Icon, label, value, helper, variant = "neutral" }: StatCardProps) {
  return (
    <div className={clsx(
      "relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-xl backdrop-blur transition",
      variants[variant],
      "hover:border-white/30 hover:shadow-2xl hover:shadow-nn-primary-500/10"
    )}>
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-2 right-3 text-white/10">
        <Icon className="h-14 w-14" />
      </div>
      <div className="relative z-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-white/60">{label}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
          {helper ? <p className="text-xs text-white/50">{helper}</p> : null}
        </div>
      </div>
    </div>
  );
}
