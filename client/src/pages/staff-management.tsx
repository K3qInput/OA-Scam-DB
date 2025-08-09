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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Users, Shield, Star, Crown, Search, UserPlus, Phone, MapPin, Mail } from "lucide-react";

const createStaffSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Valid email is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["staff", "senior_staff", "tribunal_head"]),
  department: z.string().optional(),
  specialization: z.string().optional(),
  phoneNumber: z.string().optional(),
  officeLocation: z.string().optional(),
  emergencyContact: z.string().optional(),
  passwordHash: z.string().min(6, "Password must be at least 6 characters"),
});

type CreateStaffData = z.infer<typeof createStaffSchema>;

export default function StaffManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateStaffData>({
    resolver: zodResolver(createStaffSchema),
    defaultValues: {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "staff",
      department: "",
      specialization: "",
      phoneNumber: "",
      officeLocation: "",
      emergencyContact: "",
      passwordHash: "",
    },
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: ["/api/staff"],
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ["/api/assignments"],
  });

  const createStaffMutation = useMutation({
    mutationFn: (data: CreateStaffData) => apiRequest("/api/staff/create", "POST", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Staff member created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/staff"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create staff member",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateStaffData) => {
    createStaffMutation.mutate(data);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-purple-600 hover:bg-purple-700"><Crown className="h-3 w-3 mr-1" />Admin</Badge>;
      case "tribunal_head":
        return <Badge className="bg-red-600 hover:bg-red-700"><Shield className="h-3 w-3 mr-1" />Tribunal Head</Badge>;
      case "senior_staff":
        return <Badge className="bg-blue-600 hover:bg-blue-700"><Star className="h-3 w-3 mr-1" />Senior Staff</Badge>;
      case "staff":
        return <Badge className="bg-green-600 hover:bg-green-700"><Users className="h-3 w-3 mr-1" />Staff</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  const filteredStaff = staffMembers.filter((member: any) => {
    const matchesSearch = 
      member.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.staffId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getStaffAssignmentCount = (staffId: string) => {
    return assignments.filter((assignment: any) => 
      assignment.staffId === staffId && assignment.isActive
    ).length;
  };

  return (
    <div className="min-h-screen bg-oa-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Staff Management</h1>
            <p className="text-oa-gray">Manage tribunal staff members and assignments</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-oa-red hover:bg-oa-red/80">
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-oa-dark border-oa-border text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Create New Staff Member
                </DialogTitle>
                <DialogDescription className="text-oa-gray">
                  Add a new staff member to the tribunal team
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">First Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="John"
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
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Last Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doe"
                              className="bg-oa-light border-oa-border text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="johndoe"
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@ownersalliance.tribunal"
                              className="bg-oa-light border-oa-border text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-oa-light border-oa-border text-white">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-oa-dark border-oa-border">
                              <SelectItem value="staff" className="text-white hover:bg-oa-light">Staff</SelectItem>
                              <SelectItem value="senior_staff" className="text-white hover:bg-oa-light">Senior Staff</SelectItem>
                              <SelectItem value="tribunal_head" className="text-white hover:bg-oa-light">Tribunal Head</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Department</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Investigation, Review, Appeals..."
                              className="bg-oa-light border-oa-border text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Specialization</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Financial Crimes, Cyber Fraud..."
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
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Phone Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="+1 (555) 123-4567"
                              className="bg-oa-light border-oa-border text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="officeLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Office Location</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Building A, Floor 4, Room 450"
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
                      name="emergencyContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Emergency Contact</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Name and phone number"
                              className="bg-oa-light border-oa-border text-white"
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
                    name="passwordHash"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Initial Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Temporary password for first login"
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
                      disabled={createStaffMutation.isPending}
                      className="flex-1 bg-oa-red hover:bg-oa-red/80"
                    >
                      {createStaffMutation.isPending ? "Creating..." : "Create Staff Member"}
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
              placeholder="Search staff members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-oa-light border-oa-border text-white"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48 bg-oa-light border-oa-border text-white">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent className="bg-oa-dark border-oa-border">
              <SelectItem value="all" className="text-white hover:bg-oa-light">All Roles</SelectItem>
              <SelectItem value="admin" className="text-white hover:bg-oa-light">Admin</SelectItem>
              <SelectItem value="tribunal_head" className="text-white hover:bg-oa-light">Tribunal Head</SelectItem>
              <SelectItem value="senior_staff" className="text-white hover:bg-oa-light">Senior Staff</SelectItem>
              <SelectItem value="staff" className="text-white hover:bg-oa-light">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member: any) => (
            <Card key={member.id} className="bg-oa-dark border-oa-border hover:border-oa-red/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">
                      {member.firstName} {member.lastName}
                    </CardTitle>
                    <CardDescription className="text-oa-gray">
                      @{member.username}
                    </CardDescription>
                  </div>
                  {getRoleBadge(member.role)}
                </div>
                {member.staffId && (
                  <div className="text-sm text-oa-gray">
                    Staff ID: {member.staffId}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {member.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-oa-gray" />
                    <span className="text-white truncate">{member.email}</span>
                  </div>
                )}
                {member.phoneNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-oa-gray" />
                    <span className="text-white">{member.phoneNumber}</span>
                  </div>
                )}
                {member.officeLocation && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-oa-gray" />
                    <span className="text-white">{member.officeLocation}</span>
                  </div>
                )}
                {member.department && (
                  <div className="text-sm">
                    <span className="text-oa-gray">Department: </span>
                    <span className="text-white">{member.department}</span>
                  </div>
                )}
                {member.specialization && (
                  <div className="text-sm">
                    <span className="text-oa-gray">Specialization: </span>
                    <span className="text-white">{member.specialization}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-oa-border">
                  <span className="text-sm text-oa-gray">Active Assignments</span>
                  <Badge variant="secondary" className="bg-oa-light text-white">
                    {getStaffAssignmentCount(member.id)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-oa-gray mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No staff members found</h3>
            <p className="text-oa-gray">
              {searchTerm || roleFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Start by adding your first staff member"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}