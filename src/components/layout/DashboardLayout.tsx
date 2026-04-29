"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Avatar,
  Button,
  Badge,
  Tooltip,
  toast,
  Spinner,

} from "@heroui/react";
import {
  Home,
  MessageCircle,
  ShieldCheck,
  Briefcase,
  Bell,
  FileText,
  Menu,
  X,
  LogOut,
  Search,
  Sparkles, Settings, ChevronRight, Shield
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useDashboardStore, } from "@/stores/dashboardStore";
import { AssetDecoder, axiosError } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems: Array<{
  id: string;
  label: string;
  icon: any;
  href: string;
  adminRequired?: number;
}> = [
    { id: "overview", label: "Dashboard", icon: Home, href: "/" },
    { id: "feeds", label: "Social Feeds", icon: MessageCircle, href: "/feeds" },
    { id: "accommodations", label: "Property Hub", icon: ShieldCheck, href: "/accommodations" },
    { id: "jobs", label: "Career Portal", icon: Briefcase, href: "/jobs" },
    { id: "lost-and-found", label: "Lost & Found", icon: Search, href: "/lost-and-found" },
    { id: "files", label: "Media Library", icon: FileText, href: "/files" },
    { id: "permissions", label: "Permissions", icon: Shield, href: "/permissions", adminRequired: 2 },
  ];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, getUser } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, section, setSection } = useDashboardStore();
  const loadUser = async () => {
    try {
      await getUser();
    } catch (error: any) {
    }
  }
  useEffect(() => {
    loadUser();
  }, [])
  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  if (!isAuthenticated) {
    return <div className="w-screen h-screen flex items-center justify-center">
      <Spinner />
    </div>
  }
  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col border-r border-divider bg-content1/50 backdrop-blur-xl transition-all duration-500 ease-in-out ${sidebarOpen ? 'w-72' : 'w-24'}`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Sparkles className="w-7 h-7 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-400">
              <span className="text-foreground text-xl font-black tracking-tighter">NyikaRise</span>
              <span className="text-primary text-[10px] uppercase tracking-[0.2em] font-black opacity-80">Intelligence</span>
            </div>
          )}
        </div>
        <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            if (item.adminRequired && (user?.admin || 0) < item.adminRequired) {
              return null;
            }
            const active = item.href == pathname;
            return (
              <Tooltip key={item.id} isDisabled={sidebarOpen} closeDelay={0}>
                <button
                  onClick={() => {
                    setSection(item.id as any);
                    router.push(item.href);
                  }}

                  className={`group relative flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 transition-all duration-300 ${active
                    ? "bg-[#e6e6e610] text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-foreground-500 hover:bg-content2 hover:text-foreground"
                    }`}
                >
                  <item.icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110 text-primary' : 'group-hover:scale-110'}`} />
                  {sidebarOpen && <span className="font-bold text-sm tracking-tight">{item.label} </span>}
                  {true && sidebarOpen && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground" />
                  )}
                </button>
                <Tooltip.Content>
                  {item.label}
                </Tooltip.Content>
              </Tooltip>
            );
          })}
        </nav>

        {/* Profile Nav Section */}
        <div className="p-4 border-t border-divider">
          <div className={`flex flex-col gap-2 rounded-3xl p-3 transition-colors ${sidebarOpen ? 'bg-content2/50 border border-divider' : ''}`}>
            <div className={`flex items-center gap-3 ${sidebarOpen ? '' : 'justify-center'}`}>
              <Avatar
                size={sidebarOpen ? "md" : "sm"}
                className="rounded-2xl border border-divider shadow-sm"
              >
                <Avatar.Image src={AssetDecoder.decoder(user?.avatar)} />
              </Avatar>
              {sidebarOpen && (
                <div className="flex flex-col min-w-0 animate-in fade-in slide-in-from-bottom-1">
                  <span className="text-sm font-black text-foreground truncate">{user?.fullName}</span>
                  <span className="text-[10px] text-foreground-500 uppercase font-black tracking-widest">{(user?.admin ?? 0) > 1 ? 'Super Admin' : 'Agent'}</span>
                </div>
              )}
            </div>
            {sidebarOpen && (
              <div className="flex flex-col gap-1 mt-2">
                <Button
                  size="sm"
                  className="justify-start px-3 text-foreground-500 hover:text-foreground hover:bg-content3"
                >
                  <Settings className="w-4 h-4" />   Account Settings
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  className="rounded-xl font-bold mt-1"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            )}
            {!sidebarOpen && (
              <Button isIconOnly variant="ghost" className="mt-2" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 border-b border-divider flex items-center justify-between px-6 lg:px-10 bg-background/60 backdrop-blur-xl z-30">
          <div className="flex items-center gap-4">
            <Button isIconOnly variant="primary" className="lg:hidden rounded-xl" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <Button
              isIconOnly
              className="hidden lg:flex text-foreground-400 hover:text-foreground hover:bg-content2 rounded-xl"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <ChevronRight className="w-5 h-5 rotate-180" /> : <ChevronRight className="w-5 h-5" />}
            </Button>
            <div className="h-6 w-[1px] bg-divider hidden lg:block mx-2" />
            <div className="flex flex-col">
              <h2 className="text-lg font-black text-foreground tracking-tight">
                {navItems.find(i => i.href === pathname)?.label || "Overview"}
              </h2>
              <span className="text-[10px] text-foreground-500 uppercase font-black tracking-widest leading-none">Management Console</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-content2/50 border border-divider rounded-2xl px-4 py-2 text-foreground-400 text-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all cursor-pointer group">
              <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span className="pr-10 font-medium">Search Command...</span>
              <kbd className="bg-content3 px-2 py-0.5 rounded-lg text-[10px] border border-divider font-sans font-bold">⌘K</kbd>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Tooltip >
                <Button isIconOnly className="text-foreground-500 hover:text-primary relative rounded-xl bg-content2/50 border border-divider">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background ring-offset-0" />
                </Button>
                <Tooltip.Content>
                  Notifications
                </Tooltip.Content>
              </Tooltip>
              <Avatar size="sm" className="lg:hidden border border-divider shadow-sm" >
                <Avatar.Image src={AssetDecoder.decoder(user?.avatar)} />
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar relative z-10 bg-content2/30">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100] lg:hidden animate-in fade-in duration-300"
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            className="w-80 h-full bg-content1 border-r border-divider flex flex-col p-6 animate-in slide-in-from-left duration-500 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-foreground text-xl font-black tracking-tighter">NyikaRise</span>
                  <span className="text-primary text-[10px] uppercase tracking-widest font-black leading-none">Mobile</span>
                </div>
              </div>
              <Button isIconOnly size="sm" variant="danger" className="rounded-xl" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-foreground-400" />
              </Button>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
              {navItems.map((item) => {
                if (item.adminRequired && (user?.admin || 0) < item.adminRequired) {
                  return null;
                }
                const active = item.href === "/" ? pathname === "/" : pathname.includes(item.href);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSection(item.id as any);
                      router.push(item.href);
                      setSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300 ${active
                      ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                      : "text-foreground-500 hover:bg-content2 hover:text-foreground"
                      }`}
                  >
                    <item.icon className={`w-5 h-5 ${active ? 'scale-110' : ''}`} />
                    <span className="font-bold text-base tracking-tight">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-auto pt-6 border-t border-divider">
              <div className="flex items-center justify-between p-4 bg-content2/50 rounded-3xl border border-divider">
                <div className="flex items-center gap-3">
                  <Badge content="" color="success" placement="bottom-right">
                    <Avatar size="md" className="rounded-2xl border border-divider shadow-sm">
                      <Avatar.Image src={AssetDecoder.decoder(user?.avatar)} />
                    </Avatar>
                  </Badge>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black text-foreground truncate">{user?.fullName}</span>
                    <span className="text-[10px] text-foreground-500 uppercase font-bold tracking-widest">Agent</span>
                  </div>
                </div>
                <Button isIconOnly size="sm" variant="danger" className="rounded-xl" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
