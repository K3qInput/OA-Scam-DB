
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Plus, Edit, Trash2, Settings } from "lucide-react";

interface PlaybookAction {
  id: string;
  type: 'ban' | 'mute' | 'warn' | 'tribunal' | 'investigation' | 'notification';
  parameters: Record<string, any>;
  delay?: number;
  condition?: string;
}

interface ActionPlaybook {
  id: string;
  name: string;
  description: string;
  trigger: string;
  actions: PlaybookAction[];
  isActive: boolean;
  executionCount: number;
  createdAt: Date;
  lastExecuted?: Date;
}

export default function ActionPlaybooks() {
  const [playbooks, setPlaybooks] = useState<ActionPlaybook[]>([
    {
      id: '1',
      name: 'Scam Report Pipeline',
      description: 'Standard procedure for handling scam reports',
      trigger: 'case_type:scam AND priority:high',
      actions: [
        { id: '1', type: 'investigation', parameters: { assignTo: 'senior_staff' } },
        { id: '2', type: 'mute', parameters: { duration: '24h' }, delay: 0 },
        { id: '3', type: 'tribunal', parameters: { type: 'public' }, delay: 3600 }
      ],
      isActive: true,
      executionCount: 45,
      createdAt: new Date('2024-01-15'),
      lastExecuted: new Date('2024-01-20')
    }
  ]);

  const [newPlaybook, setNewPlaybook] = useState<Partial<ActionPlaybook>>({
    name: '',
    description: '',
    trigger: '',
    actions: [],
    isActive: true
  });

  const [editingPlaybook, setEditingPlaybook] = useState<string | null>(null);

  const actionTypes = [
    { value: 'ban', label: 'Temporary Ban' },
    { value: 'mute', label: 'Mute User' },
    { value: 'warn', label: 'Issue Warning' },
    { value: 'tribunal', label: 'Create Tribunal' },
    { value: 'investigation', label: 'Start Investigation' },
    { value: 'notification', label: 'Send Notification' }
  ];

  const addAction = (playbookId: string) => {
    const newAction: PlaybookAction = {
      id: Date.now().toString(),
      type: 'warn',
      parameters: {}
    };

    setPlaybooks(prev => prev.map(p => 
      p.id === playbookId 
        ? { ...p, actions: [...p.actions, newAction] }
        : p
    ));
  };

  const executePlaybook = async (playbook: ActionPlaybook) => {
    console.log('Executing playbook:', playbook.name);
    // In real implementation, this would execute the playbook actions
    setPlaybooks(prev => prev.map(p => 
      p.id === playbook.id 
        ? { ...p, executionCount: p.executionCount + 1, lastExecuted: new Date() }
        : p
    ));
  };

  const togglePlaybook = (id: string) => {
    setPlaybooks(prev => prev.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  return (
    <div className="min-h-screen bg-oa-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Action Playbooks</h1>
          <p className="text-oa-gray">Automated workflows for consistent case handling</p>
        </div>

        {/* Create New Playbook */}
        <Card className="oa-card mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Playbook
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Playbook Name"
                value={newPlaybook.name}
                onChange={(e) => setNewPlaybook(prev => ({ ...prev, name: e.target.value }))}
                className="oa-input"
              />
              <Input
                placeholder="Trigger Condition (e.g., case_type:scam)"
                value={newPlaybook.trigger}
                onChange={(e) => setNewPlaybook(prev => ({ ...prev, trigger: e.target.value }))}
                className="oa-input"
              />
            </div>
            <Textarea
              placeholder="Description"
              value={newPlaybook.description}
              onChange={(e) => setNewPlaybook(prev => ({ ...prev, description: e.target.value }))}
              className="oa-input"
            />
            <Button className="oa-btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Playbook
            </Button>
          </CardContent>
        </Card>

        {/* Existing Playbooks */}
        <div className="grid gap-6">
          {playbooks.map((playbook) => (
            <Card key={playbook.id} className="oa-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      {playbook.name}
                      <Badge variant={playbook.isActive ? "default" : "secondary"}>
                        {playbook.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <p className="text-oa-gray text-sm">{playbook.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => executePlaybook(playbook)}
                      className="oa-btn-primary"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Execute
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => togglePlaybook(playbook.id)}
                    >
                      {playbook.isActive ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Trigger Condition</h4>
                    <code className="bg-gray-800 px-2 py-1 rounded text-sm">{playbook.trigger}</code>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Actions ({playbook.actions.length})</h4>
                    <div className="space-y-2">
                      {playbook.actions.map((action, index) => (
                        <div key={action.id} className="flex items-center gap-3 p-3 bg-gray-800 rounded">
                          <span className="text-oa-gray text-sm">{index + 1}.</span>
                          <Badge>{action.type}</Badge>
                          <span className="text-sm text-oa-gray">
                            {JSON.stringify(action.parameters)}
                          </span>
                          {action.delay && (
                            <Badge variant="outline">Delay: {action.delay}s</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => addAction(playbook.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Action
                    </Button>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-oa-gray">
                    <span>Executed: {playbook.executionCount} times</span>
                    {playbook.lastExecuted && (
                      <span>Last run: {playbook.lastExecuted.toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
