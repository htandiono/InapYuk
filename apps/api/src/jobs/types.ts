export interface JobResult {
  job: string;
  processed: number;
  details?: Record<string, unknown>;
}

export interface JobDefinition {
  name: string;
  /** Standard 5-field cron expression used by the local dev scheduler. */
  schedule: string;
  run: () => Promise<JobResult>;
}
