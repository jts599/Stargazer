import React, { useState, useMemo } from 'react';
import './Calendar.css';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  highlightedDates?: Date[];
  className?: string;
  /** Resolves a 0-100 score where 0 is white and 100 is black. */
  dateColorCodeFormatingFunction?: (date: Date) => number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isDisabled: boolean;
  stargazingScore?: number;
}

/**
 * Provides a neutral score when no date scoring callback is supplied.
 * @returns Zero, which renders the lightest calendar text color.
 * @sideEffects None.
 */
function defaultScoreResolution(): number {
  return 0;
}

/**
 * Compares Date objects by local calendar day.
 * @param date1 First date to compare.
 * @param date2 Second date to compare.
 * @returns True when both dates share year, month, and day.
 * @sideEffects None.
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear()
    && date1.getMonth() === date2.getMonth()
    && date1.getDate() === date2.getDate();
}

/**
 * Determines whether a date is outside the optional selectable bounds.
 * @param date Date to evaluate.
 * @param minDate Earliest selectable local date, when provided.
 * @param maxDate Latest selectable local date, when provided.
 * @returns True when date is before minDate or after maxDate.
 * @sideEffects None.
 */
function isDateDisabled(date: Date, minDate?: Date, maxDate?: Date): boolean {
  return (minDate !== undefined && date < minDate) || (maxDate !== undefined && date > maxDate);
}

/**
 * Builds the view model for a single calendar cell.
 * @param date Date represented by the cell.
 * @param currentMonthIndex Current visible month index.
 * @param selectedDate Currently selected date.
 * @param highlightedDates Dates to render as highlighted.
 * @param today Today's local date with time removed.
 * @param minDate Earliest selectable local date, when provided.
 * @param maxDate Latest selectable local date, when provided.
 * @param resolveScore Callback that resolves the stargazing score for the date.
 * @returns CalendarDay state used by the button renderer.
 * @sideEffects Calls resolveScore, which may have caller-defined side effects.
 */
function createCalendarDay(
  date: Date,
  currentMonthIndex: number,
  selectedDate: Date,
  highlightedDates: Date[],
  today: Date,
  minDate: Date | undefined,
  maxDate: Date | undefined,
  resolveScore: (date: Date) => number,
): CalendarDay {
  return {
    date,
    isCurrentMonth: date.getMonth() === currentMonthIndex,
    isToday: isSameDay(date, today),
    isSelected: isSameDay(date, selectedDate),
    isHighlighted: highlightedDates.some(highlightedDate => isSameDay(highlightedDate, date)),
    isDisabled: isDateDisabled(date, minDate, maxDate),
    stargazingScore: resolveScore(date),
  };
}

/**
 * Converts a 0-100 score into a grayscale text color.
 * @param score Optional percentile-like score.
 * @returns CSS color string for scored dates, otherwise inherit.
 * @sideEffects None.
 */
function getScoreTextColor(score?: number): string {
  if (score === undefined) {
    return 'inherit';
  }

  const channel = 255 - (score * 2.55);
  return `rgb(${channel}, ${channel}, ${channel})`;
}

export function Calendar({
  selectedDate = new Date(),
  onDateSelect,
  minDate,
  maxDate,
  highlightedDates = [],
  className = '',
  dateColorCodeFormatingFunction = defaultScoreResolution
}: CalendarProps): React.ReactElement {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth()));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of the month and how many days are in the month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Get the day of the week for the first day (0 = Sunday)
    const startDayOfWeek = firstDayOfMonth.getDay();
    
    // Get days from previous month to fill the first week
    const daysFromPrevMonth = startDayOfWeek;
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, daysInPrevMonth - i);
      days.push(createCalendarDay(date, month, selectedDate, highlightedDates, today, minDate, maxDate, dateColorCodeFormatingFunction));
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(createCalendarDay(date, month, selectedDate, highlightedDates, today, minDate, maxDate, dateColorCodeFormatingFunction));
    }
    
    // Calculate minimum weeks needed (5 or 6)
    const totalDaysShown = days.length;
    const weeksNeeded = Math.ceil(totalDaysShown / 7);
    const maxDaysToShow = weeksNeeded * 7;
    const remainingDays = maxDaysToShow - totalDaysShown;
    
    // Only add days from next month if we need them to complete the grid
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(createCalendarDay(date, month, selectedDate, highlightedDates, today, minDate, maxDate, dateColorCodeFormatingFunction));
    }
    
    return days;
  }, [currentMonth, selectedDate, highlightedDates, minDate, maxDate, dateColorCodeFormatingFunction]);


  const handlePrevMonth = (): void => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = (): void => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: CalendarDay): void => {
    if (!day.isDisabled && onDateSelect) {
      onDateSelect(day.date);
    }
  };

  const handleToday = (): void => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth()));
    if (onDateSelect) {
      onDateSelect(today);
    }
  };

  // Check if selected date is today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDateCopy = new Date(selectedDate);
  selectedDateCopy.setHours(0, 0, 0, 0);
  const isSelectedDateToday = isSameDay(selectedDateCopy, today);

  return (
    <div className={`calendar ${className}`}>
      <div className="calendar-header">
        <button 
          className="calendar-nav-button" 
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          &#8249;
        </button>
        
        <div className="calendar-month-year">
          <div className="calendar-today-container">
            {!isSelectedDateToday && (
              <button className="calendar-today-button" onClick={handleToday} aria-label="Go to today">
                T
              </button>
            )}
          </div>
          <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
          <div className="calendar-month-spacer"></div>
        </div>
        
        <button 
          className="calendar-nav-button" 
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          &#8250;
        </button>
      </div>

      <div className="calendar-weekdays">
        {weekDays.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {calendarDays.map((day, index) => {
          const textColor = getScoreTextColor(day.stargazingScore);

          return (
            <button
              key={index}
              className={`calendar-day ${
                day.isCurrentMonth ? 'current-month' : 'other-month'
              } ${
                day.isToday ? 'today' : ''
              } ${
                day.isSelected ? 'selected' : ''
              } ${
                day.isHighlighted ? 'highlighted' : ''
              } ${
                day.isDisabled ? 'disabled' : ''
              }`}
              onClick={() => handleDateClick(day)}
              disabled={day.isDisabled}
              aria-label={`${day.date.toLocaleDateString()}`}
              style={{ color: textColor }} // Apply dynamic text color
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;
