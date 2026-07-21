const STORAGE_PREFIX = "fjl:analytics:";

export function trackPlausibleOnce(scope, eventKey, eventName, props = {}) {
  if (!scope || typeof scope.plausible !== "function") return false;

  const storageKey = `${STORAGE_PREFIX}${eventKey}`;
  try {
    if (scope.sessionStorage?.getItem(storageKey)) return false;
  } catch {
    // Plausible can still receive the event when browser storage is restricted.
  }

  scope.plausible(eventName, { props });
  try {
    scope.sessionStorage?.setItem(storageKey, "1");
  } catch {
    // Tracking should not break the experience when storage is restricted.
  }
  return true;
}
