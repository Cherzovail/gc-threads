export const state = {
  currentUser: null,
  currentUsername: null,

  allHomePosts: [],

  // concerns filter
  activeConcernCategory: 'All',

  // calendar
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  selectedDay: null,

  // demo events (UI will render these)
  events: [
    { month: new Date().getMonth(), year: new Date().getFullYear(), day: Math.min(new Date().getDate() + 2, 28), title: 'Campus Meeting', date: null, time: '1:00 PM', location: 'GC Lobby', color: '#14b8a6', attendees: 12 },
    { month: new Date().getMonth(), year: new Date().getFullYear(), day: Math.min(new Date().getDate() + 7, 28), title: 'Orientation', date: null, time: '9:00 AM', location: 'Auditorium', color: '#f59e0b', attendees: 30 }
  ]
};

