import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { User, Star, Award, Calendar, Mail, Phone, MapPin, Edit3, Save, X } from "lucide-react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: userStats } = useQuery({
    queryKey: ["/api/users/stats", currentUser?.id],
    enabled: !!currentUser?.id,
    initialData: {
      totalCases: 0,
      resolvedCases: 0,
      reputation: 0,
      joinedDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      trustLevel: "bronze",
      completedProjects: 0,
      averageRating: 0,
    },
  });

  const { data: recentActivity } = useQuery({
    queryKey: ["/api/users/activity", currentUser?.id],
    enabled: !!currentUser?.id,
    initialData: [],
  });

  const [profileForm, setProfileForm] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    bio: currentUser?.bio || "",
    location: currentUser?.location || "",
    website: currentUser?.website || "",
    phoneNumber: currentUser?.phoneNumber || "",
    linkedinUrl: currentUser?.linkedinUrl || "",
    githubUrl: currentUser?.githubUrl || "",
    skills: currentUser?.skills || [],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/auth/user", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileForm);
  };

  const handleCancelEdit = () => {
    setProfileForm({
      firstName: currentUser?.firstName || "",
      lastName: currentUser?.lastName || "",
      bio: currentUser?.bio || "",
      location: currentUser?.location || "",
      website: currentUser?.website || "",
      phoneNumber: currentUser?.phoneNumber || "",
      linkedinUrl: currentUser?.linkedinUrl || "",
      githubUrl: currentUser?.githubUrl || "",
      skills: currentUser?.skills || [],
    });
    setIsEditing(false);
  };

  const getTrustLevelColor = (level: string) => {
    const colors = {
      bronze: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      silver: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      gold: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      platinum: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    };
    return colors[level as keyof typeof colors] || colors.bronze;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Profile</h1>
            <p className="text-slate-400">Manage your profile information and view your activity</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="text-center">
                <div className="mx-auto w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-white" />
                </div>
                <CardTitle className="text-white text-xl">
                  {currentUser?.firstName} {currentUser?.lastName}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  @{currentUser?.username}
                </CardDescription>
                <div className="flex justify-center mt-2">
                  <Badge className={getTrustLevelColor(userStats?.trustLevel || "bronze")}>
                    {userStats?.trustLevel || "Bronze"} Member
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {currentUser?.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">{currentUser.email}</span>
                    </div>
                  )}
                  
                  {profileForm.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">{profileForm.phoneNumber}</span>
                    </div>
                  )}
                  
                  {profileForm.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="text-slate-300">{profileForm.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">
                      Joined {formatDistanceToNow(new Date(userStats?.joinedDate || new Date()))} ago
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{userStats?.reputation || 0}</div>
                    <div className="text-xs text-slate-400">Reputation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{userStats?.totalCases || 0}</div>
                    <div className="text-xs text-slate-400">Cases</div>
                  </div>
                </div>

                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  className="w-full"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel Edit" : "Edit Profile"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-slate-800">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-white">About</CardTitle>
                      <CardDescription className="text-slate-400">
                        Your personal information and bio
                      </CardDescription>
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white">First Name</Label>
                            <Input
                              value={profileForm.firstName}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                              className="bg-slate-900 border-slate-600 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Last Name</Label>
                            <Input
                              value={profileForm.lastName}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                              className="bg-slate-900 border-slate-600 text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-white">Bio</Label>
                          <Textarea
                            value={profileForm.bio}
                            onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                            className="bg-slate-900 border-slate-600 text-white min-h-[100px]"
                            placeholder="Tell others about yourself..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white">Location</Label>
                            <Input
                              value={profileForm.location}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, location: e.target.value }))}
                              className="bg-slate-900 border-slate-600 text-white"
                              placeholder="City, Country"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-white">Website</Label>
                            <Input
                              value={profileForm.website}
                              onChange={(e) => setProfileForm(prev => ({ ...prev, website: e.target.value }))}
                              className="bg-slate-900 border-slate-600 text-white"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">Bio</h3>
                          <p className="text-slate-300">
                            {currentUser?.bio || "No bio provided yet."}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-white mb-2">Contact Information</h4>
                            <div className="space-y-2 text-sm">
                              <p className="text-slate-300">Email: {currentUser?.email}</p>
                              {profileForm.phoneNumber && (
                                <p className="text-slate-300">Phone: {profileForm.phoneNumber}</p>
                              )}
                              {profileForm.location && (
                                <p className="text-slate-300">Location: {profileForm.location}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium text-white mb-2">Statistics</h4>
                            <div className="space-y-2 text-sm">
                              <p className="text-slate-300">Cases Handled: {userStats?.totalCases || 0}</p>
                              <p className="text-slate-300">Resolved Cases: {userStats?.resolvedCases || 0}</p>
                              <p className="text-slate-300">Success Rate: {userStats?.totalCases ? Math.round((userStats.resolvedCases / userStats.totalCases) * 100) : 0}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-slate-400">
                      Your latest actions and contributions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity && recentActivity.length > 0 ? (
                        recentActivity.map((activity: any, index: number) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-slate-900 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-white">{activity.description}</p>
                              <p className="text-sm text-slate-400">
                                {formatDistanceToNow(new Date(activity.createdAt))} ago
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-slate-400">No recent activity to show.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Achievements & Badges</CardTitle>
                    <CardDescription className="text-slate-400">
                      Your accomplishments and recognition
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 bg-slate-900 rounded-lg text-center">
                        <Award className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <h3 className="font-semibold text-white">First Case</h3>
                        <p className="text-sm text-slate-400">Handled your first case</p>
                      </div>

                      <div className="p-4 bg-slate-900 rounded-lg text-center">
                        <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <h3 className="font-semibold text-white">Trusted Member</h3>
                        <p className="text-sm text-slate-400">Achieved {userStats?.trustLevel} status</p>
                      </div>

                      <div className="p-4 bg-slate-900 rounded-lg text-center">
                        <User className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <h3 className="font-semibold text-white">Community Member</h3>
                        <p className="text-sm text-slate-400">Active community participant</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}