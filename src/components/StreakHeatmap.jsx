import React, { useState } from 'react';
import { generateActivityGridData } from '../lib/streakService';
import { Flame, Trophy, Calendar, CheckCircle2 } from 'lucide-react';

export default function StreakHeatmap({ streakData }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  const { weeks, monthLabels } = generateActivityGridData(streakData?.history_dates || {}, 52);

  const getColorClass = (level, isFuture) => {
    if (isFuture) return 'bg-slate-100 opacity-40';
    switch (level) {
      case 1:
        return 'bg-emerald-200 hover:ring-2 hover:ring-emerald-400';
      case 2:
        return 'bg-emerald-400 hover:ring-2 hover:ring-emerald-600';
      case 3:
        return 'bg-emerald-600 hover:ring-2 hover:ring-emerald-800';
      default:
        return 'bg-slate-100 hover:bg-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm">
      
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Speaking Attendance & Consistency</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Track every day you speak English and build your daily habit.
          </p>
        </div>

        {/* Quick Streak Stats Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">
            <Flame className="w-4 h-4 text-amber-500" />
            <div>
              <div className="text-xs text-amber-700 font-medium leading-none">Current Streak</div>
              <div className="text-sm font-extrabold text-amber-900">{streakData?.current_streak || 0} Days</div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-xs text-emerald-700 font-medium leading-none">Longest Streak</div>
              <div className="text-sm font-extrabold text-emerald-900">{streakData?.longest_streak || 0} Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub-Style 52-Week Grid */}
      <div className="mt-5 overflow-x-auto pb-2">
        <div className="min-w-[720px]">
          
          {/* Month Header Row */}
          <div className="flex text-[10px] text-slate-400 font-semibold mb-1 pl-7 relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute"
                style={{ left: `${m.weekIndex * 13.8 + 28}px` }}
              >
                {m.name}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            
            {/* Day of week labels */}
            <div className="flex flex-col justify-between text-[9px] text-slate-400 font-medium pr-2 py-0.5 select-none">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Heatmap Columns (Weeks) */}
            <div className="flex gap-[3.5px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3.5px]">
                  {week.map((day, dIdx) => (
                    <div
                      key={dIdx}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={`w-[11px] h-[11px] rounded-[2px] cursor-pointer transition-all ${getColorClass(
                        day.level,
                        day.isFuture
                      )} ${day.isToday ? 'ring-1 ring-slate-800' : ''}`}
                    />
                  ))}
                </div>
              ))}
            </div>

          </div>

          {/* Hover Tooltip & Intensity Legend */}
          <div className="flex items-center justify-between mt-4 text-xs text-slate-500 pt-3 border-t border-slate-100">
            
            <div className="h-5">
              {hoveredDay ? (
                <span className="font-medium text-slate-800">
                  {hoveredDay.count === 0
                    ? `No practice on ${hoveredDay.displayDate}`
                    : `${hoveredDay.count} practice session${hoveredDay.count > 1 ? 's' : ''} on ${hoveredDay.displayDate}`}
                </span>
              ) : (
                <span className="text-slate-400 text-xs">Hover over any square to view details</span>
              )}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>Less</span>
              <div className="w-2.5 h-2.5 rounded-[2px] bg-slate-100 border border-slate-200" title="0 sessions" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-200" title="1 session" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400" title="2 sessions" />
              <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600" title="3+ sessions" />
              <span>More</span>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}

