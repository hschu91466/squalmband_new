// src/utils/formatDate.js
export function formatDateTime(mysqlTimestamp, options = {}) {
  if (!mysqlTimestamp) return "—";

  const date = new Date(mysqlTimestamp.replace(" ", "T") + "Z");

  return date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  });
}
