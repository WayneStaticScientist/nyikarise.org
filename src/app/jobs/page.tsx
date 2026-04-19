"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  Avatar,
  Badge,
  Select,
  ProgressBar,
} from "@heroui/react";
import {
  PlusCircle,
  Briefcase,
  Building,
  MapPin,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileUp,
  Trash2,
  Loader2
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";
import Image from "next/image";

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
        setJobs(response.data.data);
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
    onClose();
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
            color="primary"
            className="font-bold rounded-xl h-11"
            startContent={<PlusCircle className="w-5 h-5" />}
          >
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
            <Button color="primary" variant="flat" className="font-bold rounded-xl">
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
                      src={job.avatars?.[0]?.media || `https://api.dicebear.com/7.x/initials/svg?seed=${job.company}`}
                      className="w-14 h-14 rounded-xl border border-divider bg-background"
                    />
                    <Badge color="primary" variant="flat" className="rounded-lg font-bold text-[10px] uppercase">
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
                  <Badge size="sm" color="default" variant="flat" className="rounded-md font-bold text-[9px] uppercase">Official</Badge>
                  <Button size="sm" color="primary" variant="flat" className="font-bold rounded-lg px-6 h-8 text-xs">
                    Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal size="4xl" backdrop="blur" classNames={{ base: "bg-background border border-divider rounded-3xl" }}>
        <Modal.Container>
          {(onClose) => (
            <>
              <Modal.Header className="bg-content1 py-6 flex flex-col gap-1 text-center border-b border-divider">
                <h2 className="text-xl font-bold">Post New Opportunity</h2>
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-content3'}`} />
                  ))}
                </div>
              </Modal.Header>
              <ModalBody className="py-8">
                {step === 1 && (
                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="Job Title"
                      placeholder="e.g. Lead Developer"
                      labelPlacement="outside"
                      size="lg"
                      variant="bordered"
                      className="col-span-2"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      classNames={{ inputWrapper: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                    />
                    <Input
                      label="Organization"
                      placeholder="Enter company name"
                      labelPlacement="outside"
                      size="lg"
                      variant="bordered"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      classNames={{ inputWrapper: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                    />
                    <Select
                      label="Type"
                      labelPlacement="outside"
                      size="lg"
                      variant="bordered"
                      selectedKeys={[formData.location]}
                      onSelectionChange={(keys) => setFormData({ ...formData, location: Array.from(keys)[0] as string })}
                      classNames={{ trigger: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                    >
                      {jobTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </Select>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <Input
                      label="Compensation ($/Year)"
                      placeholder="85000"
                      type="number"
                      labelPlacement="outside"
                      size="lg"
                      variant="bordered"
                      startContent={<DollarSign className="w-4 h-4 text-primary" />}
                      value={formData.salary.toString()}
                      onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) })}
                      classNames={{ inputWrapper: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                    />
                    <Textarea
                      label="Mission Description"
                      placeholder="What should the applicant know?"
                      labelPlacement="outside"
                      size="lg"
                      variant="bordered"
                      minRows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      classNames={{ inputWrapper: "border-divider rounded-xl pt-4 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-8 text-center py-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold">Brand Logo</h3>
                      <p className="text-xs text-foreground-500 font-medium">Upload a logo to enhance visibility.</p>
                    </div>
                    {!previewUrl ? (
                      <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-divider rounded-3xl bg-content2 cursor-pointer hover:bg-content3 transition-all group">
                        <FileUp className="w-12 h-12 text-primary mb-4" />
                        <p className="text-sm font-bold uppercase tracking-tight">Upload Logo</p>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSelectedFile(e.target.files[0]);
                            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                          }
                        }} />
                      </label>
                    ) : (
                      <div className="relative w-full h-72 rounded-3xl overflow-hidden border border-divider group flex items-center justify-center bg-content1 shadow-xl">
                        <Image src={previewUrl} alt="Preview" width={200} height={200} className="max-w-[200px] max-h-[200px] object-contain" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button color="danger" variant="flat" className="font-bold rounded-xl" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} startContent={<Trash2 className="w-4 h-4" />}>Remove</Button>
                        </div>
                      </div>
                    )}
                    {isSubmitting && <ProgressBar value={uploadProgress} color="primary" size="sm" className="max-w-md mx-auto" />}
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold">Successfully Posted</h3>
                      <p className="text-sm text-foreground-500 font-medium mt-2">The role is now receiving applications.</p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="bg-content1 py-6 border-t border-divider">
                {step === 1 && (
                  <Button color="primary" className="font-bold rounded-xl w-full h-12" onClick={handleStep1} endContent={<ArrowRight className="w-4 h-4" />}>Continue</Button>
                )}
                {step === 2 && (
                  <div className="flex gap-4 w-full">
                    <Button variant="flat" className="font-bold rounded-xl h-12 flex-1" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                    <Button color="primary" className="font-bold rounded-xl h-12 flex-1" onClick={handleCreateJob} isLoading={isSubmitting} endContent={<ArrowRight className="w-4 h-4" />}>Save & Attach Logo</Button>
                  </div>
                )}
                {step === 3 && (
                  <div className="flex gap-4 w-full">
                    <Button variant="flat" className="font-bold rounded-xl h-12 flex-1" onClick={handleFinish} isDisabled={isSubmitting}>Skip</Button>
                    <Button color="primary" className="font-bold rounded-xl h-12 flex-1" onClick={handleFileUpload} isLoading={isSubmitting} isDisabled={!selectedFile}>Publish Now</Button>
                  </div>
                )}
                {step === 4 && <Button color="primary" className="font-bold rounded-xl w-full h-12" onClick={handleFinish}>Return to Portal</Button>}
              </ModalFooter>
            </>
          )}
        </Modal.Container>
      </Modal>
    </DashboardLayout>
  );
}
