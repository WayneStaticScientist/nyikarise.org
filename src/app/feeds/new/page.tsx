'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Input,
  ProgressBar,
  toast
} from "@heroui/react";
import {
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Image as ImageIcon
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Image from "next/image";
import { calculateFileHash } from "@/lib/utils";
import RichTextEditor from "@/components/ui/RichTextEditor";

export default function NewFeedPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFeedId, setNewFeedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ title: "", content: "" });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleStep1 = async () => {
    if (!formData.title || !formData.content) return;
    setIsSubmitting(true);
    try {
      const response = await api.post("/feeds/create", formData);
      setNewFeedId(response.data.feed._id);
      setStep(2);
      toast.success("Feed created successfully");
    } catch (error) {
      toast.danger("Failed to create feed " + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!newFeedId) return;

    if (selectedFiles.length === 0) {
      setStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 500);
      const uploadRequests = await Promise.all(selectedFiles.map(async (file) => {
        const fileHash = await calculateFileHash(file);
        const form = new FormData();
        form.append("documentId", newFeedId);
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
      setStep(3);
    } catch (error) {
      console.error("File upload failed:", error);
      toast.danger("Some files failed to upload");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    router.push("/feeds");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="outline"
            onClick={() => router.push("/feeds")}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">New Publication</h1>
            <p className="text-foreground-500 font-medium">Create a new post for the community feed.</p>
          </div>
        </div>

        <Card className="bg-content1 border border-divider shadow-sm rounded-[2rem] overflow-hidden">
          <div className="bg-content2/50 border-b border-divider px-10 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold min-w-10 min-h-10 border ${step >= 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-content3 text-foreground-400 border-divider'}`}>
                1
              </div>
              <div className={`w-10 h-[2px] ${step >= 2 ? 'bg-primary' : 'bg-divider'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold min-w-10 min-h-10 border ${step >= 2 ? 'bg-primary text-primary-foreground border-primary' : 'bg-content3 text-foreground-400 border-divider'}`}>
                2
              </div>
              <div className={`w-10 h-[2px] ${step >= 3 ? 'bg-primary' : 'bg-divider'}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold min-w-10 min-h-10 border ${step >= 3 ? 'bg-success text-success-foreground border-success' : 'bg-content3 text-foreground-400 border-divider'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm font-bold text-foreground-500 uppercase tracking-widest">
              Stage {step} of 3
            </p>
          </div>

          <div className="">
            {step === 1 && (
              <div className="space-y-8 max-w-2xl mx-auto">
                <div className="space-y-2 text-center">
                  <h3 className="text-2xl font-bold">Content Details</h3>
                  <p className="text-foreground-500">Provide the text content for your new post.</p>
                </div>

                <div className="space-y-6">
                  <Input
                    placeholder="Enter a compelling title..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="border-divider rounded-xl h-14 bg-content2 focus-within:border-primary"
                  />
                  <RichTextEditor
                    placeholder="Describe the update in detail..."
                    value={formData.content}
                    onChange={(v) => setFormData({ ...formData, content: v })}
                  />
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    variant="primary"
                    className="font-bold rounded-xl px-10 h-12"
                    onPress={handleStep1}
                    isDisabled={!formData.title || !formData.content}
                  >
                    Save & Continue
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-10 max-w-2xl mx-auto text-center">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Visual Context</h3>
                  <p className="text-foreground-500 font-medium">Add an image to capture attention. (Optional)</p>
                </div>

                {previewUrls.length === 0 ? (
                  <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-divider rounded-3xl bg-content2 cursor-pointer hover:bg-content3/50 hover:border-primary/50 transition-all group relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ImageIcon className="w-12 h-12 text-foreground-400 group-hover:text-primary transition-colors mb-4 relative z-10" />
                    <p className="text-base font-bold relative z-10">Click or drag images to upload</p>
                    <p className="text-xs text-foreground-400 mt-2 uppercase font-bold relative z-10">PNG, JPG up to 10MB</p>
                    <input type="file" className="hidden" multiple accept="image/*" onChange={(e) => {
                      if (e.target.files?.length) {
                        const files = Array.from(e.target.files);
                        setSelectedFiles(files);
                        setPreviewUrls(files.map(file => URL.createObjectURL(file)));
                      }
                    }} />
                  </label>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-video rounded-3xl overflow-hidden border border-divider group bg-content1 shadow-md">
                          <Image src={url} alt="Preview" fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button variant="danger" size="sm" className="font-bold rounded-xl" onPress={() => {
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
                    <Button variant="outline" size="sm" className="font-bold" onPress={() => { setSelectedFiles([]); setPreviewUrls([]); }}>
                      Clear All
                    </Button>
                  </div>
                )}

                {isSubmitting && (
                  <div className="space-y-2 max-w-sm mx-auto">
                    <div className="flex justify-between text-xs font-bold text-foreground-500 uppercase tracking-wider">
                      <span>Uploading</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <ProgressBar value={uploadProgress} color="default" size="sm" className="h-2 rounded-full" />
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-divider">
                  <Button variant="outline" className="font-bold rounded-xl px-8 h-12 text-foreground-500" onPress={handleFileUpload} isDisabled={isSubmitting}>
                    Skip This Step
                  </Button>
                  <Button variant="primary" className="font-bold rounded-xl px-10 h-12 shadow-lg shadow-primary/20" onPress={handleFileUpload} isDisabled={selectedFiles.length === 0}>
                    Publish Post
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center justify-center py-16 space-y-8 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center text-success border border-success/20">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-extrabold tracking-tight">Successfully Published!</h3>
                  <p className="text-foreground-500 font-medium max-w-sm mx-auto">Your new post is now live and visible to the community.</p>
                </div>
                <Button variant="primary" className="font-bold rounded-xl px-12 h-14" onPress={handleFinish}>
                  Return to Feeds Dashboard
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
