import React, { useState, useMemo } from 'react';
import './Calendar.css';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  highlightedDates?: Date[];
  className?: string;
  //0-100, 0 is white, 100 is black
  dateColorCodeFormatingFunction?: (date: Date) => number;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isDisabled: boolean;
  stargazingScore?: number; // Add stargazing score
}

function defaultScoreResolution(_i:Date):number{
  return 0;
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

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  const isDateDisabled = (date: Date, min?: Date, max?: Date): boolean => {
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  };

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
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate),
        isHighlighted: highlightedDates.some(d => isSameDay(d, date)),
        isDisabled: isDateDisabled(date, minDate, maxDate),
        stargazingScore: dateColorCodeFormatingFunction(date)
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate),
        isHighlighted: highlightedDates.some(d => isSameDay(d, date)),
        isDisabled: isDateDisabled(date, minDate, maxDate),
        stargazingScore: dateColorCodeFormatingFunction(date)
      });
    }
    
    // Add days from next month to complete the grid (6 weeks × 7 days = 42 days)
    const totalDaysShown = days.length;
    const remainingDays = 42 - totalDaysShown;
    
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        isSelected: isSameDay(date, selectedDate),
        isHighlighted: highlightedDates.some(d => isSameDay(d, date)),
        isDisabled: isDateDisabled(date, minDate, maxDate),
        stargazingScore: dateColorCodeFormatingFunction(date)
      });
    }
    
    return days;
  }, [currentMonth, selectedDate, highlightedDates, minDate, maxDate]);


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
          <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
        </div>
        
        <button 
          className="calendar-nav-button" 
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          &#8250;
        </button>
      </div>

      <div className="calendar-controls">
        <button className="calendar-today-button" onClick={handleToday}>
          Today
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
          const textColor = day.stargazingScore !== undefined
            ? `rgb(${255 - (day.stargazingScore * 2.55)}, ${255 - (day.stargazingScore * 2.55)}, ${255 - (day.stargazingScore * 2.55)})`
            : 'inherit'; // Default to inherit if no score

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
