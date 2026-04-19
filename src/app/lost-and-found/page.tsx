"use client";

import { useEffect, useState } from "react";
import { 
  Card, 
  Button, 
  Input, 
  Textarea, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  Avatar,
  Badge,
  Progress,
  Select,
  SelectItem,
  Image as HeroImage
} from "@heroui/react";
import { 
  Plus, 
  Search, 
  Package, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  FileUp, 
  Trash2,
  Loader2,
  ShieldCheck,
  Zap,
  Phone
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

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

const categories = ["Electronics", "Documents", "Keys", "Wallet/Bag", "Clothing", "Pets", "Other"];

export default function LostAndFoundPage() {
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    onClose();
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
                  variant={filter === 'all' ? 'solid' : 'light'} 
                  color={filter === 'all' ? 'primary' : 'default'}
                  className="rounded-lg font-bold px-4"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button 
                  size="sm" 
                  variant={filter === 'lost' ? 'solid' : 'light'} 
                  color={filter === 'lost' ? 'danger' : 'default'}
                  className="rounded-lg font-bold px-4"
                  onClick={() => setFilter('lost')}
                >
                  Lost
                </Button>
                <Button 
                  size="sm" 
                  variant={filter === 'found' ? 'solid' : 'light'} 
                  color={filter === 'found' ? 'success' : 'default'}
                  className="rounded-lg font-bold px-4"
                  onClick={() => setFilter('found')}
                >
                  Found
                </Button>
             </div>
             <Button color="primary" className="font-bold rounded-xl h-11 px-6 shadow-lg shadow-primary/20" onClick={onOpen} startContent={<Plus className="w-5 h-5" />}>
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
            <Button color="primary" variant="flat" className="font-bold rounded-xl" onClick={onOpen}>
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
                        {item.avatars?.[0] ? <HeroImage src={item.avatars[0].media} /> : <Package className="w-8 h-8 m-auto text-foreground-300" />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-start">
                            <Badge color={item.type === 'lost' ? 'danger' : 'success'} variant="flat" className="rounded-md font-bold text-[9px] uppercase px-2 mb-2">
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

      {/* Recovery Wizard */}
      <Modal isOpen={isOpen} onClose={handleFinish} size="4xl" backdrop="blur" classNames={{ base: "bg-background border border-divider rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="bg-content1 py-6 flex flex-col gap-1 text-center border-b border-divider">
                <h2 className="text-xl font-bold">New Recovery Report</h2>
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-content3'}`} />
                  ))}
                </div>
              </ModalHeader>
              <ModalBody className="py-8">
                {step === 1 && (
                  <div className="space-y-8">
                    <div className="flex justify-center gap-4 p-1.5 bg-content2 border border-divider rounded-2xl w-fit mx-auto">
                        <Button 
                          className={`rounded-xl h-11 px-8 font-bold transition-all ${formData.type === 'lost' ? 'bg-danger text-white shadow-lg shadow-danger/20' : 'bg-transparent text-foreground-500'}`}
                          onClick={() => setFormData({...formData, type: 'lost'})}
                        >
                          I Lost Something
                        </Button>
                        <Button 
                          className={`rounded-xl h-11 px-8 font-bold transition-all ${formData.type === 'found' ? 'bg-success text-white shadow-lg shadow-success/20' : 'bg-transparent text-foreground-500'}`}
                          onClick={() => setFormData({...formData, type: 'found'})}
                        >
                          I Found Something
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-4">
                      <Input
                        label="Object Title"
                        placeholder="e.g. Mechanical Watch"
                        labelPlacement="outside"
                        size="lg"
                        variant="bordered"
                        className="col-span-2"
                        value={formData.itemName}
                        onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                        classNames={{ inputWrapper: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                      />
                      <Select
                        label="Classification"
                        labelPlacement="outside"
                        size="lg"
                        variant="bordered"
                        selectedKeys={[formData.category]}
                        onSelectionChange={(keys) => setFormData({...formData, category: Array.from(keys)[0] as string})}
                        classNames={{ trigger: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                      >
                        {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </Select>
                      <Input
                        label="Occurence Date"
                        type="date"
                        labelPlacement="outside"
                        size="lg"
                        variant="bordered"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        classNames={{ inputWrapper: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                      />
                    </div>
                    <Textarea
                      label="Distinguishing Features"
                      placeholder="Describe scratches, markings, or internal contents..."
                      labelPlacement="outside"
                      size="lg"
                      variant="bordered"
                      minRows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      classNames={{ inputWrapper: "border-divider rounded-xl p-4 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <Input
                      label="Zone of Discovery"
                      placeholder="e.g. Science Complex, Level 3"
                      labelPlacement="outside"
                      size="lg"
                      variant="bordered"
                      startContent={<MapPin className="w-4 h-4 text-primary" />}
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      classNames={{ inputWrapper: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="Coutact Name"
                        placeholder="Required for admin use"
                        labelPlacement="outside"
                        size="lg"
                        variant="bordered"
                        value={formData.contactName}
                        onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                        classNames={{ inputWrapper: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                      />
                      <Input
                        label="Phone Number"
                        placeholder="+263 7..."
                        labelPlacement="outside"
                        size="lg"
                        variant="bordered"
                        startContent={<Phone className="w-4 h-4 text-primary" />}
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                        classNames={{ inputWrapper: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                   <div className="space-y-8 text-center py-6">
                    <div className="space-y-1">
                       <h3 className="text-lg font-bold">Physical Proof</h3>
                       <p className="text-xs text-foreground-500 font-medium">Upload a photo to aid identification.</p>
                    </div>
                    {!previewUrl ? (
                      <label className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-divider rounded-3xl bg-content2 cursor-pointer hover:bg-content3 transition-all group">
                        <FileUp className="w-12 h-12 text-primary mb-4" />
                        <p className="text-md font-bold uppercase tracking-tight">Select Item Image</p>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSelectedFile(e.target.files[0]);
                            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                          }
                        }} />
                      </label>
                    ) : (
                      <div className="relative w-full h-72 rounded-3xl overflow-hidden border border-divider group shadow-xl bg-content1">
                        <HeroImage src={previewUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button color="danger" variant="flat" className="font-bold rounded-xl px-10" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} startContent={<Trash2 className="w-4 h-4" />}>Remove</Button>
                        </div>
                      </div>
                    )}
                    {isSubmitting && <Progress value={uploadProgress} color="primary" size="sm" className="max-w-md mx-auto" />}
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <div className="text-center font-bold">
                       <h3 className="text-xl">Report Registered</h3>
                       <p className="text-sm text-foreground-500 font-medium mt-2">Database updated successfully.</p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="bg-content1 py-6 border-t border-divider">
                {step === 1 && (
                  <Button color="primary" className="font-bold rounded-xl w-full h-12" onClick={handleStep1} endContent={<ArrowRight className="w-4 h-4" />}>Next</Button>
                )}
                {step === 2 && (
                  <div className="flex gap-4 w-full">
                    <Button variant="flat" className="font-bold rounded-xl h-12 flex-1" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                    <Button color="primary" className="font-bold rounded-xl h-12 flex-1 shadow-lg shadow-primary/20" onClick={handleCreateReport} isLoading={isSubmitting} endContent={<ArrowRight className="w-4 h-4" />}>Save & Attach</Button>
                  </div>
                )}
                {step === 3 && (
                  <div className="flex gap-4 w-full">
                    <Button variant="flat" className="font-bold rounded-xl h-12 flex-1" onClick={handleFinish} isDisabled={isSubmitting}>Skip</Button>
                    <Button color="primary" className="font-bold rounded-xl h-12 flex-1" onClick={handleUploadMedia} isLoading={isSubmitting} isDisabled={!selectedFile}>Publish Report</Button>
                  </div>
                )}
                {step === 4 && <Button color="primary" className="font-bold rounded-xl w-full h-12" onClick={handleFinish}>Return to Dashboard</Button>}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
}
