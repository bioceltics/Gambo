/**
 * Generation Status Manager
 * Tracks and persists bundle generation progress for real-time UI updates
 */

import * as fs from 'fs';
import * as path from 'path';

export interface GenerationStatus {
  status: 'idle' | 'generating' | 'complete' | 'error';
  currentStep?: string;
  progress?: {
    fixturesFetched?: number;
    fixturesAnalyzed?: number;
    bundlesCreated?: number;
    totalFixtures?: number;
  };
  lastGeneration?: string;
  nextGeneration?: string;
  errorMessage?: string;
  activities?: string[];
  startTime?: string;
  endTime?: string;
}

const STATUS_FILE_PATH = path.join(process.cwd(), 'logs', 'generation-status.json');
const LOG_DIR = path.join(process.cwd(), 'logs');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

class GenerationStatusManager {
  private status: GenerationStatus = {
    status: 'idle',
    activities: []
  };

  constructor() {
    this.loadStatus();
  }

  private loadStatus(): void {
    try {
      if (fs.existsSync(STATUS_FILE_PATH)) {
        const data = fs.readFileSync(STATUS_FILE_PATH, 'utf-8');
        this.status = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load generation status:', error);
    }
  }

  private saveStatus(): void {
    try {
      fs.writeFileSync(STATUS_FILE_PATH, JSON.stringify(this.status, null, 2));
    } catch (error) {
      console.error('Failed to save generation status:', error);
    }
  }

  startGeneration(): void {
    this.status = {
      status: 'generating',
      currentStep: 'Initializing',
      progress: {
        fixturesFetched: 0,
        fixturesAnalyzed: 0,
        bundlesCreated: 0,
        totalFixtures: 0
      },
      activities: ['🚀 Bundle generation started'],
      startTime: new Date().toISOString()
    };
    this.saveStatus();
  }

  updateStep(step: string): void {
    this.status.currentStep = step;
    this.addActivity(step);
    this.saveStatus();
  }

  addActivity(activity: string): void {
    if (!this.status.activities) {
      this.status.activities = [];
    }

    const timestamp = new Date().toLocaleTimeString();
    this.status.activities.push(`[${timestamp}] ${activity}`);

    // Keep only last 20 activities
    if (this.status.activities.length > 20) {
      this.status.activities = this.status.activities.slice(-20);
    }

    this.saveStatus();
  }

  updateProgress(updates: Partial<GenerationStatus['progress']>): void {
    if (!this.status.progress) {
      this.status.progress = {};
    }

    this.status.progress = {
      ...this.status.progress,
      ...updates
    };

    this.saveStatus();
  }

  completeGeneration(bundlesCreated: number): void {
    this.status.status = 'complete';
    this.status.currentStep = 'Complete';
    this.status.lastGeneration = new Date().toISOString();
    this.status.endTime = new Date().toISOString();

    if (this.status.progress) {
      this.status.progress.bundlesCreated = bundlesCreated;
    }

    this.addActivity(`✅ Generation complete! Created ${bundlesCreated} bundles`);
    this.saveStatus();

    // Reset to idle after 5 seconds
    setTimeout(() => {
      this.status.status = 'idle';
      this.saveStatus();
    }, 5000);
  }

  failGeneration(error: string): void {
    this.status.status = 'error';
    this.status.currentStep = 'Failed';
    this.status.errorMessage = error;
    this.status.endTime = new Date().toISOString();
    this.addActivity(`❌ Generation failed: ${error}`);
    this.saveStatus();

    // Reset to idle after 10 seconds
    setTimeout(() => {
      this.status.status = 'idle';
      this.saveStatus();
    }, 10000);
  }

  getStatus(): GenerationStatus {
    return { ...this.status };
  }
}

// Singleton instance
export const generationStatusManager = new GenerationStatusManager();
