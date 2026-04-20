"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Badge,
} from "@heroui/react";
import {
  Home,
  MapPin,
  PlusCircle,
  Loader2,
  Bed,
  Maximize
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Image from "next/image";

type Accommodation = {
  _id: string;
  propertyName: string;
  type: string;
  location: string;
  description: string;
  rooms: number;
  monthlyRent: number;
  isAvailable: boolean;
  avatars: Array<{ media: string; cache: string }>;
};

const roomTypes = ["Single Room", "Double Room", "Studio", "Apartment", "Dormitory"];

export default function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newAccId, setNewAccId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    propertyName: "",
    type: "Single Room",
    location: "",
    description: "",
    rooms: 1,
    monthlyRent: 0,
    isAvailable: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const response = await api.get("/accommodations/all");
      if (response.data.success) {
        setAccommodations(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch accommodations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1 = () => {
    if (formData.propertyName && formData.location) setStep(2);
  };

  const handleCreateAccommodation = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/accommodations/new", formData);
      if (response.data.success) {
        setNewAccId(response.data.data._id);
        setStep(3);
      }
    } catch (error) {
      console.error("Failed to create accommodation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!newAccId || !selectedFile) {
      handleFinish();
      return;
    }

    setIsSubmitting(true);
    const form = new FormData();
    form.append("documentId", newAccId);
    form.append("route", "accommodations");
    form.append("type", "image");
    form.append("file", selectedFile);

    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev < 95 ? prev + 5 : prev));
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
    fetchAccommodations();
  };

  const resetWizard = () => {
    setStep(1);
    setFormData({
      propertyName: "",
      type: "Single Room",
      location: "",
      description: "",
      rooms: 1,
      monthlyRent: 0,
      isAvailable: true
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setNewAccId(null);
    setUploadProgress(0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Property Hub</h1>
            <p className="text-foreground-500 font-medium">Manage student housing and estate listings.</p>
          </div>
          <Button
            variant="primary"
            className="font-bold rounded-xl h-11"
          >
            <PlusCircle className="w-5 h-5" />
            Add Property
          </Button>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : accommodations.length === 0 ? (
          <Card className="bg-content1 border border-divider p-20 flex flex-col items-center justify-center text-center space-y-6 rounded-[2rem]">
            <div className="w-20 h-20 rounded-3xl bg-content2 border border-divider flex items-center justify-center text-foreground-400">
              <Home className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">No property listings</h3>
              <p className="text-foreground-500 max-w-sm">Start by listing a new student accommodation.</p>
            </div>
            <Button variant="primary" className="font-bold rounded-xl">
              Add Your First Listing
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accommodations.map((acc) => (
              <Card key={acc._id} className="bg-content1 border border-divider overflow-hidden rounded-2xl hover:border-primary/50 transition-all group shadow-sm">
                <div className="relative h-44">
                  <Image
                    src={acc.avatars?.[0]?.media || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
                    alt={acc.propertyName}
                    fill
                    className="w-full h-full object-cover rounded-none transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-3 left-3 z-10">
                    <Badge color={acc.isAvailable ? "success" : "danger"} className="p-1 px-3 text-white font-bold rounded-lg uppercase text-[10px]">
                      {acc.isAvailable ? "Active" : "Occupied"}
                    </Badge>
                  </div>
                </div>
                <Card.Content className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-foreground text-md line-clamp-1">{acc.propertyName}</h4>
                      <p className="text-[10px] text-foreground-500 font-bold uppercase tracking-tight flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {acc.location}
                      </p>
                    </div>
                    <p className="text-primary font-bold text-md">${acc.monthlyRent}</p>
                  </div>

                  <div className="flex items-center gap-4 py-2 border-y border-divider">
                    <div className="flex items-center gap-2 text-foreground-500">
                      <Bed className="w-3.5 h-3.5 text-primary" /> <span className="text-[11px] font-bold uppercase">{acc.rooms} BR</span>
                    </div>
                    <div className="flex items-center gap-2 text-foreground-500 border-l border-divider pl-4">
                      <Maximize className="w-3.5 h-3.5 text-primary" /> <span className="text-[11px] font-bold uppercase">{acc.type}</span>
                    </div>
                  </div>

                  <p className="text-xs text-foreground-500 line-clamp-2 leading-relaxed font-medium">{acc.description}</p>

                  <Button variant="danger-soft" fullWidth className="font-bold rounded-xl h-9 text-xs">
                    Edit Listing
                  </Button>
                </Card.Content>
              </Card>
            ))}
          </div>
        )}
      </div>

    </DashboardLayout >
  );
}
