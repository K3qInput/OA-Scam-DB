import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
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
  Edit
} from "lucide-react";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/statistics"],
  });

  // Get all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  // Get audit logs
  const { data: auditLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/audit-logs"],
  });

  // Get system health
  const { data: systemHealth } = useQuery({
    queryKey: ["/api/admin/system-health"],
  });

  // Update user mutation
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

  // Delete user mutation
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

  return (
    <div className="flex h-screen bg-oa-black">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-oa-gray">Manage users, monitor system, and control platform settings</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-oa-dark border border-oa-border">
              <TabsTrigger 
                value="overview" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-overview"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-users"
              >
                Users
              </TabsTrigger>
              <TabsTrigger 
                value="audit" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-audit"
              >
                Audit Logs
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-system"
              >
                System Health
              </TabsTrigger>
              <TabsTrigger 
                value="security" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-security"
              >
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-settings"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-oa-dark border-oa-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-oa-gray">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{(stats as any)?.totalUsers || 0}</div>
                    <div className="text-xs text-oa-green">+12% from last month</div>
                  </CardContent>
                </Card>

                <Card className="bg-oa-dark border-oa-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-oa-gray">Total Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{(stats as any)?.totalCases || 0}</div>
                    <div className="text-xs text-oa-green">+8% from last month</div>
                  </CardContent>
                </Card>

                <Card className="bg-oa-dark border-oa-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-oa-gray">Pending Cases</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{(stats as any)?.pendingCases || 0}</div>
                    <div className="text-xs text-yellow-400">Needs attention</div>
                  </CardContent>
                </Card>

                <Card className="bg-oa-dark border-oa-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-oa-gray">Active Disputes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{(stats as any)?.activeDisputes || 0}</div>
                    <div className="text-xs text-red-400">Monitor closely</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-oa-dark border-oa-border">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-oa-primary" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(auditLogs as any[])?.slice(0, 5).map((log: any) => (
                      <div key={log.id} className="flex items-center justify-between">
                        <div>
                          <div className="text-white text-sm">{log.action}</div>
                          <div className="text-oa-gray text-xs">{log.userId}</div>
                        </div>
                        <div className="text-oa-gray text-xs">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="bg-oa-dark border-oa-border">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      System Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm">High CPU Usage</div>
                        <div className="text-oa-gray text-xs">Server load at 85%</div>
                      </div>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm">Memory Usage</div>
                        <div className="text-oa-gray text-xs">RAM usage at 70%</div>
                      </div>
                      <Badge variant="outline" className="text-yellow-400">Warning</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm">Database Size</div>
                        <div className="text-oa-gray text-xs">Growing rapidly</div>
                      </div>
                      <Badge variant="outline" className="text-oa-primary">Info</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card className="bg-oa-dark border-oa-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="h-5 w-5 text-oa-primary" />
                    User Management
                  </CardTitle>
                  <CardDescription className="text-oa-gray">
                    Manage user accounts, roles, and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Input
                        placeholder="Search users..."
                        className="bg-oa-black border-oa-border text-white"
                        data-testid="input-search-users"
                      />
                      <Select>
                        <SelectTrigger className="w-48 bg-oa-black border-oa-border text-white">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent className="bg-oa-dark border-oa-border">
                          <SelectItem value="all">All Roles</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow className="border-oa-border">
                          <TableHead className="text-oa-gray">User</TableHead>
                          <TableHead className="text-oa-gray">Role</TableHead>
                          <TableHead className="text-oa-gray">Status</TableHead>
                          <TableHead className="text-oa-gray">Last Login</TableHead>
                          <TableHead className="text-oa-gray">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(users as any[])?.map((user: any) => (
                          <TableRow key={user.id} className="border-oa-border">
                            <TableCell className="text-white">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.profileImageUrl} />
                                  <AvatarFallback className="bg-oa-black text-white">
                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                                  <div className="text-oa-gray text-sm">{user.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.role === 'admin' ? 'default' : user.role === 'staff' ? 'secondary' : 'outline'}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-oa-gray">
                              {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleUserStatus(user.id, user.isActive)}
                                  data-testid={`button-toggle-user-${user.id}`}
                                >
                                  {user.isActive ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                </Button>
                                <Select onValueChange={(role) => changeUserRole(user.id, role)}>
                                  <SelectTrigger className="w-24 h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteUserMutation.mutate(user.id)}
                                  data-testid={`button-delete-user-${user.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-red-400" />
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

            <TabsContent value="audit" className="space-y-6">
              <Card className="bg-oa-dark border-oa-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-oa-primary" />
                    Audit Logs
                  </CardTitle>
                  <CardDescription className="text-oa-gray">
                    Monitor all system activities and user actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-oa-border">
                        <TableHead className="text-oa-gray">Timestamp</TableHead>
                        <TableHead className="text-oa-gray">User</TableHead>
                        <TableHead className="text-oa-gray">Action</TableHead>
                        <TableHead className="text-oa-gray">Entity</TableHead>
                        <TableHead className="text-oa-gray">IP Address</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(auditLogs as any[])?.map((log: any) => (
                        <TableRow key={log.id} className="border-oa-border">
                          <TableCell className="text-oa-gray">
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-white">{log.userId}</TableCell>
                          <TableCell className="text-white">{log.action}</TableCell>
                          <TableCell className="text-oa-gray">{log.entityType}</TableCell>
                          <TableCell className="text-oa-gray">{log.ipAddress}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-oa-dark border-oa-border">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Database className="h-5 w-5 text-oa-primary" />
                      Database Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Status</span>
                      <Badge variant="default">Healthy</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Connections</span>
                      <span className="text-white">12/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Size</span>
                      <span className="text-white">2.3 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Backup</span>
                      <span className="text-oa-green">24h ago</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-oa-dark border-oa-border">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-oa-primary" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-oa-gray">CPU Usage</span>
                      <span className="text-yellow-400">85%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Memory Usage</span>
                      <span className="text-oa-green">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Disk Usage</span>
                      <span className="text-oa-green">32%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Network I/O</span>
                      <span className="text-oa-green">Normal</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="bg-oa-dark border-oa-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-oa-primary" />
                    Security Settings
                  </CardTitle>
                  <CardDescription className="text-oa-gray">
                    Configure security policies and monitor threats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label className="text-white">Login Attempts</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-oa-gray">Max failed attempts</span>
                          <Input type="number" defaultValue="5" className="w-20 bg-oa-black border-oa-border text-white" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-oa-gray">Lockout duration (minutes)</span>
                          <Input type="number" defaultValue="30" className="w-20 bg-oa-black border-oa-border text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-white">Session Management</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-oa-gray">Session timeout (hours)</span>
                          <Input type="number" defaultValue="24" className="w-20 bg-oa-black border-oa-border text-white" />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-oa-gray">Concurrent sessions</span>
                          <Input type="number" defaultValue="3" className="w-20 bg-oa-black border-oa-border text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button className="bg-oa-primary hover:bg-oa-primary/80" data-testid="button-save-security">
                    Save Security Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-oa-dark border-oa-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-oa-primary" />
                    Platform Settings
                  </CardTitle>
                  <CardDescription className="text-oa-gray">
                    Configure global platform settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Platform Name</Label>
                      <Input 
                        defaultValue="OwnersAlliance" 
                        className="bg-oa-black border-oa-border text-white"
                        data-testid="input-platform-name"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Support Email</Label>
                      <Input 
                        defaultValue="support@ownersalliance.com" 
                        className="bg-oa-black border-oa-border text-white"
                        data-testid="input-support-email"
                      />
                    </div>

                    <div>
                      <Label className="text-white">Maintenance Mode</Label>
                      <Select>
                        <SelectTrigger className="bg-oa-black border-oa-border text-white">
                          <SelectValue placeholder="Select mode" />
                        </SelectTrigger>
                        <SelectContent className="bg-oa-dark border-oa-border">
                          <SelectItem value="off">Off</SelectItem>
                          <SelectItem value="on">On</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button className="bg-oa-primary hover:bg-oa-primary/80" data-testid="button-save-settings">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}