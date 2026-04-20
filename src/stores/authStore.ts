import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { TAvatar } from "@/types/avatar";

interface User {
  id: string;
  email: string;
  fullName: string;
  admin: number;
  phoneNumber: string;
  avatar?: TAvatar;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  deviceId: string;
  isAuthenticated: boolean;
  login: (phoneNumber: string, password: string) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      deviceId: typeof window !== "undefined" ? (localStorage.getItem("x-device-id") || uuidv4()) : uuidv4(),
      isAuthenticated: false,
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
            user: {
              id: user._id,
              email: user.email,
              fullName: user.fullName,
              admin: user.admin,
              phoneNumber: user.phoneNumber,
              avatar: user.avatar
            },
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            isAuthenticated: true
          });
        } catch (error) {
          throw error;
        }
      },
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
      },
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
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
