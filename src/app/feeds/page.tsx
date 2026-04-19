"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Avatar,
  Badge,
  toast,
} from "@heroui/react";
import {
  Plus,
  Search,
  MessageSquare,
  Heart,
  Loader2,
  Edit
} from "lucide-react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { FeedImage } from "@/components/ui/feed-image";
import DashboardLayout from "@/components/layout/DashboardLayout";

type Feed = {
  _id: string;
  title: string;
  content: string;
  user: {
    _id: string;
    fullName: string;
  };
  likes: number;
  comments: number;
  views: number;
  datePosted: number;
  avatars: Array<{ media: string; cache: string; cloud?: string }>;
};

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      const response = await api.get("/feeds/all");
      setFeeds(response.data.feeds);
    } catch (error) {
      toast.danger('Failed to fetch feeds ' + error)
      console.error("Failed to fetch feeds:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFeeds = feeds.filter(f =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Social Feed</h1>
            <p className="text-foreground-500 font-medium">Manage community posts and news updates.</p>
          </div>
          <div className="flex gap-3">
            <div className="max-w-xs relative bg-content1 rounded-xl border border-divider">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-400" />
              <input
                type="text"
                placeholder="Filter posts..."
                className="bg-transparent border-none outline-none pl-10 pr-4 py-2 text-sm text-foreground w-full placeholder:text-foreground-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="primary"
              className="font-bold rounded-xl px-6 h-11"
              onPress={() => router.push("/feeds/new")}
            >
              <Plus className="w-5 h-5" />
              New Post
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : filteredFeeds.length === 0 ? (
          <Card className="bg-content1 border border-divider p-20 flex flex-col items-center justify-center text-center space-y-6 rounded-[2rem]">
            <div className="w-20 h-20 rounded-3xl bg-content2 border border-divider flex items-center justify-center text-foreground-400">
              <MessageSquare className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">No posts yet</h3>
              <p className="text-foreground-500 max-w-sm font-medium">Create updates to keep the community informed.</p>
            </div>
            <Button variant="primary" className="font-bold rounded-xl" onPress={() => router.push("/feeds/new")}>
              Create First Entry
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredFeeds.map((feed) => (
              <Card key={feed._id} className="bg-content1 w-full border border-divider p-6 rounded-2xl hover:border-primary/50 transition-all group shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-4 w-full">
                    <Avatar className="w-12 h-12 border border-divider bg-background" />
                    <div className="flex-1 space-y-3 w-full min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-foreground line-clamp-1">{feed.title}</h4>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-foreground-400">{feed.user.fullName} • {new Date(feed.datePosted).toDateString()}</p>
                        </div>
                        <Badge color="accent" className="rounded-lg font-bold text-[10px] bg-primary/10 text-primary border-none">{feed.views} Views</Badge>
                      </div>
                      <p className="text-sm text-foreground-500 line-clamp-3 leading-relaxed">{feed.content}</p>

                      {feed.avatars && feed.avatars.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 py-2 w-full overflow-x-auto">
                          {feed.avatars.slice(0, 3).map((img, i) => (
                            <FeedImage key={i} img={img} />
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 text-foreground-500">
                            <Heart className="w-4 h-4" />
                            <span className="text-xs font-bold">{feed.likes}</span>
                          </div>
                          <div className="flex items-center gap-2 text-foreground-500">
                            <MessageSquare className="w-4 h-4" />
                            <span className="text-xs font-bold">{feed.comments}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="primary"
                          className="font-bold rounded-lg px-4"
                          onClick={() => router.push(`/feeds/edit/${feed._id}`)}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
