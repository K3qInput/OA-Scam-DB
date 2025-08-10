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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Briefcase, 
  CheckCircle, 
  MessageSquare,
  Plus,
  Search,
  Filter
} from "lucide-react";

interface FreelancerProfile {
  id: string;
  userId: string;
  isVerified: boolean;
  verificationLevel: string;
  title: string;
  bio: string;
  skills: string[];
  specializations: string[];
  hourlyRate: number;
  currency: string;
  availability: string;
  portfolio: any;
  experience: string;
  completedJobs: number;
  averageRating: number;
  totalEarnings: string;
  responseTime: number;
  languages: string[];
  timezone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  clientId: string;
  freelancerId?: string;
  title: string;
  description: string;
  requirements: string;
  category: string;
  skills: string[];
  budget: number;
  budgetType: string;
  currency: string;
  deadline?: string;
  status: string;
  priority: string;
  isPublic: boolean;
  isVerifiedOnly: boolean;
  applicationCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const skillOptions = [
  "web_development", "mobile_development", "game_development", "ui_ux_design",
  "graphic_design", "3d_modeling", "animation", "content_writing", "copywriting",
  "seo", "marketing", "project_management", "data_analysis", "ai_ml", "blockchain",
  "cybersecurity", "devops", "qa_testing", "minecraft_development", "discord_bots",
  "server_administration", "plugin_development", "mod_development"
];

const categoryOptions = [
  "Web Development", "Mobile Development", "Game Development", "Design",
  "Writing & Content", "Marketing", "Data & Analytics", "DevOps & Infrastructure",
  "Minecraft & Gaming", "Discord & Community", "Other"
];

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("browse-freelancers");
  const [freelancerFilters, setFreelancerFilters] = useState({ skills: "", verified: "" });
  const [projectFilters, setProjectFilters] = useState({ skills: "", status: "open" });
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    requirements: "",
    category: "",
    skills: [] as string[],
    budget: "",
    budgetType: "fixed",
    deadline: "",
    isVerifiedOnly: false
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: freelancers = [] } = useQuery({
    queryKey: ["/api/freelancers", freelancerFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (freelancerFilters.skills) params.append("skills", freelancerFilters.skills);
      if (freelancerFilters.verified) params.append("verified", freelancerFilters.verified);
      const url = `/api/freelancers${params.toString() ? `?${params}` : ""}`;
      return apiRequest(url);
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects", projectFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectFilters.skills) params.append("skills", projectFilters.skills);
      if (projectFilters.status) params.append("status", projectFilters.status);
      const url = `/api/projects${params.toString() ? `?${params}` : ""}`;
      return apiRequest(url);
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      return apiRequest("/api/projects", {
        method: "POST",
        body: projectData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Project Created",
        description: "Your project has been posted successfully.",
      });
      setIsCreateProjectOpen(false);
      setProjectForm({
        title: "",
        description: "",
        requirements: "",
        category: "",
        skills: [],
        budget: "",
        budgetType: "fixed",
        deadline: "",
        isVerifiedOnly: false
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateProject = () => {
    createProjectMutation.mutate({
      ...projectForm,
      budget: projectForm.budget ? parseFloat(projectForm.budget) : null,
      deadline: projectForm.deadline || null,
    });
  };

  const getExperienceBadgeVariant = (experience: string) => {
    switch (experience) {
      case "expert": return "default";
      case "intermediate": return "secondary";
      case "entry": return "outline";
      default: return "outline";
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available": return "text-green-600";
      case "busy": return "text-yellow-600";
      case "unavailable": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Freelancer Marketplace</h1>
        <p className="text-muted-foreground">
          Connect with verified freelancers or find your next project opportunity.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse-freelancers" data-testid="tab-browse-freelancers">
            <User className="h-4 w-4 mr-2" />
            Browse Freelancers
          </TabsTrigger>
          <TabsTrigger value="browse-projects" data-testid="tab-browse-projects">
            <Briefcase className="h-4 w-4 mr-2" />
            Browse Projects
          </TabsTrigger>
          <TabsTrigger value="post-project" data-testid="tab-post-project">
            <Plus className="h-4 w-4 mr-2" />
            Post Project
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse-freelancers" className="space-y-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="skill-filter">Filter by Skills</Label>
              <Select 
                value={freelancerFilters.skills} 
                onValueChange={(value) => setFreelancerFilters(prev => ({ ...prev, skills: value }))}
              >
                <SelectTrigger data-testid="select-skill-filter">
                  <SelectValue placeholder="All skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All skills</SelectItem>
                  {skillOptions.map(skill => (
                    <SelectItem key={skill} value={skill}>
                      {skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="verified-filter">Verification Status</Label>
              <Select 
                value={freelancerFilters.verified} 
                onValueChange={(value) => setFreelancerFilters(prev => ({ ...prev, verified: value }))}
              >
                <SelectTrigger data-testid="select-verified-filter">
                  <SelectValue placeholder="All freelancers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All freelancers</SelectItem>
                  <SelectItem value="true">Verified only</SelectItem>
                  <SelectItem value="false">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {freelancers.map((freelancer: FreelancerProfile) => (
              <Card key={freelancer.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {freelancer.title.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{freelancer.title}</CardTitle>
                        {freelancer.isVerified && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {freelancer.averageRating && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>{freelancer.averageRating}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          <span>{freelancer.completedJobs} jobs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {freelancer.bio}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Experience Level</span>
                      <Badge variant={getExperienceBadgeVariant(freelancer.experience)}>
                        {freelancer.experience}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span>Availability</span>
                      <span className={`font-medium ${getAvailabilityColor(freelancer.availability)}`}>
                        {freelancer.availability}
                      </span>
                    </div>
                    
                    {freelancer.hourlyRate && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Rate</span>
                        <span className="font-medium">
                          ${freelancer.hourlyRate}/{freelancer.currency === 'USD' ? 'hr' : freelancer.currency}
                        </span>
                      </div>
                    )}
                  </div>

                  {freelancer.skills.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {freelancer.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {freelancer.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{freelancer.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      data-testid={`button-contact-${freelancer.id}`}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Contact
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      data-testid={`button-view-profile-${freelancer.id}`}
                    >
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {freelancers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">No freelancers found matching your criteria.</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse-projects" className="space-y-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="project-skill-filter">Filter by Skills</Label>
              <Select 
                value={projectFilters.skills} 
                onValueChange={(value) => setProjectFilters(prev => ({ ...prev, skills: value }))}
              >
                <SelectTrigger data-testid="select-project-skill-filter">
                  <SelectValue placeholder="All skills" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All skills</SelectItem>
                  {skillOptions.map(skill => (
                    <SelectItem key={skill} value={skill}>
                      {skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="project-status-filter">Project Status</Label>
              <Select 
                value={projectFilters.status} 
                onValueChange={(value) => setProjectFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger data-testid="select-project-status-filter">
                  <SelectValue placeholder="All projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All projects</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            {projects.map((project: Project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <Badge variant={project.status === 'open' ? 'default' : 'secondary'}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        {project.isVerifiedOnly && (
                          <Badge variant="outline">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified only
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>
                            ${project.budget} {project.budgetType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{project.applicationCount} applications</span>
                        </div>
                        {project.deadline && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm">{project.description}</p>

                  {project.skills.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Required Skills</div>
                      <div className="flex flex-wrap gap-1">
                        {project.skills.map(skill => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      data-testid={`button-apply-${project.id}`}
                      disabled={project.status !== 'open'}
                    >
                      Apply Now
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      data-testid={`button-view-project-${project.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground">No projects found matching your criteria.</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="post-project" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Post a New Project</CardTitle>
              <CardDescription>
                Create a project listing to find the perfect freelancer for your needs.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="project-title">Project Title *</Label>
                  <Input
                    id="project-title"
                    data-testid="input-project-title"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Build a modern web application"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="project-category">Category *</Label>
                  <Select 
                    value={projectForm.category} 
                    onValueChange={(value) => setProjectForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger data-testid="select-project-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-description">Project Description *</Label>
                <Textarea
                  id="project-description"
                  data-testid="textarea-project-description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project, goals, and expectations..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project-requirements">Requirements *</Label>
                <Textarea
                  id="project-requirements"
                  data-testid="textarea-project-requirements"
                  value={projectForm.requirements}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, requirements: e.target.value }))}
                  placeholder="List specific requirements, deliverables, and technical specifications..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="project-budget">Budget</Label>
                  <Input
                    id="project-budget"
                    data-testid="input-project-budget"
                    type="number"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, budget: e.target.value }))}
                    placeholder="1000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget-type">Budget Type</Label>
                  <Select 
                    value={projectForm.budgetType} 
                    onValueChange={(value) => setProjectForm(prev => ({ ...prev, budgetType: value }))}
                  >
                    <SelectTrigger data-testid="select-budget-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="hourly">Hourly Rate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="project-deadline">Deadline</Label>
                  <Input
                    id="project-deadline"
                    data-testid="input-project-deadline"
                    type="date"
                    value={projectForm.deadline}
                    onChange={(e) => setProjectForm(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Required Skills</Label>
                <Select 
                  value="" 
                  onValueChange={(value) => {
                    if (!projectForm.skills.includes(value)) {
                      setProjectForm(prev => ({ ...prev, skills: [...prev.skills, value] }));
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-add-skill">
                    <SelectValue placeholder="Add required skills" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillOptions.filter(skill => !projectForm.skills.includes(skill)).map(skill => (
                      <SelectItem key={skill} value={skill}>
                        {skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {projectForm.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {projectForm.skills.map(skill => (
                      <Badge 
                        key={skill} 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => setProjectForm(prev => ({ 
                          ...prev, 
                          skills: prev.skills.filter(s => s !== skill) 
                        }))}
                      >
                        {skill.replace(/_/g, ' ')} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="verified-only"
                  data-testid="checkbox-verified-only"
                  checked={projectForm.isVerifiedOnly}
                  onChange={(e) => setProjectForm(prev => ({ ...prev, isVerifiedOnly: e.target.checked }))}
                />
                <Label htmlFor="verified-only">Only allow verified freelancers to apply</Label>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleCreateProject}
                  disabled={!projectForm.title || !projectForm.description || !projectForm.requirements}
                  data-testid="button-create-project"
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post Project
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setProjectForm({
                    title: "",
                    description: "",
                    requirements: "",
                    category: "",
                    skills: [],
                    budget: "",
                    budgetType: "fixed",
                    deadline: "",
                    isVerifiedOnly: false
                  })}
                  data-testid="button-clear-form"
                >
                  Clear Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}