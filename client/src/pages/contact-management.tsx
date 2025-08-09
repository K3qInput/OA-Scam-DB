import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Search, Mail, Clock, User, AlertTriangle, CheckCircle, Eye, UserCheck } from "lucide-react";

export default function ContactManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contactMessages = [] } = useQuery({
    queryKey: ["/api/contact"],
    initialData: [],
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: ["/api/staff"],
    initialData: [],
  });

  const updateMessageMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & any) => 
      apiRequest("PATCH", `/api/contact/${id}`, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/contact"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-600 hover:bg-red-700";
      case "high": return "bg-orange-600 hover:bg-orange-700";
      case "medium": return "bg-yellow-600 hover:bg-yellow-700";
      case "low": return "bg-green-600 hover:bg-green-700";
      default: return "bg-gray-600 hover:bg-gray-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-600 hover:bg-blue-700";
      case "in_progress": return "bg-orange-600 hover:bg-orange-700";
      case "resolved": return "bg-green-600 hover:bg-green-700";
      case "closed": return "bg-gray-600 hover:bg-gray-700";
      default: return "bg-gray-600 hover:bg-gray-700";
    }
  };

  const updateStatus = (messageId: string, status: string) => {
    updateMessageMutation.mutate({ id: messageId, status });
  };

  const assignToStaff = (messageId: string, staffId: string) => {
    updateMessageMutation.mutate({ id: messageId, assignedTo: staffId });
  };

  const filteredMessages = contactMessages.filter((message: any) => {
    const matchesSearch = 
      message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || message.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openMessageDetail = (message: any) => {
    setSelectedMessage(message);
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-oa-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Contact Management</h1>
          <p className="text-oa-gray">Manage and respond to contact messages from users</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-oa-gray" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-oa-light border-oa-border text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-oa-light border-oa-border text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-oa-dark border-oa-border">
              <SelectItem value="all" className="text-white hover:bg-oa-light">All Status</SelectItem>
              <SelectItem value="new" className="text-white hover:bg-oa-light">New</SelectItem>
              <SelectItem value="in_progress" className="text-white hover:bg-oa-light">In Progress</SelectItem>
              <SelectItem value="resolved" className="text-white hover:bg-oa-light">Resolved</SelectItem>
              <SelectItem value="closed" className="text-white hover:bg-oa-light">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-48 bg-oa-light border-oa-border text-white">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent className="bg-oa-dark border-oa-border">
              <SelectItem value="all" className="text-white hover:bg-oa-light">All Priority</SelectItem>
              <SelectItem value="critical" className="text-white hover:bg-oa-light">Critical</SelectItem>
              <SelectItem value="high" className="text-white hover:bg-oa-light">High</SelectItem>
              <SelectItem value="medium" className="text-white hover:bg-oa-light">Medium</SelectItem>
              <SelectItem value="low" className="text-white hover:bg-oa-light">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Messages List */}
        <div className="space-y-4">
          {filteredMessages.map((message: any) => (
            <Card key={message.id} className="bg-oa-dark border-oa-border hover:border-oa-red/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      {message.subject}
                    </CardTitle>
                    <CardDescription className="text-oa-gray">
                      From: {message.name} ({message.email})
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(message.priority)}>
                      {message.priority === "critical" && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {message.priority}
                    </Badge>
                    <Badge className={getStatusColor(message.status)}>
                      {message.status === "resolved" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {message.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-oa-gray">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(message.createdAt), "MMM dd, yyyy HH:mm")}
                    </div>
                    {message.assignedToUser && (
                      <div className="flex items-center gap-1">
                        <UserCheck className="h-4 w-4" />
                        Assigned to: {message.assignedToUser.firstName} {message.assignedToUser.lastName}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-white line-clamp-2">{message.message}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => openMessageDetail(message)}
                    variant="outline"
                    className="border-oa-border text-white hover:bg-oa-light"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  
                  {message.status === "new" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(message.id, "in_progress")}
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled={updateMessageMutation.isPending}
                    >
                      Start Progress
                    </Button>
                  )}
                  
                  {message.status === "in_progress" && (
                    <Button
                      size="sm"
                      onClick={() => updateStatus(message.id, "resolved")}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={updateMessageMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Resolved
                    </Button>
                  )}
                  
                  {!message.assignedTo && (
                    <Select onValueChange={(staffId) => assignToStaff(message.id, staffId)}>
                      <SelectTrigger className="w-40 bg-oa-light border-oa-border text-white h-8">
                        <SelectValue placeholder="Assign to..." />
                      </SelectTrigger>
                      <SelectContent className="bg-oa-dark border-oa-border">
                        {staffMembers.map((staff: any) => (
                          <SelectItem key={staff.id} value={staff.id} className="text-white hover:bg-oa-light">
                            {staff.firstName} {staff.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-oa-gray mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No messages found</h3>
            <p className="text-oa-gray">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your filters"
                : "No contact messages have been received yet"}
            </p>
          </div>
        )}

        {/* Message Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="bg-oa-dark border-oa-border text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Message Details
              </DialogTitle>
              <DialogDescription className="text-oa-gray">
                Full message information and management options
              </DialogDescription>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Sender Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-oa-gray" />
                        <span className="text-white">{selectedMessage.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-oa-gray" />
                        <span className="text-white">{selectedMessage.email}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Message Status</h4>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(selectedMessage.priority)}>
                          {selectedMessage.priority}
                        </Badge>
                        <Badge className={getStatusColor(selectedMessage.status)}>
                          {selectedMessage.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="text-sm text-oa-gray">
                        Received: {format(new Date(selectedMessage.createdAt), "MMM dd, yyyy HH:mm")}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Subject</h4>
                  <p className="text-white bg-oa-light p-3 rounded border border-oa-border">
                    {selectedMessage.subject}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">Message</h4>
                  <div className="text-white bg-oa-light p-4 rounded border border-oa-border max-h-64 overflow-y-auto">
                    <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {selectedMessage.assignedToUser && (
                  <div>
                    <h4 className="font-semibold text-white mb-2">Assigned To</h4>
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-oa-gray" />
                      <span className="text-white">
                        {selectedMessage.assignedToUser.firstName} {selectedMessage.assignedToUser.lastName}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-oa-border">
                  <Button
                    onClick={() => setIsDetailDialogOpen(false)}
                    variant="outline"
                    className="flex-1 border-oa-border text-white hover:bg-oa-light"
                  >
                    Close
                  </Button>
                  {selectedMessage.status !== "resolved" && (
                    <Button
                      onClick={() => {
                        updateStatus(selectedMessage.id, "resolved");
                        setIsDetailDialogOpen(false);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={updateMessageMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}