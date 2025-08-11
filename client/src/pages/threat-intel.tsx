import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Search, 
  Filter, 
  Plus,
  ExternalLink,
  MapPin,
  Calendar,
  Activity,
  Database,
  Target,
  Globe
} from "lucide-react";

export default function ThreatIntel() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock threat intelligence data
  const threatStats = {
    totalThreats: 1247,
    activeCampaigns: 23,
    blockedIPs: 892,
    suspiciousTransactions: 156
  };

  const threatFeeds = [
    {
      id: "1",
      source: "OwnersAlliance Intel",
      type: "Fraud Campaign",
      threat: "Discord Investment Scam",
      severity: "High",
      confidence: 85,
      firstSeen: "2025-08-10",
      lastSeen: "2025-08-11",
      indicators: ["discord.gg/fakeinvest", "fake-investment-bot", "192.168.1.100"],
      description: "Coordinated campaign targeting cryptocurrency investors through Discord servers"
    },
    {
      id: "2",
      source: "Community Reports",
      type: "Phishing",
      threat: "Fake Support Pages",
      severity: "Medium",
      confidence: 72,
      firstSeen: "2025-08-09",
      lastSeen: "2025-08-11",
      indicators: ["support-metamask.com", "wallet-recovery.net"],
      description: "Fake support websites collecting wallet recovery phrases"
    },
    {
      id: "3",
      source: "Partner Intelligence",
      type: "Account Takeover",
      threat: "Credential Stuffing",
      severity: "High",
      confidence: 90,
      firstSeen: "2025-08-08",
      lastSeen: "2025-08-11",
      indicators: ["185.220.101.42", "tor-exit-node"],
      description: "Automated login attempts using leaked credentials"
    }
  ];

  const indicators = [
    { type: "IP Address", value: "192.168.1.100", threat: "Discord Scam Campaign", confidence: 85 },
    { type: "Domain", value: "support-metamask.com", threat: "Phishing Site", confidence: 92 },
    { type: "URL", value: "discord.gg/fakeinvest", threat: "Investment Scam", confidence: 88 },
    { type: "Hash", value: "d41d8cd98f00b204e9800998ecf8427e", threat: "Malicious Script", confidence: 75 }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "bg-red-500";
      case "high": return "bg-orange-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-400";
    if (confidence >= 70) return "text-yellow-400";
    return "text-orange-400";
  };

  return (
    <div className="flex h-screen bg-oa-dark">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-oa-dark">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Threat Intelligence</h1>
              <p className="text-slate-400">Monitor and analyze security threats across the OwnersAlliance network</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-oa-gray border-oa-gray">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">Total Threats</p>
                      <p className="text-2xl font-bold text-white">{threatStats.totalThreats.toLocaleString()}</p>
                    </div>
                    <Shield className="h-8 w-8 text-oa-orange" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-oa-gray border-oa-gray">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">Active Campaigns</p>
                      <p className="text-2xl font-bold text-white">{threatStats.activeCampaigns}</p>
                    </div>
                    <Activity className="h-8 w-8 text-red-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-oa-gray border-oa-gray">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">Blocked IPs</p>
                      <p className="text-2xl font-bold text-white">{threatStats.blockedIPs.toLocaleString()}</p>
                    </div>
                    <Target className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-oa-gray border-oa-gray">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-400">Suspicious Activity</p>
                      <p className="text-2xl font-bold text-white">{threatStats.suspiciousTransactions}</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-oa-gray border-oa-gray">
                <TabsTrigger value="overview" className="data-[state=active]:bg-oa-orange data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="feeds" className="data-[state=active]:bg-oa-orange data-[state=active]:text-white">
                  Threat Feeds
                </TabsTrigger>
                <TabsTrigger value="indicators" className="data-[state=active]:bg-oa-orange data-[state=active]:text-white">
                  IoCs
                </TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-oa-orange data-[state=active]:text-white">
                  Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-oa-gray border-oa-gray">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-oa-orange" />
                        Threat Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Discord Scams</span>
                          <div className="flex items-center gap-2">
                            <Progress value={75} className="w-20" />
                            <span className="text-sm text-slate-400">+15%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Phishing Sites</span>
                          <div className="flex items-center gap-2">
                            <Progress value={60} className="w-20" />
                            <span className="text-sm text-slate-400">+8%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">Fake Exchanges</span>
                          <div className="flex items-center gap-2">
                            <Progress value={45} className="w-20" />
                            <span className="text-sm text-slate-400">-3%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-oa-gray border-oa-gray">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Globe className="h-5 w-5 text-oa-orange" />
                        Geographic Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">🇺🇸 United States</span>
                          <span className="text-white font-medium">342</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">🇷🇺 Russia</span>
                          <span className="text-white font-medium">198</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">🇨🇳 China</span>
                          <span className="text-white font-medium">156</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-300">🇳🇬 Nigeria</span>
                          <span className="text-white font-medium">123</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="feeds" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search threats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-oa-gray border-oa-gray text-white placeholder-slate-400"
                      />
                    </div>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48 bg-oa-gray border-oa-gray text-white">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent className="bg-oa-gray border-oa-gray">
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="fraud">Fraud Campaign</SelectItem>
                        <SelectItem value="phishing">Phishing</SelectItem>
                        <SelectItem value="malware">Malware</SelectItem>
                        <SelectItem value="account">Account Takeover</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="bg-oa-orange hover:bg-oa-orange/80 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Intelligence
                  </Button>
                </div>

                <div className="space-y-4">
                  {threatFeeds.map((threat) => (
                    <Card key={threat.id} className="bg-oa-gray border-oa-gray">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-white">{threat.threat}</h3>
                              <Badge className={`${getSeverityColor(threat.severity)} text-white`}>
                                {threat.severity}
                              </Badge>
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                {threat.type}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm mb-3">{threat.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-slate-400">Source:</span>
                                <p className="text-white">{threat.source}</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Confidence:</span>
                                <p className={`font-semibold ${getConfidenceColor(threat.confidence)}`}>
                                  {threat.confidence}%
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-400">First Seen:</span>
                                <p className="text-white">{threat.firstSeen}</p>
                              </div>
                              <div>
                                <span className="text-slate-400">Last Seen:</span>
                                <p className="text-white">{threat.lastSeen}</p>
                              </div>
                            </div>

                            <div className="mt-4">
                              <span className="text-slate-400 text-sm">Indicators:</span>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {threat.indicators.map((indicator, index) => (
                                  <Badge key={index} variant="outline" className="border-slate-600 text-slate-300 font-mono text-xs">
                                    {indicator}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="indicators" className="space-y-6">
                <Card className="bg-oa-gray border-oa-gray">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Database className="h-5 w-5 text-oa-orange" />
                      Indicators of Compromise (IoCs)
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Track and analyze threat indicators across the network
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-300">Type</TableHead>
                          <TableHead className="text-slate-300">Indicator</TableHead>
                          <TableHead className="text-slate-300">Associated Threat</TableHead>
                          <TableHead className="text-slate-300">Confidence</TableHead>
                          <TableHead className="text-slate-300">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {indicators.map((indicator, index) => (
                          <TableRow key={index} className="border-slate-700">
                            <TableCell>
                              <Badge variant="outline" className="border-slate-600 text-slate-300">
                                {indicator.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-slate-300">{indicator.value}</TableCell>
                            <TableCell className="text-slate-300">{indicator.threat}</TableCell>
                            <TableCell>
                              <span className={`font-semibold ${getConfidenceColor(indicator.confidence)}`}>
                                {indicator.confidence}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                  Block
                                </Button>
                                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                                  Monitor
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <Card className="bg-oa-gray border-oa-gray">
                  <CardHeader>
                    <CardTitle className="text-white">Threat Analysis</CardTitle>
                    <CardDescription className="text-slate-400">
                      Analyze suspicious URLs, IPs, and files for potential threats
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Indicator to Analyze
                        </label>
                        <Input
                          placeholder="Enter URL, IP, domain, or hash..."
                          className="bg-oa-dark border-slate-600 text-white placeholder-slate-400"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">
                          Analysis Type
                        </label>
                        <Select>
                          <SelectTrigger className="bg-oa-dark border-slate-600 text-white">
                            <SelectValue placeholder="Select analysis type" />
                          </SelectTrigger>
                          <SelectContent className="bg-oa-gray border-oa-gray">
                            <SelectItem value="url">URL Analysis</SelectItem>
                            <SelectItem value="ip">IP Reputation</SelectItem>
                            <SelectItem value="domain">Domain Analysis</SelectItem>
                            <SelectItem value="hash">File Hash</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-slate-300 mb-2 block">
                        Additional Context (Optional)
                      </label>
                      <Textarea
                        placeholder="Provide additional context about the indicator..."
                        className="bg-oa-dark border-slate-600 text-white placeholder-slate-400"
                        rows={3}
                      />
                    </div>

                    <Button className="bg-oa-orange hover:bg-oa-orange/80 text-white">
                      <Search className="h-4 w-4 mr-2" />
                      Analyze Threat
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}