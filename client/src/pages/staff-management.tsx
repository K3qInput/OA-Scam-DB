import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Users, UserPlus, Award, TrendingUp, Settings, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StaffMember {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
  specialization?: string;
  staffId?: string;
  phoneNumber?: string;
  officeLocation?: string;
  certifications: string[];
  isActive: boolean;
  createdAt: string;
}

interface StaffPermission {
  id: string;
  userId: string;
  permission: string;
  scope?: string;
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
  isActive: boolean;
}

interface StaffPerformance {
  id: string;
  staffId: string;
  period: string;
  casesHandled: number;
  avgResolutionTime: number;
  qualityRating: number;
  teamworkRating: number;
  clientSatisfaction: number;
  goals: any;
  achievements: string[];
  areasForImprovement: string[];
  evaluatedBy: string;
  createdAt: string;
}

export default function StaffManagementPage() {
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [permissionForm, setPermissionForm] = useState({
    permission: "",
    scope: "",
    expiresAt: "",
  });
  const [performanceForm, setPerformanceForm] = useState({
    period: "",
    casesHandled: 0,
    avgResolutionTime: 0,
    qualityRating: 5,
    teamworkRating: 5,
    clientSatisfaction: 5,
    goals: {},
    achievements: "",
    areasForImprovement: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user to check permissions
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check if user can manage staff
  const canManageStaff = currentUser?.role && ["admin", "tribunal_head", "senior_staff"].includes(currentUser.role);

  // Get staff members
  const { data: staffMembers = [], isLoading: staffLoading } = useQuery({
    queryKey: ["/api/staff"],
    queryFn: () => apiRequest("/api/staff"),
    enabled: canManageStaff,
  });

  // Get permissions for selected staff
  const { data: staffPermissions = [] } = useQuery({
    queryKey: ["/api/staff", selectedStaffId, "permissions"],
    queryFn: () => apiRequest(`/api/staff/${selectedStaffId}/permissions`),
    enabled: !!selectedStaffId && canManageStaff,
  });

  // Get performance for selected staff
  const { data: performance = [] } = useQuery({
    queryKey: ["/api/staff", selectedStaffId, "performance"],
    queryFn: () => apiRequest(`/api/staff/${selectedStaffId}/performance`),
    enabled: !!selectedStaffId && canManageStaff,
  });

  // Grant permission mutation
  const grantPermissionMutation = useMutation({
    mutationFn: async (permissionData: any) => {
      return apiRequest("/api/staff/permissions", {
        method: "POST",
        body: JSON.stringify(permissionData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Permission granted successfully",
      });
      setPermissionForm({
        permission: "",
        scope: "",
        expiresAt: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff", selectedStaffId, "permissions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create performance review mutation
  const createPerformanceMutation = useMutation({
    mutationFn: async (performanceData: any) => {
      return apiRequest("/api/staff/performance", {
        method: "POST",
        body: JSON.stringify(performanceData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Performance review created successfully",
      });
      setPerformanceForm({
        period: "",
        casesHandled: 0,
        avgResolutionTime: 0,
        qualityRating: 5,
        teamworkRating: 5,
        clientSatisfaction: 5,
        goals: {},
        achievements: "",
        areasForImprovement: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/staff", selectedStaffId, "performance"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGrantPermission = () => {
    if (!selectedStaffId || !permissionForm.permission) {
      toast({
        title: "Validation Error",
        description: "Please select a staff member and permission",
        variant: "destructive",
      });
      return;
    }

    grantPermissionMutation.mutate({
      userId: selectedStaffId,
      ...permissionForm,
    });
  };

  const handleCreatePerformanceReview = () => {
    if (!selectedStaffId || !performanceForm.period) {
      toast({
        title: "Validation Error",
        description: "Please select a staff member and period",
        variant: "destructive",
      });
      return;
    }

    const achievementsArray = performanceForm.achievements
      .split("\n")
      .filter(a => a.trim())
      .map(a => a.trim());

    const improvementArray = performanceForm.areasForImprovement
      .split("\n")
      .filter(a => a.trim())
      .map(a => a.trim());

    createPerformanceMutation.mutate({
      staffId: selectedStaffId,
      ...performanceForm,
      achievements: achievementsArray,
      areasForImprovement: improvementArray,
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "tribunal_head": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "senior_staff": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "staff": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPerformanceColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-red-600";
  };

  const selectedStaff = staffMembers.find((s: StaffMember) => s.id === selectedStaffId);

  const permissionOptions = [
    "case_management",
    "user_management", 
    "evidence_review",
    "appeal_handling",
    "report_generation",
    "audit_access",
    "staff_training",
    "system_config",
  ];

  const departments = [
    "administration",
    "investigation", 
    "tribunal",
    "compliance",
    "training",
    "technical",
  ];

  if (!canManageStaff) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access staff management features.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Staff Management</h1>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Manage staff permissions, performance reviews, and administrative tasks. 
          Only senior staff and administrators can access these features.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Staff Members
            </CardTitle>
            <CardDescription>
              Select a staff member to manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {staffLoading ? (
              <div>Loading staff...</div>
            ) : staffMembers.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                No staff members found
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {staffMembers.map((staff: StaffMember) => (
                  <div
                    key={staff.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedStaffId === staff.id 
                        ? "bg-blue-50 border-blue-300 dark:bg-blue-950 dark:border-blue-700" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-900"
                    }`}
                    onClick={() => setSelectedStaffId(staff.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{staff.firstName} {staff.lastName}</div>
                        <div className="text-sm text-gray-500">@{staff.username}</div>
                        {staff.staffId && (
                          <div className="text-xs text-gray-400">ID: {staff.staffId}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge className={getRoleColor(staff.role)}>
                          {staff.role.replace("_", " ")}
                        </Badge>
                        {staff.department && (
                          <div className="text-xs text-gray-500 mt-1">
                            {staff.department}
                          </div>
                        )}
                      </div>
                    </div>
                    {staff.specialization && (
                      <div className="text-xs text-blue-600 mt-1">
                        {staff.specialization.replace("_", " ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Management */}
        <div className="lg:col-span-2">
          {!selectedStaff ? (
            <Card>
              <CardContent className="text-center py-12">
                <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Select a staff member to manage</p>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedStaff.firstName} {selectedStaff.lastName}</CardTitle>
                    <CardDescription>Staff member details and information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Username</Label>
                        <div className="text-sm">{selectedStaff.username}</div>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <div className="text-sm">{selectedStaff.email}</div>
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Badge className={getRoleColor(selectedStaff.role)}>
                          {selectedStaff.role.replace("_", " ")}
                        </Badge>
                      </div>
                      <div>
                        <Label>Staff ID</Label>
                        <div className="text-sm">{selectedStaff.staffId || "N/A"}</div>
                      </div>
                      <div>
                        <Label>Department</Label>
                        <div className="text-sm">{selectedStaff.department || "N/A"}</div>
                      </div>
                      <div>
                        <Label>Specialization</Label>
                        <div className="text-sm">{selectedStaff.specialization?.replace("_", " ") || "N/A"}</div>
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <div className="text-sm">{selectedStaff.phoneNumber || "N/A"}</div>
                      </div>
                      <div>
                        <Label>Office</Label>
                        <div className="text-sm">{selectedStaff.officeLocation || "N/A"}</div>
                      </div>
                    </div>

                    {selectedStaff.certifications.length > 0 && (
                      <div>
                        <Label>Certifications</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedStaff.certifications.map((cert, index) => (
                            <Badge key={index} variant="outline">
                              <Award className="h-3 w-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <Label>Status</Label>
                      <Badge variant={selectedStaff.isActive ? "default" : "secondary"}>
                        {selectedStaff.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div>
                      <Label>Member Since</Label>
                      <div className="text-sm">{new Date(selectedStaff.createdAt).toLocaleDateString()}</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Permissions Tab */}
              <TabsContent value="permissions">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Staff Permissions
                    </CardTitle>
                    <CardDescription>
                      Manage permissions for {selectedStaff.firstName} {selectedStaff.lastName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Grant Permission Form */}
                    <div className="border-b pb-4">
                      <h3 className="font-medium mb-3">Grant New Permission</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="permission">Permission</Label>
                          <Select
                            value={permissionForm.permission}
                            onValueChange={(value) => setPermissionForm({ ...permissionForm, permission: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select permission" />
                            </SelectTrigger>
                            <SelectContent>
                              {permissionOptions.map((perm) => (
                                <SelectItem key={perm} value={perm}>
                                  {perm.replace("_", " ").toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="scope">Scope (Optional)</Label>
                          <Input
                            id="scope"
                            placeholder="e.g., department, case_type"
                            value={permissionForm.scope}
                            onChange={(e) => setPermissionForm({ ...permissionForm, scope: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="expires">Expires (Optional)</Label>
                          <Input
                            id="expires"
                            type="date"
                            value={permissionForm.expiresAt}
                            onChange={(e) => setPermissionForm({ ...permissionForm, expiresAt: e.target.value })}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleGrantPermission}
                        disabled={!permissionForm.permission || grantPermissionMutation.isPending}
                        className="mt-4"
                      >
                        {grantPermissionMutation.isPending ? "Granting..." : "Grant Permission"}
                      </Button>
                    </div>

                    {/* Current Permissions */}
                    <div>
                      <h3 className="font-medium mb-3">Current Permissions</h3>
                      {staffPermissions.length === 0 ? (
                        <div className="text-gray-500 text-center py-4">
                          No permissions granted yet
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {staffPermissions.map((permission: StaffPermission) => (
                            <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-medium">{permission.permission.replace("_", " ").toUpperCase()}</div>
                                {permission.scope && (
                                  <div className="text-sm text-gray-500">Scope: {permission.scope}</div>
                                )}
                                <div className="text-xs text-gray-400">
                                  Granted: {new Date(permission.grantedAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge variant={permission.isActive ? "default" : "secondary"}>
                                  {permission.isActive ? "Active" : "Inactive"}
                                </Badge>
                                {permission.expiresAt && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Expires: {new Date(permission.expiresAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Reviews
                    </CardTitle>
                    <CardDescription>
                      Manage performance reviews for {selectedStaff.firstName} {selectedStaff.lastName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Create Performance Review Form */}
                    <div className="border-b pb-4">
                      <h3 className="font-medium mb-3">Create Performance Review</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="period">Review Period</Label>
                          <Select
                            value={performanceForm.period}
                            onValueChange={(value) => setPerformanceForm({ ...performanceForm, period: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Q1_2024">Q1 2024</SelectItem>
                              <SelectItem value="Q2_2024">Q2 2024</SelectItem>
                              <SelectItem value="Q3_2024">Q3 2024</SelectItem>
                              <SelectItem value="Q4_2024">Q4 2024</SelectItem>
                              <SelectItem value="annual_2024">Annual 2024</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="casesHandled">Cases Handled</Label>
                          <Input
                            id="casesHandled"
                            type="number"
                            value={performanceForm.casesHandled}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, casesHandled: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="avgResolutionTime">Avg Resolution Time (hours)</Label>
                          <Input
                            id="avgResolutionTime"
                            type="number"
                            step="0.1"
                            value={performanceForm.avgResolutionTime}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, avgResolutionTime: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="qualityRating">Quality Rating (1-5)</Label>
                          <Input
                            id="qualityRating"
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={performanceForm.qualityRating}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, qualityRating: parseFloat(e.target.value) || 5 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="teamworkRating">Teamwork Rating (1-5)</Label>
                          <Input
                            id="teamworkRating"
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={performanceForm.teamworkRating}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, teamworkRating: parseFloat(e.target.value) || 5 })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="clientSatisfaction">Client Satisfaction (1-5)</Label>
                          <Input
                            id="clientSatisfaction"
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            value={performanceForm.clientSatisfaction}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, clientSatisfaction: parseFloat(e.target.value) || 5 })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <Label htmlFor="achievements">Achievements (one per line)</Label>
                          <Textarea
                            id="achievements"
                            placeholder="List key achievements..."
                            value={performanceForm.achievements}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, achievements: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="improvements">Areas for Improvement (one per line)</Label>
                          <Textarea
                            id="improvements"
                            placeholder="Areas needing improvement..."
                            value={performanceForm.areasForImprovement}
                            onChange={(e) => setPerformanceForm({ ...performanceForm, areasForImprovement: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleCreatePerformanceReview}
                        disabled={!performanceForm.period || createPerformanceMutation.isPending}
                        className="mt-4"
                      >
                        {createPerformanceMutation.isPending ? "Creating..." : "Create Review"}
                      </Button>
                    </div>

                    {/* Performance History */}
                    <div>
                      <h3 className="font-medium mb-3">Performance History</h3>
                      {performance.length === 0 ? (
                        <div className="text-gray-500 text-center py-4">
                          No performance reviews yet
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {performance.map((review: StaffPerformance) => (
                            <div key={review.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium">{review.period}</h4>
                                <div className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <div className="text-sm text-gray-500">Cases Handled</div>
                                  <div className="font-medium">{review.casesHandled}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500">Avg Resolution</div>
                                  <div className="font-medium">{review.avgResolutionTime}h</div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500">Quality</div>
                                  <div className={`font-medium ${getPerformanceColor(review.qualityRating)}`}>
                                    {review.qualityRating}/5
                                  </div>
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500">Teamwork</div>
                                  <div className={`font-medium ${getPerformanceColor(review.teamworkRating)}`}>
                                    {review.teamworkRating}/5
                                  </div>
                                </div>
                              </div>
                              {review.achievements.length > 0 && (
                                <div className="mb-2">
                                  <div className="text-sm font-medium text-green-700 mb-1">Achievements:</div>
                                  <ul className="text-sm list-disc list-inside space-y-1">
                                    {review.achievements.map((achievement, index) => (
                                      <li key={index}>{achievement}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {review.areasForImprovement.length > 0 && (
                                <div>
                                  <div className="text-sm font-medium text-orange-700 mb-1">Areas for Improvement:</div>
                                  <ul className="text-sm list-disc list-inside space-y-1">
                                    {review.areasForImprovement.map((area, index) => (
                                      <li key={index}>{area}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}