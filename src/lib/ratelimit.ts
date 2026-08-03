import {
  MAX_BILL_UPLOADS_PER_WINDOW,
  BILL_UPLOAD_RATE_LIMIT_WINDOW_IN_MS,
  MAX_BILL_SUMMARY_REQUESTS_PER_WINDOW,
  BILL_SUMMARY_RATE_LIMIT_WINDOW_IN_MS,
} from '@/constants/rateLimit';

const rateLimitStore = new Map<string, number[]>();

function isRequestAllowed({
  key,
  maxRequests,
  windowInMs,
}: {
  key: string;
  maxRequests: number;
  windowInMs: number;
}): boolean {
  const now = Date.now();
  const previousTimestamps = rateLimitStore.get(key) ?? [];
  const timestampsInsideWindow = previousTimestamps.filter(
    (timestamp) => now - timestamp < windowInMs,
  );

  const hasReachedLimit = timestampsInsideWindow.length >= maxRequests;

  if (hasReachedLimit) {
    rateLimitStore.set(key, timestampsInsideWindow);
    return false;
  }

  timestampsInsideWindow.push(now);
  rateLimitStore.set(key, timestampsInsideWindow);

  return true;
}

export function checkBillUploadRateLimit({ userId }: { userId: string }): boolean {
  const isAllowed = isRequestAllowed({
    key: `bill-upload:${userId}`,
    maxRequests: MAX_BILL_UPLOADS_PER_WINDOW,
    windowInMs: BILL_UPLOAD_RATE_LIMIT_WINDOW_IN_MS,
  });

  return !isAllowed;
}

export function checkBillSummaryRateLimit({ billId }: { billId: string }): boolean {
  const isAllowed = isRequestAllowed({
    key: `bill-summary:${billId}`,
    maxRequests: MAX_BILL_SUMMARY_REQUESTS_PER_WINDOW,
    windowInMs: BILL_SUMMARY_RATE_LIMIT_WINDOW_IN_MS,
  });

  return !isAllowed;
}