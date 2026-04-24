"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Avatar,
  Badge,
} from "@heroui/react";
import {
  PlusCircle,
  Briefcase,
  Building,
  MapPin,
  Loader2
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

type Job = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: number;
  tags: string[];
  avatars: Array<{ media: string; cache: string }>;
};

const jobTypes = ["Full-time", "Part-time", "Remote", "Internship", "Contract"];

export default function JobsPage() {
  const [open, setOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newJobId, setNewJobId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "On-site",
    description: "",
    salary: 0,
    tags: [] as string[]
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get("/jobs/all");
      if (response.data.success) {
        setJobs(response.data.list);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1 = () => {
    if (formData.title && formData.company) setStep(2);
  };

  const handleCreateJob = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/jobs/new", formData);
      if (response.data.success) {
        setNewJobId(response.data.data._id);
        setStep(3);
      }
    } catch (error) {
      console.error("Failed to create job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (!newJobId || !selectedFile) {
      handleFinish();
      return;
    }

    setIsSubmitting(true);
    const form = new FormData();
    form.append("documentId", newJobId);
    form.append("route", "jobs");
    form.append("type", "image");
    form.append("file", selectedFile);

    try {
      const interval = setInterval(() => {
        setUploadProgress(prev => (prev < 95 ? prev + 5 : prev));
      }, 100);

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
    fetchJobs();
  };

  const resetWizard = () => {
    setStep(1);
    setFormData({
      title: "",
      company: "",
      location: "On-site",
      description: "",
      salary: 0,
      tags: []
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setNewJobId(null);
    setUploadProgress(0);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Career Portal</h1>
            <p className="text-foreground-500 font-medium">Post and manage professional opportunities.</p>
          </div>
          <Button
            variant="primary"
            className="font-bold rounded-xl h-11"
          >
            <PlusCircle className="w-5 h-5" />
            Post Job
          </Button>
        </div>

        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <Card className="bg-content1 border border-divider p-20 flex flex-col items-center justify-center text-center space-y-6 rounded-2xl">
            <div className="w-20 h-20 rounded-2xl bg-content2 border border-divider flex items-center justify-center text-foreground-400">
              <Briefcase className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">No vacancies</h3>
              <p className="text-foreground-500 max-w-sm">Bring talent by posting a new job opportunity.</p>
            </div>
            <Button variant="primary" className="font-bold rounded-xl">
              Post First Job
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <Card key={job._id} className="bg-content1 border border-divider p-6 rounded-2xl hover:border-primary/50 transition-all group shadow-sm flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex justify-between items-start">
                    <Avatar
                      className="w-14 h-14 rounded-xl border border-divider bg-background"
                    >
                      <Avatar.Image src={job.avatars?.[0]?.media || `https://api.dicebear.com/7.x/initials/svg?seed=${job.company}`} />
                    </Avatar>
                    <Badge variant="primary" className="rounded-lg font-bold text-[10px] uppercase">
                      {job.salary > 0 ? `$${job.salary}/yr` : 'Competitive'}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-md line-clamp-1">{job.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-foreground-500 tracking-tight">
                      <span className="flex items-center gap-1"><Building className="w-3 h-3" /> {job.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                    </div>
                  </div>

                  <p className="text-xs text-foreground-500 line-clamp-3 leading-relaxed font-medium">{job.description}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-divider flex items-center justify-between">
                  <Badge size="sm" variant="primary" className="rounded-md font-bold text-[9px] uppercase">Official</Badge>
                  <Button size="sm" variant="primary" className="font-bold rounded-lg px-6 h-8 text-xs">
                    Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
