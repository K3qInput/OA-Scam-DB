import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ThumbsUp, ThumbsDown, Shield, AlertTriangle, User } from "lucide-react";

const vouchSchema = z.object({
  targetUserId: z.string().min(1, "User ID is required"),
  type: z.enum(["vouch", "devouch"]),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  evidence: z.string().optional(),
  weight: z.number().min(1).max(5).default(1),
  isAnonymous: z.boolean().default(false),
});

type VouchFormData = z.infer<typeof vouchSchema>;

export default function VouchSystem() {
  const [activeTab, setActiveTab] = useState("give-vouch");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<VouchFormData>({
    resolver: zodResolver(vouchSchema),
    defaultValues: {
      type: "vouch",
      weight: 1,
      isAnonymous: false,
    },
  });

  // Get user vouches
  const { data: userVouches, isLoading: vouchesLoading } = useQuery({
    queryKey: ["/api/vouches/user"],
  });

  // Get recent vouches
  const { data: recentVouches, isLoading: recentLoading } = useQuery({
    queryKey: ["/api/vouches/recent"],
  });

  // Create vouch mutation
  const createVouchMutation = useMutation({
    mutationFn: async (data: VouchFormData) => {
      const response = await apiRequest("POST", "/api/vouches", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Vouch submitted successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/vouches"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit vouch",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VouchFormData) => {
    createVouchMutation.mutate(data);
  };

  return (
    <div className="flex h-screen bg-oa-black">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Vouch System</h1>
            <p className="text-oa-gray">Vouch for trusted users or report suspicious behavior</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-oa-dark border border-oa-border">
              <TabsTrigger 
                value="give-vouch" 
                className="text-oa-gray data-[state=active]:text-oa-green data-[state=active]:bg-oa-green/10"
                data-testid="tab-give-vouch"
              >
                Give Vouch
              </TabsTrigger>
              <TabsTrigger 
                value="give-devouch" 
                className="text-oa-gray data-[state=active]:text-red-400 data-[state=active]:bg-red-400/10"
                data-testid="tab-give-devouch"
              >
                Give Devouch
              </TabsTrigger>
              <TabsTrigger 
                value="my-vouches" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-my-vouches"
              >
                My Vouches
              </TabsTrigger>
              <TabsTrigger 
                value="recent" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-recent"
              >
                Recent Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="give-vouch" className="space-y-6">
              <Card className="bg-oa-dark border-oa-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-oa-green" />
                    Give Vouch
                  </CardTitle>
                  <CardDescription className="text-oa-gray">
                    Vouch for a user you trust and have had positive experiences with
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <input type="hidden" {...field} value="vouch" />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="targetUserId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">User ID or Username</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter user ID or username"
                                className="bg-oa-black border-oa-border text-white"
                                data-testid="input-target-user"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Vouch Weight</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger className="bg-oa-black border-oa-border text-white" data-testid="select-weight">
                                  <SelectValue placeholder="Select weight" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-oa-dark border-oa-border">
                                <SelectItem value="1">1 - Weak</SelectItem>
                                <SelectItem value="2">2 - Light</SelectItem>
                                <SelectItem value="3">3 - Medium</SelectItem>
                                <SelectItem value="4">4 - Strong</SelectItem>
                                <SelectItem value="5">5 - Very Strong</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Reason</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Explain why you're vouching for this user..."
                                className="bg-oa-black border-oa-border text-white"
                                rows={4}
                                data-testid="textarea-reason"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="evidence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Evidence (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Any links, transaction IDs, or additional evidence..."
                                className="bg-oa-black border-oa-border text-white"
                                rows={3}
                                data-testid="textarea-evidence"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-oa-green hover:bg-oa-green/80 text-black"
                        disabled={createVouchMutation.isPending}
                        data-testid="button-submit-vouch"
                      >
                        {createVouchMutation.isPending ? "Submitting..." : "Submit Vouch"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="give-devouch" className="space-y-6">
              <Card className="bg-oa-dark border-oa-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5 text-red-400" />
                    Give Devouch
                  </CardTitle>
                  <CardDescription className="text-oa-gray">
                    Report suspicious or untrustworthy behavior
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => onSubmit({...data, type: "devouch"}))} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="targetUserId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">User ID or Username</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter user ID or username"
                                className="bg-oa-black border-oa-border text-white"
                                data-testid="input-devouch-target-user"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Severity</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger className="bg-oa-black border-oa-border text-white" data-testid="select-devouch-weight">
                                  <SelectValue placeholder="Select severity" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-oa-dark border-oa-border">
                                <SelectItem value="1">1 - Minor Issue</SelectItem>
                                <SelectItem value="2">2 - Concerning</SelectItem>
                                <SelectItem value="3">3 - Problematic</SelectItem>
                                <SelectItem value="4">4 - Serious</SelectItem>
                                <SelectItem value="5">5 - Very Serious</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Reason</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Explain the issue with this user..."
                                className="bg-oa-black border-oa-border text-white"
                                rows={4}
                                data-testid="textarea-devouch-reason"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="evidence"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Evidence</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Provide evidence (screenshots, links, transaction IDs, etc.)"
                                className="bg-oa-black border-oa-border text-white"
                                rows={3}
                                data-testid="textarea-devouch-evidence"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        disabled={createVouchMutation.isPending}
                        data-testid="button-submit-devouch"
                      >
                        {createVouchMutation.isPending ? "Submitting..." : "Submit Devouch"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="my-vouches" className="space-y-6">
              <div className="grid gap-4">
                {vouchesLoading ? (
                  <div className="text-oa-gray">Loading your vouches...</div>
                ) : (userVouches as any[])?.length > 0 ? (
                  (userVouches as any[]).map((vouch: any) => (
                    <Card key={vouch.id} className="bg-oa-dark border-oa-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${vouch.type === 'vouch' ? 'bg-oa-green/20' : 'bg-red-400/20'}`}>
                              {vouch.type === 'vouch' ? 
                                <ThumbsUp className="h-4 w-4 text-oa-green" /> : 
                                <ThumbsDown className="h-4 w-4 text-red-400" />
                              }
                            </div>
                            <div>
                              <div className="text-white font-medium">
                                {vouch.type === 'vouch' ? 'Vouched for' : 'Devouched'} {vouch.targetUserId}
                              </div>
                              <div className="text-oa-gray text-sm">{vouch.reason}</div>
                            </div>
                          </div>
                          <Badge variant={vouch.type === 'vouch' ? 'default' : 'destructive'}>
                            Weight: {vouch.weight}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-oa-gray text-center py-8">No vouches yet</div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <div className="grid gap-4">
                {recentLoading ? (
                  <div className="text-oa-gray">Loading recent activity...</div>
                ) : (recentVouches as any[])?.length > 0 ? (
                  (recentVouches as any[]).map((vouch: any) => (
                    <Card key={vouch.id} className="bg-oa-dark border-oa-border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-oa-black text-white">
                                {vouch.isAnonymous ? '?' : vouch.fromUserId.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-white font-medium">
                                {vouch.isAnonymous ? 'Anonymous' : vouch.fromUserId} {vouch.type === 'vouch' ? 'vouched for' : 'devouched'} {vouch.targetUserId}
                              </div>
                              <div className="text-oa-gray text-sm">
                                {new Date(vouch.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={vouch.type === 'vouch' ? 'default' : 'destructive'}>
                              {vouch.type}
                            </Badge>
                            <Badge variant="outline" className="text-oa-gray">
                              {vouch.weight}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-oa-gray text-center py-8">No recent activity</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}