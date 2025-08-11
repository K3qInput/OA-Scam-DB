import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  DollarSign,
  Clock,
  Shield,
  User,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCaseSchema } from "@shared/schema";

const enhancedCaseSchema = insertCaseSchema.extend({
  tags: z.array(z.string()).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  relatedCases: z.array(z.string()).optional(),
  anonymousReport: z.boolean().default(false),
  contactMethod: z.enum(["email", "discord", "telegram", "phone"]).optional(),
  timezonePref: z.string().optional(),
});

type EnhancedCaseFormData = z.infer<typeof enhancedCaseSchema>;

const typeOptions = [
  { value: "financial_scam", label: "Financial Scam", icon: DollarSign },
  { value: "fake_services", label: "Fake Services", icon: Shield },
  { value: "identity_theft", label: "Identity Theft", icon: User },
  { value: "account_fraud", label: "Account Fraud", icon: Shield },
  { value: "impersonation", label: "Impersonation", icon: User },
  { value: "other", label: "Other", icon: MessageSquare }
];

const priorityOptions = [
  { value: "low", label: "Low Priority", color: "bg-green-900 text-green-200" },
  { value: "medium", label: "Medium Priority", color: "bg-yellow-900 text-yellow-200" },
  { value: "high", label: "High Priority", color: "bg-orange-900 text-orange-200" },
  { value: "urgent", label: "Urgent", color: "bg-red-900 text-red-200" }
];

const availableTags = [
  "Discord", "Minecraft", "Gaming", "Cryptocurrency", "NFT", "Commission", 
  "Service", "Freelance", "Server", "Bot", "Plugin", "Website", "Trading",
  "Marketplace", "Social Media", "Email", "Phone"
];

export default function EnhancedNewCase() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EnhancedCaseFormData>({
    resolver: zodResolver(enhancedCaseSchema),
    defaultValues: {
      type: "other",
      priority: "medium",
      tags: [],
      anonymousReport: false,
      relatedCases: [],
    },
  });

  const createCaseMutation = useMutation({
    mutationFn: async (data: EnhancedCaseFormData) => {
      const caseData = {
        ...data,
        tags: selectedTags,
      };
      
      // Create the case first
      const response = await apiRequest("POST", "/api/cases", caseData);
      const caseResult = await response.json();
      
      // Upload evidence files if any
      if (evidenceFiles.length > 0) {
        const formData = new FormData();
        evidenceFiles.forEach((file, index) => {
          formData.append(`evidence-${index}`, file);
        });
        formData.append("caseId", caseResult.id);
        
        await apiRequest("POST", "/api/cases/evidence", formData);
      }
      
      return caseResult;
    },
    onSuccess: () => {
      toast({
        title: "Case Created Successfully",
        description: "Your case has been submitted and will be reviewed by our team.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      form.reset();
      setSelectedTags([]);
      setEvidenceFiles([]);
      setCurrentStep(1);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Case",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || 
                          file.type === 'application/pdf' ||
                          file.type.startsWith('text/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      return isValidType && isValidSize;
    });
    
    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were rejected",
        description: "Only images, PDFs, and text files under 10MB are allowed.",
        variant: "destructive",
      });
    }
    
    setEvidenceFiles([...evidenceFiles, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const onSubmit = (data: EnhancedCaseFormData) => {
    createCaseMutation.mutate(data);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "upcoming";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Submit New Case Report</CardTitle>
          <CardDescription className="text-slate-400">
            Help us investigate fraud and protect the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => {
              const status = getStepStatus(step);
              return (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${status === 'completed' ? 'bg-green-600 text-white' : 
                      status === 'current' ? 'bg-blue-600 text-white' : 
                      'bg-slate-600 text-slate-400'}
                  `}>
                    {status === 'completed' ? <CheckCircle className="h-4 w-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-20 h-1 mx-2 ${
                      status === 'completed' ? 'bg-green-600' : 'bg-slate-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={(currentStep - 1) * 25 + 25} className="h-2" />
        </CardContent>
      </Card>

      {/* Form Content */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={currentStep.toString()} className="w-full">
            {/* Step 1: Basic Information */}
            <TabsContent value="1" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="accusedUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Accused Username *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter username"
                              className="bg-slate-700 border-slate-600 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Case Type *</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue placeholder="Select case type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              {typeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <option.icon className="h-4 w-4" />
                                    {option.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Priority Level</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {priorityOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <Badge className={option.color}>
                                  {option.label}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Case Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description of the incident"
                            className="bg-slate-700 border-slate-600 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 2: Incident Details */}
            <TabsContent value="2" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Incident Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Detailed Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide a detailed description of what happened, including timeline, communication methods, and any relevant context..."
                            className="bg-slate-700 border-slate-600 text-white min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amountLost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Amount Lost ($)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="bg-slate-700 border-slate-600 text-white"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300">Preferred Contact</FormLabel>
                          <Select value={field.value || ""} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue placeholder="How should we contact you?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="discord">Discord</SelectItem>
                              <SelectItem value="telegram">Telegram</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="contactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Contact Information</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your contact details (email, Discord tag, etc.)"
                            className="bg-slate-700 border-slate-600 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 3: Evidence & Tags */}
            <TabsContent value="3" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Evidence & Classification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Evidence Upload */}
                  <div className="space-y-4">
                    <Label className="text-slate-300">Evidence Files</Label>
                    <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-slate-400 mb-2">Upload screenshots, chat logs, receipts, or other evidence</p>
                      <Input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.txt,.doc,.docx"
                        onChange={handleFileUpload}
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Supported: Images, PDFs, Text files (max 10MB each)
                      </p>
                    </div>
                    
                    {evidenceFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm text-slate-300">Uploaded Files:</p>
                        {evidenceFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-700 p-2 rounded">
                            <span className="text-sm text-white">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="space-y-3">
                    <Label className="text-slate-300">Tags (Optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTagToggle(tag)}
                          className="text-xs"
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-blue-900 text-blue-200">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Step 4: Review & Submit */}
            <TabsContent value="4" className="space-y-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Review & Submit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-blue-700 bg-blue-900/20">
                    <Info className="h-4 w-4 text-blue-400" />
                    <AlertDescription className="text-blue-200">
                      Please review your case details before submitting. Once submitted, your case will be assigned to our investigation team.
                    </AlertDescription>
                  </Alert>

                  {/* Privacy Options */}
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="anonymousReport"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-slate-300 font-normal">
                            Submit as anonymous report (your identity will be protected)
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-700 p-4 rounded-lg space-y-2">
                    <h4 className="font-medium text-white">Case Summary</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Accused:</span>
                        <span className="text-white ml-2">{form.getValues('accusedUsername')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Type:</span>
                        <span className="text-white ml-2">{form.getValues('type')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Priority:</span>
                        <Badge className={priorityOptions.find(p => p.value === form.getValues('priority'))?.color || ""}>
                          {priorityOptions.find(p => p.value === form.getValues('priority'))?.label}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-slate-400">Evidence:</span>
                        <span className="text-white ml-2">{evidenceFiles.length} file(s)</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={createCaseMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createCaseMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Case
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}