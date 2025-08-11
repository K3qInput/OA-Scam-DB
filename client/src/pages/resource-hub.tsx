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
import { useToast } from "@/hooks/use-toast";
import { Star, ExternalLink, BookOpen, Server, Code, Zap, Shield, Plus, Search } from "lucide-react";

interface ResourceItem {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  type: string;
  url: string;
  price?: string;
  rating: string;
  reviewCount: number;
  tags: string[];
  verifiedBy?: string;
  isSponsored: boolean;
  isTrusted: boolean;
  addedBy: string;
  lastChecked?: string;
  metadata?: any;
  createdAt: string;
  category?: {
    name: string;
    targetAudience: string;
  };
}

interface ResourceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  targetAudience: string;
  sortOrder: number;
  isActive: boolean;
}

export default function ResourceHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [resourceForm, setResourceForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    type: "plugin",
    url: "",
    price: "",
    tags: [] as string[]
  });

  const { data: resources, isLoading } = useQuery({
    queryKey: ["/api/resources", { search: searchQuery, category: filterCategory, type: filterType }],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/resource-categories"],
  });

  const addResourceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("Failed to add resource");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Resource added successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/resources"] });
      setResourceForm({
        categoryId: "",
        title: "",
        description: "",
        type: "plugin",
        url: "",
        price: "",
        tags: []
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to add resource", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleAddResource = () => {
    if (!resourceForm.title || !resourceForm.description || !resourceForm.url || !resourceForm.categoryId) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    addResourceMutation.mutate(resourceForm);
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      plugin: <Zap className="w-4 h-4" />,
      script: <Code className="w-4 h-4" />,
      hosting: <Server className="w-4 h-4" />,
      service: <Shield className="w-4 h-4" />,
      tutorial: <BookOpen className="w-4 h-4" />,
      tool: <Star className="w-4 h-4" />
    };
    return icons[type as keyof typeof icons] || <Star className="w-4 h-4" />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      plugin: "bg-purple-100 text-purple-800",
      script: "bg-blue-100 text-blue-800",
      hosting: "bg-green-100 text-green-800",
      service: "bg-orange-100 text-orange-800",
      tutorial: "bg-yellow-100 text-yellow-800",
      tool: "bg-gray-100 text-gray-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const ResourceCard = ({ resource }: { resource: ResourceItem }) => {
    const rating = parseFloat(resource.rating);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(resource.type)}
                {resource.title}
                {resource.isSponsored && (
                  <Badge className="bg-yellow-100 text-yellow-800">Sponsored</Badge>
                )}
                {resource.isTrusted && (
                  <Badge className="bg-green-100 text-green-800">Trusted</Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getTypeColor(resource.type)}>
                  {resource.type}
                </Badge>
                {resource.price && (
                  <Badge variant="outline">
                    {resource.price}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">
                  ({resource.reviewCount})
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm">{resource.description}</p>

          {resource.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {resource.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {resource.metadata && (
            <div className="text-xs text-muted-foreground">
              {resource.metadata.version && (
                <div>Version: {resource.metadata.version}</div>
              )}
              {resource.metadata.compatibility && (
                <div>Compatible with: {resource.metadata.compatibility}</div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-xs text-muted-foreground">
              {resource.category?.name} • Added by {resource.addedBy}
              {resource.verifiedBy && (
                <div className="text-green-600">Verified by {resource.verifiedBy}</div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.open(resource.url, '_blank')}
                className="flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AddResourceForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Submit Resource
        </CardTitle>
        <CardDescription>
          Share helpful tools, plugins, and services with the community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category *</Label>
          <Select 
            value={resourceForm.categoryId} 
            onValueChange={(value) => setResourceForm(prev => ({ ...prev, categoryId: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category: ResourceCategory) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={resourceForm.title}
            onChange={(e) => setResourceForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Name of the plugin, tool, or service"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={resourceForm.description}
            onChange={(e) => setResourceForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="What does this resource do? Why is it useful?"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select 
              value={resourceForm.type} 
              onValueChange={(value) => setResourceForm(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plugin">Plugin</SelectItem>
                <SelectItem value="script">Script</SelectItem>
                <SelectItem value="hosting">Hosting Service</SelectItem>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="tutorial">Tutorial</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              value={resourceForm.price}
              onChange={(e) => setResourceForm(prev => ({ ...prev, price: e.target.value }))}
              placeholder="Free, $5/month, One-time $20, etc."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">URL *</Label>
          <Input
            id="url"
            type="url"
            value={resourceForm.url}
            onChange={(e) => setResourceForm(prev => ({ ...prev, url: e.target.value }))}
            placeholder="https://example.com/resource"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={resourceForm.tags.join(", ")}
            onChange={(e) => setResourceForm(prev => ({ 
              ...prev, 
              tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
            }))}
            placeholder="minecraft, discord, bot, economy"
          />
        </div>

        <Button 
          onClick={handleAddResource}
          disabled={addResourceMutation.isPending}
          className="w-full"
        >
          {addResourceMutation.isPending ? "Submitting..." : "Submit Resource"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Resource Hub</h1>
          <p className="text-muted-foreground">
            Curated collection of trusted tools, plugins, and services for server owners and developers
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="browse">Browse Resources</TabsTrigger>
            <TabsTrigger value="submit">Submit Resource</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        className="pl-10"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories?.map((category: ResourceCategory) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="plugin">Plugin</SelectItem>
                        <SelectItem value="script">Script</SelectItem>
                        <SelectItem value="hosting">Hosting</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="tool">Tool</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {isLoading ? (
                <div className="text-center py-8">Loading resources...</div>
              ) : !resources || resources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No resources found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource: ResourceItem) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="submit">
            <AddResourceForm />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}