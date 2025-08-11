import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, Ban, Search, Copy, ExternalLink, Tag, AlertTriangle } from "lucide-react";

interface BlacklistEntry {
  id: string;
  entryType: string;
  entryValue: string;
  reason: string;
  severity: string;
  evidence?: any;
  addedBy: string;
  approvedBy?: string;
  isActive: boolean;
  expiresAt?: string;
  tags: string[];
  relatedCases: string[];
  notes?: string;
  createdAt: string;
  approvedAt?: string;
}

export default function BlacklistDatabase() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [entryForm, setEntryForm] = useState({
    entryType: "discord_id",
    entryValue: "",
    reason: "",
    severity: "high",
    evidence: {},
    tags: [] as string[],
    notes: ""
  });

  const { data: blacklistEntries, isLoading } = useQuery({
    queryKey: ["/api/blacklist", { search: searchQuery }],
  });

  const addEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/blacklist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("Failed to add blacklist entry");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Blacklist entry added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/blacklist"] });
      setEntryForm({
        entryType: "discord_id",
        entryValue: "",
        reason: "",
        severity: "high",
        evidence: {},
        tags: [],
        notes: ""
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to add blacklist entry", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleAddEntry = () => {
    if (!entryForm.entryValue || !entryForm.reason) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    addEntryMutation.mutate(entryForm);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800"
    };
    return colors[severity as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getEntryTypeDisplay = (type: string) => {
    const types = {
      user: "User Account",
      discord_id: "Discord ID",
      email: "Email Address",
      ip_address: "IP Address",
      domain: "Domain"
    };
    return types[type as keyof typeof types] || type;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const BlacklistCard = ({ entry }: { entry: BlacklistEntry }) => (
    <Card className="border-l-4 border-l-red-500">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-red-500" />
              {getEntryTypeDisplay(entry.entryType)}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getSeverityColor(entry.severity)}>
                {entry.severity} risk
              </Badge>
              {!entry.isActive && (
                <Badge variant="secondary">Inactive</Badge>
              )}
              {entry.expiresAt && new Date(entry.expiresAt) > new Date() && (
                <Badge variant="outline">Expires {new Date(entry.expiresAt).toLocaleDateString()}</Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">
              Added {new Date(entry.createdAt).toLocaleDateString()}
            </div>
            {entry.approvedBy && (
              <div className="text-xs text-green-600">
                Approved by {entry.approvedBy}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <code className="bg-muted px-2 py-1 rounded font-mono text-sm flex-1">
            {entry.entryValue}
          </code>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => copyToClipboard(entry.entryValue)}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>

        <div>
          <div className="text-sm font-medium mb-1">Reason:</div>
          <p className="text-sm">{entry.reason}</p>
        </div>

        {entry.notes && (
          <div>
            <div className="text-sm font-medium mb-1">Notes:</div>
            <p className="text-sm text-muted-foreground">{entry.notes}</p>
          </div>
        )}

        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {entry.relatedCases.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Related Cases:</div>
            <div className="flex flex-wrap gap-1">
              {entry.relatedCases.map((caseId, index) => (
                <Badge key={index} variant="outline" className="text-xs cursor-pointer">
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Case {caseId.slice(0, 8)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-2">
          Added by: {entry.addedBy}
        </div>
      </CardContent>
    </Card>
  );

  const AddEntryForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ban className="w-5 h-5" />
          Add Blacklist Entry
        </CardTitle>
        <CardDescription>
          Add confirmed bad actors to the shared blacklist database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Only add entries with strong evidence. False positives harm community trust.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entryType">Entry Type *</Label>
            <Select 
              value={entryForm.entryType} 
              onValueChange={(value) => setEntryForm(prev => ({ ...prev, entryType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="discord_id">Discord ID</SelectItem>
                <SelectItem value="email">Email Address</SelectItem>
                <SelectItem value="ip_address">IP Address</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
                <SelectItem value="user">User Account</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select 
              value={entryForm.severity} 
              onValueChange={(value) => setEntryForm(prev => ({ ...prev, severity: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="critical">Critical Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="entryValue">{getEntryTypeDisplay(entryForm.entryType)} *</Label>
          <Input
            id="entryValue"
            value={entryForm.entryValue}
            onChange={(e) => setEntryForm(prev => ({ ...prev, entryValue: e.target.value }))}
            placeholder={`Enter the ${entryForm.entryType.replace('_', ' ')} to blacklist`}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Blacklisting *</Label>
          <Textarea
            id="reason"
            value={entryForm.reason}
            onChange={(e) => setEntryForm(prev => ({ ...prev, reason: e.target.value }))}
            placeholder="Detailed explanation of why this entry should be blacklisted"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={entryForm.tags.join(", ")}
            onChange={(e) => setEntryForm(prev => ({ 
              ...prev, 
              tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
            }))}
            placeholder="scammer, fraud, phishing, bot"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={entryForm.notes}
            onChange={(e) => setEntryForm(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional context or evidence details"
            rows={2}
          />
        </div>

        <Button 
          onClick={handleAddEntry}
          disabled={addEntryMutation.isPending}
          className="w-full"
        >
          {addEntryMutation.isPending ? "Adding..." : "Add to Blacklist"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Blacklist Database</h1>
          <p className="text-muted-foreground">
            Shared database of confirmed bad actors across partnered communities
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="search">Search Blacklist</TabsTrigger>
            <TabsTrigger value="add">Add Entry</TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        placeholder="Search by Discord ID, email, IP address, or reason..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {isLoading ? (
                <div className="text-center py-8">Loading blacklist entries...</div>
              ) : !blacklistEntries || blacklistEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No blacklist entries found
                </div>
              ) : (
                <div className="space-y-4">
                  {blacklistEntries.map((entry: BlacklistEntry) => (
                    <BlacklistCard key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="add">
            <AddEntryForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}