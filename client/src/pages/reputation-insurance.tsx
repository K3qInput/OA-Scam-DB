
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield, DollarSign, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/auth-utils';

interface InsurancePolicy {
  id: string;
  userId: string;
  coverageAmount: number;
  premium: number;
  trustScoreThreshold: number;
  status: 'active' | 'expired' | 'claimed';
  createdAt: string;
  expiresAt: string;
  claims: InsuranceClaim[];
}

interface InsuranceClaim {
  id: string;
  policyId: string;
  reason: string;
  evidenceUrls: string[];
  status: 'pending' | 'approved' | 'denied';
  payoutAmount?: number;
  createdAt: string;
}

export default function ReputationInsurance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(null);
  const [newClaimData, setNewClaimData] = useState({
    reason: '',
    evidence: '',
  });

  const { data: policies, isLoading } = useQuery({
    queryKey: ['/api/insurance/policies'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/insurance/policies');
      return response.json();
    },
  });

  const purchasePolicyMutation = useMutation({
    mutationFn: async (policyData: any) => {
      const response = await apiRequest('POST', '/api/insurance/policies', policyData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Policy Purchased",
        description: "Your reputation insurance policy is now active.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/policies'] });
    },
  });

  const submitClaimMutation = useMutation({
    mutationFn: async (claimData: any) => {
      const response = await apiRequest('POST', '/api/insurance/claims', claimData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Claim Submitted",
        description: "Your insurance claim has been submitted for review.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/insurance/policies'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'claimed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Reputation Insurance</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insurance Plans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Available Plans
            </CardTitle>
            <CardDescription>
              Protect your trust score against false reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Basic Protection</h3>
              <p className="text-sm text-muted-foreground">Coverage up to 50 trust points</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-bold">$10/month</span>
                <Button 
                  size="sm"
                  onClick={() => purchasePolicyMutation.mutate({
                    coverageAmount: 50,
                    premium: 10,
                    trustScoreThreshold: 70
                  })}
                >
                  Purchase
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Premium Protection</h3>
              <p className="text-sm text-muted-foreground">Coverage up to 100 trust points</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-bold">$25/month</span>
                <Button 
                  size="sm"
                  onClick={() => purchasePolicyMutation.mutate({
                    coverageAmount: 100,
                    premium: 25,
                    trustScoreThreshold: 60
                  })}
                >
                  Purchase
                </Button>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold">Elite Protection</h3>
              <p className="text-sm text-muted-foreground">Full trust score restoration</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-bold">$50/month</span>
                <Button 
                  size="sm"
                  onClick={() => purchasePolicyMutation.mutate({
                    coverageAmount: 200,
                    premium: 50,
                    trustScoreThreshold: 50
                  })}
                >
                  Purchase
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div>Loading...</div>
            ) : policies?.length > 0 ? (
              <div className="space-y-3">
                {policies.map((policy: InsurancePolicy) => (
                  <div 
                    key={policy.id}
                    className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                    onClick={() => setSelectedPolicy(policy)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">${policy.coverageAmount} Coverage</div>
                        <div className="text-sm text-muted-foreground">
                          ${policy.premium}/month
                        </div>
                      </div>
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Expires: {new Date(policy.expiresAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No active policies
              </div>
            )}
          </CardContent>
        </Card>

        {/* Claim Submission */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Submit Claim
            </CardTitle>
            <CardDescription>
              File a claim for false reputation damage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason for Claim</Label>
              <Textarea
                id="reason"
                placeholder="Describe the false report or reputation damage..."
                value={newClaimData.reason}
                onChange={(e) => setNewClaimData({ ...newClaimData, reason: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="evidence">Evidence URLs</Label>
              <Textarea
                id="evidence"
                placeholder="Provide links to evidence supporting your claim..."
                value={newClaimData.evidence}
                onChange={(e) => setNewClaimData({ ...newClaimData, evidence: e.target.value })}
              />
            </div>

            <Button
              onClick={() => {
                if (selectedPolicy) {
                  submitClaimMutation.mutate({
                    policyId: selectedPolicy.id,
                    reason: newClaimData.reason,
                    evidenceUrls: newClaimData.evidence.split('\n').filter(url => url.trim()),
                  });
                  setNewClaimData({ reason: '', evidence: '' });
                } else {
                  toast({
                    title: "No Policy Selected",
                    description: "Please select an active policy first.",
                    variant: "destructive",
                  });
                }
              }}
              disabled={!selectedPolicy || !newClaimData.reason}
              className="w-full"
            >
              Submit Claim
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Policy Details */}
      {selectedPolicy && (
        <Card>
          <CardHeader>
            <CardTitle>Policy Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Coverage Amount</Label>
                <div className="font-semibold">${selectedPolicy.coverageAmount}</div>
              </div>
              <div>
                <Label>Monthly Premium</Label>
                <div className="font-semibold">${selectedPolicy.premium}</div>
              </div>
              <div>
                <Label>Trust Score Threshold</Label>
                <div className="font-semibold">{selectedPolicy.trustScoreThreshold}%</div>
              </div>
              <div>
                <Label>Status</Label>
                <Badge className={getStatusColor(selectedPolicy.status)}>
                  {selectedPolicy.status}
                </Badge>
              </div>
            </div>

            {selectedPolicy.claims.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-3">Claims History</h3>
                <div className="space-y-2">
                  {selectedPolicy.claims.map((claim) => (
                    <div key={claim.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{claim.reason}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(claim.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status}
                        </Badge>
                      </div>
                      {claim.payoutAmount && (
                        <div className="text-sm font-medium text-green-600 mt-1">
                          Payout: ${claim.payoutAmount}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
