
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Settings, AlertTriangle, TrendingUp, Shield } from "lucide-react";

interface AIControlSettings {
  contentModeration: {
    strictness: number; // 0-100
    sensitivity: number; // 0-100
    autoAction: boolean;
    flagThreshold: number; // 0-100
  };
  fraudDetection: {
    strictness: number;
    realTimeScanning: boolean;
    behavioralAnalysis: boolean;
    crossPlatformMatching: boolean;
  };
  impersonationDetection: {
    similarity_threshold: number; // 0-100
    autoQuarantine: boolean;
    alertLevel: 'low' | 'medium' | 'high';
  };
  trustScoring: {
    updateFrequency: number; // minutes
    autoAdjustments: boolean;
    weightings: {
      transactions: number;
      feedback: number;
      reports: number;
      timeInCommunity: number;
    };
  };
}

export default function AIModerationControls() {
  const [settings, setSettings] = useState<AIControlSettings>({
    contentModeration: {
      strictness: 75,
      sensitivity: 60,
      autoAction: true,
      flagThreshold: 85
    },
    fraudDetection: {
      strictness: 80,
      realTimeScanning: true,
      behavioralAnalysis: true,
      crossPlatformMatching: true
    },
    impersonationDetection: {
      similarity_threshold: 85,
      autoQuarantine: false,
      alertLevel: 'medium'
    },
    trustScoring: {
      updateFrequency: 60,
      autoAdjustments: true,
      weightings: {
        transactions: 25,
        feedback: 20,
        reports: 30,
        timeInCommunity: 25
      }
    }
  });

  const [aiStatus, setAiStatus] = useState({
    isActive: true,
    processedToday: 1247,
    flaggedContent: 23,
    falsePositives: 2,
    accuracy: 97.8
  });

  const updateSetting = (category: keyof AIControlSettings, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const updateWeighting = (type: keyof AIControlSettings['trustScoring']['weightings'], value: number) => {
    // Ensure weightings always sum to 100
    const currentWeightings = { ...settings.trustScoring.weightings };
    const oldValue = currentWeightings[type];
    const difference = value - oldValue;
    
    // Distribute the difference across other weightings
    const otherTypes = Object.keys(currentWeightings).filter(k => k !== type) as Array<keyof typeof currentWeightings>;
    const adjustmentPerOther = -difference / otherTypes.length;
    
    const newWeightings = { ...currentWeightings };
    newWeightings[type] = value;
    
    otherTypes.forEach(t => {
      newWeightings[t] = Math.max(0, Math.min(100, newWeightings[t] + adjustmentPerOther));
    });
    
    setSettings(prev => ({
      ...prev,
      trustScoring: {
        ...prev.trustScoring,
        weightings: newWeightings
      }
    }));
  };

  const saveSettings = async () => {
    // In real implementation, this would save to backend
    console.log('Saving AI moderation settings:', settings);
  };

  return (
    <div className="min-h-screen bg-oa-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-400" />
            AI Moderation Controls
          </h1>
          <p className="text-oa-gray">Configure AI behavior and moderation thresholds in real time</p>
        </div>

        {/* AI Status Overview */}
        <Card className="oa-card mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              AI System Status
              <Badge className={aiStatus.isActive ? "bg-green-500" : "bg-red-500"}>
                {aiStatus.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-400">{aiStatus.processedToday}</div>
                <div className="text-sm text-gray-400">Items Processed Today</div>
              </div>
              <div className="text-center p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <div className="text-2xl font-bold text-orange-400">{aiStatus.flaggedContent}</div>
                <div className="text-sm text-gray-400">Content Flagged</div>
              </div>
              <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div className="text-2xl font-bold text-red-400">{aiStatus.falsePositives}</div>
                <div className="text-sm text-gray-400">False Positives</div>
              </div>
              <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="text-2xl font-bold text-green-400">{aiStatus.accuracy}%</div>
                <div className="text-sm text-gray-400">Accuracy Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration Tabs */}
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Content Moderation</TabsTrigger>
            <TabsTrigger value="fraud">Fraud Detection</TabsTrigger>
            <TabsTrigger value="impersonation">Impersonation</TabsTrigger>
            <TabsTrigger value="trust">Trust Scoring</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <Card className="oa-card">
              <CardHeader>
                <CardTitle className="text-white">Content Moderation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-white block mb-2">Strictness Level: {settings.contentModeration.strictness}%</label>
                  <Slider
                    value={[settings.contentModeration.strictness]}
                    onValueChange={([value]) => updateSetting('contentModeration', 'strictness', value)}
                    max={100}
                    step={5}
                    className="mb-4"
                  />
                  <p className="text-sm text-oa-gray">Higher values mean stricter content filtering</p>
                </div>

                <div>
                  <label className="text-white block mb-2">Sensitivity: {settings.contentModeration.sensitivity}%</label>
                  <Slider
                    value={[settings.contentModeration.sensitivity]}
                    onValueChange={([value]) => updateSetting('contentModeration', 'sensitivity', value)}
                    max={100}
                    step={5}
                    className="mb-4"
                  />
                  <p className="text-sm text-oa-gray">Sensitivity to detecting harmful content</p>
                </div>

                <div>
                  <label className="text-white block mb-2">Auto-Action Threshold: {settings.contentModeration.flagThreshold}%</label>
                  <Slider
                    value={[settings.contentModeration.flagThreshold]}
                    onValueChange={([value]) => updateSetting('contentModeration', 'flagThreshold', value)}
                    max={100}
                    step={5}
                    className="mb-4"
                  />
                  <p className="text-sm text-oa-gray">Confidence level required for automatic actions</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Enable Automatic Actions</h4>
                    <p className="text-sm text-oa-gray">Allow AI to take actions automatically</p>
                  </div>
                  <Switch
                    checked={settings.contentModeration.autoAction}
                    onCheckedChange={(checked) => updateSetting('contentModeration', 'autoAction', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fraud">
            <Card className="oa-card">
              <CardHeader>
                <CardTitle className="text-white">Fraud Detection Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-white block mb-2">Detection Strictness: {settings.fraudDetection.strictness}%</label>
                  <Slider
                    value={[settings.fraudDetection.strictness]}
                    onValueChange={([value]) => updateSetting('fraudDetection', 'strictness', value)}
                    max={100}
                    step={5}
                    className="mb-4"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Real-Time Scanning</h4>
                      <p className="text-sm text-oa-gray">Scan all transactions in real-time</p>
                    </div>
                    <Switch
                      checked={settings.fraudDetection.realTimeScanning}
                      onCheckedChange={(checked) => updateSetting('fraudDetection', 'realTimeScanning', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Behavioral Analysis</h4>
                      <p className="text-sm text-oa-gray">Analyze user behavior patterns</p>
                    </div>
                    <Switch
                      checked={settings.fraudDetection.behavioralAnalysis}
                      onCheckedChange={(checked) => updateSetting('fraudDetection', 'behavioralAnalysis', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Cross-Platform Matching</h4>
                      <p className="text-sm text-oa-gray">Match users across platforms</p>
                    </div>
                    <Switch
                      checked={settings.fraudDetection.crossPlatformMatching}
                      onCheckedChange={(checked) => updateSetting('fraudDetection', 'crossPlatformMatching', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trust">
            <Card className="oa-card">
              <CardHeader>
                <CardTitle className="text-white">Trust Scoring Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-white block mb-2">Update Frequency: {settings.trustScoring.updateFrequency} minutes</label>
                  <Slider
                    value={[settings.trustScoring.updateFrequency]}
                    onValueChange={([value]) => updateSetting('trustScoring', 'updateFrequency', value)}
                    min={5}
                    max={1440}
                    step={5}
                    className="mb-4"
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-white font-medium">Score Weightings (must sum to 100%)</h4>
                  
                  <div>
                    <label className="text-white block mb-2">Transactions: {settings.trustScoring.weightings.transactions}%</label>
                    <Slider
                      value={[settings.trustScoring.weightings.transactions]}
                      onValueChange={([value]) => updateWeighting('transactions', value)}
                      max={100}
                      step={5}
                      className="mb-2"
                    />
                  </div>

                  <div>
                    <label className="text-white block mb-2">Feedback: {settings.trustScoring.weightings.feedback}%</label>
                    <Slider
                      value={[settings.trustScoring.weightings.feedback]}
                      onValueChange={([value]) => updateWeighting('feedback', value)}
                      max={100}
                      step={5}
                      className="mb-2"
                    />
                  </div>

                  <div>
                    <label className="text-white block mb-2">Reports: {settings.trustScoring.weightings.reports}%</label>
                    <Slider
                      value={[settings.trustScoring.weightings.reports]}
                      onValueChange={([value]) => updateWeighting('reports', value)}
                      max={100}
                      step={5}
                      className="mb-2"
                    />
                  </div>

                  <div>
                    <label className="text-white block mb-2">Community Time: {settings.trustScoring.weightings.timeInCommunity}%</label>
                    <Slider
                      value={[settings.trustScoring.weightings.timeInCommunity]}
                      onValueChange={([value]) => updateWeighting('timeInCommunity', value)}
                      max={100}
                      step={5}
                      className="mb-2"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Auto-Adjustments</h4>
                    <p className="text-sm text-oa-gray">Allow AI to adjust scores automatically</p>
                  </div>
                  <Switch
                    checked={settings.trustScoring.autoAdjustments}
                    onCheckedChange={(checked) => updateSetting('trustScoring', 'autoAdjustments', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-8">
          <Button onClick={saveSettings} className="oa-btn-primary">
            <Settings className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
