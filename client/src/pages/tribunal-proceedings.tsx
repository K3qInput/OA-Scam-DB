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
import { Plus, Gavel, Calendar, Users, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const createProceedingSchema = z.object({
  caseId: z.string().min(1, "Case is required"),
  proceedingType: z.enum(["hearing", "review", "appeal", "final_decision"]),
  scheduledDate: z.string().optional(),
  panelMembers: z.array(z.string()).optional(),
  decisionReason: z.string().optional(),
  nextSteps: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type CreateProceedingData = z.infer<typeof createProceedingSchema>;

export default function TribunalProceedings() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateProceedingData>({
    resolver: zodResolver(createProceedingSchema),
    defaultValues: {
      caseId: "",
      proceedingType: "hearing",
      scheduledDate: "",
      panelMembers: [],
      decisionReason: "",
      nextSteps: "",
      isPublic: false,
    },
  });

  const { data: proceedings = [] } = useQuery({
    queryKey: ["/api/tribunal/proceedings"],
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["/api/cases"],
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  const createProceedingMutation = useMutation({
    mutationFn: (data: CreateProceedingData) => apiRequest("/api/tribunal/proceedings", "POST", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Tribunal proceeding scheduled successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/tribunal/proceedings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule proceeding",
        variant: "destructive",
      });
    },
  });

  const updateProceedingMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CreateProceedingData>) => 
      apiRequest(`/api/tribunal/proceedings/${id}`, "PATCH", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Proceeding updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tribunal/proceedings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update proceeding",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateProceedingData) => {
    createProceedingMutation.mutate(data);
  };

  const getProceedingTypeBadge = (type: string) => {
    switch (type) {
      case "hearing":
        return <Badge className="bg-blue-600 hover:bg-blue-700"><Gavel className="h-3 w-3 mr-1" />Hearing</Badge>;
      case "review":
        return <Badge className="bg-yellow-600 hover:bg-yellow-700"><FileText className="h-3 w-3 mr-1" />Review</Badge>;
      case "appeal":
        return <Badge className="bg-orange-600 hover:bg-orange-700"><AlertCircle className="h-3 w-3 mr-1" />Appeal</Badge>;
      case "final_decision":
        return <Badge className="bg-purple-600 hover:bg-purple-700"><CheckCircle className="h-3 w-3 mr-1" />Final Decision</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case "approved":
        return <Badge className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-600 hover:bg-red-700"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-600 hover:bg-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "deferred":
        return <Badge className="bg-gray-600 hover:bg-gray-700"><AlertCircle className="h-3 w-3 mr-1" />Deferred</Badge>;
      default:
        return null;
    }
  };

  const updateOutcome = (proceedingId: string, outcome: string) => {
    updateProceedingMutation.mutate({ id: proceedingId, outcome });
  };

  return (
    <div className="min-h-screen bg-oa-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tribunal Proceedings</h1>
            <p className="text-oa-gray">Schedule and manage tribunal hearings and decisions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-oa-red hover:bg-oa-red/80">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Proceeding
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-oa-dark border-oa-border text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Schedule New Proceeding
                </DialogTitle>
                <DialogDescription className="text-oa-gray">
                  Schedule a new tribunal proceeding for a case
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="caseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Case</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-oa-light border-oa-border text-white">
                                <SelectValue placeholder="Select case" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-oa-dark border-oa-border">
                              {cases.cases?.map((caseItem: any) => (
                                <SelectItem key={caseItem.id} value={caseItem.id} className="text-white hover:bg-oa-light">
                                  {caseItem.caseNumber} - {caseItem.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="proceedingType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Proceeding Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-oa-light border-oa-border text-white">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-oa-dark border-oa-border">
                              <SelectItem value="hearing" className="text-white hover:bg-oa-light">Hearing</SelectItem>
                              <SelectItem value="review" className="text-white hover:bg-oa-light">Review</SelectItem>
                              <SelectItem value="appeal" className="text-white hover:bg-oa-light">Appeal</SelectItem>
                              <SelectItem value="final_decision" className="text-white hover:bg-oa-light">Final Decision</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="scheduledDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Scheduled Date & Time</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="bg-oa-light border-oa-border text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="decisionReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Decision Reason (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Reason for scheduling this proceeding..."
                            className="bg-oa-light border-oa-border text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="nextSteps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Next Steps (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="What should happen after this proceeding..."
                            className="bg-oa-light border-oa-border text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1 border-oa-border text-white hover:bg-oa-light"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createProceedingMutation.isPending}
                      className="flex-1 bg-oa-red hover:bg-oa-red/80"
                    >
                      {createProceedingMutation.isPending ? "Scheduling..." : "Schedule Proceeding"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Proceedings List */}
        <div className="space-y-6">
          {proceedings.map((proceeding: any) => (
            <Card key={proceeding.id} className="bg-oa-dark border-oa-border">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Gavel className="h-5 w-5" />
                      {proceeding.case?.caseNumber} - {proceeding.case?.title}
                    </CardTitle>
                    <CardDescription className="text-oa-gray">
                      Chairperson: {proceeding.chairpersonUser?.firstName} {proceeding.chairpersonUser?.lastName}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getProceedingTypeBadge(proceeding.proceedingType)}
                    {proceeding.outcome && getOutcomeBadge(proceeding.outcome)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-oa-gray" />
                    <div>
                      <p className="text-sm text-oa-gray">Scheduled</p>
                      <p className="text-white">
                        {proceeding.scheduledDate 
                          ? format(new Date(proceeding.scheduledDate), "MMM dd, yyyy HH:mm")
                          : "Not scheduled"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-oa-gray" />
                    <div>
                      <p className="text-sm text-oa-gray">Actual Date</p>
                      <p className="text-white">
                        {proceeding.actualDate 
                          ? format(new Date(proceeding.actualDate), "MMM dd, yyyy HH:mm")
                          : "Not completed"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-oa-gray" />
                    <div>
                      <p className="text-sm text-oa-gray">Panel Members</p>
                      <p className="text-white">
                        {proceeding.panelMembers?.length || 0} members
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-oa-gray" />
                    <div>
                      <p className="text-sm text-oa-gray">Public</p>
                      <p className="text-white">
                        {proceeding.isPublic ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                </div>

                {proceeding.decisionReason && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Decision Reason</h4>
                    <p className="text-oa-gray">{proceeding.decisionReason}</p>
                  </div>
                )}

                {proceeding.nextSteps && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Next Steps</h4>
                    <p className="text-oa-gray">{proceeding.nextSteps}</p>
                  </div>
                )}

                {!proceeding.outcome && (
                  <div className="flex gap-2 pt-4 border-t border-oa-border">
                    <Button
                      size="sm"
                      onClick={() => updateOutcome(proceeding.id, "approved")}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={updateProceedingMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateOutcome(proceeding.id, "rejected")}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={updateProceedingMutation.isPending}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => updateOutcome(proceeding.id, "deferred")}
                      variant="outline"
                      className="border-oa-border text-white hover:bg-oa-light"
                      disabled={updateProceedingMutation.isPending}
                    >
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Defer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {proceedings.length === 0 && (
          <div className="text-center py-12">
            <Gavel className="h-12 w-12 text-oa-gray mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No proceedings scheduled</h3>
            <p className="text-oa-gray mb-4">Schedule your first tribunal proceeding to get started</p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-oa-red hover:bg-oa-red/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule First Proceeding
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}