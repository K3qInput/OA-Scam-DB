import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Upload, X } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/auth-utils";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { formatDistanceToNow } from "date-fns";

const newCaseSchema = z.object({
  reportedUserId: z.string().min(1, "Reported user ID is required"),
  type: z.enum(["financial_scam", "identity_theft", "fake_services", "account_fraud", "other"]),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description must be less than 5000 characters"),
  amountInvolved: z.string().optional(),
  currency: z.string().default("USD"),
  tags: z.array(z.string()).optional(),
});

type NewCaseFormData = z.infer<typeof newCaseSchema>;

interface UploadedFile {
  file: File;
  description: string;
}

export default function NewCase() {
  return (
    <DashboardLayout title="Create New Case" subtitle="Report fraud, scams, or disputes for investigation">
      <NewCaseForm />
    </DashboardLayout>
  );
}

function NewCaseForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewCaseFormData>({
    resolver: zodResolver(newCaseSchema),
    defaultValues: {
      type: "financial_scam",
      priority: "medium",
      currency: "USD",
      tags: [],
    },
  });

  const createCaseMutation = useMutation({
    mutationFn: async (data: NewCaseFormData) => {
      return await apiRequest("POST", "/api/cases", data);
    },
    onSuccess: async (newCase: any) => {
      // Upload evidence files if any
      if (uploadedFiles.length > 0) {
        for (const { file, description } of uploadedFiles) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("description", description);

          try {
            await fetch(`/api/cases/${newCase.id}/evidence`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              },
              body: formData,
            });
          } catch (error) {
            console.error("Failed to upload evidence:", error);
          }
        }
      }

      toast({
        title: "Success",
        description: "Case created successfully",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/cases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/statistics"] });
      setLocation("/dashboard");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create case",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: NewCaseFormData) => {
    setIsSubmitting(true);
    
    // Keep amount as string for API consistency
    const processedData = {
      ...data,
    };

    try {
      await createCaseMutation.mutateAsync(processedData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select files smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setUploadedFiles(prev => [...prev, { file, description: "" }]);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileDescription = (index: number, description: string) => {
    setUploadedFiles(prev => 
      prev.map((item, i) => i === index ? { ...item, description } : item)
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with real-time info */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-sm text-gray-400 grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          <span>Created: <CurrentTime className="text-white" /></span>
          <span>Priority: Real-time submission</span>
          <span>Status: Draft</span>
        </div>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Case Information</CardTitle>
          <p className="text-slate-400 text-sm">
            Case will be automatically assigned ID after submission • Created: {new Date().toLocaleString()}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reportedUserId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Reported User ID/Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter user ID or username"
                            className="bg-slate-900 border-slate-600 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Scam Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                              <SelectValue placeholder="Select scam type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="financial_scam">Financial Scam</SelectItem>
                            <SelectItem value="identity_theft">Identity Theft</SelectItem>
                            <SelectItem value="fake_services">Fake Services</SelectItem>
                            <SelectItem value="account_fraud">Account Fraud</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Priority Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-slate-800 border-slate-600">
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Case Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief title describing the case"
                            className="bg-slate-900 border-slate-600 text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="amountInvolved"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Amount Involved (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="bg-slate-900 border-slate-600 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-800 border-slate-600">
                              <SelectItem value="USD">USD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="GBP">GBP</SelectItem>
                              <SelectItem value="BTC">BTC</SelectItem>
                              <SelectItem value="ETH">ETH</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Detailed Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of the scam, including what happened, how you were contacted, and any relevant details..."
                        className="bg-slate-900 border-slate-600 text-white min-h-[120px] resize-none"
                        {...field}
                      />
                    </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    {/* Evidence Upload */}
                    <div className="space-y-4">
                      <Label className="text-gray-300">Evidence (Optional)</Label>
                      <div className="border-2 border-dashed border-oa-surface rounded-lg p-6">
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-sm mb-2">
                            Upload screenshots, documents, or other evidence
                          </p>
                          <Input
                            type="file"
                            multiple
                            accept="image/*,.pdf,.txt,.csv"
                            onChange={addFile}
                            className="hidden"
                            id="file-upload"
                          />
                          <Label
                            htmlFor="file-upload"
                            className="oa-btn-secondary cursor-pointer inline-block"
                          >
                            Choose Files
                          </Label>
                        </div>
                      </div>

                      {/* Uploaded Files */}
                      {uploadedFiles.length > 0 && (
                        <div className="space-y-3">
                          <Label className="text-gray-300">Uploaded Files</Label>
                          {uploadedFiles.map((item, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-oa-surface rounded-lg">
                              <div className="flex-1">
                                <p className="text-sm text-white font-medium">{item.file.name}</p>
                                <Input
                                  placeholder="Add description (optional)"
                                  value={item.description}
                                  onChange={(e) => updateFileDescription(index, e.target.value)}
                                  className="oa-input mt-2 text-xs"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFile(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Warning Alert */}
                    <Alert className="border-yellow-600 bg-yellow-900/20">
                      <AlertDescription className="text-yellow-200 text-sm">
                        <strong>Important:</strong> Please ensure all information provided is accurate. 
                        False reports may result in account restrictions. All cases will be reviewed by staff before verification.
                      </AlertDescription>
                    </Alert>

                    {/* Submit Buttons */}
                    <div className="flex space-x-4 pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting || createCaseMutation.isPending}
                        className="oa-btn-primary flex-1"
                      >
                        {isSubmitting || createCaseMutation.isPending ? "Submitting..." : "Submit Case"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setLocation("/dashboard")}
                        className="oa-btn-secondary flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
