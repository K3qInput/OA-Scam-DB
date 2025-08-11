import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, MessageCircle, Mail, Calendar, Award, TrendingUp, Users, Clock } from "lucide-react";

interface StaffProfile {
  id: string;
  userId: string;
  displayName: string;
  roleHistory?: any;
  specializations: string[];
  contactMethods?: any;
  bio?: string;
  joinedStaffAt: string;
  isActive: boolean;
  isPublicContact: boolean;
  caseLoad: number;
  successRate: string;
  commendations: number;
  user?: {
    username: string;
    role: string;
    profileImageUrl?: string;
  };
}

export default function StaffTransparency() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: staffProfiles, isLoading } = useQuery({
    queryKey: ["/api/staff-profiles", { search: searchQuery }],
  });

  const getRoleColor = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      tribunal_head: "bg-purple-100 text-purple-800",
      senior_staff: "bg-blue-100 text-blue-800",
      staff: "bg-green-100 text-green-800",
      moderator: "bg-yellow-100 text-yellow-800"
    };
    return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const StaffCard = ({ profile }: { profile: StaffProfile }) => {
    const successRate = parseFloat(profile.successRate);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={profile.user?.profileImageUrl} />
              <AvatarFallback>
                {profile.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{profile.displayName}</h3>
                {profile.isActive ? (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={getRoleColor(profile.user?.role || "staff")}>
                  {profile.user?.role?.replace('_', ' ').toUpperCase()}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  @{profile.user?.username}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile.joinedStaffAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {profile.caseLoad} active cases
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getSuccessRateColor(successRate)}`}>
                {successRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {profile.bio && (
            <p className="text-sm text-muted-foreground">{profile.bio}</p>
          )}

          {profile.specializations.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Specializations</div>
              <div className="flex flex-wrap gap-1">
                {profile.specializations.map((spec, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 py-2 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                <Award className="w-4 h-4 text-yellow-500" />
                {profile.commendations}
              </div>
              <div className="text-xs text-muted-foreground">Commendations</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                {successRate.toFixed(0)}%
              </div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-lg font-semibold">
                <Users className="w-4 h-4 text-green-500" />
                {profile.caseLoad}
              </div>
              <div className="text-xs text-muted-foreground">Active Cases</div>
            </div>
          </div>

          {profile.isPublicContact && profile.contactMethods && (
            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">Contact Methods</div>
              <div className="flex gap-2">
                {profile.contactMethods.discord && (
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    Discord
                  </Button>
                )}
                {profile.contactMethods.email && (
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </Button>
                )}
              </div>
              {profile.contactMethods.availability && (
                <div className="text-xs text-muted-foreground mt-2">
                  Available: {profile.contactMethods.availability}
                </div>
              )}
            </div>
          )}

          {profile.roleHistory && (
            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">Role History</div>
              <div className="space-y-1">
                {(profile.roleHistory as any[]).slice(0, 3).map((role, index) => (
                  <div key={index} className="text-xs flex items-center justify-between">
                    <span>{role.role.replace('_', ' ').toUpperCase()}</span>
                    <span className="text-muted-foreground">
                      {new Date(role.startDate).toLocaleDateString()} - 
                      {role.endDate ? new Date(role.endDate).toLocaleDateString() : 'Present'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Staff Transparency</h1>
          <p className="text-muted-foreground">
            Meet our team - transparent information about all staff members and their roles
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search staff by name, role, or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-8">Loading staff profiles...</div>
        ) : !staffProfiles || staffProfiles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No staff profiles found
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {staffProfiles.filter((p: StaffProfile) => p.isActive).map((profile: StaffProfile) => (
                <StaffCard key={profile.id} profile={profile} />
              ))}
            </div>

            {staffProfiles.some((p: StaffProfile) => !p.isActive) && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Former Staff</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {staffProfiles.filter((p: StaffProfile) => !p.isActive).map((profile: StaffProfile) => (
                    <StaffCard key={profile.id} profile={profile} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}