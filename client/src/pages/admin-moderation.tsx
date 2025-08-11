import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { 
  Shield, ShieldCheck, ShieldX, UserX, MessageSquareX, FileX, 
  Eye, EyeOff, Edit, Trash2, Ban, AlertTriangle, CheckCircle,
  Clock, Users, Search, Filter, MoreVertical, Lock, Unlock,
  Flag, Hammer, Crown, Settings, Database, FileText
} from "lucide-react";

const moderationActionSchema = z.object({
  targetType: z.enum(["user", "case", "contact", "comment", "post", "evidence"]),
  targetId: z.string().min(1, "Target ID is required"),
  action: z.enum(["edit", "delete", "hide", "ban", "warn", "approve", "reject", "lock", "unlock"]),
  reason: z.string().min(1, "Reason is required"),
  duration: z.string().optional(), // For temporary actions
  severity: z.enum(["low", "medium", "high", "critical"]),
  isPublic: z.boolean().default(false),
  notes: z.string().optional(),
});

type ModerationActionData = z.infer<typeof moderationActionSchema>;

export default function AdminModeration() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ModerationActionData>({
    resolver: zodResolver(moderationActionSchema),
    defaultValues: {
      targetType: "user",
      targetId: "",
      action: "warn",
      reason: "",
      severity: "medium",
      isPublic: false,
      notes: "",
    },
  });

  const { data: moderationLogs = [] } = useQuery({
    queryKey: ["/api/moderation/logs"],
    initialData: [],
  });

  const { data: flaggedContent = [] } = useQuery({
    queryKey: ["/api/moderation/flagged"],
    initialData: [],
  });

  const { data: moderationStats } = useQuery({
    queryKey: ["/api/moderation/stats"],
    initialData: {
      totalActions: 0,
      pendingReviews: 0,
      autoModActions: 0,
      manualActions: 0,
      bannedUsers: 0,
      hiddenContent: 0,
    },
  });

  const createModerationActionMutation = useMutation({
    mutationFn: (data: ModerationActionData) => apiRequest("POST", "/api/moderation/actions", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Moderation action executed successfully",
      });
      setIsActionDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/moderation"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to execute moderation action",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ModerationActionData) => {
    createModerationActionMutation.mutate(data);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "ban":
        return <Badge className="bg-red-600 hover:bg-red-700"><Ban className="h-3 w-3 mr-1" />Ban</Badge>;
      case "delete":
        return <Badge className="bg-red-500 hover:bg-red-600"><Trash2 className="h-3 w-3 mr-1" />Delete</Badge>;
      case "hide":
        return <Badge className="bg-orange-600 hover:bg-orange-700"><EyeOff className="h-3 w-3 mr-1" />Hide</Badge>;
      case "warn":
        return <Badge className="bg-yellow-600 hover:bg-yellow-700"><AlertTriangle className="h-3 w-3 mr-1" />Warn</Badge>;
      case "approve":
        return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-3 w-3 mr-1" />Approve</Badge>;
      case "lock":
        return <Badge className="bg-purple-600 hover:bg-purple-700"><Lock className="h-3 w-3 mr-1" />Lock</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-700 hover:bg-red-800">Critical</Badge>;
      case "high":
        return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case "low":
        return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  return (
    <DashboardLayout 
      title="Staff Moderation Center" 
      subtitle="Complete A-Z moderation and management controls"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-end mb-6">
          <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-oa-red hover:bg-oa-red/80">
              <Hammer className="h-4 w-4 mr-2" />
              Take Action
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-oa-dark border-oa-border text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Execute Moderation Action
              </DialogTitle>
              <DialogDescription className="text-oa-gray">
                Take moderation action on any content or user
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="targetType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Target Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-oa-light border-oa-border text-white">
                              <SelectValue placeholder="Select target type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-oa-dark border-oa-border">
                            <SelectItem value="user" className="text-white hover:bg-oa-light">User</SelectItem>
                            <SelectItem value="case" className="text-white hover:bg-oa-light">Case</SelectItem>
                            <SelectItem value="contact" className="text-white hover:bg-oa-light">Contact Message</SelectItem>
                            <SelectItem value="comment" className="text-white hover:bg-oa-light">Comment</SelectItem>
                            <SelectItem value="post" className="text-white hover:bg-oa-light">Post</SelectItem>
                            <SelectItem value="evidence" className="text-white hover:bg-oa-light">Evidence</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="action"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Action</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-oa-light border-oa-border text-white">
                              <SelectValue placeholder="Select action" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-oa-dark border-oa-border">
                            <SelectItem value="edit" className="text-white hover:bg-oa-light">Edit</SelectItem>
                            <SelectItem value="delete" className="text-white hover:bg-oa-light">Delete</SelectItem>
                            <SelectItem value="hide" className="text-white hover:bg-oa-light">Hide</SelectItem>
                            <SelectItem value="ban" className="text-white hover:bg-oa-light">Ban</SelectItem>
                            <SelectItem value="warn" className="text-white hover:bg-oa-light">Warn</SelectItem>
                            <SelectItem value="approve" className="text-white hover:bg-oa-light">Approve</SelectItem>
                            <SelectItem value="reject" className="text-white hover:bg-oa-light">Reject</SelectItem>
                            <SelectItem value="lock" className="text-white hover:bg-oa-light">Lock</SelectItem>
                            <SelectItem value="unlock" className="text-white hover:bg-oa-light">Unlock</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="targetId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Target ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter user ID, case ID, etc."
                          className="bg-oa-light border-oa-border text-white placeholder:text-oa-gray"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Severity</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-oa-light border-oa-border text-white">
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-oa-dark border-oa-border">
                            <SelectItem value="low" className="text-white hover:bg-oa-light">Low</SelectItem>
                            <SelectItem value="medium" className="text-white hover:bg-oa-light">Medium</SelectItem>
                            <SelectItem value="high" className="text-white hover:bg-oa-light">High</SelectItem>
                            <SelectItem value="critical" className="text-white hover:bg-oa-light">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Duration (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., 7 days, 30 days, permanent"
                            className="bg-oa-light border-oa-border text-white placeholder:text-oa-gray"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Reason</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Detailed reason for this moderation action..."
                          className="bg-oa-light border-oa-border text-white placeholder:text-oa-gray"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Internal Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Internal staff notes about this action..."
                          className="bg-oa-light border-oa-border text-white placeholder:text-oa-gray"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-oa-red hover:bg-oa-red/80"
                  disabled={createModerationActionMutation.isPending}
                >
                  {createModerationActionMutation.isPending ? "Executing..." : "Execute Action"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Moderation Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Total Actions</p>
                <p className="text-2xl font-bold text-white">{moderationStats.totalActions}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-400">{moderationStats.pendingReviews}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Auto Actions</p>
                <p className="text-2xl font-bold text-purple-400">{moderationStats.autoModActions}</p>
              </div>
              <Settings className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Manual Actions</p>
                <p className="text-2xl font-bold text-green-400">{moderationStats.manualActions}</p>
              </div>
              <Hammer className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Banned Users</p>
                <p className="text-2xl font-bold text-red-400">{moderationStats.bannedUsers}</p>
              </div>
              <Ban className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Hidden Content</p>
                <p className="text-2xl font-bold text-orange-400">{moderationStats.hiddenContent}</p>
              </div>
              <EyeOff className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Moderation Logs */}
      <Card className="bg-oa-light border-oa-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Moderation Actions
          </CardTitle>
          <CardDescription className="text-oa-gray">
            Complete log of all moderation actions taken by staff
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {moderationLogs.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-oa-gray mx-auto mb-4" />
                <p className="text-oa-gray">No moderation actions recorded yet</p>
              </div>
            ) : (
              moderationLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-oa-dark rounded-lg border border-oa-border">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        {getActionBadge(log.action)}
                        {getSeverityBadge(log.severity)}
                      </div>
                      <p className="text-white font-medium">{log.reason}</p>
                      <p className="text-sm text-oa-gray">
                        Target: {log.targetType} ({log.targetId}) • By: {log.moderatorName}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-oa-gray">
                      {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}