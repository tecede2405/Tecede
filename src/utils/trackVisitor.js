import { getVisitorId } from "./visitor";

export const trackVisit = (page) => {
  fetch(`${process.env.REACT_APP_API_URL}/api/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      visitorId: getVisitorId(),
      page,
      userAgent: navigator.userAgent,
      referrer: document.referrer || "direct",
    }),
  }).catch(() => {});
};
