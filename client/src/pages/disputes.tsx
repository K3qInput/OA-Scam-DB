import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Vote, Clock, Users, CheckCircle, XCircle, Minus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DisputeResolution {
  id: string;
  caseId: string;
  title: string;
  description: string;
  proposedResolution: string;
  proposedBy: string;
  isPublic: boolean;
  votingStartDate: string;
  votingEndDate: string;
  minimumVotes: number;
  status: string;
  finalDecision?: string;
  implementation?: string;
  votes: DisputeVote[];
}

interface DisputeVote {
  id: string;
  disputeId: string;
  voterHash: string;
  choice: "approve" | "reject" | "abstain";
  reason?: string;
  weight: number;
  createdAt: string;
}

export default function DisputesPage() {
  const [selectedDispute, setSelectedDispute] = useState<string>("");
  const [voteForm, setVoteForm] = useState({
    choice: "approve" as "approve" | "reject" | "abstain",
    reason: "",
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user to check permissions
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Get active disputes
  const { data: disputes = [], isLoading: disputesLoading } = useQuery({
    queryKey: ["/api/disputes/active"],
    queryFn: () => apiRequest("/api/disputes/active"),
  });

  // Vote on dispute mutation
  const voteOnDisputeMutation = useMutation({
    mutationFn: async ({ disputeId, voteData }: { disputeId: string; voteData: any }) => {
      return apiRequest(`/api/disputes/${disputeId}/vote`, {
        method: "POST",
        body: JSON.stringify(voteData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Vote Recorded",
        description: "Your anonymous vote has been recorded successfully",
      });
      setVoteForm({
        choice: "approve",
        reason: "",
      });
      setSelectedDispute("");
      queryClient.invalidateQueries({ queryKey: ["/api/disputes/active"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmitVote = () => {
    if (!selectedDispute) {
      toast({
        title: "Validation Error",
        description: "Please select a dispute to vote on",
        variant: "destructive",
      });
      return;
    }

    voteOnDisputeMutation.mutate({
      disputeId: selectedDispute,
      voteData: voteForm,
    });
  };

  const calculateVoteStats = (votes: DisputeVote[]) => {
    const totalWeight = votes.reduce((sum, vote) => sum + vote.weight, 0);
    const approveWeight = votes.filter(v => v.choice === "approve").reduce((sum, vote) => sum + vote.weight, 0);
    const rejectWeight = votes.filter(v => v.choice === "reject").reduce((sum, vote) => sum + vote.weight, 0);
    const abstainWeight = votes.filter(v => v.choice === "abstain").reduce((sum, vote) => sum + vote.weight, 0);

    return {
      total: votes.length,
      totalWeight,
      approve: {
        count: votes.filter(v => v.choice === "approve").length,
        weight: approveWeight,
        percentage: totalWeight > 0 ? (approveWeight / totalWeight) * 100 : 0,
      },
      reject: {
        count: votes.filter(v => v.choice === "reject").length,
        weight: rejectWeight,
        percentage: totalWeight > 0 ? (rejectWeight / totalWeight) * 100 : 0,
      },
      abstain: {
        count: votes.filter(v => v.choice === "abstain").length,
        weight: abstainWeight,
        percentage: totalWeight > 0 ? (abstainWeight / totalWeight) * 100 : 0,
      },
    };
  };

  const isVotingActive = (dispute: DisputeResolution) => {
    const now = new Date();
    const endDate = new Date(dispute.votingEndDate);
    return now < endDate && dispute.status === "active";
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Voting ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const selectedDisputeData = disputes.find((d: DisputeResolution) => d.id === selectedDispute);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Vote className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Public Dispute Resolutions</h1>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Participate in anonymous voting on public dispute resolutions. Your vote is weighted based on your reputation level.
          All votes are completely anonymous to protect voter privacy.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Disputes List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Active Disputes</h2>
          
          {disputesLoading ? (
            <div>Loading disputes...</div>
          ) : disputes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Vote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No active disputes at the moment</p>
              </CardContent>
            </Card>
          ) : (
            disputes.map((dispute: DisputeResolution) => {
              const stats = calculateVoteStats(dispute.votes);
              const votingActive = isVotingActive(dispute);
              
              return (
                <Card 
                  key={dispute.id} 
                  className={`cursor-pointer transition-all ${
                    selectedDispute === dispute.id ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedDispute(dispute.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{dispute.title}</CardTitle>
                        <CardDescription>Case ID: {dispute.caseId}</CardDescription>
                      </div>
                      <div className="text-right">
                        <Badge variant={votingActive ? "default" : "secondary"}>
                          {votingActive ? "Active" : "Ended"}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {getTimeRemaining(dispute.votingEndDate)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{dispute.description}</p>
                    
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg mb-4">
                      <h4 className="font-medium mb-2">Proposed Resolution:</h4>
                      <p className="text-sm">{dispute.proposedResolution}</p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {stats.total} votes ({stats.totalWeight} weight)
                        </span>
                        <span>Min: {dispute.minimumVotes} votes</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            Approve ({stats.approve.count})
                          </span>
                          <span>{stats.approve.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={stats.approve.percentage} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            Reject ({stats.reject.count})
                          </span>
                          <span>{stats.reject.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={stats.reject.percentage} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-1 text-gray-600">
                            <Minus className="h-4 w-4" />
                            Abstain ({stats.abstain.count})
                          </span>
                          <span>{stats.abstain.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={stats.abstain.percentage} className="h-2" />
                      </div>
                    </div>

                    {dispute.finalDecision && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <h4 className="font-medium mb-1">Final Decision:</h4>
                        <p className="text-sm">{dispute.finalDecision}</p>
                        {dispute.implementation && (
                          <div className="mt-2">
                            <h4 className="font-medium mb-1">Implementation:</h4>
                            <p className="text-sm">{dispute.implementation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Voting Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Cast Your Vote</CardTitle>
              <CardDescription>
                Your vote is anonymous and weighted by your reputation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedDispute ? (
                <div className="text-center py-8 text-gray-500">
                  <Vote className="h-12 w-12 mx-auto mb-4" />
                  <p>Select a dispute to vote on</p>
                </div>
              ) : !isVotingActive(selectedDisputeData!) ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4" />
                  <p>Voting has ended for this dispute</p>
                </div>
              ) : (
                <>
                  <div>
                    <Label>Your Vote</Label>
                    <RadioGroup
                      value={voteForm.choice}
                      onValueChange={(value: "approve" | "reject" | "abstain") =>
                        setVoteForm({ ...voteForm, choice: value })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="approve" id="approve" />
                        <Label htmlFor="approve" className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          Approve Resolution
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="reject" id="reject" />
                        <Label htmlFor="reject" className="flex items-center gap-2 text-red-600">
                          <XCircle className="h-4 w-4" />
                          Reject Resolution
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="abstain" id="abstain" />
                        <Label htmlFor="abstain" className="flex items-center gap-2 text-gray-600">
                          <Minus className="h-4 w-4" />
                          Abstain
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="voteReason">Reason (Optional)</Label>
                    <Textarea
                      id="voteReason"
                      placeholder="Explain your vote reasoning (optional)..."
                      value={voteForm.reason}
                      onChange={(e) => setVoteForm({ ...voteForm, reason: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <AlertCircle className="h-4 w-4" />
                      <span className="font-medium">Anonymous Voting</span>
                    </div>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Your identity will be completely anonymous. Only your vote choice and reasoning will be recorded.
                    </p>
                  </div>

                  {currentUser?.reputation && (
                    <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                      <div className="text-sm">
                        <strong>Your Vote Weight:</strong> {
                          currentUser.reputation.trustLevel === "platinum" ? "3x" :
                          currentUser.reputation.trustLevel === "gold" ? "2x" : "1x"
                        }
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Based on your {currentUser.reputation.trustLevel} trust level
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmitVote}
                    disabled={voteOnDisputeMutation.isPending}
                    className="w-full"
                  >
                    {voteOnDisputeMutation.isPending ? "Submitting..." : "Submit Anonymous Vote"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}