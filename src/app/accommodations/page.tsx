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
  Image as HeroImage,
  Checkbox
} from "@heroui/react";
import { 
  Home, 
  MapPin, 
  DollarSign, 
  PlusCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  FileUp, 
  Trash2,
  Loader2,
  Bed,
  Maximize
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import api from "@/lib/api";

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
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    onClose();
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
            color="primary" 
            className="font-bold rounded-xl h-11"
            onClick={onOpen}
            startContent={<PlusCircle className="w-5 h-5" />}
          >
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
            <Button color="primary" variant="flat" className="font-bold rounded-xl" onClick={onOpen}>
              Add Your First Listing
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {accommodations.map((acc) => (
              <Card key={acc._id} className="bg-content1 border border-divider overflow-hidden rounded-2xl hover:border-primary/50 transition-all group shadow-sm">
                <div className="relative h-44">
                   <HeroImage 
                    src={acc.avatars?.[0]?.media || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"} 
                    className="w-full h-full object-cover rounded-none transition-transform duration-500 group-hover:scale-110" 
                   />
                   <div className="absolute top-3 left-3 z-10">
                      <Badge color={acc.isAvailable ? "success" : "danger"} className="p-1 px-3 text-white font-bold rounded-lg uppercase text-[10px]">
                        {acc.isAvailable ? "Active" : "Occupied"}
                      </Badge>
                   </div>
                </div>
                <CardBody className="p-5 space-y-4">
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
                  
                  <Button color="default" variant="flat" fullWidth className="font-bold rounded-xl h-9 text-xs">
                    Edit Listing
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={handleFinish} size="4xl" backdrop="blur" classNames={{ base: "bg-background border border-divider rounded-3xl" }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="bg-content1 py-6 flex flex-col gap-1 text-center border-b border-divider">
                <h2 className="text-xl font-bold">New Property Record</h2>
                <div className="flex justify-center gap-2 mt-4">
                  {[1, 2, 3, 4].map(s => (
                    <div key={s} className={`h-1 w-12 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-content3'}`} />
                  ))}
                </div>
              </ModalHeader>
              <ModalBody className="py-8">
                {step === 1 && (
                  <div className="grid grid-cols-2 gap-6">
                    <Input
                      label="Property Name"
                      placeholder="e.g. South View Manor"
                      labelPlacement="outside"
                      size="lg"
                      variant="bordered"
                      className="col-span-2"
                      value={formData.propertyName}
                      onChange={(e) => setFormData({...formData, propertyName: e.target.value})}
                      classNames={{ inputWrapper: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                    />
                    <Input
                      label="Neighborhood"
                      placeholder="e.g. West Campus District"
                      labelPlacement="outside"
                      size="lg"
                      variant="bordered"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      classNames={{ inputWrapper: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                    />
                    <Select
                      label="Housing Class"
                      labelPlacement="outside"
                      size="lg"
                      variant="bordered"
                      selectedKeys={[formData.type]}
                      onSelectionChange={(keys) => setFormData({...formData, type: Array.from(keys)[0] as string})}
                      classNames={{ trigger: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                    >
                      {roomTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </Select>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <Input
                        label="Monthly Subscription ($)"
                        placeholder="450"
                        type="number"
                        labelPlacement="outside"
                        size="lg"
                        variant="bordered"
                        startContent={<DollarSign className="w-4 h-4 text-primary" />}
                        value={formData.monthlyRent.toString()}
                        onChange={(e) => setFormData({...formData, monthlyRent: parseInt(e.target.value)})}
                        classNames={{ inputWrapper: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                      />
                      <Input
                        label="Room Units"
                        placeholder="3"
                        type="number"
                        labelPlacement="outside"
                        size="lg"
                        variant="bordered"
                        value={formData.rooms.toString()}
                        onChange={(e) => setFormData({...formData, rooms: parseInt(e.target.value)})}
                        classNames={{ inputWrapper: "border-divider rounded-xl h-12 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                      />
                    </div>
                    <Textarea
                      label="Facility Description"
                      placeholder="List amenities, distances to transport, and house rules..."
                      labelPlacement="outside"
                      size="lg"
                      variant="bordered"
                      minRows={5}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      classNames={{ inputWrapper: "border-divider rounded-xl pt-4 bg-content2 focus-within:border-primary", label: "font-bold text-xs uppercase text-foreground-500" }}
                    />
                    <Checkbox isSelected={formData.isAvailable} color="primary" onValueChange={(val) => setFormData({...formData, isAvailable: val})}>
                       <span className="text-xs font-bold text-foreground-500 uppercase tracking-tight">Active for immediate occupancy</span>
                    </Checkbox>
                  </div>
                )}

                {step === 3 && (
                   <div className="space-y-8 text-center py-6">
                    <div className="space-y-1">
                       <h3 className="text-lg font-bold">Property Showcase</h3>
                       <p className="text-xs text-foreground-500 font-medium">Clear visuals significantly increase lead generation.</p>
                    </div>
                    {!previewUrl ? (
                      <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-divider rounded-3xl bg-content2 cursor-pointer hover:bg-content3 transition-all group">
                        <FileUp className="w-12 h-12 text-primary mb-4" />
                        <p className="text-md font-bold uppercase tracking-tight">Upload Master Photo</p>
                        <p className="text-[10px] text-foreground-500 mt-1 uppercase font-bold">PNG / JPG up to 10MB</p>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setSelectedFile(e.target.files[0]);
                            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
                          }
                        }} />
                      </label>
                    ) : (
                      <div className="relative w-full h-80 rounded-3xl overflow-hidden border border-divider group shadow-xl">
                        <HeroImage src={previewUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button color="danger" variant="flat" className="font-bold rounded-xl px-10" onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} startContent={<Trash2 className="w-4 h-4" />}>Reset Media</Button>
                        </div>
                      </div>
                    )}
                    {isSubmitting && <Progress value={uploadProgress} color="primary" size="sm" className="max-w-md mx-auto" />}
                  </div>
                )}

                {step === 4 && (
                  <div className="flex flex-col items-center justify-center py-10 space-y-6">
                    <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center text-success">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="text-center space-y-2">
                       <h3 className="text-2xl font-bold">Listing Deployed</h3>
                       <p className="text-sm text-foreground-500 font-medium">The property is now visible to all active users.</p>
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter className="bg-content1 py-6 border-t border-divider">
                {step === 1 && (
                  <Button color="primary" className="font-bold rounded-xl w-full h-12" onClick={handleStep1} isDisabled={!formData.propertyName || !formData.location} endContent={<ArrowRight className="w-4 h-4" />}>Next Stage</Button>
                )}
                {step === 2 && (
                  <div className="flex gap-4 w-full">
                    <Button variant="flat" className="font-bold rounded-xl h-12 flex-1" onClick={() => setStep(1)}><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
                    <Button color="primary" className="font-bold rounded-xl h-12 flex-1" onClick={handleCreateAccommodation} isLoading={isSubmitting} isDisabled={!formData.monthlyRent} endContent={<ArrowRight className="w-4 h-4" />}>Proceed to Assets</Button>
                  </div>
                )}
                {step === 3 && (
                  <div className="flex gap-4 w-full">
                    <Button variant="flat" className="font-bold rounded-xl h-12 flex-1" onClick={handleFinish} isDisabled={isSubmitting}>Skip Media</Button>
                    <Button color="primary" className="font-bold rounded-xl h-12 flex-1" onClick={handleFileUpload} isLoading={isSubmitting} isDisabled={!selectedFile}>Apply & Launch</Button>
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
