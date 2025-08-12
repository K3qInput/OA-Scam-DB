import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Zap, Code, Handshake, Server, Star, Clock, Users } from "lucide-react";

interface AiToolCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  targetRole: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

interface AiTool {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  instructions: string;
  inputFields: Record<string, any>;
  outputFormat: string;
  requiredRole: string;
  usageCount: number;
  rating: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const iconMap: Record<string, any> = {
  handshake: Handshake,
  code: Code,
  cube: Server,
  server: Server,
  zap: Zap,
};

export default function AiToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTool, setSelectedTool] = useState<AiTool | null>(null);
  const [isToolDialogOpen, setIsToolDialogOpen] = useState(false);
  const [toolInputs, setToolInputs] = useState<Record<string, any>>({});
  const [toolResult, setToolResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<AiToolCategory[]>({
    queryKey: ["/api/ai-tools/categories"],
  });

  const { data: tools = [] } = useQuery<AiTool[]>({
    queryKey: ["/api/ai-tools", selectedCategory],
    enabled: !!selectedCategory,
  });

  const useToolMutation = useMutation({
    mutationFn: async ({ toolId, inputData }: { toolId: string; inputData: any }) => {
      const response = await apiRequest("POST", `/api/ai-tools/${toolId}/use`, { inputData });
      return response.json();
    },
    onSuccess: (data: any) => {
      setToolResult(data.outputData || data);
      setIsProcessing(false);
      toast({
        title: "AI Tool Complete",
        description: "Your request has been processed successfully.",
      });
    },
    onError: (error) => {
      setIsProcessing(false);
      toast({
        title: "Processing Failed",
        description: "There was an error processing your request.",
        variant: "destructive",
      });
    },
  });

  const handleToolUse = async () => {
    if (!selectedTool) return;
    
    setIsProcessing(true);
    setToolResult(null);
    
    useToolMutation.mutate({
      toolId: selectedTool.id,
      inputData: toolInputs,
    });
  };

  const renderInputField = (fieldName: string, fieldConfig: any) => {
    const value = toolInputs[fieldName] || "";
    
    const updateInput = (newValue: string) => {
      setToolInputs(prev => ({ ...prev, [fieldName]: newValue }));
    };

    switch (fieldConfig.type) {
      case "text":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>{fieldConfig.label}</Label>
            <Input
              id={fieldName}
              data-testid={`input-${fieldName}`}
              value={value}
              onChange={(e) => updateInput(e.target.value)}
              placeholder={fieldConfig.placeholder || ""}
              required={fieldConfig.required}
            />
          </div>
        );
      
      case "textarea":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>{fieldConfig.label}</Label>
            <Textarea
              id={fieldName}
              data-testid={`textarea-${fieldName}`}
              value={value}
              onChange={(e) => updateInput(e.target.value)}
              placeholder={fieldConfig.placeholder || ""}
              required={fieldConfig.required}
              rows={4}
            />
          </div>
        );
      
      case "select":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>{fieldConfig.label}</Label>
            <Select value={value} onValueChange={updateInput}>
              <SelectTrigger data-testid={`select-${fieldName}`}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {fieldConfig.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      
      case "number":
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>{fieldConfig.label}</Label>
            <Input
              id={fieldName}
              data-testid={`input-${fieldName}`}
              type="number"
              value={value}
              onChange={(e) => updateInput(e.target.value)}
              placeholder={fieldConfig.placeholder || ""}
              required={fieldConfig.required}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderToolResult = () => {
    if (!toolResult) return null;

    return (
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-semibold">Results</h3>
        
        {/* Deal Generator Results */}
        {toolResult.dealDocument && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Generated Agreement</h4>
              <pre className="whitespace-pre-wrap text-sm font-mono bg-background p-4 rounded border">
                {toolResult.dealDocument}
              </pre>
            </div>
            
            {toolResult.recommendedActions && (
              <div className="space-y-2">
                <h4 className="font-medium">Recommended Actions</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {toolResult.recommendedActions.map((action: string, index: number) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Code Analyzer Results */}
        {typeof toolResult.securityScore === 'number' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold text-green-600">
                {toolResult.securityScore}/100
              </div>
              <div>
                <div className="font-medium">Security Score</div>
                <div className="text-sm text-muted-foreground">Overall code security rating</div>
              </div>
            </div>

            {toolResult.vulnerabilities && toolResult.vulnerabilities.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Vulnerabilities Found</h4>
                {toolResult.vulnerabilities.map((vuln: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={vuln.severity === 'high' ? 'destructive' : vuln.severity === 'medium' ? 'default' : 'secondary'}>
                        {vuln.severity}
                      </Badge>
                      <span className="font-medium">{vuln.type}</span>
                      <span className="text-sm text-muted-foreground">Line {vuln.line}</span>
                    </div>
                    <p className="text-sm mb-2">{vuln.description}</p>
                    <p className="text-sm text-blue-600">💡 {vuln.recommendation}</p>
                  </div>
                ))}
              </div>
            )}

            {toolResult.bestPractices && (
              <div className="space-y-2">
                <h4 className="font-medium text-green-600">✅ Good Practices</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {toolResult.bestPractices.map((practice: string, index: number) => (
                    <li key={index}>{practice}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Generic Results */}
        {toolResult.result && !toolResult.dealDocument && typeof toolResult.securityScore !== 'number' && (
          <div className="bg-muted p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(toolResult, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  };

  // Mock categories and tools for demonstration
  const mockCategories = [
    {
      id: "contract-generation",
      name: "Contract & Deals",
      description: "AI-powered contract generation and deal analysis tools",
      icon: "handshake",
      targetRole: "all",
      isActive: true,
      sortOrder: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: "code-analysis",
      name: "Code Analysis",
      description: "Advanced code security and quality analysis tools",
      icon: "code",
      targetRole: "developer",
      isActive: true,
      sortOrder: 2,
      createdAt: new Date().toISOString()
    },
    {
      id: "resource-finder",
      name: "Resource Finder",
      description: "Find the perfect tools and resources for your projects",
      icon: "zap",
      targetRole: "all",
      isActive: true,
      sortOrder: 3,
      createdAt: new Date().toISOString()
    }
  ];

  const mockTools = [
    {
      id: "contract-generator",
      categoryId: "contract-generation",
      name: "AI Contract Generator",
      description: "Create fair and comprehensive contracts for freelance work",
      instructions: "Provide project details and requirements to generate a custom contract",
      inputFields: {
        projectType: {
          type: "select",
          label: "Project Type",
          options: ["Web Development", "Mobile App", "Design", "Content Writing", "Marketing"],
          required: true
        },
        budget: {
          type: "number",
          label: "Budget ($)",
          placeholder: "Enter project budget",
          required: true
        },
        timeline: {
          type: "text",
          label: "Timeline",
          placeholder: "e.g. 4 weeks",
          required: true
        },
        requirements: {
          type: "textarea",
          label: "Project Requirements",
          placeholder: "Describe the project requirements in detail...",
          required: true
        }
      },
      outputFormat: "contract_document",
      requiredRole: "user",
      usageCount: 1247,
      rating: 4.8,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: "scam-detector",
      categoryId: "contract-generation",
      name: "Scam Detection Analyzer",
      description: "Analyze conversations and offers for potential scam indicators",
      instructions: "Paste conversation logs or offer details for analysis",
      inputFields: {
        content: {
          type: "textarea",
          label: "Content to Analyze",
          placeholder: "Paste the conversation or offer details here...",
          required: true
        },
        contentType: {
          type: "select",
          label: "Content Type",
          options: ["Chat Conversation", "Email", "Job Offer", "Other"],
          required: true
        }
      },
      outputFormat: "analysis_report",
      requiredRole: "user",
      usageCount: 892,
      rating: 4.9,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const displayCategories = categories.length > 0 ? categories : mockCategories;
  const displayTools = tools.length > 0 ? tools : mockTools.filter(tool => tool.categoryId === selectedCategory);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">AI Tools Suite</h1>
        <p className="text-slate-400">
          Powerful AI-driven tools to help with contracts, security analysis, and resource discovery.
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          {displayCategories.map((category: any) => {
            const IconComponent = iconMap[category.icon] || Zap;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="flex items-center gap-2 data-[state=active]:bg-slate-700"
              >
                <IconComponent className="h-4 w-4" />
                {category.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {displayCategories.map((category: any) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-white">{category.name}</h2>
              <p className="text-slate-400">{category.description}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayTools.map((tool: any) => (
                <Card key={tool.id} className="bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-600 transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white">{tool.name}</CardTitle>
                      {tool.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-slate-300">{tool.rating}</span>
                        </div>
                      )}
                    </div>
                    <CardDescription className="text-slate-400">{tool.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {tool.usageCount} uses
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Quick results
                      </div>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        setSelectedTool(tool);
                        setIsToolDialogOpen(true);
                        setToolInputs({});
                        setToolResult(null);
                      }}
                    >
                      Use Tool
                    </Button>
                  </CardContent>
                </Card>
              ))}

              {displayTools.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-400">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tools available in this category yet.</p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}

        {/* Tool Usage Dialog */}
        <Dialog open={isToolDialogOpen} onOpenChange={setIsToolDialogOpen}>
          <DialogContent className="sm:max-w-2xl bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">{selectedTool?.name}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedTool?.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Input Fields */}
              <div className="space-y-4">
                {selectedTool && Object.entries(selectedTool.inputFields).map(([fieldName, fieldConfig]) =>
                  renderInputField(fieldName, fieldConfig as any)
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleToolUse}
                  disabled={isProcessing || !selectedTool}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessing ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setIsToolDialogOpen(false)}>
                  Cancel
                </Button>
              </div>

              {/* Results */}
              {renderToolResult()}
            </div>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
}