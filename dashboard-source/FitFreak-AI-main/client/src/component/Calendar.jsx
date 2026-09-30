import React, { useEffect, useState, useMemo } from "react";
import axios from "../api/axiosInstance";
import { useAuth } from "../context/useAuth";
import "./Calendar.css";

/**
 * Always returns a 6x7 grid (6 weeks, 7 days) so layout height never changes.
 */
const getMonthData = (year, month) => {
  const weeks = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const numDays = lastDay.getDate();
  const startWeekday = firstDay.getDay();

  // Start currentDay so that the first week will have leading nulls for days before the 1st
  let currentDay = 1 - startWeekday;

  for (let week = 0; week < 6; week++) {
    const weekRow = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      if (currentDay < 1 || currentDay > numDays) {
        weekRow.push(null);
      } else {
        weekRow.push(new Date(year, month, currentDay));
      }
      currentDay++;
    }
    weeks.push(weekRow);
  }

  return weeks;
};

// Local YYYY-MM-DD key. toISOString() converts to UTC, which shifts dates by a
// day for users east/west of UTC and broke the "today" highlight.
const localKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function Calendar({ showSkeleton = false }) {
  const { token } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(Boolean(token && !showSkeleton));

  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() };
  });

  // Keep wrapper visible while loading to avoid remount jumps
  const shouldShowSkeleton = showSkeleton || !token || loading;

  useEffect(() => {
    let mounted = true;
    if (!token || showSkeleton) {
      setLoading(false);
      return () => (mounted = false);
    }

    async function fetchProgress() {
      setLoading(true);
      try {
        const res = await axios.get("/progress", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!mounted) return;
        setProgress(res.data || []);
      } catch (err) {
        console.error("Error fetching progress:", err?.response?.data || err);
        if (!mounted) return;
        setProgress([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProgress();
    return () => (mounted = false);
  }, [token, showSkeleton]);

  // monthData will always be a 6x7 grid (stable height)
  const monthData = useMemo(
    () => getMonthData(currentMonth.year, currentMonth.month),
    [currentMonth.year, currentMonth.month]
  );

  const today = new Date();
  const todayStr = localKey(today);

  const gotoPrevMonth = () => {
    setCurrentMonth(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
    );
  };

  const gotoNextMonth = () => {
    setCurrentMonth(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
    );
  };

  const findProgressForDate = (dateObj) => {
    if (!dateObj) return null;
    const dateStr = localKey(dateObj);
    return progress.find((p) => p.date === dateStr) || null;
  };

  const wrapperClass = `calendar-wrapper small ${shouldShowSkeleton ? "skeleton-mode" : "loaded"}`;

  return (
    <div className={wrapperClass}>
      <div className="calendar-header">
        <button onClick={gotoPrevMonth}>&lt;</button>
        <div className="calendar-title">
          {new Date(currentMonth.year, currentMonth.month).toLocaleString("default", {
            month: "short",
            year: "numeric",
          })}
        </div>
        <button onClick={gotoNextMonth}>&gt;</button>
      </div>

      {/* calendar-body reserves space and toggles skeleton vs real table without swapping the whole wrapper */}
      <div className="calendar-body">
        {shouldShowSkeleton ? (
          <table className="calendar-table">
            <thead>
              <tr>
                {Array.from({ length: 7 }).map((_, i) => (
                  <th key={i}>
                    <div className="skeleton-line tiny" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* 6 rows to match real table */}
              {Array.from({ length: 6 }).map((_, r) => (
                <tr key={r}>
                  {Array.from({ length: 7 }).map((_, c) => (
                    <td key={c}>
                      <div className="calendar-skeleton-cell" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="calendar-table">
            <thead>
              <tr>
                {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
                  <th key={d}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthData.map((week, wi) => (
                <tr key={wi}>
                  {week.map((dateObj, di) => {
                    const progressForDay = findProgressForDate(dateObj);
                    const dateStr = dateObj ? localKey(dateObj) : null;

                    const isCompleted =
                      dateObj &&
                      progressForDay &&
                      progressForDay.exercisesTotal > 0 &&
                      progressForDay.exercisesCompleted === progressForDay.exercisesTotal;

                    const isMissed =
                      dateObj &&
                      dateStr < todayStr &&
                      progressForDay &&
                      progressForDay.exercisesTotal > 0 &&
                      progressForDay.exercisesCompleted !== progressForDay.exercisesTotal;

                    const isToday = dateObj && dateStr === todayStr;

                    let classNames = "";
                    if (isCompleted) classNames = "cell-completed";
                    else if (isMissed) classNames = "cell-missed";
                    if (isToday) classNames += " cell-today";

                    return (
                      <td key={di} className={`calendar-cell ${classNames}`}>
                        {dateObj && <div className="date-number">{dateObj.getDate()}</div>}
                        {isCompleted && <span className="day-dot" title="Workout completed" />}
                        {isMissed && <span className="day-dot day-dot-missed" title="Workout missed" />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!shouldShowSkeleton && (
        <div className="calendar-legend">
          <span><i className="day-dot-legend" /> Completed</span>
          <span><i className="day-dot-legend missed" /> Missed</span>
        </div>
      )}
    </div>
  );
}
