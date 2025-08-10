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

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/ai-tools/categories"],
  });

  const { data: tools = [] } = useQuery({
    queryKey: ["/api/ai-tools", selectedCategory],
    enabled: !!selectedCategory,
  });

  const useToolMutation = useMutation({
    mutationFn: async ({ toolId, inputData }: { toolId: string; inputData: any }) => {
      return apiRequest(`/api/ai-tools/${toolId}/use`, {
        method: "POST",
        body: { inputData },
      });
    },
    onSuccess: (data) => {
      setToolResult(data.outputData);
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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">AI Tools</h1>
        <p className="text-muted-foreground">
          Powerful AI-driven tools to help with deal generation, code analysis, and more.
        </p>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          {categories.map((category: AiToolCategory) => {
            const IconComponent = iconMap[category.icon] || Zap;
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                data-testid={`tab-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-2"
              >
                <IconComponent className="h-4 w-4" />
                {category.name}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category: AiToolCategory) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">{category.name}</h2>
              <p className="text-muted-foreground">{category.description}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool: AiTool) => (
                <Card key={tool.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                      {tool.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{tool.rating}</span>
                        </div>
                      )}
                    </div>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {tool.usageCount} uses
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {tool.outputFormat}
                      </div>
                    </div>

                    <Dialog open={isToolDialogOpen && selectedTool?.id === tool.id} onOpenChange={setIsToolDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full"
                          data-testid={`button-use-${tool.name.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => {
                            setSelectedTool(tool);
                            setToolInputs({});
                            setToolResult(null);
                            setIsToolDialogOpen(true);
                          }}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Use Tool
                        </Button>
                      </DialogTrigger>
                      
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{tool.name}</DialogTitle>
                          <DialogDescription>{tool.description}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Input Parameters</h3>
                            {Object.entries(tool.inputFields).map(([fieldName, fieldConfig]) =>
                              renderInputField(fieldName, fieldConfig)
                            )}
                          </div>

                          <div className="flex gap-4">
                            <Button
                              onClick={handleToolUse}
                              disabled={isProcessing}
                              data-testid="button-process-tool"
                              className="flex-1"
                            >
                              {isProcessing ? (
                                <>
                                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4 mr-2" />
                                  Process with AI
                                </>
                              )}
                            </Button>
                            
                            <Button
                              variant="outline"
                              onClick={() => setIsToolDialogOpen(false)}
                              data-testid="button-cancel"
                            >
                              Cancel
                            </Button>
                          </div>

                          {renderToolResult()}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              ))}
            </div>

            {tools.length === 0 && selectedCategory && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">No tools available in this category yet.</div>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {!selectedCategory && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">Select a category to view available AI tools.</div>
        </div>
      )}
    </div>
  );
}