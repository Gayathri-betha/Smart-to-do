import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navbar } from "@/components/Navbar";
import { TaskCard } from "@/components/TaskCard";
import { AddTaskModal } from "@/components/AddTaskModal";
import { AiQuickAdd } from "@/components/AiQuickAdd";
import { StatsBar } from "@/components/StatsBar";
import { supabase, type Task } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type FilterMode = "all" | "active" | "done";

export default function Dashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterMode>("all");

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("completed", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setTasks((data as Task[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (data: Partial<Task>) => {
    if (!user) return;
    const { error } = await supabase.from("tasks").insert({
      user_id: user.id,
      title: data.title,
      description: data.description ?? null,
      due_date: data.due_date ?? null,
      priority: data.priority ?? "medium",
      completed: false,
    });
    if (error) toast.error(error.message);
    else {
      toast.success("Task added");
      fetchTasks();
    }
  };

  const addManyTasks = async (titles: string[]) => {
    if (!user) return;
    const rows = titles.map((title) => ({
      user_id: user.id,
      title,
      priority: "medium" as const,
      completed: false,
    }));
    const { error } = await supabase.from("tasks").insert(rows);
    if (error) toast.error(error.message);
    else fetchTasks();
  };

  const toggleTask = async (task: Task) => {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id);
    if (error) toast.error(error.message);
    else {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
      );
    }
  };

  const deleteTask = async (id: string) => {
    const prev = tasks;
    setTasks((p) => p.filter((t) => t.id !== id));
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      setTasks(prev);
    } else {
      toast.success("Task deleted");
    }
  };

  const filtered = useMemo(() => {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "done") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <main className="container max-w-3xl py-6 space-y-6 sm:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Hey there 👋
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Let's make today productive.
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} size="lg" className="shadow-glow">
            <Plus className="h-4 w-4" />
            <span className="ml-1.5">New task</span>
          </Button>
        </div>

        <StatsBar tasks={tasks} />

        <AiQuickAdd onAdd={addTask} onAddMany={addManyTasks} />

        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            <Filter className="mr-1 inline h-3.5 w-3.5" />
            Your tasks
          </h3>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterMode)}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="h-6 text-xs">All</TabsTrigger>
              <TabsTrigger value="active" className="h-6 text-xs">Active</TabsTrigger>
              <TabsTrigger value="done" className="h-6 text-xs">Done</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
            <p className="text-muted-foreground">
              {filter === "done"
                ? "No completed tasks yet."
                : filter === "active"
                ? "All caught up! 🎉"
                : "No tasks yet. Add your first one above ✨"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />
            ))}
          </div>
        )}
      </main>

      <AddTaskModal open={modalOpen} onOpenChange={setModalOpen} onSubmit={addTask} />
    </div>
  );
}