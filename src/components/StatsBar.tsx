import { CheckCircle2, ListTodo, Target, TrendingUp } from "lucide-react";
import type { Task } from "@/lib/supabase";

interface StatsBarProps {
  tasks: Task[];
}

export function StatsBar({ tasks }: StatsBarProps) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const high = tasks.filter((t) => !t.completed && t.priority === "high").length;

  const stats = [
    { label: "Total", value: total, Icon: ListTodo, accent: "text-primary" },
    { label: "Completed", value: done, Icon: CheckCircle2, accent: "text-success" },
    { label: "High priority", value: high, Icon: Target, accent: "text-destructive" },
    { label: "Productivity", value: `${pct}%`, Icon: TrendingUp, accent: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value, Icon, accent }) => (
        <div
          key={label}
          className="rounded-2xl border border-border bg-surface p-4 shadow-card"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
            <Icon className={`h-4 w-4 ${accent}`} />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
        </div>
      ))}
    </div>
  );
}