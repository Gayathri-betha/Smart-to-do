import { useState } from "react";
import { Loader2, Sparkles, Wand2, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { breakdownTask, isAiConfigured, parseNaturalLanguage } from "@/lib/ai";
import type { Task } from "@/lib/supabase";
import { toast } from "sonner";

interface AiQuickAddProps {
  onAdd: (data: Partial<Task>) => Promise<void>;
  onAddMany: (titles: string[]) => Promise<void>;
}

export function AiQuickAdd({ onAdd, onAddMany }: AiQuickAddProps) {
  const [nlInput, setNlInput] = useState("");
  const [goalInput, setGoalInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNL = async () => {
    if (!nlInput.trim()) return;
    setLoading(true);
    try {
      const parsed = await parseNaturalLanguage(nlInput);
      await onAdd({
        title: parsed.title,
        due_date: parsed.due_date,
        priority: parsed.priority,
      });
      setNlInput("");
      toast.success("Task added by AI ✨");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBreakdown = async () => {
    if (!goalInput.trim()) return;
    setLoading(true);
    try {
      const subtasks = await breakdownTask(goalInput);
      if (!subtasks.length) throw new Error("No subtasks generated");
      await onAddMany(subtasks);
      setGoalInput("");
      toast.success(`AI created ${subtasks.length} subtasks ✨`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isAiConfigured) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-surface-muted p-4 text-center text-sm text-muted-foreground">
        💡 Add <code className="rounded bg-surface px-1.5 py-0.5 text-xs">VITE_GEMINI_API_KEY</code> to <code>.env.local</code> to unlock AI features.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-br from-accent to-surface p-4 shadow-card">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">AI Quick Add</h3>
      </div>

      <Tabs defaultValue="nl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nl">
            <Wand2 className="mr-1.5 h-3.5 w-3.5" /> Natural language
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <ListTree className="mr-1.5 h-3.5 w-3.5" /> Breakdown
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nl" className="mt-3 space-y-2">
          <Input
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNL()}
            placeholder="e.g. Meeting with Sara tomorrow at 5pm"
            disabled={loading}
          />
          <Button onClick={handleNL} disabled={loading || !nlInput.trim()} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            <span className="ml-2">Parse & add</span>
          </Button>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-3 space-y-2">
          <Input
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleBreakdown()}
            placeholder="e.g. Prepare for technical interview"
            disabled={loading}
          />
          <Button onClick={handleBreakdown} disabled={loading || !goalInput.trim()} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListTree className="h-4 w-4" />}
            <span className="ml-2">Break into subtasks</span>
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}