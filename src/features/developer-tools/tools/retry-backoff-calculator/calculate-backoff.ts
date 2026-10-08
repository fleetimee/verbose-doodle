export type BackoffStrategy = "fixed" | "exponential";
export type JitterMode = "none" | "full" | "equal";
export type BackoffPolicy = {
  strategy: BackoffStrategy;
  jitter: JitterMode;
  retries: number;
  delay: number;
  multiplier: number;
  cap: number;
  timeout: number;
  budget: number | null;
};

export function calculateBackoff(policy: BackoffPolicy) {
  let expectedStart = 0;
  let maximumStart = 0;
  const initialFits = policy.budget === null || policy.timeout <= policy.budget;
  const rows = [
    {
      attempt: 1,
      minimumDelay: 0,
      maximumDelay: 0,
      expectedDelay: 0,
      expectedStart: 0,
      maximumStart: 0,
      maximumFinish: policy.timeout,
      fits: initialFits,
    },
  ];
  for (let retry = 0; retry < policy.retries; retry += 1) {
    const maximumDelay = Math.min(
      policy.cap,
      policy.delay *
        (policy.strategy === "exponential" ? policy.multiplier ** retry : 1)
    );
    let minimumDelay = maximumDelay;
    if (policy.jitter === "full") {
      minimumDelay = 0;
    } else if (policy.jitter === "equal") {
      minimumDelay = maximumDelay / 2;
    }
    const expectedDelay = (minimumDelay + maximumDelay) / 2;
    expectedStart += policy.timeout + expectedDelay;
    maximumStart += policy.timeout + maximumDelay;
    const maximumFinish = maximumStart + policy.timeout;
    rows.push({
      attempt: retry + 2,
      minimumDelay,
      maximumDelay,
      expectedDelay,
      expectedStart,
      maximumStart,
      maximumFinish,
      fits: policy.budget === null || maximumFinish <= policy.budget,
    });
  }
  return {
    rows,
    expectedTotal: expectedStart + policy.timeout,
    maximumTotal: maximumStart + policy.timeout,
    fittingAttempts: rows.filter((row) => row.fits).length,
  };
}
