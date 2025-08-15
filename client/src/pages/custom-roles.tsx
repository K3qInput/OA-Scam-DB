
import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Users, Shield, Settings } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'moderation' | 'admin' | 'cases' | 'users' | 'system';
}

interface CustomRole {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  userCount: number;
  createdAt: Date;
}

export default function CustomRoles() {
  const [roles, setRoles] = useState<CustomRole[]>([
    {
      id: 'moderator',
      name: 'Moderator',
      description: 'Standard moderation permissions',
      color: '#3B82F6',
      permissions: ['view_reports', 'handle_cases', 'ban_users'],
      userCount: 5,
      createdAt: new Date(),
    },
    {
      id: 'senior_mod',
      name: 'Senior Moderator',
      description: 'Enhanced moderation with admin access',
      color: '#8B5CF6',
      permissions: ['view_reports', 'handle_cases', 'ban_users', 'access_admin', 'manage_staff'],
      userCount: 2,
      createdAt: new Date(),
    },
  ]);

  const permissions: Permission[] = [
    { id: 'view_reports', name: 'View Reports', description: 'Can view submitted reports', category: 'cases' },
    { id: 'handle_cases', name: 'Handle Cases', description: 'Can process and resolve cases', category: 'cases' },
    { id: 'ban_users', name: 'Ban Users', description: 'Can ban/unban users', category: 'moderation' },
    { id: 'access_admin', name: 'Admin Access', description: 'Can access admin panel', category: 'admin' },
    { id: 'manage_staff', name: 'Manage Staff', description: 'Can add/remove staff members', category: 'admin' },
    { id: 'view_logs', name: 'View Logs', description: 'Can view system logs', category: 'system' },
    { id: 'manage_roles', name: 'Manage Roles', description: 'Can create/edit roles', category: 'admin' },
    { id: 'tribunal_access', name: 'Tribunal Access', description: 'Can participate in tribunals', category: 'cases' },
  ];

  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    color: '#EF4444',
    permissions: [] as string[],
  });

  const [editingRole, setEditingRole] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'moderation': return 'bg-red-500';
      case 'admin': return 'bg-purple-500';
      case 'cases': return 'bg-blue-500';
      case 'users': return 'bg-green-500';
      case 'system': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const togglePermission = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const createRole = () => {
    if (!newRole.name) return;
    
    const role: CustomRole = {
      id: newRole.name.toLowerCase().replace(/\s+/g, '_'),
      name: newRole.name,
      description: newRole.description,
      color: newRole.color,
      permissions: newRole.permissions,
      userCount: 0,
      createdAt: new Date(),
    };

    setRoles(prev => [...prev, role]);
    setNewRole({ name: '', description: '', color: '#EF4444', permissions: [] });
  };

  const deleteRole = (roleId: string) => {
    setRoles(prev => prev.filter(role => role.id !== roleId));
  };

  return (
    <div className="flex h-screen bg-oa-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-oa-dark p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Custom Role Builder</h1>
            <p className="text-gray-400">Create and manage custom roles with granular permissions</p>
          </div>

          <Tabs defaultValue="roles" className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="roles" className="data-[state=active]:bg-red-600">
                <Users className="h-4 w-4 mr-2" />
                Roles
              </TabsTrigger>
              <TabsTrigger value="permissions" className="data-[state=active]:bg-red-600">
                <Shield className="h-4 w-4 mr-2" />
                Permissions
              </TabsTrigger>
              <TabsTrigger value="create" className="data-[state=active]:bg-red-600">
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </TabsTrigger>
            </TabsList>

            <TabsContent value="roles" className="space-y-4">
              <div className="grid gap-4">
                {roles.map((role) => (
                  <Card key={role.id} className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: role.color }}
                          />
                          <CardTitle className="text-white">{role.name}</CardTitle>
                          <Badge variant="outline" className="text-gray-400">
                            {role.userCount} users
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setEditingRole(role.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteRole(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 mb-4">{role.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map((permId) => {
                          const perm = permissions.find(p => p.id === permId);
                          return perm ? (
                            <Badge 
                              key={permId} 
                              className={`${getCategoryColor(perm.category)} text-white`}
                            >
                              {perm.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="grid gap-4">
                {['moderation', 'admin', 'cases', 'users', 'system'].map(category => (
                  <Card key={category} className="bg-gray-900 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white capitalize flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
                        {category} Permissions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {permissions.filter(p => p.category === category).map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                            <div>
                              <h4 className="font-medium text-white">{permission.name}</h4>
                              <p className="text-sm text-gray-400">{permission.description}</p>
                            </div>
                            <Badge className={`${getCategoryColor(permission.category)} text-white`}>
                              {permission.category}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Create New Role</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="roleName" className="text-white">Role Name</Label>
                      <Input
                        id="roleName"
                        value={newRole.name}
                        onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter role name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roleColor" className="text-white">Role Color</Label>
                      <Input
                        id="roleColor"
                        type="color"
                        value={newRole.color}
                        onChange={(e) => setNewRole(prev => ({ ...prev, color: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roleDescription" className="text-white">Description</Label>
                    <Input
                      id="roleDescription"
                      value={newRole.description}
                      onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this role's purpose"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-white">Permissions</Label>
                    {['moderation', 'admin', 'cases', 'users', 'system'].map(category => (
                      <div key={category} className="space-y-3">
                        <h4 className="font-medium text-white capitalize flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
                          {category}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-5">
                          {permissions.filter(p => p.category === category).map((permission) => (
                            <div key={permission.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={permission.id}
                                checked={newRole.permissions.includes(permission.id)}
                                onCheckedChange={() => togglePermission(permission.id)}
                              />
                              <Label 
                                htmlFor={permission.id} 
                                className="text-sm text-gray-300 cursor-pointer"
                              >
                                {permission.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={createRole} 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={!newRole.name}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
