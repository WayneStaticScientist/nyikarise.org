import { create, type StateCreator } from "zustand";

export type DashboardSection =
  | "overview"
  | "users"
  | "feeds"
  | "accommodations"
  | "jobs"
  | "chat"
  | "files";

export interface StatCard {
  label: string;
  value: string;
  delta: string;
  icon: string;
  accent: string;
}

export interface DashboardData {
  welcome: string;
  subtitle: string;
  stats: StatCard[];
  summary: {
    activeUsers: number;
    totalPosts: number;
    listings: number;
    openJobs: number;
  };
  recentEvents: Array<{
    id: string;
    title: string;
    description: string;
    tag: string;
  }>;
}

interface DashboardStore {
  sidebarOpen: boolean;
  section: DashboardSection;
  dashboardData: DashboardData | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setSection: (section: DashboardSection) => void;
  setDashboardData: (data: DashboardData) => void;
}

const createDashboardStore: StateCreator<DashboardStore> = (set) => ({
  sidebarOpen: false,
  section: "overview",
  dashboardData: null,
  setSidebarOpen: (sidebarOpen: boolean) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSection: (section: DashboardSection) => set({ section }),
  setDashboardData: (dashboardData: DashboardData) => set({ dashboardData }),
});

export const useDashboardStore = create<DashboardStore>(createDashboardStore);
