export function getSafeRedirectPath({ redirectTo }: { redirectTo: string | null }): string {
  const isMissing = !redirectTo;
  const isInternalPath = redirectTo?.startsWith('/') && !redirectTo.startsWith('//');

  if (isMissing || !isInternalPath) return '/';

  return redirectTo;
}