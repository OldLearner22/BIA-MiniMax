import { TimeValue } from "../types";

const UNIT_TO_MINUTES: Record<string, number> = {
  minutes: 1,
  hours: 60,
  days: 24 * 60,
  weeks: 7 * 24 * 60,
};

export const convertToMinutes = (time?: TimeValue): number => {
  if (!time) return 0;
  // Handle edge case where unit might not match exactly or extend in future
  const multiplier = UNIT_TO_MINUTES[time.unit] || 0;
  return time.value * multiplier;
};

// processRto is typically stored as a number (hours) in RecoveryObjective
// resourceRto is a TimeValue object
export const isRtoCompliant = (
  processRto: number | undefined,
  resourceRto: TimeValue | undefined,
): boolean => {
  if (processRto === undefined || !resourceRto) return true; // Cannot validate if missing data

  const processMinutes = processRto * 60; // Assume process RTO is in hours
  const resourceMinutes = convertToMinutes(resourceRto);

  // Resource RTO must be <= Process RTO to be compliant
  return resourceMinutes <= processMinutes;
};
