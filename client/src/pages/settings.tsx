import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Settings, User, Bell, Shield, Eye, Palette } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("account");

  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: userSettings } = useQuery({
    queryKey: ["/api/settings/user"],
    initialData: {
      emailNotifications: true,
      pushNotifications: false,
      theme: "dark",
      language: "en",
      timezone: "UTC",
      twoFactorEnabled: false,
      profileVisibility: "public",
      activityTracking: true,
    },
  });

  const [accountForm, setAccountForm] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    bio: currentUser?.bio || "",
    phoneNumber: currentUser?.phoneNumber || "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: userSettings?.emailNotifications || true,
    pushNotifications: userSettings?.pushNotifications || false,
    caseUpdates: true,
    systemAlerts: true,
    marketingEmails: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: userSettings?.profileVisibility || "public",
    activityTracking: userSettings?.activityTracking || true,
    dataSharing: false,
    analyticsOptOut: false,
  });

  const updateAccountMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/auth/user", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Updated",
        description: "Your account information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update account information.",
        variant: "destructive",
      });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/settings/user", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    },
  });

  const handleAccountUpdate = () => {
    updateAccountMutation.mutate(accountForm);
  };

  const handleNotificationUpdate = () => {
    updateSettingsMutation.mutate({ type: "notifications", ...notificationSettings });
  };

  const handlePrivacyUpdate = () => {
    updateSettingsMutation.mutate({ type: "privacy", ...privacySettings });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
            <p className="text-slate-400">Manage your account and application preferences</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-slate-800">
            <TabsTrigger value="account" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Appearance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Account Information</CardTitle>
                <CardDescription className="text-slate-400">
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white">First Name</Label>
                    <Input
                      id="firstName"
                      value={accountForm.firstName}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white">Last Name</Label>
                    <Input
                      id="lastName"
                      value={accountForm.lastName}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    value={accountForm.bio}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="bg-slate-900 border-slate-600 text-white min-h-[100px]"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    value={accountForm.phoneNumber}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="bg-slate-900 border-slate-600 text-white"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <Button
                  onClick={handleAccountUpdate}
                  disabled={updateAccountMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateAccountMutation.isPending ? "Updating..." : "Update Account"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
                <CardDescription className="text-slate-400">
                  Choose how you want to be notified about activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Email Notifications</Label>
                      <p className="text-sm text-slate-400">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Push Notifications</Label>
                      <p className="text-sm text-slate-400">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Case Updates</Label>
                      <p className="text-sm text-slate-400">Get notified when cases are updated</p>
                    </div>
                    <Switch
                      checked={notificationSettings.caseUpdates}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, caseUpdates: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">System Alerts</Label>
                      <p className="text-sm text-slate-400">Important system notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleNotificationUpdate}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateSettingsMutation.isPending ? "Updating..." : "Save Notifications"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Privacy Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Profile Visibility</Label>
                    <Select
                      value={privacySettings.profileVisibility}
                      onValueChange={(value) => 
                        setPrivacySettings(prev => ({ ...prev, profileVisibility: value }))
                      }
                    >
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="members">Members Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Activity Tracking</Label>
                      <p className="text-sm text-slate-400">Allow tracking of your activity for analytics</p>
                    </div>
                    <Switch
                      checked={privacySettings.activityTracking}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, activityTracking: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-white">Data Sharing</Label>
                      <p className="text-sm text-slate-400">Share anonymized data for platform improvement</p>
                    </div>
                    <Switch
                      checked={privacySettings.dataSharing}
                      onCheckedChange={(checked) => 
                        setPrivacySettings(prev => ({ ...prev, dataSharing: checked }))
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handlePrivacyUpdate}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateSettingsMutation.isPending ? "Updating..." : "Save Privacy Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Appearance</CardTitle>
                <CardDescription className="text-slate-400">
                  Customize how the application looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white">Theme</Label>
                    <Select defaultValue="dark">
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Timezone</Label>
                    <Select defaultValue="UTC">
                      <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                        <SelectItem value="GMT">GMT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Appearance Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}