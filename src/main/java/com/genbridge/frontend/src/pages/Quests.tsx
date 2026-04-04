import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import questService, { Quest, QuestCompletion } from "@/services/questService";

export default function Quests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completions, setCompletions] = useState<QuestCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [questsData, completionsData] = await Promise.all([
        questService.getQuests(),
        questService.getMyCompletions(),
      ]);
      setQuests(questsData);
      setCompletions(completionsData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const completedIds = new Set(completions.map((item) => item.questId));

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activePage="quests" />
      <div className="flex-1 ml-72 pt-12 pb-16 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">Quests</h1>
            <p className="text-muted-foreground">
              Complete offline activities and submit a short reflection for each quest.
            </p>
          </div>

          {loading ? (
            <p>Loading quests...</p>
          ) : quests.length === 0 ? (
            <p className="text-muted-foreground">No published quests yet.</p>
          ) : (
            <div className="space-y-4">
              {quests.map((quest) => {
                const completed = quest.completed || completedIds.has(quest.id);

                return (
                  <div
                    key={quest.id}
                    className="border rounded-xl p-6 bg-card shadow-sm flex flex-col gap-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-foreground">{quest.title}</h2>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {quest.description}
                        </p>
                      </div>

                      <Badge
                        className={
                          completed
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }
                      >
                        {completed ? "Completed" : "Pending"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {completed
                          ? "You have already submitted a reflection."
                          : "Open the quest to complete it."}
                      </span>

                      <Button asChild>
                        <Link to={`/quests/${quest.id}`}>View Quest</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}