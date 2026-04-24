import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { IUser } from "@/types/user";


interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  deviceId: string;
  isAuthenticated: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<IUser>) => void;
  getUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      deviceId: typeof window !== "undefined" ? (localStorage.getItem("x-device-id") || uuidv4()) : uuidv4(),
      isAuthenticated: false,
      getUser: async () => {
        const { default: api } = await import("@/lib/api");
        try {
          const response = await api.get(`/user/getuser`);
          const { user } = response.data;
          set({
            user: user,
            isAuthenticated: true
          });
        } catch (error) {
          throw error;
        }
      },
      login: async (phoneNumber, password) => {
        const { default: api } = await import("@/lib/api");
        try {
          const response = await api.post("/user/login", { phoneNumber, password });
          const { tokens, user } = response.data;
          if (typeof window !== "undefined") {
            const dId = get().deviceId;
            localStorage.setItem("x-device-id", dId);
          }
          set({
            user: user,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true
          });
          window.location.href = "/"
        } catch (error) {
          throw error;
        }
      },
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
        localStorage.removeItem("x-device-id");
        localStorage.removeItem("auth-storage");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "auth-storage",
    }
  )
);
