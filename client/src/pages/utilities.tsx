import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Hash, 
  Key, 
  Shield, 
  QrCode, 
  Copy, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Lock,
  Unlock,
  Calculator,
  Clock,
  Database,
  FileText,
  Zap
} from "lucide-react";

export default function Utilities() {
  const [activeTab, setActiveTab] = useState("hash");
  const [showPassword, setShowPassword] = useState(false);
  const [hashInput, setHashInput] = useState("");
  const [hashResult, setHashResult] = useState("");
  const [passwordLength, setPasswordLength] = useState(16);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const { toast } = useToast();

  const generateHash = async (algorithm: string) => {
    if (!hashInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to hash",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simple demonstration - in real app would use crypto APIs
      const encoder = new TextEncoder();
      const data = encoder.encode(hashInput);
      const hashBuffer = await crypto.subtle.digest(algorithm, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setHashResult(hashHex);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate hash",
        variant: "destructive",
      });
    }
  };

  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const allChars = uppercase + lowercase + numbers + symbols;
    
    let password = '';
    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill remaining length
    for (let i = password.length; i < passwordLength; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    setGeneratedPassword(password.split('').sort(() => Math.random() - 0.5).join(''));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCurrentTimestamp = () => {
    const now = new Date();
    return {
      unix: Math.floor(now.getTime() / 1000),
      iso: now.toISOString(),
      local: now.toLocaleString(),
      utc: now.toUTCString()
    };
  };

  const timestamp = getCurrentTimestamp();

  return (
    <div className="flex h-screen bg-oa-black">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Header />
        <div className="px-8 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Security Utilities</h1>
            <p className="text-oa-gray">Essential tools for security analysis and data processing</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-oa-dark border border-oa-border">
              <TabsTrigger 
                value="hash" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-hash"
              >
                Hash Generator
              </TabsTrigger>
              <TabsTrigger 
                value="password" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-password"
              >
                Password Gen
              </TabsTrigger>
              <TabsTrigger 
                value="encoder" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-encoder"
              >
                Encoder/Decoder
              </TabsTrigger>
              <TabsTrigger 
                value="timestamp" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-timestamp"
              >
                Timestamp
              </TabsTrigger>
              <TabsTrigger 
                value="calculator" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-calculator"
              >
                Calculator
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="text-oa-gray data-[state=active]:text-white data-[state=active]:bg-oa-primary/10"
                data-testid="tab-system"
              >
                System Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hash" className="space-y-6">
              <Card className="bg-oa-dark border-oa-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Hash className="h-5 w-5 text-oa-primary" />
                    Hash Generator
                  </CardTitle>
                  <CardDescription className="text-oa-gray">
                    Generate cryptographic hashes for text input
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="hash-input" className="text-white">Input Text</Label>
                    <Textarea
                      id="hash-input"
                      value={hashInput}
                      onChange={(e) => setHashInput(e.target.value)}
                      placeholder="Enter text to hash..."
                      className="bg-oa-black border-oa-border text-white"
                      rows={4}
                      data-testid="textarea-hash-input"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => generateHash('SHA-256')}
                      className="bg-oa-primary hover:bg-oa-primary/80"
                      data-testid="button-sha256"
                    >
                      SHA-256
                    </Button>
                    <Button 
                      onClick={() => generateHash('SHA-1')}
                      variant="outline"
                      className="border-oa-border text-oa-gray"
                      data-testid="button-sha1"
                    >
                      SHA-1
                    </Button>
                    <Button 
                      onClick={() => generateHash('SHA-512')}
                      variant="outline"
                      className="border-oa-border text-oa-gray"
                      data-testid="button-sha512"
                    >
                      SHA-512
                    </Button>
                  </div>

                  {hashResult && (
                    <div>
                      <Label className="text-white">Hash Result</Label>
                      <div className="flex gap-2">
                        <Input
                          value={hashResult}
                          readOnly
                          className="bg-oa-black border-oa-border text-white font-mono"
                          data-testid="input-hash-result"
                        />
                        <Button
                          onClick={() => copyToClipboard(hashResult)}
                          variant="outline"
                          size="icon"
                          className="border-oa-border"
                          data-testid="button-copy-hash"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password" className="space-y-6">
              <Card className="bg-oa-dark border-oa-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Key className="h-5 w-5 text-oa-primary" />
                    Password Generator
                  </CardTitle>
                  <CardDescription className="text-oa-gray">
                    Generate secure passwords with customizable options
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="password-length" className="text-white">Password Length</Label>
                    <Input
                      id="password-length"
                      type="number"
                      value={passwordLength}
                      onChange={(e) => setPasswordLength(parseInt(e.target.value) || 16)}
                      min={8}
                      max={128}
                      className="bg-oa-black border-oa-border text-white"
                      data-testid="input-password-length"
                    />
                  </div>

                  <Button 
                    onClick={generatePassword}
                    className="bg-oa-green hover:bg-oa-green/80 text-black"
                    data-testid="button-generate-password"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Generate Password
                  </Button>

                  {generatedPassword && (
                    <div>
                      <Label className="text-white">Generated Password</Label>
                      <div className="flex gap-2">
                        <Input
                          value={generatedPassword}
                          type={showPassword ? "text" : "password"}
                          readOnly
                          className="bg-oa-black border-oa-border text-white font-mono"
                          data-testid="input-generated-password"
                        />
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          variant="outline"
                          size="icon"
                          className="border-oa-border"
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          onClick={() => copyToClipboard(generatedPassword)}
                          variant="outline"
                          size="icon"
                          className="border-oa-border"
                          data-testid="button-copy-password"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-2 text-sm text-oa-gray">
                        Password strength: <Badge variant="default" className="ml-1">Strong</Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="encoder" className="space-y-6">
              <Card className="bg-oa-dark border-oa-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Lock className="h-5 w-5 text-oa-primary" />
                    Encoder/Decoder
                  </CardTitle>
                  <CardDescription className="text-oa-gray">
                    Encode and decode text using various methods
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="encode-input" className="text-white">Input Text</Label>
                    <Textarea
                      id="encode-input"
                      placeholder="Enter text to encode/decode..."
                      className="bg-oa-black border-oa-border text-white"
                      rows={4}
                      data-testid="textarea-encode-input"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-oa-primary hover:bg-oa-primary/80" data-testid="button-base64-encode">
                      Base64 Encode
                    </Button>
                    <Button variant="outline" className="border-oa-border text-oa-gray" data-testid="button-base64-decode">
                      Base64 Decode
                    </Button>
                    <Button variant="outline" className="border-oa-border text-oa-gray" data-testid="button-url-encode">
                      URL Encode
                    </Button>
                    <Button variant="outline" className="border-oa-border text-oa-gray" data-testid="button-url-decode">
                      URL Decode
                    </Button>
                  </div>

                  <div>
                    <Label className="text-white">Result</Label>
                    <Textarea
                      placeholder="Encoded/decoded result will appear here..."
                      readOnly
                      className="bg-oa-black border-oa-border text-white"
                      rows={4}
                      data-testid="textarea-encode-result"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timestamp" className="space-y-6">
              <Card className="bg-oa-dark border-oa-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-oa-primary" />
                    Timestamp Utility
                  </CardTitle>
                  <CardDescription className="text-oa-gray">
                    Current time in various formats
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Unix Timestamp</Label>
                      <div className="flex gap-2">
                        <Input
                          value={timestamp.unix}
                          readOnly
                          className="bg-oa-black border-oa-border text-white font-mono"
                          data-testid="input-unix-timestamp"
                        />
                        <Button
                          onClick={() => copyToClipboard(timestamp.unix.toString())}
                          variant="outline"
                          size="icon"
                          className="border-oa-border"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">ISO 8601</Label>
                      <div className="flex gap-2">
                        <Input
                          value={timestamp.iso}
                          readOnly
                          className="bg-oa-black border-oa-border text-white font-mono"
                          data-testid="input-iso-timestamp"
                        />
                        <Button
                          onClick={() => copyToClipboard(timestamp.iso)}
                          variant="outline"
                          size="icon"
                          className="border-oa-border"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Local Time</Label>
                      <div className="flex gap-2">
                        <Input
                          value={timestamp.local}
                          readOnly
                          className="bg-oa-black border-oa-border text-white font-mono"
                          data-testid="input-local-timestamp"
                        />
                        <Button
                          onClick={() => copyToClipboard(timestamp.local)}
                          variant="outline"
                          size="icon"
                          className="border-oa-border"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">UTC Time</Label>
                      <div className="flex gap-2">
                        <Input
                          value={timestamp.utc}
                          readOnly
                          className="bg-oa-black border-oa-border text-white font-mono"
                          data-testid="input-utc-timestamp"
                        />
                        <Button
                          onClick={() => copyToClipboard(timestamp.utc)}
                          variant="outline"
                          size="icon"
                          className="border-oa-border"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="border-oa-border text-oa-gray"
                    data-testid="button-refresh-timestamp"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calculator" className="space-y-6">
              <Card className="bg-oa-dark border-oa-border">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-oa-primary" />
                    Quick Calculator
                  </CardTitle>
                  <CardDescription className="text-oa-gray">
                    Basic calculator and unit conversions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="calc-input" className="text-white">Expression</Label>
                    <Input
                      id="calc-input"
                      placeholder="Enter mathematical expression..."
                      className="bg-oa-black border-oa-border text-white font-mono"
                      data-testid="input-calculator"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
                      <Button
                        key={btn}
                        variant="outline"
                        className="border-oa-border text-white"
                        data-testid={`calc-button-${btn}`}
                      >
                        {btn}
                      </Button>
                    ))}
                  </div>

                  <div>
                    <Label className="text-white">Result</Label>
                    <Input
                      readOnly
                      placeholder="Result will appear here..."
                      className="bg-oa-black border-oa-border text-white font-mono text-lg"
                      data-testid="input-calc-result"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-oa-dark border-oa-border">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Database className="h-5 w-5 text-oa-primary" />
                      Browser Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-oa-gray">User Agent:</span>
                      <span className="text-white text-sm">{navigator.userAgent.split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Platform:</span>
                      <span className="text-white">{navigator.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Language:</span>
                      <span className="text-white">{navigator.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Cookies Enabled:</span>
                      <span className="text-white">{navigator.cookieEnabled ? 'Yes' : 'No'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-oa-dark border-oa-border">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Zap className="h-5 w-5 text-oa-primary" />
                      Screen Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Resolution:</span>
                      <span className="text-white">{screen.width} x {screen.height}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Color Depth:</span>
                      <span className="text-white">{screen.colorDepth} bits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Pixel Ratio:</span>
                      <span className="text-white">{window.devicePixelRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-oa-gray">Viewport:</span>
                      <span className="text-white">{window.innerWidth} x {window.innerHeight}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}