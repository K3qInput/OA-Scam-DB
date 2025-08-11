import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Star, Trophy, DollarSign, Clock, Shield, Globe, Github, Twitter, ExternalLink, Briefcase } from "lucide-react";

interface ReputationProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  specialties: string[];
  publicRoles: string[];
  isPublic: boolean;
  projectsCompleted: number;
  totalEarnings: number;
  averageRating: string;
  portfolioItems?: any;
  socialLinks?: any;
  availabilityStatus: string;
  hourlyRate?: number;
  preferredPaymentMethods: string[];
  lastActiveAt: string;
  user?: {
    username: string;
    profileImageUrl?: string;
    createdAt: string;
  };
  reputation?: {
    reputationScore: number;
    trustLevel: string;
    verificationLevel: number;
    vouchesReceived: number;
  };
}

export default function ReputationProfiles() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    bio: "",
    specialties: [] as string[],
    publicRoles: [] as string[],
    isPublic: true,
    portfolioItems: {},
    socialLinks: {},
    availabilityStatus: "available",
    hourlyRate: "",
    preferredPaymentMethods: [] as string[]
  });

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["/api/reputation-profiles", { search: searchQuery, specialty: filterSpecialty }],
  });

  const { data: myProfile } = useQuery({
    queryKey: ["/api/reputation-profiles/my"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/reputation-profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/reputation-profiles"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to update profile", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({
      ...profileForm,
      hourlyRate: profileForm.hourlyRate ? parseInt(profileForm.hourlyRate) * 100 : null // Convert to cents
    });
  };

  const getTrustLevelColor = (level: string) => {
    const colors = {
      bronze: "bg-amber-100 text-amber-800",
      silver: "bg-gray-100 text-gray-800", 
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-purple-100 text-purple-800"
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getAvailabilityColor = (status: string) => {
    const colors = {
      available: "bg-green-100 text-green-800",
      busy: "bg-yellow-100 text-yellow-800",
      unavailable: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const ProfileCard = ({ profile }: { profile: ReputationProfile }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile.user?.profileImageUrl} />
              <AvatarFallback>
                {profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="flex items-center gap-2">
                {profile.displayName}
                {profile.reputation && profile.reputation.verificationLevel >= 3 && (
                  <Shield className="w-4 h-4 text-blue-500" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getTrustLevelColor(profile.reputation?.trustLevel || "bronze")}>
                  {profile.reputation?.trustLevel || "bronze"}
                </Badge>
                <Badge variant="outline" className={getAvailabilityColor(profile.availabilityStatus)}>
                  {profile.availabilityStatus}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-yellow-500" />
              {parseFloat(profile.averageRating).toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              {profile.projectsCompleted} projects
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {profile.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">{profile.bio}</p>
        )}

        {profile.specialties.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Specialties</div>
            <div className="flex flex-wrap gap-1">
              {profile.specialties.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.publicRoles.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Roles</div>
            <div className="flex flex-wrap gap-1">
              {profile.publicRoles.map((role, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {profile.hourlyRate && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                ${(profile.hourlyRate / 100).toFixed(0)}/hr
              </div>
            )}
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              {profile.reputation?.reputationScore || 100}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {profile.socialLinks?.github && (
              <Github className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            )}
            {profile.socialLinks?.twitter && (
              <Twitter className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            )}
            {profile.socialLinks?.website && (
              <Globe className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
            )}
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last active {new Date(profile.lastActiveAt).toLocaleDateString()}</span>
            <span>Member since {new Date(profile.user?.createdAt || '').toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ProfileEditForm = () => (
    <Card>
      <CardHeader>
        <CardTitle>Edit Your Public Profile</CardTitle>
        <CardDescription>
          Customize how you appear to other community members
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={profileForm.displayName}
            onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
            placeholder="How you want to be known"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={profileForm.bio}
            onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell others about yourself, your experience, and what you do"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialties">Specialties (comma-separated)</Label>
          <Input
            id="specialties"
            value={profileForm.specialties.join(", ")}
            onChange={(e) => setProfileForm(prev => ({ 
              ...prev, 
              specialties: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
            }))}
            placeholder="e.g., Discord Bots, Server Setup, Moderation, Plugin Development"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="roles">Public Roles (comma-separated)</Label>
          <Input
            id="roles"
            value={profileForm.publicRoles.join(", ")}
            onChange={(e) => setProfileForm(prev => ({ 
              ...prev, 
              publicRoles: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
            }))}
            placeholder="e.g., Developer, Server Owner, Designer, Community Manager"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={profileForm.hourlyRate}
              onChange={(e) => setProfileForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
              placeholder="Your hourly rate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability Status</Label>
            <Select 
              value={profileForm.availabilityStatus} 
              onValueChange={(value) => setProfileForm(prev => ({ ...prev, availabilityStatus: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available for Work</SelectItem>
                <SelectItem value="busy">Busy - Limited Availability</SelectItem>
                <SelectItem value="unavailable">Not Available</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <Label>Social Links</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={(profileForm.socialLinks as any)?.github || ""}
                onChange={(e) => setProfileForm(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, github: e.target.value }
                }))}
                placeholder="GitHub username or URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={(profileForm.socialLinks as any)?.website || ""}
                onChange={(e) => setProfileForm(prev => ({ 
                  ...prev, 
                  socialLinks: { ...prev.socialLinks, website: e.target.value }
                }))}
                placeholder="Your website URL"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="isPublic"
            checked={profileForm.isPublic}
            onCheckedChange={(checked) => setProfileForm(prev => ({ ...prev, isPublic: checked }))}
          />
          <Label htmlFor="isPublic">Make profile public</Label>
        </div>

        <Button 
          onClick={handleUpdateProfile}
          disabled={updateProfileMutation.isPending}
          className="w-full"
        >
          {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Community Profiles</h1>
          <p className="text-muted-foreground">
            Discover trusted community members and showcase your own expertise
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="browse">Browse Profiles</TabsTrigger>
            <TabsTrigger value="my-profile">My Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by name, specialty, or role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={filterSpecialty} onValueChange={setFilterSpecialty}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Specialties</SelectItem>
                        <SelectItem value="discord-bots">Discord Bots</SelectItem>
                        <SelectItem value="server-setup">Server Setup</SelectItem>
                        <SelectItem value="moderation">Moderation</SelectItem>
                        <SelectItem value="plugin-development">Plugin Development</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="community-management">Community Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {isLoading ? (
                <div className="text-center py-8">Loading profiles...</div>
              ) : !profiles || profiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No profiles found matching your criteria
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {profiles.map((profile: ReputationProfile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="my-profile">
            <ProfileEditForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}