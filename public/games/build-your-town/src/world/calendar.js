(() => {
  const dayMilliseconds = 60000;
  let simulation;
  let dateKey, formattedDate;
  const daysInMonth = (year, month) => {
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  };
  function initialize(city) {
    if (city.calendar) return city.calendar;
    const days = daysInMonth(city.year, city.month);
    const progress = Math.max(0, Math.min(24, city.tickInMonth || 0)) / 25 * days;
    city.calendar = { day: Math.floor(progress) + 1, dailyHours: 0, dailyBudget: 0, budgetRemainder: 0 };
    city.dayTime = progress ? (progress % 1) * 24 : Number.isFinite(city.dayTime) ? city.dayTime : 8;
    return city.calendar;
  }
  function restore(city, data) {
    const saved = data.calendar;
    if (!saved || !Number.isInteger(saved.day) || saved.day < 1 || saved.day > daysInMonth(city.year, city.month)) {
      initialize(city);
      return;
    }
    city.calendar = {
      day: saved.day,
      dailyHours: Number.isFinite(saved.dailyHours) && saved.dailyHours >= 0 && saved.dailyHours <= 24 ? saved.dailyHours : 0,
      dailyBudget: Number.isFinite(saved.dailyBudget) ? saved.dailyBudget : 0,
      budgetRemainder: Number.isFinite(saved.budgetRemainder) && Math.abs(saved.budgetRemainder) <= 0.5 ? saved.budgetRemainder : 0,
    };
    for (const key of ["encounterAt", "encounterCheckAt"]) {
      if (Number.isFinite(saved[key]) && saved[key] >= 0 && saved[key] <= monthTime(city)) city.calendar[key] = saved[key];
    }
  }
  function monthTime(city) {
    const calendar = initialize(city);
    return city.year * 12 + city.month + (calendar.day - 1 + city.dayTime / 24) / daysInMonth(city.year, city.month);
  }
  function advance(city, elapsed, speed = 1) {
    const result = { updated: false, monthEnded: false, messages: [] };
    const calendar = initialize(city);
    if (!simulation || !(elapsed > 0) || !(speed > 0) || city.bankrupt) return result;
    let hours = elapsed / dayMilliseconds * speed * 24;
    while (hours > 1e-9 && !city.bankrupt) {
      const time = city.dayTime;
      const boundary = Math.floor(time + 1e-9) + 1;
      const step = Math.min(hours, boundary - time);
      calendar.dailyBudget += simulation.accrue(city, step / (daysInMonth(city.year, city.month) * 24));
      city.dayTime += step;
      calendar.dailyHours += step;
      hours -= step;
      if (city.dayTime < boundary - 1e-9) break;
      const days = daysInMonth(city.year, city.month);
      simulation.hour(city, 1 / (days * 24));
      result.updated = true;
      if (boundary === 24) {
        simulation.budget(city, calendar.dailyBudget);
        calendar.dailyBudget = 0;
        calendar.dailyHours = 0;
        city.dayTime = 0;
        if (calendar.day === days) {
          result.messages.push(...simulation.month(city));
          result.monthEnded = true;
          calendar.day = 1;
          city.month++;
          if (city.month === 12) { city.month = 0; city.year++; }
        } else calendar.day++;
      } else city.dayTime = boundary;
      city.tickInMonth = Math.min(24, Math.floor((calendar.day - 1 + city.dayTime / 24) / daysInMonth(city.year, city.month) * 25));
    }
    window.__townJournal?.capture(city);
    return result;
  }
  function settleBudget(city, monthlyNet, fraction) {
    if (!(fraction > 0)) return;
    const calendar = initialize(city);
    const amount = calendar.budgetRemainder + monthlyNet * fraction;
    const whole = Math.round(amount);
    city.money += whole;
    calendar.budgetRemainder = amount - whole;
  }
  function formatDate(city) {
    const calendar = initialize(city);
    const lang = document.documentElement.lang === "fr" ? "fr" : "en-GB";
    const key = `${lang}:${city.year}:${city.month}:${calendar.day}`;
    if (key === dateKey) return formattedDate;
    dateKey = key;
    const date = new Date(0);
    date.setUTCFullYear(city.year, city.month, calendar.day);
    formattedDate = new Intl.DateTimeFormat(lang, {
      day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
    }).format(date);
    return formattedDate;
  }
  window.__townCalendar = {
    advance, initialize, restore, daysInMonth, monthTime, settleBudget, formatDate,
    snapshot: city => ({ ...initialize(city) }),
    bind: callbacks => { simulation = callbacks; },
    chance: (probability, fraction) => fraction === 1 ? probability : -Math.expm1(Math.log1p(-probability) * fraction),
  };
})();
