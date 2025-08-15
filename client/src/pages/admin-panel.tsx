
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Users, 
  Activity, 
  Settings, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  TrendingUp,
  Database,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Edit,
  Plus,
  Search,
  BarChart,
  FileText,
  Crown
} from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUserDialogOpen, setNewUserDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/statistics"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/statistics");
      return response.json();
    },
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/users");
      return response.json();
    },
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/audit-logs"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/audit-logs");
      return response.json();
    },
  });

  const { data: systemHealth } = useQuery({
    queryKey: ["/api/admin/system-health"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/system-health");
      return response.json();
    },
  });

  // Mutations
  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/admin/users/${userId}`, updates);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/admin/users", userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setNewUserDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const toggleUserStatus = (userId: string, isActive: boolean) => {
    updateUserMutation.mutate({
      userId,
      updates: { isActive: !isActive }
    });
  };

  const changeUserRole = (userId: string, role: string) => {
    updateUserMutation.mutate({
      userId,
      updates: { role }
    });
  };

  const filteredUsers = users?.filter((user: User) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500';
      case 'tribunal_head': return 'bg-purple-500';
      case 'senior_staff': return 'bg-blue-500';
      case 'staff': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-950 p-4 lg:p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Crown className="h-8 w-8 text-red-500" />
              Admin Control Panel
            </h1>
            <p className="text-gray-400">Ultimate platform management and control center</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="overview" className="data-[state=active]:bg-red-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-red-600">
                <Users className="h-4 w-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="moderation" className="data-[state=active]:bg-red-600">
                <Shield className="h-4 w-4 mr-2" />
                Moderation
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-red-600">
                <Database className="h-4 w-4 mr-2" />
                System Health
              </TabsTrigger>
              <TabsTrigger value="audit" className="data-[state=active]:bg-red-600">
                <FileText className="h-4 w-4 mr-2" />
                Audit Logs
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Users</p>
                        <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Active Cases</p>
                        <p className="text-2xl font-bold text-white">{stats?.activeCases || 0}</p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">System Health</p>
                        <p className="text-2xl font-bold text-white">{systemHealth?.status === 'healthy' ? '100%' : '0%'}</p>
                      </div>
                      <Activity className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Uptime</p>
                        <p className="text-2xl font-bold text-white">{Math.floor((systemHealth?.uptime || 0) / 60)}m</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {auditLogs?.slice(0, 5).map((log: any) => (
                        <div key={log.id} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-300">{log.action}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setActiveTab("users")}>
                        <Users className="h-4 w-4 mr-2" />
                        Manage Users
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => setNewUserDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create User
                      </Button>
                      <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setActiveTab("moderation")}>
                        <Shield className="h-4 w-4 mr-2" />
                        Moderation
                      </Button>
                      <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setActiveTab("system")}>
                        <Database className="h-4 w-4 mr-2" />
                        System Status
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <Button onClick={() => setNewUserDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </div>

              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-700">
                          <TableHead className="text-gray-300">User</TableHead>
                          <TableHead className="text-gray-300">Role</TableHead>
                          <TableHead className="text-gray-300">Status</TableHead>
                          <TableHead className="text-gray-300">Last Login</TableHead>
                          <TableHead className="text-gray-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user: User) => (
                          <TableRow key={user.id} className="border-gray-700">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.profileImageUrl} />
                                  <AvatarFallback className="bg-red-600 text-white text-xs">
                                    {user.username.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-white">{user.username}</p>
                                  <p className="text-sm text-gray-400">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={`${getRoleColor(user.role)} text-white`}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.isActive ? "default" : "destructive"}>
                                {user.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={user.isActive ? "destructive" : "default"}
                                  onClick={() => toggleUserStatus(user.id, user.isActive)}
                                >
                                  {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System Health Tab */}
            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Database</span>
                        <Badge className="bg-green-500 text-white">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">API Server</span>
                        <Badge className="bg-green-500 text-white">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Memory Usage</span>
                        <span className="text-white">{Math.round((systemHealth?.memory?.used || 0) / 1024 / 1024)}MB</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Uptime</span>
                        <span className="text-white">{Math.floor((systemHealth?.uptime || 0) / 60)} minutes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Response Time</span>
                        <span className="text-white">~50ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Error Rate</span>
                        <span className="text-white">0.1%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Audit Logs Tab */}
            <TabsContent value="audit" className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Audit Logs</CardTitle>
                  <CardDescription className="text-gray-400">
                    System and user activity logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditLogs?.slice(0, 10).map((log: any) => (
                      <div key={log.id} className="flex items-start space-x-4 p-4 bg-gray-800 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-white">{log.action}</p>
                            <span className="text-sm text-gray-400">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            User: {log.userId} | IP: {log.ipAddress}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Create User Dialog */}
          <Dialog open={newUserDialogOpen} onOpenChange={setNewUserDialogOpen}>
            <DialogContent className="bg-gray-900 border-gray-700 text-white">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add a new user to the system with specified role and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input placeholder="Enter username" className="bg-gray-800 border-gray-700" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="Enter email" className="bg-gray-800 border-gray-700" />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select>
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="senior_staff">Senior Staff</SelectItem>
                      <SelectItem value="tribunal_head">Tribunal Head</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setNewUserDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Create User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit User Dialog */}
          {selectedUser && (
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
              <DialogContent className="bg-gray-900 border-gray-700 text-white">
                <DialogHeader>
                  <DialogTitle>Edit User: {selectedUser.username}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={selectedUser.role}
                      onValueChange={(role) => changeUserRole(selectedUser.id, role)}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="senior_staff">Senior Staff</SelectItem>
                        <SelectItem value="tribunal_head">Tribunal Head</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setSelectedUser(null)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        deleteUserMutation.mutate(selectedUser.id);
                        setSelectedUser(null);
                      }}
                    >
                      Delete User
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </main>
      </div>
    </div>
  );
}
