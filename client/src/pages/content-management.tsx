import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { 
  FileText, Edit, Trash2, Eye, EyeOff, Plus, Search, 
  Filter, MoreVertical, Globe, Lock, Users, Star,
  MessageSquare, Image, Video, File, Archive,
  Calendar, Tag, TrendingUp, Award, Bookmark
} from "lucide-react";

const contentSchema = z.object({
  type: z.enum(["announcement", "guide", "policy", "news", "tutorial", "faq"]),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  summary: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  tags: z.string().optional(),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  publishDate: z.string().optional(),
  expiryDate: z.string().optional(),
});

type ContentData = z.infer<typeof contentSchema>;

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ContentData>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      type: "announcement",
      title: "",
      content: "",
      summary: "",
      category: "",
      tags: "",
      isPublic: true,
      isFeatured: false,
      isPinned: false,
      allowComments: true,
    },
  });

  const { data: contents = [] } = useQuery({
    queryKey: ["/api/content"],
    initialData: [],
  });

  const { data: contentStats } = useQuery({
    queryKey: ["/api/content/stats"],
    initialData: {
      totalContent: 0,
      published: 0,
      draft: 0,
      featured: 0,
      totalViews: 0,
      totalComments: 0,
    },
  });

  const createContentMutation = useMutation({
    mutationFn: (data: ContentData) => apiRequest("POST", "/api/content", data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create content",
        variant: "destructive",
      });
    },
  });

  const toggleContentStatus = useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) => 
      apiRequest("PATCH", `/api/content/${id}`, { isPublic }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content status updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/content/${id}`),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Content deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/content"] });
    },
  });

  const onSubmit = (data: ContentData) => {
    createContentMutation.mutate(data);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "announcement":
        return <Badge className="bg-blue-600 hover:bg-blue-700"><MessageSquare className="h-3 w-3 mr-1" />Announcement</Badge>;
      case "guide":
        return <Badge className="bg-green-600 hover:bg-green-700"><FileText className="h-3 w-3 mr-1" />Guide</Badge>;
      case "policy":
        return <Badge className="bg-purple-600 hover:bg-purple-700"><Lock className="h-3 w-3 mr-1" />Policy</Badge>;
      case "news":
        return <Badge className="bg-orange-600 hover:bg-orange-700"><TrendingUp className="h-3 w-3 mr-1" />News</Badge>;
      case "tutorial":
        return <Badge className="bg-yellow-600 hover:bg-yellow-700"><Video className="h-3 w-3 mr-1" />Tutorial</Badge>;
      case "faq":
        return <Badge className="bg-cyan-600 hover:bg-cyan-700"><MessageSquare className="h-3 w-3 mr-1" />FAQ</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 bg-oa-dark min-h-screen text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <FileText className="h-8 w-8 text-oa-red" />
            Content Management
          </h1>
          <p className="text-oa-gray mt-2">Create, edit, and manage all website content</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-oa-red hover:bg-oa-red/80">
              <Plus className="h-4 w-4 mr-2" />
              Create Content
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-oa-dark border-oa-border text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Create New Content
              </DialogTitle>
              <DialogDescription className="text-oa-gray">
                Create announcements, guides, policies, and more
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Content Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-oa-light border-oa-border text-white">
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-oa-dark border-oa-border">
                            <SelectItem value="announcement" className="text-white hover:bg-oa-light">Announcement</SelectItem>
                            <SelectItem value="guide" className="text-white hover:bg-oa-light">Guide</SelectItem>
                            <SelectItem value="policy" className="text-white hover:bg-oa-light">Policy</SelectItem>
                            <SelectItem value="news" className="text-white hover:bg-oa-light">News</SelectItem>
                            <SelectItem value="tutorial" className="text-white hover:bg-oa-light">Tutorial</SelectItem>
                            <SelectItem value="faq" className="text-white hover:bg-oa-light">FAQ</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Category</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., General, Security, Updates"
                            className="bg-oa-light border-oa-border text-white placeholder:text-oa-gray"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter content title..."
                          className="bg-oa-light border-oa-border text-white placeholder:text-oa-gray"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Summary (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief summary of the content..."
                          className="bg-oa-light border-oa-border text-white placeholder:text-oa-gray"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Content</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your content here... (Supports markdown)"
                          className="bg-oa-light border-oa-border text-white placeholder:text-oa-gray min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tags (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="tag1, tag2, tag3"
                          className="bg-oa-light border-oa-border text-white placeholder:text-oa-gray"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="publishDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Publish Date (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="bg-oa-light border-oa-border text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Expiry Date (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="datetime-local"
                            className="bg-oa-light border-oa-border text-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="isPublic"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="bg-oa-light border-oa-border"
                          />
                        </FormControl>
                        <FormLabel className="text-white">Public</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="bg-oa-light border-oa-border"
                          />
                        </FormControl>
                        <FormLabel className="text-white">Featured</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isPinned"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="bg-oa-light border-oa-border"
                          />
                        </FormControl>
                        <FormLabel className="text-white">Pinned</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="allowComments"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="bg-oa-light border-oa-border"
                          />
                        </FormControl>
                        <FormLabel className="text-white">Allow Comments</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-oa-red hover:bg-oa-red/80"
                  disabled={createContentMutation.isPending}
                >
                  {createContentMutation.isPending ? "Creating..." : "Create Content"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Total Content</p>
                <p className="text-2xl font-bold text-white">{contentStats.totalContent}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Published</p>
                <p className="text-2xl font-bold text-green-400">{contentStats.published}</p>
              </div>
              <Globe className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Drafts</p>
                <p className="text-2xl font-bold text-yellow-400">{contentStats.draft}</p>
              </div>
              <Edit className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Featured</p>
                <p className="text-2xl font-bold text-purple-400">{contentStats.featured}</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Total Views</p>
                <p className="text-2xl font-bold text-cyan-400">{contentStats.totalViews}</p>
              </div>
              <Eye className="h-8 w-8 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-oa-light border-oa-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-oa-gray">Comments</p>
                <p className="text-2xl font-bold text-orange-400">{contentStats.totalComments}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content List */}
      <Card className="bg-oa-light border-oa-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Content Library
          </CardTitle>
          <CardDescription className="text-oa-gray">
            Manage all your content from one central location
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {contents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-oa-gray mx-auto mb-4" />
                <p className="text-oa-gray">No content created yet</p>
              </div>
            ) : (
              contents.map((content: any) => (
                <div key={content.id} className="flex items-center justify-between p-4 bg-oa-dark rounded-lg border border-oa-border">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeBadge(content.type)}
                        {content.isFeatured && <Badge className="bg-yellow-600"><Star className="h-3 w-3 mr-1" />Featured</Badge>}
                        {content.isPinned && <Badge className="bg-cyan-600"><Bookmark className="h-3 w-3 mr-1" />Pinned</Badge>}
                        {!content.isPublic && <Badge variant="secondary"><EyeOff className="h-3 w-3 mr-1" />Draft</Badge>}
                      </div>
                      <p className="text-white font-medium">{content.title}</p>
                      <p className="text-sm text-oa-gray">
                        Category: {content.category} • Views: {content.views || 0} • Comments: {content.comments || 0}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleContentStatus.mutate({ id: content.id, isPublic: !content.isPublic })}
                      className="border-oa-border text-white hover:bg-oa-light"
                    >
                      {content.isPublic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline" className="border-oa-border text-white hover:bg-oa-light">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteContentMutation.mutate(content.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}