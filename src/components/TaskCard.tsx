import { format, isPast, isToday, isTomorrow } from "date-fns";
import { Calendar, Trash2, Circle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityConfig = {
  high: { label: "High", className: "bg-destructive/10 text-destructive border-destructive/20" },
  medium: { label: "Medium", className: "bg-warning/10 text-warning border-warning/20" },
  low: { label: "Low", className: "bg-success/10 text-success border-success/20" },
};

function formatDue(date: string) {
  const d = new Date(date);
  if (isToday(d)) return `Today, ${format(d, "h:mm a")}`;
  if (isTomorrow(d)) return `Tomorrow, ${format(d, "h:mm a")}`;
  return format(d, "MMM d, h:mm a");
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const overdue = task.due_date && !task.completed && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
  const p = priorityConfig[task.priority];

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card transition-all hover:shadow-card-lg",
        task.completed && "opacity-60"
      )}
    >
      <button
        onClick={() => onToggle(task)}
        className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-primary"
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
      >
        {task.completed ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn("font-semibold leading-snug", task.completed && "line-through")}>
            {task.title}
          </h3>
          <Badge variant="outline" className={cn("shrink-0 text-xs", p.className)}>
            {p.label}
          </Badge>
        </div>

        {task.description && (
          <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>
        )}

        {task.due_date && (
          <div
            className={cn(
              "mt-2 flex items-center gap-1.5 text-xs",
              overdue ? "text-destructive" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDue(task.due_date)}</span>
            {overdue && <span className="font-semibold">· Overdue</span>}
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(task.id)}
        className="opacity-0 transition-opacity group-hover:opacity-100"
        aria-label="Delete task"
      >
        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
}