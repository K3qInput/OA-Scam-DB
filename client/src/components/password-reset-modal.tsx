import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";

const passwordResetSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Valid email is required"),
  reason: z.string().min(10, "Please provide a reason (minimum 10 characters)"),
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordResetModal({ isOpen, onClose }: PasswordResetModalProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      username: "",
      email: "",
      reason: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: PasswordResetFormData) => {
      const response = await apiRequest("POST", "/api/auth/request-password-reset", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast({
        title: "Password Reset Requested",
        description: "Your request has been submitted for admin review.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Request Failed",
        description: error.message || "Failed to submit password reset request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: PasswordResetFormData) => {
    resetPasswordMutation.mutate(data);
  };

  const handleClose = () => {
    if (!resetPasswordMutation.isPending) {
      setIsSubmitted(false);
      form.reset();
      onClose();
    }
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-400" />
            </div>
            <DialogTitle className="text-center text-white">Request Submitted</DialogTitle>
            <DialogDescription className="text-center text-slate-400">
              Your password reset request has been submitted successfully.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-blue-700 bg-blue-900/20">
              <Mail className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                An admin will review your request and contact you via email within 24-48 hours.
              </AlertDescription>
            </Alert>

            <div className="bg-slate-700 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-white">What happens next?</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Your request will be reviewed by an administrator</li>
                <li>• You'll receive an email with further instructions</li>
                <li>• Keep your contact information updated</li>
                <li>• Contact support if you don't hear back within 48 hours</li>
              </ul>
            </div>

            <div className="flex justify-center">
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Request Password Reset
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Submit a password reset request for admin review. All requests must be approved by staff.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <Alert className="border-yellow-700 bg-yellow-900/20">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                Password resets require administrator approval for security reasons.
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Your username"
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your.email@example.com"
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Reason for Reset</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please explain why you need a password reset (e.g., forgot password, account security concern, etc.)"
                      className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-slate-700 p-4 rounded-lg">
              <h4 className="font-medium text-white mb-2">Important Information</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• Requests are reviewed manually by administrators</li>
                <li>• You must provide a valid reason for the reset</li>
                <li>• Response time is typically 24-48 hours</li>
                <li>• Fraudulent requests may result in account suspension</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={resetPasswordMutation.isPending}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="flex-1"
              >
                {resetPasswordMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}