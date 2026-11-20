export type ToastKind = "success" | "error";
export type AuthRestrictionStatus = 401 | 403;

export const SITE_TOAST_EVENT = "sharekit:toast";
export const AUTH_RESTRICTION_EVENT = "sharekit:auth-restriction";

type SiteToast = {
  kind: ToastKind;
  message: string;
};

type AuthRestriction = {
  status: AuthRestrictionStatus;
  message: string;
};

export function notify(kind: ToastKind, message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<SiteToast>(SITE_TOAST_EVENT, {
      detail: { kind, message },
    }),
  );
}

export function notifySuccess(message: string) {
  notify("success", message);
}

export function notifyError(message: string) {
  notify("error", message);
}

export function reportError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  notifyError(message);
  return message;
}

export function notifyAuthRestriction(
  status: AuthRestrictionStatus,
  message: string,
) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AuthRestriction>(AUTH_RESTRICTION_EVENT, {
      detail: { status, message },
    }),
  );
}
