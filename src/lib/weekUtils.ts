import { startOfWeek, endOfWeek, format } from 'date-fns';

export const getCurrentWeek = (date: Date = new Date()) => {
  // Week starts on Sunday, ends on Saturday
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
  
  return {
    start: format(weekStart, 'yyyy-MM-dd'),
    end: format(weekEnd, 'yyyy-MM-dd'),
    startDate: weekStart,
    endDate: weekEnd,
  };
};

export const isSettlementDay = (date: Date = new Date()) => {
  // Saturday is day 6
  return date.getDay() === 6;
};

export const getWeekRange = (weekStart: string, weekEnd: string) => {
  return `${format(new Date(weekStart), 'MMM dd')} - ${format(new Date(weekEnd), 'MMM dd, yyyy')}`;
};