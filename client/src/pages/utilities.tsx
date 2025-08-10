import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Plus, Star, Edit, FileText, FolderOpen, Award } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface UtilityCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface UtilityDocument {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  accessLevel: string;
  difficulty: string;
  estimatedReadTime?: number;
  rating?: number;
  ratingCount?: number;
  authorId: string;
  lastEditedBy?: string;
  version: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  category: UtilityCategory;
  author: any;
}

export default function UtilitiesPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<UtilityDocument | null>(null);
  const [editingDocument, setEditingDocument] = useState<UtilityDocument | null>(null);
  const [newDocumentForm, setNewDocumentForm] = useState({
    categoryId: "",
    title: "",
    content: "",
    summary: "",
    tags: "",
    accessLevel: "staff",
    difficulty: "beginner",
    estimatedReadTime: 5,
  });
  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    feedback: "",
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user to check permissions
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Check if user can create documents
  const canCreateDocs = currentUser?.role && ["admin", "tribunal_head", "senior_staff", "staff"].includes(currentUser.role);

  // Get utility categories
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/utility/categories"],
    queryFn: () => apiRequest("/api/utility/categories"),
  });

  // Get utility documents
  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/utility/documents", selectedCategoryId],
    queryFn: () => {
      const params = selectedCategoryId !== "all" ? `?categoryId=${selectedCategoryId}` : "";
      return apiRequest(`/api/utility/documents${params}`);
    },
  });

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (documentData: any) => {
      return apiRequest("/api/utility/documents", {
        method: "POST",
        body: JSON.stringify(documentData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document created successfully",
      });
      setNewDocumentForm({
        categoryId: "",
        title: "",
        content: "",
        summary: "",
        tags: "",
        accessLevel: "staff",
        difficulty: "beginner",
        estimatedReadTime: 5,
      });
      setShowCreateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/utility/documents"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return apiRequest(`/api/utility/documents/${id}`, {
        method: "PUT",
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Document updated successfully",
      });
      setEditingDocument(null);
      queryClient.invalidateQueries({ queryKey: ["/api/utility/documents"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Rate document mutation
  const rateDocumentMutation = useMutation({
    mutationFn: async ({ documentId, ratingData }: { documentId: string; ratingData: any }) => {
      return apiRequest(`/api/utility/documents/${documentId}/rate`, {
        method: "POST",
        body: JSON.stringify(ratingData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Rating submitted successfully",
      });
      setRatingForm({
        rating: 5,
        feedback: "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/utility/documents"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateDocument = () => {
    if (!newDocumentForm.title || !newDocumentForm.content || !newDocumentForm.categoryId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const tagsArray = newDocumentForm.tags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag);

    createDocumentMutation.mutate({
      ...newDocumentForm,
      tags: tagsArray,
      isPublished: true,
      version: 1,
    });
  };

  const handleUpdateDocument = () => {
    if (!editingDocument) return;

    updateDocumentMutation.mutate({
      id: editingDocument.id,
      updates: editingDocument,
    });
  };

  const handleRateDocument = (documentId: string) => {
    rateDocumentMutation.mutate({
      documentId,
      ratingData: ratingForm,
    });
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "all": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "staff": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "senior_staff": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "admin": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? "text-yellow-400 fill-current" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Knowledge Base & Utilities</h1>
        </div>
        {canCreateDocs && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>
                  Create a new guide, procedure, or training document
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newDocumentForm.categoryId}
                      onValueChange={(value) => setNewDocumentForm({ ...newDocumentForm, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category: UtilityCategory) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="accessLevel">Access Level</Label>
                    <Select
                      value={newDocumentForm.accessLevel}
                      onValueChange={(value) => setNewDocumentForm({ ...newDocumentForm, accessLevel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="staff">Staff Only</SelectItem>
                        <SelectItem value="senior_staff">Senior Staff</SelectItem>
                        <SelectItem value="admin">Admin Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newDocumentForm.title}
                    onChange={(e) => setNewDocumentForm({ ...newDocumentForm, title: e.target.value })}
                    placeholder="Document title"
                  />
                </div>
                <div>
                  <Label htmlFor="summary">Summary</Label>
                  <Textarea
                    id="summary"
                    value={newDocumentForm.summary}
                    onChange={(e) => setNewDocumentForm({ ...newDocumentForm, summary: e.target.value })}
                    placeholder="Brief summary of the document"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={newDocumentForm.content}
                    onChange={(e) => setNewDocumentForm({ ...newDocumentForm, content: e.target.value })}
                    placeholder="Document content (supports Markdown)"
                    rows={10}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={newDocumentForm.difficulty}
                      onValueChange={(value) => setNewDocumentForm({ ...newDocumentForm, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="readTime">Read Time (min)</Label>
                    <Input
                      id="readTime"
                      type="number"
                      min="1"
                      value={newDocumentForm.estimatedReadTime}
                      onChange={(e) => setNewDocumentForm({ ...newDocumentForm, estimatedReadTime: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newDocumentForm.tags}
                      onChange={(e) => setNewDocumentForm({ ...newDocumentForm, tags: e.target.value })}
                      placeholder="guide, training, procedure"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateDocument}
                    disabled={createDocumentMutation.isPending}
                  >
                    {createDocumentMutation.isPending ? "Creating..." : "Create Document"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Alert>
        <BookOpen className="h-4 w-4" />
        <AlertDescription>
          Access comprehensive guides, training materials, and documentation. 
          Staff can create and manage content for the knowledge base.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div
                className={`p-2 rounded cursor-pointer transition-colors ${
                  selectedCategoryId === "all" 
                    ? "bg-blue-100 dark:bg-blue-900" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                onClick={() => setSelectedCategoryId("all")}
              >
                <div className="font-medium">All Documents</div>
                <div className="text-sm text-gray-500">{documents.length} items</div>
              </div>
              {categories.map((category: UtilityCategory) => {
                const categoryDocs = documents.filter((doc: UtilityDocument) => doc.categoryId === category.id);
                return (
                  <div
                    key={category.id}
                    className={`p-2 rounded cursor-pointer transition-colors ${
                      selectedCategoryId === category.id 
                        ? "bg-blue-100 dark:bg-blue-900" 
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    <div className="font-medium">{category.name}</div>
                    <div className="text-sm text-gray-500">{categoryDocs.length} items</div>
                    <div className="text-xs text-gray-400">{category.description}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="lg:col-span-3">
          {selectedDocument ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedDocument.title}</CardTitle>
                    <CardDescription>
                      By {selectedDocument.author?.firstName} {selectedDocument.author?.lastName} • 
                      Version {selectedDocument.version} • 
                      {selectedDocument.estimatedReadTime} min read
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {canCreateDocs && selectedDocument.authorId === currentUser?.id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingDocument(selectedDocument)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedDocument(null)}
                    >
                      Back to List
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getAccessLevelColor(selectedDocument.accessLevel)}>
                    {selectedDocument.accessLevel.replace("_", " ")}
                  </Badge>
                  <Badge className={getDifficultyColor(selectedDocument.difficulty)}>
                    {selectedDocument.difficulty}
                  </Badge>
                  {selectedDocument.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {selectedDocument.summary && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Summary</h3>
                    <p className="text-sm">{selectedDocument.summary}</p>
                  </div>
                )}

                <div className="prose max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap">{selectedDocument.content}</div>
                </div>

                {selectedDocument.rating && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">{renderStars(selectedDocument.rating)}</div>
                      <span className="text-sm text-gray-600">
                        {selectedDocument.rating.toFixed(1)} ({selectedDocument.ratingCount} reviews)
                      </span>
                    </div>
                  </div>
                )}

                {/* Rating Form */}
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3">Rate this Document</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>Rating</Label>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 cursor-pointer ${
                              i < ratingForm.rating 
                                ? "text-yellow-400 fill-current" 
                                : "text-gray-300"
                            }`}
                            onClick={() => setRatingForm({ ...ratingForm, rating: i + 1 })}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="feedback">Feedback (Optional)</Label>
                      <Textarea
                        id="feedback"
                        placeholder="Share your thoughts on this document..."
                        value={ratingForm.feedback}
                        onChange={(e) => setRatingForm({ ...ratingForm, feedback: e.target.value })}
                        rows={2}
                      />
                    </div>
                    <Button
                      onClick={() => handleRateDocument(selectedDocument.id)}
                      disabled={rateDocumentMutation.isPending}
                      size="sm"
                    >
                      {rateDocumentMutation.isPending ? "Submitting..." : "Submit Rating"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">
                  {selectedCategoryId === "all" 
                    ? "All Documents" 
                    : categories.find((c: UtilityCategory) => c.id === selectedCategoryId)?.name
                  }
                </h2>
                <div className="text-sm text-gray-500">
                  {documents.length} document{documents.length !== 1 ? "s" : ""}
                </div>
              </div>

              {documentsLoading ? (
                <div>Loading documents...</div>
              ) : documents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">No documents found in this category</p>
                    {canCreateDocs && (
                      <Button 
                        className="mt-4" 
                        onClick={() => setShowCreateDialog(true)}
                      >
                        Create First Document
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map((document: UtilityDocument) => (
                    <Card 
                      key={document.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedDocument(document)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{document.title}</CardTitle>
                        <CardDescription>
                          {document.category.name} • {document.estimatedReadTime} min read
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {document.summary && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {document.summary}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={getAccessLevelColor(document.accessLevel)}>
                            {document.accessLevel.replace("_", " ")}
                          </Badge>
                          <Badge className={getDifficultyColor(document.difficulty)}>
                            {document.difficulty}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div>
                            By {document.author?.firstName} {document.author?.lastName}
                          </div>
                          {document.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span>{document.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        {document.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {document.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {document.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{document.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Document Dialog */}
      {editingDocument && (
        <Dialog open={!!editingDocument} onOpenChange={() => setEditingDocument(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Document</DialogTitle>
              <DialogDescription>
                Make changes to {editingDocument.title}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTitle">Title</Label>
                <Input
                  id="editTitle"
                  value={editingDocument.title}
                  onChange={(e) => setEditingDocument({ ...editingDocument, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editSummary">Summary</Label>
                <Textarea
                  id="editSummary"
                  value={editingDocument.summary || ""}
                  onChange={(e) => setEditingDocument({ ...editingDocument, summary: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="editContent">Content</Label>
                <Textarea
                  id="editContent"
                  value={editingDocument.content}
                  onChange={(e) => setEditingDocument({ ...editingDocument, content: e.target.value })}
                  rows={15}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingDocument(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateDocument}
                  disabled={updateDocumentMutation.isPending}
                >
                  {updateDocumentMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}