// GitHub-Style Activity Grid and Streak Calculations for SpeakCheck

export function generateActivityGridData(historyDatesMap = {}, weeksToShow = 52) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // We want to show weeksToShow weeks ending on current week's Saturday/Sunday
  const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const totalDays = weeksToShow * 7;
  
  // Calculate start date
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (totalDays - 1 - (6 - currentDayOfWeek)));

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const dateStr = d.toISOString().split('T')[0];
    const count = historyDatesMap[dateStr] || 0;

    let level = 0;
    if (count === 1) level = 1;
    else if (count === 2) level = 2;
    else if (count >= 3) level = 3;

    days.push({
      date: dateStr,
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dayOfWeek: d.getDay(),
      count,
      level,
      isToday: dateStr === today.toISOString().split('T')[0],
      isFuture: d > today
    });
  }

  // Group into columns of 7 days (Sunday to Saturday)
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Calculate Month labels
  const monthLabels = [];
  let lastMonth = -1;

  weeks.forEach((week, index) => {
    const firstDayInWeek = week[0];
    if (firstDayInWeek) {
      const monthNum = new Date(firstDayInWeek.date).getMonth();
      if (monthNum !== lastMonth) {
        lastMonth = monthNum;
        monthLabels.push({
          weekIndex: index,
          name: new Date(firstDayInWeek.date).toLocaleDateString('en-US', { month: 'short' })
        });
      }
    }
  });

  return {
    weeks,
    monthLabels,
    totalPracticedDays: Object.keys(historyDatesMap).length
  };
}

export function formatStreakBadge(currentStreak) {
  if (currentStreak === 0) return { label: 'Start Streak', color: 'text-slate-400 bg-slate-100', icon: '❄️' };
  if (currentStreak < 3) return { label: `${currentStreak} Day Streak`, color: 'text-amber-700 bg-amber-100', icon: '🔥' };
  if (currentStreak < 7) return { label: `${currentStreak} Days on Fire!`, color: 'text-orange-700 bg-orange-100', icon: '⚡' };
  if (currentStreak < 30) return { label: `${currentStreak} Days Champion!`, color: 'text-emerald-700 bg-emerald-100', icon: '🏆' };
  return { label: `${currentStreak} Days Unstoppable!`, color: 'text-purple-700 bg-purple-100', icon: '👑' };
}

