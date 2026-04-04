import api from "./api";

export interface Quest {
  id: number;
  title: string;
  description: string;
  offlineInstruction: string;
  published: boolean;
  completed?: boolean;
  publishedAt?: string | null;
}

export interface QuestCompletion {
  id: number;
  questId: number;
  questTitle: string;
  reflection: string;
  completedAt: string;
}

export interface QuestRequest {
  title: string;
  description: string;
  offlineInstruction: string;
  published: boolean;
}

export interface QuestCompletionRequest {
  reflection: string;
}

const questService = {
  getQuests: async () => {
    const res = await api.get("/quests");
    return res.data;
  },

  getQuestById: async (id: string | number) => {
    const res = await api.get(`/quests/${id}`);
    return res.data;
  },

  completeQuest: async (id: string | number, payload: QuestCompletionRequest) => {
    const res = await api.post(`/quests/${id}/complete`, payload);
    return res.data;
  },

  getMyCompletions: async () => {
    const res = await api.get("/quests/completions");
    return res.data;
  },

  getAllAdminQuests: async () => {
    const res = await api.get("/admin/quests");
    return res.data;
  },

  createQuest: async (payload: QuestRequest) => {
    const res = await api.post("/quests", payload);
    return res.data;
  },

  updateQuest: async (id: string | number, payload: QuestRequest) => {
    const res = await api.put(`/quests/${id}`, payload);
    return res.data;
  },

  deleteQuest: async (id: string | number) => {
    const res = await api.delete(`/quests/${id}`);
    return res.data;
  },
};

export default questService;