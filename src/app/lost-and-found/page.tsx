"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Badge,
} from "@heroui/react";
import {
  Plus,
  Package,
  MapPin,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import { AssetDecoder } from "@/lib/utils";
import Image from "next/image";

interface LostItem {
  _id: string;
  type: "lost" | "found";
  itemName: string;
  category: string;
  description: string;
  location: string;
  date: string;
  contactName: string;
  contactPhone: string;
  status: "open" | "resolved" | "archived";
  avatars?: Array<{ media: string; cache: string }>;
}


export default function LostAndFoundPage() {
  const [items, setItems] = useState<LostItem[]>([]);
  const [filter, setFilter] = useState<"all" | "lost" | "found">("all");
  const [isLoading, setIsLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItemId, setNewItemId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    type: "lost" as "lost" | "found",
    itemName: "",
    category: "Electronics",
    description: "",
    location: "",
    date: new Date().toISOString().split('T')[0],
    contactName: "",
    contactPhone: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await api.get("/lost-and-found/all");
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (error) {
      console.warn("API not responding, using mock data for UI preview");
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1 = () => {
    if (formData.itemName && formData.description) setStep(2);
  };

  const handleCreateReport = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/lost-and-found/new", formData);
      if (response.data.success) {
        setNewItemId(response.data.data._id);
        setStep(3);
      }
    } catch (error) {
      console.error("Failed to create report:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadMedia = async () => {
    if (!newItemId || !selectedFile) {
      handleFinish();
      return;
    }

    setIsSubmitting(true);
    const form = new FormData();
    form.append("documentId", newItemId);
    form.append("route", "lost-found");
    form.append("type", "image");
    form.append("file", selectedFile);

    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev < 90 ? prev + 10 : prev));
      }, 150);

      const response = await api.post("/file/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      clearInterval(interval);
      setUploadProgress(100);

      if (response.data.success) {
        setStep(4);
      }
    } catch (error) {
      console.error("File upload failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    resetWizard();
    fetchItems();
  };

  const resetWizard = () => {
    setStep(1);
    setFormData({
      type: "lost",
      itemName: "",
      category: "Electronics",
      description: "",
      location: "",
      date: new Date().toISOString().split('T')[0],
      contactName: "",
      contactPhone: ""
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setNewItemId(null);
    setUploadProgress(0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Recovery Center</h1>
            <p className="text-foreground-500 font-medium">Tracking lost & found property across the platform.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-content1 p-1 rounded-xl border border-divider flex">
              <Button
                size="sm"
                variant={filter === 'all' ? 'primary' : 'primary'}
                className="rounded-lg font-bold px-4"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filter === 'lost' ? 'danger' : 'primary'}
                className="rounded-lg font-bold px-4"
                onClick={() => setFilter('lost')}
              >
                Lost
              </Button>
              <Button
                size="sm"
                variant={filter === 'found' ? 'secondary' : 'primary'}
                className="rounded-lg font-bold px-4"
                onClick={() => setFilter('found')}
              >
                Found
              </Button>
            </div>
            <Button variant="primary" className="font-bold rounded-xl h-11 px-6 shadow-lg shadow-primary/20" ><Plus className="w-5 h-5" />
              File Report
            </Button>
          </div>
        </div>

        {items.length === 0 && !isLoading ? (
          <Card className="bg-content1 border border-divider p-20 flex flex-col items-center justify-center text-center space-y-6 rounded-3xl">
            <div className="w-20 h-20 rounded-3xl bg-content2 border border-divider flex items-center justify-center text-foreground-400">
              <Package className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">No reports currently filed</h3>
              <p className="text-foreground-500 max-w-sm font-medium">Any items reported lost or found will be listed here management.</p>
            </div>
            <Button variant="primary" className="font-bold rounded-xl" >
              Submit New Report
            </Button>
          </Card>
        ) : isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.filter(i => filter === 'all' || i.type === filter).map(item => (
              <Card key={item._id} className="bg-content1 border border-divider rounded-2xl p-5 hover:border-primary/50 transition-all shadow-sm">
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-xl border border-divider bg-content2 overflow-hidden flex-shrink-0">
                    {item.avatars?.[0] ? <Image alt={item.itemName} width={100} height={100} src={AssetDecoder.decoder(item.avatars[0])} /> : <Package className="w-8 h-8 m-auto text-foreground-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <Badge variant={item.type === 'lost' ? 'secondary' : 'primary'} className="rounded-md font-bold text-[9px] uppercase px-2 mb-2">
                        {item.type}
                      </Badge>
                      <span className="text-[10px] font-bold text-foreground-400">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-foreground truncate">{item.itemName}</h4>
                    <p className="text-xs text-foreground-500 flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3 h-3 text-primary" /> {item.location}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Security Summary */}
        <div className="grid md:grid-cols-3 gap-6 pt-6">
          <Card className="col-span-1 md:col-span-2 bg-content1 border border-divider p-8 rounded-3xl flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-bold text-foreground">Verified Claims Only</h3>
              <p className="text-sm text-foreground-500 font-medium">Administrators must verify the identity and ownership before finalizing a return transaction.</p>
            </div>
          </Card>
          <Card className="bg-content2 border border-divider p-8 rounded-3xl flex flex-col justify-center">
            <h4 className="text-md font-bold text-foreground flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-warning fill-warning" /> Proactive Alerting
            </h4>
            <p className="text-xs text-foreground-500 font-medium leading-relaxed">Notifications are dispatched instantly to users when items matching their reports are registered.</p>
          </Card>
        </div>
      </div>

    </DashboardLayout>
  );
}
