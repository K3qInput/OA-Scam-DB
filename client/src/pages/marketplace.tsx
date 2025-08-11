import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Star, 
  DollarSign, 
  Clock, 
  MapPin, 
  Shield, 
  Award,
  Plus,
  Filter,
  Eye,
  MessageSquare,
  Users,
  Briefcase
} from "lucide-react";

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState("browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock data for demonstration - in real app would come from API
  const freelancers = [
    {
      id: "1",
      name: "Alex Johnson",
      title: "Full-Stack Developer",
      rating: 4.8,
      reviews: 127,
      hourlyRate: 75,
      location: "New York, USA",
      isVerified: true,
      skills: ["React", "Node.js", "Python", "PostgreSQL"],
      description: "Experienced developer specializing in modern web applications and API development.",
      avatar: null,
      completedProjects: 89,
      responseTime: "< 1 hour"
    },
    {
      id: "2", 
      name: "Sarah Chen",
      title: "UX/UI Designer",
      rating: 4.9,
      reviews: 203,
      hourlyRate: 65,
      location: "San Francisco, USA",
      isVerified: true,
      skills: ["Figma", "Adobe XD", "Sketch", "Prototyping"],
      description: "Creative designer focused on user-centered design and modern interfaces.",
      avatar: null,
      completedProjects: 156,
      responseTime: "< 2 hours"
    },
    {
      id: "3",
      name: "Mohamed Hassan",
      title: "Blockchain Developer", 
      rating: 4.7,
      reviews: 89,
      hourlyRate: 95,
      location: "London, UK",
      isVerified: true,
      skills: ["Solidity", "Web3", "Smart Contracts", "DeFi"],
      description: "Specialized in blockchain development and decentralized applications.",
      avatar: null,
      completedProjects: 43,
      responseTime: "< 3 hours"
    }
  ];

  const projects = [
    {
      id: "1",
      title: "E-commerce Website Development",
      budget: "$5,000 - $8,000",
      deadline: "6 weeks",
      description: "Looking for a experienced developer to build a modern e-commerce platform with payment integration.",
      skills: ["React", "Node.js", "Stripe", "MongoDB"],
      proposals: 12,
      postedBy: "TechCorp Inc.",
      postedAt: "2 days ago",
      isUrgent: false
    },
    {
      id: "2", 
      title: "Mobile App UI/UX Design",
      budget: "$2,500 - $4,000",
      deadline: "3 weeks", 
      description: "Need a complete UI/UX design for a fitness tracking mobile application.",
      skills: ["Figma", "Mobile Design", "UI/UX", "Prototyping"],
      proposals: 8,
      postedBy: "FitLife Startup",
      postedAt: "1 day ago",
      isUrgent: true
    },
    {
      id: "3",
      title: "Smart Contract Development",
      budget: "$10,000 - $15,000", 
      deadline: "8 weeks",
      description: "Develop and audit smart contracts for a new DeFi lending platform.",
      skills: ["Solidity", "Web3", "Smart Contracts", "Security Audit"],
      proposals: 5,
      postedBy: "DefiMax Protocol",
      postedAt: "3 days ago",
      isUrgent: false
    }
  ];

  return (
    <div className="flex h-screen bg-oa-black">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Freelancer Marketplace</h1>
            <p className="text-oa-gray">Connect with verified freelancers and find projects</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-oa-dark border border-oa-border">
              <TabsTrigger 
                value="browse" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-browse-freelancers"
              >
                Browse Freelancers
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-browse-projects"
              >
                Browse Projects
              </TabsTrigger>
              <TabsTrigger 
                value="my-projects" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-my-projects"
              >
                My Projects
              </TabsTrigger>
              <TabsTrigger 
                value="my-profile" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-my-profile"
              >
                My Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-oa-gray" />
                  <Input
                    placeholder="Search freelancers by skills, name, or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-oa-dark border-oa-border text-white"
                    data-testid="input-search-freelancers"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 bg-oa-dark border-oa-border text-white">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-oa-dark border-oa-border">
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="blockchain">Blockchain</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="border-oa-border text-oa-gray">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freelancers.map((freelancer) => (
                  <Card key={freelancer.id} className="bg-oa-dark border-oa-border hover:border-oa-primary/50 transition-colors">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={freelancer.avatar} />
                          <AvatarFallback className="bg-oa-black text-white">
                            {freelancer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-white">{freelancer.name}</h3>
                            {freelancer.isVerified && (
                              <Shield className="h-4 w-4 text-oa-green" />
                            )}
                          </div>
                          <p className="text-oa-gray text-sm">{freelancer.title}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-white font-medium">{freelancer.rating}</span>
                          <span className="text-oa-gray text-sm">({freelancer.reviews})</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">${freelancer.hourlyRate}/hr</div>
                        </div>
                      </div>

                      <p className="text-oa-gray text-sm">{freelancer.description}</p>

                      <div className="flex flex-wrap gap-1">
                        {freelancer.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {freelancer.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{freelancer.skills.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs text-oa-gray">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {freelancer.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {freelancer.responseTime}
                        </div>
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {freelancer.completedProjects} projects
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1 bg-oa-primary hover:bg-oa-primary/80">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline" className="border-oa-border">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-oa-gray" />
                    <Input
                      placeholder="Search projects..."
                      className="pl-10 bg-oa-dark border-oa-border text-white w-80"
                      data-testid="input-search-projects"
                    />
                  </div>
                  <Select>
                    <SelectTrigger className="w-48 bg-oa-dark border-oa-border text-white">
                      <SelectValue placeholder="All Budgets" />
                    </SelectTrigger>
                    <SelectContent className="bg-oa-dark border-oa-border">
                      <SelectItem value="all">All Budgets</SelectItem>
                      <SelectItem value="low">$0 - $1,000</SelectItem>
                      <SelectItem value="mid">$1,000 - $5,000</SelectItem>
                      <SelectItem value="high">$5,000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Dialog open={showCreateProject} onOpenChange={setShowCreateProject}>
                  <DialogTrigger asChild>
                    <Button className="bg-oa-green hover:bg-oa-green/80 text-black">
                      <Plus className="h-4 w-4 mr-2" />
                      Post Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-oa-dark border-oa-border text-white max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Post a New Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Project Title</Label>
                        <Input 
                          id="title"
                          className="bg-oa-black border-oa-border text-white"
                          placeholder="Enter project title..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea 
                          id="description"
                          className="bg-oa-black border-oa-border text-white"
                          placeholder="Describe your project requirements..."
                          rows={4}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="budget">Budget Range</Label>
                          <Input 
                            id="budget"
                            className="bg-oa-black border-oa-border text-white"
                            placeholder="e.g. $1,000 - $3,000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deadline">Deadline</Label>
                          <Input 
                            id="deadline"
                            className="bg-oa-black border-oa-border text-white"
                            placeholder="e.g. 4 weeks"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="skills">Required Skills</Label>
                        <Input 
                          id="skills"
                          className="bg-oa-black border-oa-border text-white"
                          placeholder="e.g. React, Node.js, PostgreSQL"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCreateProject(false)}>
                          Cancel
                        </Button>
                        <Button className="bg-oa-green hover:bg-oa-green/80 text-black">
                          Post Project
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="space-y-4">
                {projects.map((project) => (
                  <Card key={project.id} className="bg-oa-dark border-oa-border">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                            {project.isUrgent && (
                              <Badge variant="destructive" className="text-xs">Urgent</Badge>
                            )}
                          </div>
                          <p className="text-oa-gray mb-3">{project.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-oa-green" />
                          <span className="text-white font-medium">{project.budget}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-oa-primary" />
                          <span className="text-white">{project.deadline}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-oa-gray" />
                          <span className="text-white">{project.proposals} proposals</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {project.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-oa-gray">
                          Posted by <span className="text-white">{project.postedBy}</span> • {project.postedAt}
                        </div>
                        <Button size="sm" className="bg-oa-primary hover:bg-oa-primary/80">
                          Submit Proposal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="my-projects" className="space-y-6">
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-oa-gray mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
                <p className="text-oa-gray mb-4">Start by posting your first project or submitting proposals</p>
                <Button className="bg-oa-primary hover:bg-oa-primary/80">
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Project
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="my-profile" className="space-y-6">
              <Card className="bg-oa-dark border-oa-border">
                <CardHeader>
                  <CardTitle className="text-white">Freelancer Profile</CardTitle>
                  <CardDescription className="text-oa-gray">
                    Create your profile to start receiving project invitations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="professional-title">Professional Title</Label>
                      <Input 
                        id="professional-title"
                        className="bg-oa-black border-oa-border text-white"
                        placeholder="e.g. Full-Stack Developer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="hourly-rate">Hourly Rate</Label>
                      <Input 
                        id="hourly-rate"
                        className="bg-oa-black border-oa-border text-white"
                        placeholder="e.g. $75"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea 
                      id="bio"
                      className="bg-oa-black border-oa-border text-white"
                      placeholder="Tell clients about your experience and expertise..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="skills">Skills & Technologies</Label>
                    <Input 
                      id="skills"
                      className="bg-oa-black border-oa-border text-white"
                      placeholder="e.g. React, Node.js, Python, PostgreSQL"
                    />
                  </div>

                  <Button className="bg-oa-primary hover:bg-oa-primary/80">
                    Save Profile
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}