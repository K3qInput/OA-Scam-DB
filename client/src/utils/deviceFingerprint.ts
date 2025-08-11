import { nanoid } from 'nanoid';

export interface DeviceFingerprint {
  fingerprint: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  browserVersion: string;
  plugins: string[];
  fonts: string[];
  hardwareConcurrency: number;
  deviceMemory: number;
  connectionType: string;
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  riskScore: number;
}

class DeviceFingerprintGenerator {
  private static instance: DeviceFingerprintGenerator;
  
  public static getInstance(): DeviceFingerprintGenerator {
    if (!DeviceFingerprintGenerator.instance) {
      DeviceFingerprintGenerator.instance = new DeviceFingerprintGenerator();
    }
    return DeviceFingerprintGenerator.instance;
  }

  private getScreenResolution(): string {
    return `${screen.width}x${screen.height}x${screen.colorDepth}`;
  }

  private getTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  private getLanguage(): string {
    return navigator.language || 'unknown';
  }

  private getPlatform(): string {
    return navigator.platform || 'unknown';
  }

  private getBrowserVersion(): string {
    const userAgent = navigator.userAgent;
    
    // Extract browser and version from user agent
    if (userAgent.includes('Chrome')) {
      const match = userAgent.match(/Chrome\/(\d+\.\d+)/);
      return match ? `Chrome ${match[1]}` : 'Chrome unknown';
    }
    if (userAgent.includes('Firefox')) {
      const match = userAgent.match(/Firefox\/(\d+\.\d+)/);
      return match ? `Firefox ${match[1]}` : 'Firefox unknown';
    }
    if (userAgent.includes('Safari')) {
      const match = userAgent.match(/Safari\/(\d+\.\d+)/);
      return match ? `Safari ${match[1]}` : 'Safari unknown';
    }
    if (userAgent.includes('Edge')) {
      const match = userAgent.match(/Edge\/(\d+\.\d+)/);
      return match ? `Edge ${match[1]}` : 'Edge unknown';
    }
    
    return 'Unknown browser';
  }

  private getPlugins(): string[] {
    if (!navigator.plugins) return [];
    
    const plugins: string[] = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    return plugins.sort();
  }

  private async getFonts(): Promise<string[]> {
    const fonts = [
      'Arial', 'Arial Black', 'Comic Sans MS', 'Courier', 'Courier New',
      'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 'Tahoma',
      'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana', 'Palatino',
      'Garamond', 'Bookman', 'Avant Garde', 'Calibri', 'Cambria'
    ];
    
    const availableFonts: string[] = [];
    
    // Create a test string for font detection
    const testString = 'mmmmmmmmmmlli';
    const testSize = '72px';
    
    // Create canvas for font testing
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return [];
    
    // Baseline measurements with default fonts
    context.font = `${testSize} monospace`;
    const baselineMonospace = context.measureText(testString).width;
    
    context.font = `${testSize} sans-serif`;
    const baselineSansSerif = context.measureText(testString).width;
    
    // Test each font
    for (const font of fonts) {
      context.font = `${testSize} "${font}", monospace`;
      const monospaceTest = context.measureText(testString).width;
      
      context.font = `${testSize} "${font}", sans-serif`;
      const sansSerifTest = context.measureText(testString).width;
      
      // If measurements differ from baseline, font is available
      if (monospaceTest !== baselineMonospace || sansSerifTest !== baselineSansSerif) {
        availableFonts.push(font);
      }
    }
    
    return availableFonts;
  }

  private getHardwareConcurrency(): number {
    return navigator.hardwareConcurrency || 0;
  }

