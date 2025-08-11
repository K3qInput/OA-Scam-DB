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

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/community-events", { type: filterEventType, status: filterStatus }],
  });

  const { data: myEvents } = useQuery({
    queryKey: ["/api/community-events/my"],
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
    }
  });

  const handleCreateEvent = () => {
    if (!eventForm.title || !eventForm.description || !eventForm.startDate || !eventForm.endDate) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createEventMutation.mutate(eventForm);
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      competition: "bg-purple-100 text-purple-800",
      dev_jam: "bg-blue-100 text-blue-800",
      server_collab: "bg-green-100 text-green-800",
      training: "bg-yellow-100 text-yellow-800",
      webinar: "bg-orange-100 text-orange-800"
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const EventCard = ({ event }: { event: CommunityEvent }) => {
    const isRegistrationOpen = event.registrationDeadline ? 
      new Date(event.registrationDeadline) > new Date() : 
      new Date(event.startDate) > new Date();
    const hasCapacity = !event.maxParticipants || event.currentParticipants < event.maxParticipants;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {event.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getEventTypeColor(event.eventType)}>
                  {event.eventType.replace('_', ' ')}
                </Badge>
                <Badge className={getStatusColor(event.status)}>
                  {event.status}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              {event.prizePool && (
                <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                  <Trophy className="w-4 h-4" />
                  ${(event.prizePool / 100).toFixed(0)}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-1">
                Prize Pool
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm">{event.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Start</div>
                <div className="text-muted-foreground">
                  {new Date(event.startDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-medium">Participants</div>
                <div className="text-muted-foreground">
                  {event.currentParticipants}
                  {event.maxParticipants && `/${event.maxParticipants}`}
                </div>
              </div>
            </div>
          </div>

          {event.registrationDeadline && (
            <div className="text-sm">
              <span className="font-medium">Registration Deadline: </span>
              <span className="text-muted-foreground">
                {new Date(event.registrationDeadline).toLocaleDateString()}
              </span>
            </div>
          )}

          {event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {event.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {event.externalLinks && (
            <div className="flex gap-2">
              {(event.externalLinks as any).discord && (
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Discord
                </Button>
              )}
              {(event.externalLinks as any).website && (
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Website
                </Button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-xs text-muted-foreground">
              Organized by {event.organizer?.displayName || event.organizer?.username}
            </div>
            {event.status === "upcoming" && isRegistrationOpen && hasCapacity && (
              <Button 
                size="sm"
                onClick={() => registerForEventMutation.mutate(event.id)}
                disabled={registerForEventMutation.isPending}
              >
                {registerForEventMutation.isPending ? "Registering..." : "Register"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const CreateEventForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Community Event
        </CardTitle>
        <CardDescription>
          Organize competitions, workshops, collaborations, and more
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title *</Label>
          <Input
            id="title"
            value={eventForm.title}
            onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Amazing Community Competition 2025"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            value={eventForm.description}
            onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detailed description of the event, rules, requirements, etc."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="eventType">Event Type</Label>
            <Select 
              value={eventForm.eventType} 
              onValueChange={(value) => setEventForm(prev => ({ ...prev, eventType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="competition">Competition</SelectItem>
                <SelectItem value="dev_jam">Dev Jam</SelectItem>
                <SelectItem value="server_collab">Server Collaboration</SelectItem>
                <SelectItem value="training">Training Workshop</SelectItem>
                <SelectItem value="webinar">Webinar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Max Participants</Label>
            <Input
              id="maxParticipants"
              type="number"
              value={eventForm.maxParticipants}
              onChange={(e) => setEventForm(prev => ({ ...prev, maxParticipants: e.target.value }))}
              placeholder="Leave empty for unlimited"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date & Time *</Label>
            <Input
              id="startDate"
              type="datetime-local"
              value={eventForm.startDate}
              onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">End Date & Time *</Label>
            <Input
              id="endDate"
              type="datetime-local"
              value={eventForm.endDate}
              onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="registrationDeadline">Registration Deadline</Label>
            <Input
              id="registrationDeadline"
              type="datetime-local"
              value={eventForm.registrationDeadline}
              onChange={(e) => setEventForm(prev => ({ ...prev, registrationDeadline: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prizePool">Prize Pool ($)</Label>
            <Input
              id="prizePool"
              type="number"
              value={eventForm.prizePool}
              onChange={(e) => setEventForm(prev => ({ ...prev, prizePool: e.target.value }))}
              placeholder="Total prize amount"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={eventForm.tags.join(", ")}
            onChange={(e) => setEventForm(prev => ({ 
              ...prev, 
              tags: e.target.value.split(",").map(tag => tag.trim()).filter(Boolean)
            }))}
            placeholder="coding, design, collaboration, beginner-friendly"
          />
        </div>

        <Button 
          onClick={handleCreateEvent}
          disabled={createEventMutation.isPending}
          className="w-full"
        >
          {createEventMutation.isPending ? "Creating..." : "Create Event"}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Community Events</h1>
          <p className="text-muted-foreground">
            Join competitions, workshops, and collaborative events in our community
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="browse">Browse Events</TabsTrigger>
            <TabsTrigger value="create">Create Event</TabsTrigger>
            <TabsTrigger value="my-events">My Events</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Select value={filterEventType} onValueChange={setFilterEventType}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                        <SelectItem value="dev_jam">Dev Jam</SelectItem>
                        <SelectItem value="server_collab">Server Collaboration</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="webinar">Webinar</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {isLoading ? (
                <div className="text-center py-8">Loading events...</div>
              ) : !events || events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No events found
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {events.map((event: CommunityEvent) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <CreateEventForm />
          </TabsContent>

          <TabsContent value="my-events">
            <Card>
              <CardHeader>
                <CardTitle>My Organized Events</CardTitle>
              </CardHeader>
              <CardContent>
                {!myEvents || myEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No events organized yet
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myEvents.map((event: CommunityEvent) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}