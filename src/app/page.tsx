"use client";

import {
  Card,
  Avatar,
  ProgressBar,
  Spinner,
} from "@heroui/react";
import {
  Users,
  Activity,
  ArrowUpRight,
  Globe,
  Database,
  Briefcase,
  Cpu,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DashboardHome() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/admin/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.warn("Stats API failure, using fallback data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, []);

  const metricCards = [
    {
      title: "Total Members",
      value: stats?.totalUsers?.toLocaleString() || "...",
      sub: `${stats?.recentSignups || 0} new this week`,
      icon: Users,
      color: "primary"
    },
    {
      title: "Open Opportunities",
      value: stats?.totalJobs?.toLocaleString() || "...",
      sub: `${stats?.activeJobs || 0} active postings`,
      icon: Briefcase,
      color: "secondary"
    },
    {
      title: "Social Activity",
      value: stats?.totalFeedPosts?.toLocaleString() || "...",
      sub: `${stats?.totalFeedComments || 0} interactions`,
      icon: Activity,
      color: "success"
    },
    {
      title: "Property Assets",
      value: stats?.totalAccommodations?.toLocaleString() || "...",
      sub: `${stats?.activeAccommodations || 0} verified`,
      icon: Globe,
      color: "warning"
    },
  ];
  if (isLoading) {
    return <div className="w-screen h-screen flex items-center justify-center">
      <Spinner />
    </div>
  }
  return (
    <DashboardLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">


        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricCards.map((card, idx) => (
            <Card key={idx} className="bg-content1 border border-divider shadow-md rounded-[2rem] group hover:border-primary/50 hover:shadow-primary/5 transition-all duration-500 overflow-hidden">
              <Card.Content className="p-7 relative">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${card.color}/10 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-${card.color}/20 transition-all duration-500`} />
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-4 rounded-2xl bg-${card.color}/10 text-${card.color} group-hover:scale-110 transition-transform duration-500`}>
                    <card.icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1.5 text-success text-[10px] font-black bg-success/10 px-3 py-1.5 rounded-xl uppercase tracking-widest border border-success/20">
                    <ArrowUpRight className="w-3 h-3" />
                    Live
                  </div>
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-[11px] font-black text-foreground-400 uppercase tracking-[0.15em]">{card.title}</p>
                  <h3 className="text-3xl font-black text-foreground tabular-nums tracking-tighter">{card.value}</h3>
                  <p className="text-[10px] font-bold text-foreground-500 flex items-center gap-1.5 mt-2">
                    <Activity className="w-3 h-3 text-success" />
                    {card.sub}
                  </p>
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Activity Stream */}

          {/* System & Storage Health */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-primary text-primary-foreground border-none shadow-2xl shadow-primary/20 rounded-[2.5rem] overflow-hidden relative">
              <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 blur-[80px] -mr-12 -mt-12 rounded-full" />
              <Card.Content className="p-10 flex flex-col items-center text-center space-y-6 relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-black tracking-tight underline decoration-white/30 underline-offset-4">Cloud Core Stats</h4>
                  <p className="text-[10px] text-white/70 font-black uppercase tracking-[0.15em]">S3 Storage Metrics</p>
                </div>
                <div className="text-5xl font-black tracking-tighter flex items-end gap-1">
                  {stats ? (stats.storageUsed / (1024 ** 3)).toFixed(4) : "1.45"}
                  <span className="text-xl font-black opacity-60 pb-1.5 uppercase">GB</span>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-80">
                    <span>Quota Utilized</span>
                    <span>15%</span>
                  </div>
                  <ProgressBar
                    value={15}
                    className="h-2 rounded-full bg-white/20"
                  />
                </div>
                <p className="text-[11px] font-bold bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                  Server Locations: Harare / Johannesburg
                </p>
              </Card.Content>
            </Card>


          </div>
          <Card className="bg-content1 lg:col-span-3 col-span-2 border border-divider shadow-xl rounded-[2.5rem]">
            <Card.Content className="p-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-2xl">
                  <Cpu className="w-6 h-6 text-success" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-base font-black text-foreground tracking-tight">System Core Health</h4>
                  <p className="text-[10px] text-success font-black uppercase tracking-widest">Active & Stable</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-content2 border border-divider text-center group hover:border-primary/50 transition-colors">
                  <span className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{(stats?.systemHealth?.uptime <= 3600) ? `${Math.floor((stats?.systemHealth?.uptime ?? 0) / 60)}m` : `${Math.floor((stats?.systemHealth?.uptime ?? 0) / 3600)}h`}</span>
                  <p className="text-[10px] text-foreground-500 font-bold uppercase tracking-widest mt-1">Uptime</p>
                </div>
                <div className="p-6 rounded-3xl bg-content2 border border-divider text-center group hover:border-primary/50 transition-colors">
                  <span className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{stats?.systemHealth?.database?.activePools || 0}</span>
                  <p className="text-[10px] text-foreground-500 font-bold uppercase tracking-widest mt-1">Active Pools</p>
                </div>
                <div className="p-6 rounded-3xl bg-content2 border border-divider text-center group hover:border-primary/50 transition-colors">
                  <span className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{stats?.systemHealth?.database?.status || 'not init'}</span>
                  <p className="text-[10px] text-foreground-500 font-bold uppercase tracking-widest mt-1">Status</p>
                </div>
                <div className="p-6 rounded-3xl bg-content2 border border-divider text-center group hover:border-primary/50 transition-colors">
                  <span className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{stats?.systemHealth?.database?.activeConnections || 0}</span>
                  <p className="text-[10px] text-foreground-500 font-bold uppercase tracking-widest mt-1">Active Connections</p>
                </div>
                <div className="p-6 rounded-3xl bg-content2 border border-divider text-center group hover:border-primary/50 transition-colors">
                  <span className="text-3xl font-black text-foreground group-hover:text-primary transition-colors">{stats?.systemHealth?.database?.readyState || 0}</span>
                  <p className="text-[10px] text-foreground-500 font-bold uppercase tracking-widest mt-1">Ready State</p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-[10px] font-black text-foreground-500 uppercase tracking-[0.2em]">
                  <span>Resource Load</span>
                  <span className="text-success">Optimal</span>
                </div>
                <ProgressBar
                  value={stats?.systemHealth ? (stats.systemHealth.memoryUsage / (512 * 1024 * 1024)) * 100 : 42}
                  size="md"
                  className="h-2 rounded-full"
                  color="accent"
                />
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <Avatar key={i} size="sm" className="border-2 border-content1" />
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-foreground-500">+{stats?.onlineUsers || 42} Active sessions detectadas</span>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