  private getDeviceMemory(): number {
    return (navigator as any).deviceMemory || 0;
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      return `${connection.effectiveType || 'unknown'}-${connection.type || 'unknown'}`;
    }
    return 'unknown';
  }

  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return 'no-canvas';
      
      // Create a unique canvas pattern
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('OwnersAlliance Fingerprint 🔒', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Security Check', 4, 45);
      
      // Add some geometric shapes
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgb(255,0,255)';
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      
      return canvas.toDataURL();
    } catch (e) {
      return 'canvas-error';
    }
  }

  private getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') as WebGLRenderingContext || 
                 canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      if (!gl) return 'no-webgl';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
      const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
      
      return `${vendor}-${renderer}`;
    } catch (e) {
      return 'webgl-error';
    }
  }

  private getAudioFingerprint(): string {
    try {
      // Create audio context for fingerprinting
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(0);
      
      // Get frequency data
      const frequencyData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(frequencyData);
      
      oscillator.stop();
      audioContext.close();
      
      return Array.from(frequencyData.slice(0, 10)).join(',');
    } catch (e) {
      return 'audio-error';
    }
  }

  private calculateRiskScore(fingerprint: Partial<DeviceFingerprint>): number {
    let riskScore = 0;
    
    // Check for suspicious patterns
    if (fingerprint.plugins && fingerprint.plugins.length === 0) {
      riskScore += 20; // No plugins might indicate headless browser
    }
    
    if (fingerprint.fonts && fingerprint.fonts.length < 5) {
      riskScore += 15; // Too few fonts might indicate virtual environment
    }
    
    if (fingerprint.canvasFingerprint === 'canvas-error' || 
        fingerprint.webglFingerprint === 'webgl-error') {
      riskScore += 25; // Canvas/WebGL errors might indicate bot
    }
    
    if (fingerprint.hardwareConcurrency === 0 || fingerprint.deviceMemory === 0) {
      riskScore += 10; // Missing hardware info
    }
    
    if (fingerprint.timezone === 'UTC' && fingerprint.language === 'en-US') {
      riskScore += 15; // Common bot configuration
    }
    
    // Check for VPN/proxy indicators
    if (fingerprint.connectionType === 'unknown-unknown') {
      riskScore += 10;
    }
    
    return Math.min(riskScore, 100);
  }

  public async generateFingerprint(): Promise<DeviceFingerprint> {
    const components: Partial<DeviceFingerprint> = {
      screenResolution: this.getScreenResolution(),
      timezone: this.getTimezone(),
      language: this.getLanguage(),
      platform: this.getPlatform(),
      browserVersion: this.getBrowserVersion(),
      plugins: this.getPlugins(),
      fonts: await this.getFonts(),
      hardwareConcurrency: this.getHardwareConcurrency(),
      deviceMemory: this.getDeviceMemory(),
      connectionType: this.getConnectionType(),
      canvasFingerprint: this.getCanvasFingerprint(),
      webglFingerprint: this.getWebGLFingerprint(),
      audioFingerprint: this.getAudioFingerprint(),
    };
    
    // Calculate risk score
    components.riskScore = this.calculateRiskScore(components);
    
    // Create unique fingerprint hash
    const fingerprintString = JSON.stringify([
      components.screenResolution,
      components.timezone,
      components.language,
      components.platform,
      components.browserVersion,
      components.plugins?.join(','),
      components.fonts?.join(','),
      components.hardwareConcurrency,
      components.deviceMemory,
      components.connectionType,
      components.canvasFingerprint?.substring(0, 100), // Truncate for performance
      components.webglFingerprint,
      components.audioFingerprint,
    ]);
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    components.fingerprint = `fp_${Math.abs(hash).toString(16)}_${nanoid(8)}`;
    
    return components as DeviceFingerprint;
  }
}

export const deviceFingerprintGenerator = DeviceFingerprintGenerator.getInstance();

// Utility function for easy use
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  return deviceFingerprintGenerator.generateFingerprint();
}

// Store fingerprint in localStorage for persistence
export function getStoredFingerprint(): string | null {
  return localStorage.getItem('device_fingerprint');
}

export function setStoredFingerprint(fingerprint: string): void {
  localStorage.setItem('device_fingerprint', fingerprint);
}

// Check if current fingerprint matches stored one
export async function validateStoredFingerprint(): Promise<boolean> {
  const stored = getStoredFingerprint();
  if (!stored) return false;
  
  const current = await generateDeviceFingerprint();
  return stored === current.fingerprint;
}