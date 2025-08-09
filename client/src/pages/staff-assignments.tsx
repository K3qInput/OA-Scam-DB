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
import { Plus, Users, UserCheck, Clock, CheckCircle, Search, FileText, MessageSquare } from "lucide-react";

const createAssignmentSchema = z.object({
  staffId: z.string().min(1, "Staff member is required"),
  caseId: z.string().optional(),
  contactId: z.string().optional(),
  assignmentType: z.enum(["primary", "secondary", "reviewer"]),
  notes: z.string().optional(),
});

type CreateAssignmentData = z.infer<typeof createAssignmentSchema>;

export default function StaffAssignments() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateAssignmentData>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      staffId: "",
      caseId: "",
      contactId: "",
      assignmentType: "primary",
      notes: "",
    },
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["/api/cases"],
  });

  const { data: contactMessages = [] } = useQuery({
    queryKey: ["/api/contact"],
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (data: CreateAssignmentData) => apiRequest("/api/assignments", "POST", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive",
      });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CreateAssignmentData>) => 
      apiRequest(`/api/assignments/${id}`, "PATCH", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateAssignmentData) => {
    createAssignmentMutation.mutate(data);
  };

  const getAssignmentTypeBadge = (type: string) => {
    switch (type) {
      case "primary":
        return <Badge className="bg-blue-600 hover:bg-blue-700"><UserCheck className="h-3 w-3 mr-1" />Primary</Badge>;
      case "secondary":
        return <Badge className="bg-green-600 hover:bg-green-700"><Users className="h-3 w-3 mr-1" />Secondary</Badge>;
      case "reviewer":
        return <Badge className="bg-purple-600 hover:bg-purple-700"><CheckCircle className="h-3 w-3 mr-1" />Reviewer</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const completeAssignment = (assignmentId: string) => {
    updateAssignmentMutation.mutate({ 
      id: assignmentId, 
      completedAt: new Date().toISOString(),
      isActive: false 
    });
  };

  const filteredAssignments = assignments.filter((assignment: any) => {
    const staffName = `${assignment.staff?.firstName || ""} ${assignment.staff?.lastName || ""}`.toLowerCase();
    const assignedByName = `${assignment.assignedByUser?.firstName || ""} ${assignment.assignedByUser?.lastName || ""}`.toLowerCase();
    
    const matchesSearch = 
      staffName.includes(searchTerm.toLowerCase()) ||
      assignedByName.includes(searchTerm.toLowerCase()) ||
      assignment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || assignment.assignmentType === typeFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && assignment.isActive) ||
      (statusFilter === "completed" && !assignment.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-oa-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Staff Assignments</h1>
            <p className="text-oa-gray">Manage staff assignments for cases and contacts</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-oa-red hover:bg-oa-red/80">
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-oa-dark border-oa-border text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Create New Assignment
                </DialogTitle>
                <DialogDescription className="text-oa-gray">
                  Assign a staff member to a case or contact message
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="staffId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Staff Member</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-oa-light border-oa-border text-white">
                                <SelectValue placeholder="Select staff member" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-oa-dark border-oa-border">
                              {staffMembers.map((staff: any) => (
                                <SelectItem key={staff.id} value={staff.id} className="text-white hover:bg-oa-light">
                                  {staff.firstName} {staff.lastName} ({staff.role})
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
                      name="assignmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Assignment Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-oa-light border-oa-border text-white">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-oa-dark border-oa-border">
                              <SelectItem value="primary" className="text-white hover:bg-oa-light">Primary</SelectItem>
                              <SelectItem value="secondary" className="text-white hover:bg-oa-light">Secondary</SelectItem>
                              <SelectItem value="reviewer" className="text-white hover:bg-oa-light">Reviewer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="caseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Case (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-oa-light border-oa-border text-white">
                                <SelectValue placeholder="Select case" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-oa-dark border-oa-border">
                              <SelectItem value="" className="text-white hover:bg-oa-light">No case</SelectItem>
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
                      name="contactId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Contact Message (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-oa-light border-oa-border text-white">
                                <SelectValue placeholder="Select contact" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-oa-dark border-oa-border">
                              <SelectItem value="" className="text-white hover:bg-oa-light">No contact</SelectItem>
                              {contactMessages.map((contact: any) => (
                                <SelectItem key={contact.id} value={contact.id} className="text-white hover:bg-oa-light">
                                  {contact.subject} - {contact.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Assignment notes and instructions..."
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
                      disabled={createAssignmentMutation.isPending}
                      className="flex-1 bg-oa-red hover:bg-oa-red/80"
                    >
                      {createAssignmentMutation.isPending ? "Creating..." : "Create Assignment"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-oa-gray" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-oa-light border-oa-border text-white"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48 bg-oa-light border-oa-border text-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-oa-dark border-oa-border">
              <SelectItem value="all" className="text-white hover:bg-oa-light">All Types</SelectItem>
              <SelectItem value="primary" className="text-white hover:bg-oa-light">Primary</SelectItem>
              <SelectItem value="secondary" className="text-white hover:bg-oa-light">Secondary</SelectItem>
              <SelectItem value="reviewer" className="text-white hover:bg-oa-light">Reviewer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-oa-light border-oa-border text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-oa-dark border-oa-border">
              <SelectItem value="all" className="text-white hover:bg-oa-light">All Status</SelectItem>
              <SelectItem value="active" className="text-white hover:bg-oa-light">Active</SelectItem>
              <SelectItem value="completed" className="text-white hover:bg-oa-light">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assignments List */}
        <div className="space-y-4">
          {filteredAssignments.map((assignment: any) => (
            <Card key={assignment.id} className="bg-oa-dark border-oa-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      {assignment.staff?.firstName} {assignment.staff?.lastName}
                    </CardTitle>
                    <CardDescription className="text-oa-gray">
                      Assigned by: {assignment.assignedByUser?.firstName} {assignment.assignedByUser?.lastName}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {getAssignmentTypeBadge(assignment.assignmentType)}
                    {assignment.isActive ? (
                      <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-600 hover:bg-gray-700">Completed</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-oa-gray" />
                    <div>
                      <p className="text-sm text-oa-gray">Assigned</p>
                      <p className="text-white">
                        {format(new Date(assignment.assignedAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  {assignment.completedAt && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-oa-gray" />
                      <div>
                        <p className="text-sm text-oa-gray">Completed</p>
                        <p className="text-white">
                          {format(new Date(assignment.completedAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    {assignment.caseId ? <FileText className="h-4 w-4 text-oa-gray" /> : <MessageSquare className="h-4 w-4 text-oa-gray" />}
                    <div>
                      <p className="text-sm text-oa-gray">Assignment Type</p>
                      <p className="text-white">
                        {assignment.caseId ? "Case Assignment" : "Contact Assignment"}
                      </p>
                    </div>
                  </div>
                </div>

                {assignment.notes && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Notes</h4>
                    <p className="text-oa-gray">{assignment.notes}</p>
                  </div>
                )}

                {assignment.isActive && (
                  <div className="flex gap-2 pt-4 border-t border-oa-border">
                    <Button
                      size="sm"
                      onClick={() => completeAssignment(assignment.id)}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={updateAssignmentMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="h-12 w-12 text-oa-gray mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No assignments found</h3>
            <p className="text-oa-gray mb-4">
              {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first staff assignment to get started"}
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-oa-red hover:bg-oa-red/80"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Assignment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}