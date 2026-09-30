// utils/cycleUtils.js
// Lightweight, estimate-only cycle math. Nothing here is a medical prediction.

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

function daysBetween(a, b) {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

// entries: array of { startDate, endDate } sorted newest first
function getCycleSummary(entries) {
  if (!entries || entries.length === 0) {
    return {
      hasEnoughData: false,
      averageCycleLength: null,
      averagePeriodLength: null,
      currentCycleDay: null,
      phase: null,
      estimatedNextPeriod: null,
    };
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(b.startDate) - new Date(a.startDate)
  );

  // Average cycle length from gaps between consecutive start dates.
  const gaps = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = daysBetween(new Date(sorted[i + 1].startDate), new Date(sorted[i].startDate));
    if (gap > 10 && gap < 60) gaps.push(gap); // ignore obviously bad data
  }
  const averageCycleLength = gaps.length
    ? Math.round(gaps.reduce((s, g) => s + g, 0) / gaps.length)
    : DEFAULT_CYCLE_LENGTH;

  // Average period length from entries that have an end date.
  const periodLengths = sorted
    .filter((e) => e.endDate)
    .map((e) => daysBetween(new Date(e.startDate), new Date(e.endDate)) + 1)
    .filter((len) => len > 0 && len < 15);
  const averagePeriodLength = periodLengths.length
    ? Math.round(periodLengths.reduce((s, l) => s + l, 0) / periodLengths.length)
    : DEFAULT_PERIOD_LENGTH;

  const lastStart = new Date(sorted[0].startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  lastStart.setHours(0, 0, 0, 0);

  const daysSinceLastStart = daysBetween(lastStart, today);
  const currentCycleDay = daysSinceLastStart >= 0 ? daysSinceLastStart + 1 : null;

  let phase = null;
  const hasEnoughData = sorted.length >= 1;

  if (currentCycleDay !== null) {
    if (currentCycleDay <= averagePeriodLength) {
      phase = 'menstrual';
    } else if (currentCycleDay <= Math.round(averageCycleLength / 2) - 1) {
      phase = 'follicular';
    } else if (currentCycleDay <= Math.round(averageCycleLength / 2) + 1) {
      phase = 'ovulation';
    } else if (currentCycleDay <= averageCycleLength) {
      phase = 'luteal';
    } else {
      phase = 'luteal'; // cycle running long — still an estimate
    }
  }

  const estimatedNextPeriod = new Date(lastStart);
  estimatedNextPeriod.setDate(estimatedNextPeriod.getDate() + averageCycleLength);

  return {
    hasEnoughData,
    averageCycleLength,
    averagePeriodLength,
    currentCycleDay,
    phase,
    estimatedNextPeriod,
  };
}

module.exports = { getCycleSummary };
