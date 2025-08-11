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
import { Calendar, Trophy, Users, Clock, MapPin, ExternalLink, Plus } from "lucide-react";

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  eventType: string;
  status: string;
  organizerId: string;
  maxParticipants?: number;
  currentParticipants: number;
  prizePool?: number;
  requirements?: any;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  discordChannelId?: string;
  externalLinks?: any;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  organizer?: {
    username: string;
    displayName?: string;
  };
}

export default function CommunityEvents() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("browse");
  const [filterEventType, setFilterEventType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    eventType: "competition",
    maxParticipants: "",
    prizePool: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    requirements: {},
    tags: [] as string[],
    externalLinks: {}
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/community-events", { type: filterEventType, status: filterStatus }],
    initialData: []
  });

  const { data: myEvents = [] } = useQuery({
    queryKey: ["/api/community-events/my"],
    initialData: []
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/community-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        },
        body: JSON.stringify({
          ...data,
          maxParticipants: data.maxParticipants ? parseInt(data.maxParticipants) : null,
          prizePool: data.prizePool ? parseInt(data.prizePool) * 100 : null // Convert to cents
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Event created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/community-events"] });
      setEventForm({
        title: "",
        description: "",
        eventType: "competition",
        maxParticipants: "",
        prizePool: "",
        startDate: "",
        endDate: "",
        registrationDeadline: "",
        requirements: {},
        tags: [],
        externalLinks: {}
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Failed to create event", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const registerForEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const response = await fetch(`/api/community-events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to register for event");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Successfully registered for event" });
      queryClient.invalidateQueries({ queryKey: ["/api/community-events"] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Registration failed", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'competition': return 'bg-purple-900 text-purple-200';
      case 'collaboration': return 'bg-blue-900 text-blue-200';
      case 'training': return 'bg-green-900 text-green-200';
      case 'social': return 'bg-orange-900 text-orange-200';
      default: return 'bg-gray-900 text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-900 text-blue-200';
      case 'active': return 'bg-green-900 text-green-200';
      case 'completed': return 'bg-gray-900 text-gray-200';
      case 'cancelled': return 'bg-red-900 text-red-200';
      default: return 'bg-gray-900 text-gray-200';
    }
  };

  // Mock events for demonstration
  const mockEvents = [
    {
      id: "1",
      title: "Discord Bot Development Challenge",
      description: "Build innovative Discord bots with a $1,000 prize pool. Show off your creativity and technical skills!",
      eventType: "competition",
      status: "upcoming",
      maxParticipants: 50,
      currentParticipants: 23,
      prizePool: 100000,
      startDate: "2025-08-20T00:00:00Z",
      endDate: "2025-09-20T23:59:59Z",
      registrationDeadline: "2025-08-15T23:59:59Z",
      tags: ["Discord", "JavaScript", "API"],
      organizer: { username: "admin", displayName: "OwnersAlliance Team" }
    },
    {
      id: "2",
      title: "Server Security Workshop",
      description: "Learn advanced server security techniques from industry experts. Free event with certificates!",
      eventType: "training",
      status: "active",
      maxParticipants: 100,
      currentParticipants: 67,
      prizePool: null,
      startDate: "2025-08-10T18:00:00Z",
      endDate: "2025-08-10T20:00:00Z",
      registrationDeadline: "2025-08-09T23:59:59Z",
      tags: ["Security", "Education", "Live"],
      organizer: { username: "security_expert", displayName: "Security Team" }
    },
    {
      id: "3",
      title: "Community Server Collaboration",
      description: "Partner with other server owners to create amazing collaborative projects and grow together.",
      eventType: "collaboration",
      status: "upcoming",
      maxParticipants: 25,
      currentParticipants: 12,
      prizePool: null,
      startDate: "2025-08-25T00:00:00Z",
      endDate: "2025-09-25T23:59:59Z",
      registrationDeadline: "2025-08-22T23:59:59Z",
      tags: ["Collaboration", "Networking", "Growth"],
      organizer: { username: "community_lead", displayName: "Community Manager" }
    }
  ];

  const displayEvents = events.length > 0 ? events : mockEvents;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Community Events</h1>
            <p className="text-slate-400 mt-1">Participate in competitions, collaborations, and training events</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="browse" className="data-[state=active]:bg-slate-700">
              Browse Events
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-slate-700">
              Create Event
            </TabsTrigger>
            <TabsTrigger value="my-events" className="data-[state=active]:bg-slate-700">
              My Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Filters */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Filter Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Event Type</Label>
                    <Select value={filterEventType} onValueChange={setFilterEventType}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="">All types</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                        <SelectItem value="collaboration">Collaboration</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Status</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="">All statuses</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-slate-800 border-slate-700 animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-slate-600 rounded"></div>
                      <div className="h-4 bg-slate-600 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-600 rounded"></div>
                        <div className="h-4 bg-slate-600 rounded w-2/3"></div>
                        <div className="h-10 bg-slate-600 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                displayEvents.map((event: any) => (
                  <Card key={event.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-white text-lg">{event.title}</CardTitle>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={getEventTypeColor(event.eventType)}>
                            {event.eventType}
                          </Badge>
                          <Badge className={getStatusColor(event.status)}>
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-slate-400">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Event Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Users className="h-4 w-4" />
                          <span>{event.currentParticipants}/{event.maxParticipants || '∞'}</span>
                        </div>
                        {event.prizePool && (
                          <div className="flex items-center gap-2 text-green-400">
                            <Trophy className="h-4 w-4" />
                            <span>${(event.prizePool / 100).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-slate-300">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-300">
                          <Clock className="h-4 w-4" />
                          <span>{Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {event.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => registerForEventMutation.mutate(event.id)}
                          disabled={registerForEventMutation.isPending}
                        >
                          {event.status === 'active' ? 'Join Now' : 'Register'}
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Create New Event</CardTitle>
                <CardDescription className="text-slate-400">
                  Organize competitions, training sessions, and community collaborations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Event Title *</Label>
                    <Input
                      value={eventForm.title}
                      onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter event title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Event Type *</Label>
                    <Select value={eventForm.eventType} onValueChange={(value) => setEventForm({ ...eventForm, eventType: value })}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="competition">Competition</SelectItem>
                        <SelectItem value="collaboration">Collaboration</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Description *</Label>
                  <Textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                    placeholder="Describe your event..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Max Participants</Label>
                    <Input
                      type="number"
                      value={eventForm.maxParticipants}
                      onChange={(e) => setEventForm({ ...eventForm, maxParticipants: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="No limit"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Prize Pool ($)</Label>
                    <Input
                      type="number"
                      value={eventForm.prizePool}
                      onChange={(e) => setEventForm({ ...eventForm, prizePool: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Registration Deadline</Label>
                    <Input
                      type="datetime-local"
                      value={eventForm.registrationDeadline}
                      onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Start Date *</Label>
                    <Input
                      type="datetime-local"
                      value={eventForm.startDate}
                      onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">End Date *</Label>
                    <Input
                      type="datetime-local"
                      value={eventForm.endDate}
                      onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => createEventMutation.mutate(eventForm)}
                    disabled={createEventMutation.isPending || !eventForm.title || !eventForm.description}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createEventMutation.isPending ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-events" className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">My Events</CardTitle>
                <CardDescription className="text-slate-400">
                  Events you've created or registered for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-400">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't created or joined any events yet.</p>
                  <Button
                    className="mt-4"
                    onClick={() => setActiveTab("browse")}
                  >
                    Browse Events
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}