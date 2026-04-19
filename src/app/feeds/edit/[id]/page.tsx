"use client"
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Input,
  ProgressBar,
  Spinner
} from "@heroui/react";
import {
  ArrowLeft,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Image from "next/image";
import { calculateFileHash } from "@/lib/utils";
import { FeedImage } from "@/components/ui/feed-image";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { AssetDecoder } from "@/lib/utils";

export default function EditFeedPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feed, setFeed] = useState<any>(null);

  const [formData, setFormData] = useState({ title: "", content: "" });
  const [existingImages, setExistingImages] = useState<any[]>([]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchFeed();
  }, [id]);

  const fetchFeed = async () => {
    try {
      const response = await api.get(`/feeds/${id}`);
      const feedData = response.data;
      setFeed(feedData);
      setFormData({ title: feedData.title, content: feedData.content });
      setExistingImages(feedData.avatars || []);
    } catch (error) {
      console.error("Failed to fetch feed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!formData.title || !formData.content) return;

    setIsSaving(true);
    try {
      await api.put(`/feeds/${id}`, formData);

      if (selectedFiles.length > 0) {
        await handleFileUpload();
      } else {
        router.push("/feeds");
      }
    } catch (error) {
      console.error("Failed to update feed:", error);
      setIsSaving(false);
    }
  };

  const handleFileUpload = async () => {
    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 500);

      const uploadRequests = await Promise.all(selectedFiles.map(async (file) => {
        const fileHash = await calculateFileHash(file);
        const form = new FormData();
        form.append("documentId", id);
        form.append("route", "feeds");
        form.append("type", "image");
        form.append("uniqueKey", fileHash);
        form.append("file", file);

        return api.post("/file/upload", form, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }));

      await Promise.all(uploadRequests);

      clearInterval(interval);
      setUploadProgress(100);
      router.push("/feeds");
    } catch (error) {
      console.error("File upload failed:", error);
      setIsSaving(false);
    }
  };

  const handleDeleteExistingImage = async (mediaUrl: string) => {
    try {
      await api.delete(`/feeds/image/${id}`, { data: { media: mediaUrl } });
      setExistingImages(prev => prev.filter(img => img.media !== mediaUrl));
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  const handleDeletePost = async () => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        await api.delete(`/feeds/${id}`);
        router.push("/feeds");
      } catch (error) {
        console.error("Failed to delete feed:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Spinner size="lg" color="current" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              isIconOnly
              variant="primary"
              onPress={() => router.push("/feeds")}
              className="rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="space-y-1">
              <h1 className="font-extrabold tracking-tight text-foreground">Edit Publication</h1>
            </div>
          </div>
          <Button
            variant="danger"
            className="font-bold rounded-xl h-11 px-6"
            onPress={handleDeletePost}
          >
            <Trash2 className="w-4 h-4" />
            Delete Post
          </Button>
        </div>

        <Card className="bg-content1 border border-divider shadow-sm rounded-[2rem] overflow-hidden">
          <div className=" space-y-10">
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Content Details</h3>
              </div>
              <Input
                placeholder="Enter a compelling title..."
                variant="secondary"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="border-divider w-full rounded-xl h-14 bg-content2 focus-within:border-primary"
              />
              <RichTextEditor
                placeholder="Describe the update in detail..."
                value={formData.content}
                onChange={(v) => setFormData({ ...formData, content: v })}
              />
            </div>

            <div className="space-y-6 pt-6 border-t border-divider">
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Visual Assets</h3>
                <p className="text-foreground-500 text-sm font-medium">Manage existing images or upload a new one.</p>
              </div>

              {existingImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {existingImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border border-divider group">
                      <FeedImage img={img} className="object-cover w-full h-full" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="danger"
                          size="sm"
                          className="font-bold rounded-xl"
                          onPress={() => handleDeleteExistingImage(img.media)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                {previewUrls.length === 0 ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-divider rounded-3xl bg-content2 cursor-pointer hover:bg-content3/50 hover:border-primary/50 transition-all group relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ImageIcon className="w-8 h-8 text-foreground-400 group-hover:text-primary transition-colors mb-2 relative z-10" />
                    <p className="text-sm font-bold relative z-10">Select images to add</p>
                    <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                      if (e.target.files?.length) {
                        const files = Array.from(e.target.files);
                        setSelectedFiles(prev => [...prev, ...files]);
                        setPreviewUrls(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
                      }
                    }} />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-3xl overflow-hidden border border-divider group bg-content1 shadow-md">
                          <Image src={url} alt="Preview" fill className="object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="danger" size="sm" className="font-bold rounded-xl px-4 backdrop-blur-md" onPress={() => {
                              const newFiles = [...selectedFiles];
                              const newUrls = [...previewUrls];
                              newFiles.splice(idx, 1);
                              newUrls.splice(idx, 1);
                              setSelectedFiles(newFiles);
                              setPreviewUrls(newUrls);
                            }}>
                              <Trash2 className="w-4 h-4 mr-1" /> Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4">
                      <label className="cursor-pointer">
                        <Button variant="primary" size="sm" className="font-bold">
                          Add More
                        </Button>
                        <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                          if (e.target.files?.length) {
                            const files = Array.from(e.target.files);
                            setSelectedFiles(prev => [...prev, ...files]);
                            setPreviewUrls(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
                          }
                        }} />
                      </label>
                      <Button variant="outline" size="sm" className="font-bold" onPress={() => { setSelectedFiles([]); setPreviewUrls([]); }}>
                        Clear All
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {isSaving && selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-foreground-500 uppercase tracking-wider">
                    <span>Uploading New Image</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <ProgressBar value={uploadProgress} size="sm" className="h-2 rounded-full" />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-8 border-t border-divider">
              <Button
                variant="primary"
                className="font-bold rounded-xl px-10 h-12 shadow-lg shadow-primary/20"
                onPress={handleUpdate}
                isDisabled={!formData.title || !formData.content}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout >
  );
}
