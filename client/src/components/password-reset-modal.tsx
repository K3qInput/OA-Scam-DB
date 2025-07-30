import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { isUnauthorizedError } from "@/lib/auth-utils";

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PasswordResetModal({ isOpen, onClose }: PasswordResetModalProps) {
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  const resetRequestMutation = useMutation({
    mutationFn: async (reason: string) => {
      await apiRequest("POST", "/api/auth/request-password-reset", { reason });
    },
    onSuccess: () => {
      toast({
        title: "Request Sent",
        description: "Password reset request sent for approval",
      });
      setReason("");
      onClose();
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
        description: "Failed to send password reset request",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for the password reset",
        variant: "destructive",
      });
      return;
    }
    resetRequestMutation.mutate(reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-oa-dark border border-oa-surface">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-500">
            Password Reset Request
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-1">
            Requires approval from yourmamasoosexy@gmail.com
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-gray-400 mb-2">
              Current Email
            </Label>
            <Input
              type="email"
              value={user?.email || ""}
              disabled
              className="oa-input text-gray-400"
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-400 mb-2">
              Reason for Reset
            </Label>
            <Textarea
              placeholder="Explain why you need to reset your password..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="oa-input h-24 resize-none"
              required
            />
          </div>

          <Alert className="border-yellow-600 bg-yellow-900/20">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200 text-sm">
              <p className="font-medium">Important:</p>
              <p>
                Password reset requests must be approved by yourmamasoosexy@gmail.com. 
                You will receive an email with reset instructions once approved.
              </p>
            </AlertDescription>
          </Alert>

          <div className="flex space-x-4 pt-4">
            <Button
              type="submit"
              disabled={resetRequestMutation.isPending}
              className="flex-1 oa-btn-primary"
            >
              {resetRequestMutation.isPending ? "Sending..." : "Send Reset Request"}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              className="flex-1 oa-btn-secondary"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
