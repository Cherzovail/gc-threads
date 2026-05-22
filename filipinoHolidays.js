/**
 * Philippine National Holidays, Special Non-Working Days, and Observances
 * Valid for 2024, 2025, 2026
 */

export const PHILIPPINE_HOLIDAYS = [
  // 2024
  { date: '2024-01-01', name: 'New Year\'s Day', type: 'national' },
  { date: '2024-02-10', name: 'Chinese New Year', type: 'special' },
  { date: '2024-02-12', name: 'Chinese New Year (substitute)', type: 'special' },
  { date: '2024-02-25', name: 'EDSA Revolution Anniversary', type: 'national' },
  { date: '2024-03-28', name: 'Maundy Thursday', type: 'national' },
  { date: '2024-03-29', name: 'Good Friday', type: 'national' },
  { date: '2024-03-30', name: 'Black Saturday', type: 'national' },
  { date: '2024-04-09', name: 'Araw ng Kagitingan', type: 'national' },
  { date: '2024-05-01', name: 'Labor Day', type: 'national' },
  { date: '2024-06-12', name: 'Independence Day', type: 'national' },
  { date: '2024-06-17', name: 'Eid\'l Adha', type: 'special' },
  { date: '2024-08-21', name: 'Ninoy and Cory Aquino Day', type: 'national' },
  { date: '2024-11-01', name: 'All Saints\' Day', type: 'national' },
  { date: '2024-11-02', name: 'All Souls\' Day', type: 'special' },
  { date: '2024-11-30', name: 'Bonifacio Day', type: 'national' },
  { date: '2024-12-08', name: 'Feast of the Immaculate Conception', type: 'special' },
  { date: '2024-12-25', name: 'Christmas Day', type: 'national' },
  { date: '2024-12-30', name: 'Rizal Day', type: 'national' },
  { date: '2024-12-31', name: 'New Year\'s Eve', type: 'observance' },

  // 2025
  { date: '2025-01-01', name: 'New Year\'s Day', type: 'national' },
  { date: '2025-01-25', name: 'Chinese New Year', type: 'special' },
  { date: '2025-01-27', name: 'Chinese New Year (substitute)', type: 'special' },
  { date: '2025-02-25', name: 'EDSA Revolution Anniversary', type: 'national' },
  { date: '2025-04-09', name: 'Araw ng Kagitingan', type: 'national' },
  { date: '2025-04-17', name: 'Maundy Thursday', type: 'national' },
  { date: '2025-04-18', name: 'Good Friday', type: 'national' },
  { date: '2025-04-19', name: 'Black Saturday', type: 'national' },
  { date: '2025-05-01', name: 'Labor Day', type: 'national' },
  { date: '2025-06-12', name: 'Independence Day', type: 'national' },
  { date: '2025-06-07', name: 'Eid\'l Fitr', type: 'special' },
  { date: '2025-06-09', name: 'Eid\'l Fitr (substitute)', type: 'special' },
  { date: '2025-07-07', name: 'Eid\'l Adha', type: 'special' },
  { date: '2025-08-21', name: 'Ninoy and Cory Aquino Day', type: 'national' },
  { date: '2025-11-01', name: 'All Saints\' Day', type: 'national' },
  { date: '2025-11-02', name: 'All Souls\' Day', type: 'special' },
  { date: '2025-11-30', name: 'Bonifacio Day', type: 'national' },
  { date: '2025-12-08', name: 'Feast of the Immaculate Conception', type: 'special' },
  { date: '2025-12-25', name: 'Christmas Day', type: 'national' },
  { date: '2025-12-30', name: 'Rizal Day', type: 'national' },
  { date: '2025-12-31', name: 'New Year\'s Eve', type: 'observance' },

  // 2026
  { date: '2026-01-01', name: 'New Year\'s Day', type: 'national' },
  { date: '2026-02-13', name: 'Chinese New Year', type: 'special' },
  { date: '2026-02-14', name: 'Chinese New Year (substitute)', type: 'special' },
  { date: '2026-02-25', name: 'EDSA Revolution Anniversary', type: 'national' },
  { date: '2026-04-02', name: 'Maundy Thursday', type: 'national' },
  { date: '2026-04-03', name: 'Good Friday', type: 'national' },
  { date: '2026-04-04', name: 'Black Saturday', type: 'national' },
  { date: '2026-04-09', name: 'Araw ng Kagitingan', type: 'national' },
  { date: '2026-05-01', name: 'Labor Day', type: 'national' },
  { date: '2026-06-12', name: 'Independence Day', type: 'national' },
  { date: '2026-05-27', name: 'Eid\'l Fitr', type: 'special' },
  { date: '2026-06-26', name: 'Eid\'l Adha', type: 'special' },
  { date: '2026-08-21', name: 'Ninoy and Cory Aquino Day', type: 'national' },
  { date: '2026-11-01', name: 'All Saints\' Day', type: 'national' },
  { date: '2026-11-02', name: 'All Souls\' Day', type: 'special' },
  { date: '2026-11-30', name: 'Bonifacio Day', type: 'national' },
  { date: '2026-12-08', name: 'Feast of the Immaculate Conception', type: 'special' },
  { date: '2026-12-25', name: 'Christmas Day', type: 'national' },
  { date: '2026-12-30', name: 'Rizal Day', type: 'national' },
  { date: '2026-12-31', name: 'New Year\'s Eve', type: 'observance' }
];

/**
 * Get holiday info for a specific date
 * @param {Date|string} date - Date to check (JS Date or 'YYYY-MM-DD' format)
 * @returns {Object|null} Holiday object or null if not a holiday
 */
export function getHolidayForDate(date) {
  let dateStr;
  
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    dateStr = `${year}-${month}-${day}`;
  } else {
    dateStr = date;
  }
  
  return PHILIPPINE_HOLIDAYS.find(h => h.date === dateStr) || null;
}

/**
 * Check if a date is a national holiday
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is a national holiday
 */
export function isNationalHoliday(date) {
  const holiday = getHolidayForDate(date);
  return holiday && holiday.type === 'national';
}

/**
 * Get all holidays for a specific month and year
 * @param {number} month - Month (1-12)
 * @param {number} year - Year (e.g., 2024)
 * @returns {Array} Array of holidays in that month
 */
export function getHolidaysByMonth(month, year) {
  const monthStr = String(month).padStart(2, '0');
  return PHILIPPINE_HOLIDAYS.filter(h => 
    h.date.startsWith(`${year}-${monthStr}`)
  );
}

/**
 * Get CSS class for holiday type styling
 * @param {string} type - Holiday type (national|special|observance)
 * @returns {string} CSS class name
 */
export function getHolidayClass(type) {
  const classes = {
    'national': 'holiday-national',
    'special': 'holiday-special',
    'observance': 'holiday-observance'
  };
  return classes[type] || 'holiday-observance';
}
