"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import {
  AUTH_RESTRICTION_EVENT,
  SITE_TOAST_EVENT,
  type AuthRestrictionStatus,
  type ToastKind,
} from "@/lib/notifications";

type SiteToast = {
  kind: ToastKind;
  message: string;
};

type AuthRestriction = {
  status: AuthRestrictionStatus;
  message: string;
};

export default function SiteFeedback() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<SiteToast>).detail;
      if (!detail || typeof detail.message !== "string" || !detail.message.trim()) {
        return;
      }

      if (detail.kind === "success") toast.success(detail.message);
      if (detail.kind === "error") toast.error(detail.message);
    };

    const handleAuthRestriction = (event: Event) => {
      const detail = (event as CustomEvent<AuthRestriction>).detail;
      if (!detail || (detail.status !== 401 && detail.status !== 403)) return;

      const destination = detail.status === 401 ? "/unauthorized" : "/forbidden";
      if (pathname !== destination) router.replace(destination);
    };

    window.addEventListener(SITE_TOAST_EVENT, handleToast);
    window.addEventListener(AUTH_RESTRICTION_EVENT, handleAuthRestriction);
    return () => {
      window.removeEventListener(SITE_TOAST_EVENT, handleToast);
      window.removeEventListener(AUTH_RESTRICTION_EVENT, handleAuthRestriction);
    };
  }, [pathname, router]);

  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4500,
        className: "sharekit-toast",
        success: { duration: 3500 },
        error: { duration: 5500 },
      }}
    />
  );
}
