import { useState, useEffect } from "react";
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
import { AlertCircle, ThumbsUp, ThumbsDown, Shield, User, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  profileImageUrl?: string;
}

interface Vouch {
  id: string;
  targetUserId: string;
  voucherUserId: string;
  status: "vouched" | "devouched";
  reason: string;
  evidence?: string;
  weight: number;
  isAnonymous: boolean;
  createdAt: string;
  voucherUser: User;
}

interface UserReputation {
  id: string;
  userId: string;
  reputationScore: number;
  vouchesReceived: number;
  devouchesReceived: number;
  trustLevel: string;
  communityScore: number;
}

export default function VouchesPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [vouchForm, setVouchForm] = useState({
    status: "vouched" as "vouched" | "devouched",
    reason: "",
    evidence: "",
    isAnonymous: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user to check permissions
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Search users
  const { data: users = [] } = useQuery({
    queryKey: ["/api/users", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const response = await apiRequest(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      return response;
    },
    enabled: searchQuery.length >= 2,
  });

  // Get vouches for selected user
  const { data: vouches = [], isLoading: vouchesLoading } = useQuery({
    queryKey: ["/api/vouches", selectedUserId],
    queryFn: () => apiRequest(`/api/vouches/${selectedUserId}`),
    enabled: !!selectedUserId,
  });

  // Get reputation for selected user
  const { data: reputation } = useQuery({
    queryKey: ["/api/reputation", selectedUserId],
    queryFn: () => apiRequest(`/api/reputation/${selectedUserId}`),
    enabled: !!selectedUserId,
  });

  // Create vouch mutation
  const createVouchMutation = useMutation({
    mutationFn: async (vouchData: any) => {
      return apiRequest("/api/vouches", {
        method: "POST",
        body: JSON.stringify(vouchData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `${vouchForm.status === "vouched" ? "Vouch" : "Devouch"} submitted successfully`,
      });
      setVouchForm({
        status: "vouched",
        reason: "",
        evidence: "",
        isAnonymous: false,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vouches", selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ["/api/reputation", selectedUserId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitVouch = () => {
    if (!selectedUserId || !vouchForm.reason.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select a user and provide a reason",
        variant: "destructive",
      });
      return;
    }

    if (selectedUserId === currentUser?.id) {
      toast({
        title: "Error",
        description: "You cannot vouch for yourself",
        variant: "destructive",
      });
      return;
    }

    createVouchMutation.mutate({
      targetUserId: selectedUserId,
      ...vouchForm,
    });
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case "platinum": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "gold": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "silver": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "bronze": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const selectedUser = users.find((u: User) => u.id === selectedUserId);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Community Vouching System</h1>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          The vouch/devouch system allows community members to build trust through peer verification. 
          Each user can only vote once per target user. Your reputation affects your vote weight.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vouch/Devouch Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Submit Vouch/Devouch
            </CardTitle>
            <CardDescription>
              Search for a user and submit your vouch or devouch with reasoning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="userSearch">Search User</Label>
              <Input
                id="userSearch"
                placeholder="Search by username or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {users.length > 0 && (
                <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
                  {users.map((user: User) => (
                    <div
                      key={user.id}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer flex items-center gap-2"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setSearchQuery(`${user.firstName} ${user.lastName} (@${user.username})`);
                      }}
                    >
                      {user.profileImageUrl && (
                        <img
                          src={user.profileImageUrl}
                          alt={user.username}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-gray-500">@{user.username} ({user.role})</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  {selectedUser.profileImageUrl && (
                    <img
                      src={selectedUser.profileImageUrl}
                      alt={selectedUser.username}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-medium">{selectedUser.firstName} {selectedUser.lastName}</div>
                    <div className="text-sm text-gray-500">@{selectedUser.username}</div>
                  </div>
                  <Badge variant="outline">{selectedUser.role}</Badge>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="vouchType">Vouch Type</Label>
              <Select
                value={vouchForm.status}
                onValueChange={(value: "vouched" | "devouched") => 
                  setVouchForm({ ...vouchForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vouched">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-green-600" />
                      Vouch (Positive)
                    </div>
                  </SelectItem>
                  <SelectItem value="devouched">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      Devouch (Negative)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Reason (Required)</Label>
              <Textarea
                id="reason"
                placeholder="Explain why you are vouching or devouching this user..."
                value={vouchForm.reason}
                onChange={(e) => setVouchForm({ ...vouchForm, reason: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="evidence">Supporting Evidence (Optional)</Label>
              <Textarea
                id="evidence"
                placeholder="Provide links, transaction IDs, or other evidence..."
                value={vouchForm.evidence}
                onChange={(e) => setVouchForm({ ...vouchForm, evidence: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={vouchForm.isAnonymous}
                onChange={(e) => setVouchForm({ ...vouchForm, isAnonymous: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="anonymous">Submit anonymously</Label>
            </div>

            <Button
              onClick={handleSubmitVouch}
              disabled={!selectedUserId || !vouchForm.reason.trim() || createVouchMutation.isPending}
              className="w-full"
            >
              {createVouchMutation.isPending ? "Submitting..." : 
               `Submit ${vouchForm.status === "vouched" ? "Vouch" : "Devouch"}`}
            </Button>
          </CardContent>
        </Card>

        {/* User Reputation & Vouches */}
        {selectedUserId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                User Reputation & Vouches
              </CardTitle>
              <CardDescription>
                Community feedback and reputation for {selectedUser?.firstName} {selectedUser?.lastName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {reputation && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold">{reputation.reputationScore}</div>
                      <div className="text-sm text-gray-600">Reputation Score</div>
                    </div>
                    <div>
                      <Badge className={getTrustLevelColor(reputation.trustLevel)}>
                        {reputation.trustLevel.toUpperCase()}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-1">Trust Level</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">{reputation.vouchesReceived}</div>
                      <div className="text-sm text-gray-600">Vouches</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-red-600">{reputation.devouchesReceived}</div>
                      <div className="text-sm text-gray-600">Devouches</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-3">Recent Vouches & Devouches</h3>
                {vouchesLoading ? (
                  <div>Loading vouches...</div>
                ) : vouches.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">
                    No vouches or devouches yet
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {vouches.map((vouch: Vouch) => (
                      <div key={vouch.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {vouch.status === "vouched" ? (
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <ThumbsDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className="font-medium">
                              {vouch.isAnonymous ? "Anonymous" : 
                               `${vouch.voucherUser.firstName} ${vouch.voucherUser.lastName}`}
                            </span>
                            <Badge variant="outline">Weight: {vouch.weight}</Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(vouch.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mb-2">{vouch.reason}</p>
                        {vouch.evidence && (
                          <div className="text-xs text-gray-600 bg-gray-50 dark:bg-gray-900 p-2 rounded">
                            <strong>Evidence:</strong> {vouch.evidence}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}