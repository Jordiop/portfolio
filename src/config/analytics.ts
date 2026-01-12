/**
 * Analytics Configuration
 *
 * This file provides helper functions for tracking analytics events.
 * It works with Plausible, Simple Analytics, or Google Analytics.
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
}

/**
 * Track a custom event
 * Works with Plausible Analytics (window.plausible),
 * Simple Analytics (window.sa_event), or Google Analytics (window.gtag)
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;

  try {
    if (
      "plausible" in window &&
      typeof (window as any).plausible === "function"
    ) {
      (window as any).plausible(event.name, { props: event.properties });
      return;
    }

    if (
      "sa_event" in window &&
      typeof (window as any).sa_event === "function"
    ) {
      (window as any).sa_event(event.name);
      return;
    }

    if ("gtag" in window && typeof (window as any).gtag === "function") {
      (window as any).gtag("event", event.name, event.properties);
      return;
    }

    if (import.meta.env.DEV) {
      console.log("[Analytics Event]", event.name, event.properties);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Failed to track analytics event:", error);
    }
  }
}

/**
 * Track page views (useful for SPA navigation)
 * Most analytics providers auto-track page views, but this can be used manually
 */
export function trackPageView(path: string): void {
  trackEvent({
    name: "pageview",
    properties: {
      path,
    },
  });
}

/**
 * Common event tracking helpers
 */
export const analytics = {
  projectViewed: (projectId: number | string) => {
    trackEvent({
      name: "project_viewed",
      properties: { project_id: projectId },
    });
  },

  resumeDownloaded: () => {
    trackEvent({
      name: "resume_downloaded",
    });
  },

  externalLinkClicked: (url: string, label: string) => {
    trackEvent({
      name: "external_link_clicked",
      properties: { url, label },
    });
  },

  socialLinkClicked: (platform: string) => {
    trackEvent({
      name: "social_link_clicked",
      properties: { platform },
    });
  },

  themeChanged: (theme: "light" | "dark") => {
    trackEvent({
      name: "theme_changed",
      properties: { theme },
    });
  },

  commandPaletteOpened: () => {
    trackEvent({
      name: "command_palette_opened",
    });
  },
};
