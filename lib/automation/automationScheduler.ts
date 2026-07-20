type ScheduledJob = {
  id: string;
  timeout: ReturnType<typeof setTimeout>;
  executeAt: number;
};

export class AutomationScheduler {
  private jobs = new Map<string, ScheduledJob>();

  schedule(jobId: string, delayMs: number, callback: () => void): string {
    this.cancel(jobId);
    const executeAt = Date.now() + Math.max(0, delayMs);
    const timeout = setTimeout(() => {
      this.jobs.delete(jobId);
      callback();
    }, Math.max(0, delayMs));

    this.jobs.set(jobId, { id: jobId, timeout, executeAt });
    return jobId;
  }

  cancel(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;
    clearTimeout(job.timeout);
    this.jobs.delete(jobId);
    return true;
  }

  pending(): Array<{ id: string; executeAt: string }> {
    return [...this.jobs.values()].map((job) => ({
      id: job.id,
      executeAt: new Date(job.executeAt).toISOString(),
    }));
  }

  clearAll() {
    for (const job of this.jobs.values()) {
      clearTimeout(job.timeout);
    }
    this.jobs.clear();
  }
}
