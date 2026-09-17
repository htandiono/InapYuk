import React from 'react';

const getDisabledState = (y: number, m: number) => {
  const d = new Date();
  const isPrev = y === d.getFullYear() && m === d.getMonth() + 1;
  const isNext = y > d.getFullYear() || (y === d.getFullYear() && m >= d.getMonth() + 12);
  return { isPrevDisabled: isPrev, isNextDisabled: isNext };
};

const shiftMonth = (set: React.Dispatch<React.SetStateAction<Date>>, offset: number) => {
  set((prev: Date) => {
    const d = new Date(prev);
    d.setMonth(d.getMonth() + offset);
    return d;
  });
};

export function usePriceCalendarNavigation(
  currentDate: Date,
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>,
  y: number,
  m: number
) {
  const { isPrevDisabled, isNextDisabled } = getDisabledState(y, m);
  const handlePrevMonth = () => !isPrevDisabled && shiftMonth(setCurrentDate, -1);
  const handleNextMonth = () => !isNextDisabled && shiftMonth(setCurrentDate, 1);
  const monthName = currentDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
  const blanks = Array.from({ length: new Date(y, m - 1, 1).getDay() });
  return { handlePrevMonth, handleNextMonth, isPrevDisabled, isNextDisabled, monthName, blanks };
}
