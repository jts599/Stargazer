import React, { useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickerDay, type PickerDayProps } from '@mui/x-date-pickers/PickerDay';
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

interface StargazerPickerDayProps extends PickerDayProps {
  resolveScore?: (date: Date) => number;
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
 * Converts a 0-100 score into the grayscale day-number color used by the calendar.
 * @param score Percentile-like score where higher values should render darker text.
 * @returns CSS rgb color string for the score.
 * @sideEffects None.
 */
function getScoreTextColor(score: number): string {
  const boundedScore = Math.min(100, Math.max(0, score));
  const channel = 255 - (boundedScore * 2.55);
  return `rgb(${channel}, ${channel}, ${channel})`;
}

/**
 * Converts an optional native date into the Day.js value required by MUI pickers.
 * @param date Native date value from the existing calendar API.
 * @returns Day.js date value, or undefined when no date was supplied.
 * @sideEffects None.
 */
function toDayjs(date?: Date): Dayjs | undefined {
  return date === undefined ? undefined : dayjs(date);
}

/**
 * Renders one MUI calendar day with stargazing score text coloring.
 * @param props MUI day props plus the optional score resolver used for custom coloring.
 * @returns Picker day element with the current score color applied.
 * @sideEffects Calls resolveScore, which may have caller-defined side effects.
 */
function StargazerPickerDay(props: StargazerPickerDayProps): React.ReactElement {
  const { day, resolveScore = defaultScoreResolution, sx, ...pickerDayProps } = props;
  const score = resolveScore(day.toDate());
  const scoreColor = getScoreTextColor(score);

  return (
    <PickerDay
      {...pickerDayProps}
      day={day}
      sx={[
        {
          color: scoreColor,
          '&.Mui-selected': {
            color: '#ffffff',
          },
          '&.MuiPickersDay-today': {
            color: '#ffffff',
          },
          '&.Mui-disabled': {
            color: '#697386',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  );
}

/**
 * Renders the stargazing date picker using MUI's standard DateCalendar.
 * @param props Selected date, bounds, optional classes, and score formatting callback.
 * @returns Inline calendar that emits native Date selections.
 * @sideEffects Calls onDateSelect when the user selects a valid date.
 */
export function Calendar({
  selectedDate = new Date(),
  onDateSelect,
  minDate,
  maxDate,
  className = '',
  dateColorCodeFormatingFunction = defaultScoreResolution
}: CalendarProps): React.ReactElement {
  const calendarValue = useMemo(() => dayjs(selectedDate), [selectedDate]);
  const calendarMinDate = useMemo(() => toDayjs(minDate), [minDate]);
  const calendarMaxDate = useMemo(() => toDayjs(maxDate), [maxDate]);

  /**
   * Forwards a valid MUI date selection through the existing native Date callback.
   * @param date Newly selected Day.js value from MUI, or null when cleared internally.
   * @returns Nothing.
   * @sideEffects Calls onDateSelect when a valid date and callback are present.
   */
  const handleDateChange = (date: Dayjs | null): void => {
    if (date === null || !date.isValid() || onDateSelect === undefined) {
      return;
    }

    onDateSelect(date.toDate());
  };

  return (
    <div className={`calendar ${className}`}>
      <DateCalendar
        fixedWeekNumber={6}
        maxDate={calendarMaxDate}
        minDate={calendarMinDate}
        showDaysOutsideCurrentMonth
        slots={{ day: StargazerPickerDay }}
        slotProps={{
          day: {
            resolveScore: dateColorCodeFormatingFunction,
          } as Partial<StargazerPickerDayProps>,
        }}
        value={calendarValue}
        views={['year', 'month', 'day']}
        onChange={handleDateChange}
      />
    </div>
  );
}

export default Calendar;
