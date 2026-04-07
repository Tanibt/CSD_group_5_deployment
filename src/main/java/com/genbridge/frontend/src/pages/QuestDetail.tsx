import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import questService, { Quest } from "@/services/questService";

export default function QuestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quest, setQuest] = useState<Quest | null>(null);
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadQuest = async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const data = await questService.getQuestById(id);
      setQuest(data);
    } catch {
      setError("Failed to load quest.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuest();
  }, [id]);

  const handleSubmit = async () => {
    if (!id || !reflection.trim()) {
      setError("Reflection is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await questService.completeQuest(id, { reflection });
      navigate("/quests");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to submit reflection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activePage="quests" />
      <div className="flex-1 ml-72 pt-12 pb-16 px-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <p>Loading quest...</p>
          ) : !quest ? (
            <p className="text-muted-foreground">Quest not found.</p>
          ) : (
            <div className="border rounded-xl bg-card shadow-sm p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                    {quest.title}
                  </h1>
                  <p className="text-muted-foreground">{quest.description}</p>
                </div>

                <Badge
                  className={
                    quest.completed
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }
                >
                  {quest.completed ? "Completed" : "Open"}
                </Badge>
              </div>

              <div className="rounded-xl border p-5 bg-background">
                <h2 className="font-semibold mb-2">Offline instruction</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {quest.offlineInstruction || "No offline instruction provided yet."}
                </p>
              </div>

              {quest.completed ? (
                <div className="rounded-xl border p-5 bg-green-50 text-green-700">
                  You have already completed this quest.
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Reflection</label>
                    <Textarea
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      placeholder="Write what you did, what you learned, and how the quest went."
                      className="min-h-[180px]"
                    />
                  </div>

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <Button onClick={handleSubmit} disabled={saving}>
                    {saving ? "Submitting..." : "Submit reflection"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}