
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Building, Server, Globe, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/auth-utils';

interface OwnershipClaim {
  id: string;
  userId: string;
  type: 'server' | 'company' | 'brand' | 'domain';
  name: string;
  description: string;
  verificationMethod: string;
  proofUrls: string[];
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  verifiedAt?: string;
  badge?: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

export default function ProofOfOwnership() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClaim, setSelectedClaim] = useState<OwnershipClaim | null>(null);
  const [newClaimData, setNewClaimData] = useState({
    type: 'server' as const,
    name: '',
    description: '',
    verificationMethod: '',
    proofUrls: '',
  });

  const { data: claims, isLoading } = useQuery({
    queryKey: ['/api/ownership/claims'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/ownership/claims');
      return response.json();
    },
  });

  const { data: verifiedBadges } = useQuery({
    queryKey: ['/api/ownership/badges'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/ownership/badges');
      return response.json();
    },
  });

  const submitClaimMutation = useMutation({
    mutationFn: async (claimData: any) => {
      const response = await apiRequest('POST', '/api/ownership/claims', claimData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Claim Submitted",
        description: "Your ownership claim has been submitted for verification.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ownership/claims'] });
      setNewClaimData({
        type: 'server',
        name: '',
        description: '',
        verificationMethod: '',
        proofUrls: '',
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'server': return <Server className="h-4 w-4" />;
      case 'company': return <Building className="h-4 w-4" />;
      case 'brand': return <Shield className="h-4 w-4" />;
      case 'domain': return <Globe className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const verificationMethods = {
    server: [
      'Discord bot admin permissions',
      'Server settings screenshot',
      'Webhook verification',
      'Audit log evidence'
    ],
    company: [
      'Business registration documents',
      'Official website control',
      'LinkedIn company page admin',
      'Domain ownership verification'
    ],
    brand: [
      'Trademark registration',
      'Official social media accounts',
      'Website domain ownership',
      'Legal documentation'
    ],
    domain: [
      'DNS TXT record',
      'HTML meta tag verification',
      'File upload verification',
      'WHOIS information'
    ]
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Proof of Ownership</h1>
      </div>

      <Tabs defaultValue="submit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="submit">Submit Claim</TabsTrigger>
          <TabsTrigger value="claims">My Claims</TabsTrigger>
          <TabsTrigger value="badges">Verified Badges</TabsTrigger>
        </TabsList>

        {/* Submit New Claim */}
        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle>Submit Ownership Claim</CardTitle>
              <CardDescription>
                Verify your ownership of servers, companies, brands, or domains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Ownership Type</Label>
                <select
                  value={newClaimData.type}
                  onChange={(e) => setNewClaimData({ 
                    ...newClaimData, 
                    type: e.target.value as any,
                    verificationMethod: '' 
                  })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                >
                  <option value="server">Discord Server</option>
                  <option value="company">Company/Business</option>
                  <option value="brand">Brand/Trademark</option>
                  <option value="domain">Domain/Website</option>
                </select>
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder={`Enter ${newClaimData.type} name...`}
                  value={newClaimData.name}
                  onChange={(e) => setNewClaimData({ ...newClaimData, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about what you're claiming ownership of..."
                  value={newClaimData.description}
                  onChange={(e) => setNewClaimData({ ...newClaimData, description: e.target.value })}
                />
              </div>

              <div>
                <Label>Verification Method</Label>
                <select
                  value={newClaimData.verificationMethod}
                  onChange={(e) => setNewClaimData({ ...newClaimData, verificationMethod: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                >
                  <option value="">Select verification method...</option>
                  {verificationMethods[newClaimData.type].map(method => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="proofUrls">Proof URLs</Label>
                <Textarea
                  id="proofUrls"
                  placeholder="Enter URLs to screenshots, documents, or other proof (one per line)..."
                  value={newClaimData.proofUrls}
                  onChange={(e) => setNewClaimData({ ...newClaimData, proofUrls: e.target.value })}
                />
              </div>

              <Button
                onClick={() => {
                  submitClaimMutation.mutate({
                    ...newClaimData,
                    proofUrls: newClaimData.proofUrls.split('\n').filter(url => url.trim()),
                  });
                }}
                disabled={!newClaimData.name || !newClaimData.verificationMethod}
                className="w-full"
              >
                Submit Claim
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Claims */}
        <TabsContent value="claims">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Claims History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div>Loading...</div>
                ) : claims?.length > 0 ? (
                  <div className="space-y-3">
                    {claims.map((claim: OwnershipClaim) => (
                      <div 
                        key={claim.id}
                        className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setSelectedClaim(claim)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(claim.type)}
                            <div>
                              <div className="font-medium">{claim.name}</div>
                              <div className="text-sm text-muted-foreground capitalize">
                                {claim.type}
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
                            {claim.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {claim.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                            {claim.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">
                          Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No claims submitted yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Claim Details */}
            {selectedClaim && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getTypeIcon(selectedClaim.type)}
                    Claim Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <div className="font-medium">{selectedClaim.name}</div>
                  </div>

                  <div>
                    <Label>Type</Label>
                    <div className="capitalize">{selectedClaim.type}</div>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusColor(selectedClaim.status)}>
                      {selectedClaim.status}
                    </Badge>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <div className="text-sm">{selectedClaim.description}</div>
                  </div>

                  <div>
                    <Label>Verification Method</Label>
                    <div className="text-sm">{selectedClaim.verificationMethod}</div>
                  </div>

                  {selectedClaim.proofUrls.length > 0 && (
                    <div>
                      <Label>Proof URLs</Label>
                      <div className="space-y-1">
                        {selectedClaim.proofUrls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm block truncate"
                          >
                            {url}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedClaim.verifiedAt && (
                    <div>
                      <Label>Verified Date</Label>
                      <div className="text-sm">
                        {new Date(selectedClaim.verifiedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Verified Badges */}
        <TabsContent value="badges">
          <Card>
            <CardHeader>
              <CardTitle>Your Verified Badges</CardTitle>
              <CardDescription>
                Display your verified ownership badges on your profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verifiedBadges?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {verifiedBadges.map((badge: any) => (
                    <div key={badge.id} className="border rounded-lg p-4 text-center">
                      <img
                        src={badge.imageUrl}
                        alt={badge.name}
                        className="w-16 h-16 mx-auto mb-2"
                      />
                      <div className="font-medium text-sm">{badge.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Verified {new Date(badge.verifiedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  No verified badges yet. Submit ownership claims to earn badges.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
