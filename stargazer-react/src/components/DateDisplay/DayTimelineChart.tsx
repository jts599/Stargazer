import React from "react";
import { formatUtcInstantForTimezone } from "../../core/helpers";
import type { ICelestialDay, ICelectialDefinition, IMoonFunctionDefinition } from "../../core/interfaces";
import "./DayTimelineChart.css";

const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = HOURS_PER_DAY * MINUTES_PER_HOUR;
const MS_PER_MINUTE = 60 * 1000;
const HOURS_TO_MS = 60 * 60 * 1000;
const SVG_WIDTH = 720;
const SVG_HEIGHT = 120;
const BAND_TOP = 0;
const BAND_HEIGHT = SVG_HEIGHT;
const BAND_OVERLAP_X = 0.75;
const MOON_BASELINE = BAND_TOP + BAND_HEIGHT;
const MOON_AMPLITUDE = 96;
const SAMPLE_STEP_MINUTES = 6;

interface DayTimelineChartProps {
    celestialDay: ICelestialDay;
}

interface TimelineSegment {
    startMinute: number;
    endMinute: number;
    className: string;
}

interface TimelineTooltip {
    segmentName: string;
    sunriseTime: string;
    sunsetTime: string;
    x: number;
    y: number;
}

/**
 * Renders a selected day's local 24-hour light and moon-visibility timeline.
 * @param props Selected celestial day containing sun, twilight, and moon-cycle data.
 * @returns SVG timeline with blue twilight bands and the positive moon sine wave.
 * @sideEffects None.
 */
export function DayTimelineChart({ celestialDay }: DayTimelineChartProps): React.ReactElement {
    const segments = buildTimelineSegments(celestialDay);
    const moonPath = buildMoonPath(celestialDay);
    const [tooltip, setTooltip] = React.useState<TimelineTooltip | null>(null);
    const sunriseTime = formatUtcInstantForTimezone(celestialDay.sun?.rise, celestialDay.timezone);
    const sunsetTime = formatUtcInstantForTimezone(celestialDay.sun?.set, celestialDay.timezone);

    return (
        <div className="day-timeline-chart" aria-label="24-hour day and moon visibility">
            <div className="day-timeline-viewport">
                <svg className="day-timeline-svg" viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} role="img">
                    {segments.map((segment, index) => (
                        <rect
                            key={`${segment.className}-${index}`}
                            aria-label={buildSegmentAriaLabel(segment, sunriseTime, sunsetTime)}
                            className={`day-timeline-band ${segment.className}`}
                            height={BAND_HEIGHT}
                            role="img"
                            tabIndex={0}
                            width={getSegmentWidth(segment)}
                            x={getSegmentX(segment)}
                            y={BAND_TOP}
                            onBlur={() => setTooltip(null)}
                            onFocus={() => setTooltip(buildFocusedTooltip(segment, sunriseTime, sunsetTime))}
                            onPointerEnter={event => setTooltip(buildPointerTooltip(event, segment, sunriseTime, sunsetTime))}
                            onPointerLeave={() => setTooltip(null)}
                            onPointerMove={event => setTooltip(buildPointerTooltip(event, segment, sunriseTime, sunsetTime))}
                        />
                    ))}
                    {moonPath && <path className="day-timeline-moon-path" d={moonPath} />}
                </svg>
                {tooltip && (
                    <div className="day-timeline-tooltip" style={{ left: `${tooltip.x}%`, top: `${tooltip.y}%` }}>
                        <div className="day-timeline-tooltip-title">{tooltip.segmentName}</div>
                        <div>Sunrise: {tooltip.sunriseTime}</div>
                        <div>Sunset: {tooltip.sunsetTime}</div>
                    </div>
                )}
            </div>
            <div className="day-timeline-labels">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>12 AM</span>
            </div>
        </div>
    );
}

/**
 * Creates hover text for screen readers and keyboard users.
 * @param segment Timeline segment being described.
 * @param sunriseTime Formatted local sunrise time.
 * @param sunsetTime Formatted local sunset time.
 * @returns Concise accessible label with segment and sun event times.
 * @sideEffects None.
 */
function buildSegmentAriaLabel(segment: TimelineSegment, sunriseTime: string, sunsetTime: string): string {
    return `${getSegmentName(segment.className)}. Sunrise ${sunriseTime}. Sunset ${sunsetTime}.`;
}

/**
 * Builds a tooltip anchored to the pointer within the SVG viewport.
 * @param event Pointer event from a timeline segment.
 * @param segment Segment currently under the pointer.
 * @param sunriseTime Formatted local sunrise time.
 * @param sunsetTime Formatted local sunset time.
 * @returns Tooltip content and percent position within the chart.
 * @sideEffects Reads the SVG element's current layout box.
 */
function buildPointerTooltip(event: React.PointerEvent<SVGRectElement>, segment: TimelineSegment, sunriseTime: string, sunsetTime: string): TimelineTooltip {
    const bounds = event.currentTarget.ownerSVGElement?.getBoundingClientRect();
    const x = bounds ? ((event.clientX - bounds.left) / bounds.width) * 100 : 50;
    const y = bounds ? ((event.clientY - bounds.top) / bounds.height) * 100 : 50;
    return buildTooltip(segment, sunriseTime, sunsetTime, x, y);
}

/**
 * Builds a keyboard-focus tooltip centered over the segment.
 * @param segment Segment receiving focus.
 * @param sunriseTime Formatted local sunrise time.
 * @param sunsetTime Formatted local sunset time.
 * @returns Tooltip content and percent position within the chart.
 * @sideEffects None.
 */
function buildFocusedTooltip(segment: TimelineSegment, sunriseTime: string, sunsetTime: string): TimelineTooltip {
    const midpoint = (segment.startMinute + segment.endMinute) / 2;
    return buildTooltip(segment, sunriseTime, sunsetTime, (midpoint / MINUTES_PER_DAY) * 100, 50);
}

/**
 * Creates tooltip state for one timeline segment.
 * @param segment Segment being displayed.
 * @param sunriseTime Formatted local sunrise time.
 * @param sunsetTime Formatted local sunset time.
 * @param x Horizontal tooltip anchor as a viewport percentage.
 * @param y Vertical tooltip anchor as a viewport percentage.
 * @returns Tooltip content and clamped chart-relative position.
 * @sideEffects None.
 */
function buildTooltip(segment: TimelineSegment, sunriseTime: string, sunsetTime: string, x: number, y: number): TimelineTooltip {
    return {
        segmentName: getSegmentName(segment.className),
        sunriseTime,
        sunsetTime,
        x: clampPercent(x),
        y: clampPercent(y),
    };
}

/**
 * Converts an internal band class into user-facing copy.
 * @param className Segment class produced by the timeline builder.
 * @returns Display name for the segment.
 * @sideEffects None.
 */
function getSegmentName(className: string): string {
    const names: Record<string, string> = {
        astronomical: "Astronomical twilight",
        civil: "Civil twilight",
        daylight: "Daylight",
        nautical: "Nautical twilight",
        night: "Night",
    };
    return names[className] ?? className;
}

/**
 * Builds ordered bands for daylight, each twilight type, and full night.
 * @param day Selected celestial day with optional twilight definitions.
 * @returns Timeline segments clamped to the local 24-hour day.
 * @sideEffects None.
 */
function buildTimelineSegments(day: ICelestialDay): TimelineSegment[] {
    const segments: TimelineSegment[] = [];
    const sun = toMinutePair(day.sun, day);
    const civil = toMinutePair(day.civilTwilight, day);
    const nautical = toMinutePair(day.nauticalTwilight, day);
    const astronomical = toMinutePair(day.astronomicalTwilight, day);

    addSegment(segments, 0, astronomical?.rise ?? sun?.rise ?? MINUTES_PER_DAY, "night");
    addSegment(segments, astronomical?.rise, nautical?.rise, "astronomical");
    addSegment(segments, nautical?.rise, civil?.rise, "nautical");
    addSegment(segments, civil?.rise, sun?.rise, "civil");
    addSegment(segments, sun?.rise, sun?.set, "daylight");
    addSegment(segments, sun?.set, civil?.set, "civil");
    addSegment(segments, civil?.set, nautical?.set, "nautical");
    addSegment(segments, nautical?.set, astronomical?.set, "astronomical");
    addSegment(segments, astronomical?.set ?? sun?.set ?? 0, MINUTES_PER_DAY, "night");

    return segments.length > 0 ? segments : [{ startMinute: 0, endMinute: MINUTES_PER_DAY, className: "night" }];
}

/**
 * Converts one celestial rise/set definition into local day minutes.
 * @param definition UTC rise/set instants, or undefined when absent.
 * @param day Selected day whose local timezone and date define the chart range.
 * @returns Rise and set minutes clamped to 0-1440, or undefined when both are missing.
 * @sideEffects None.
 */
function toMinutePair(definition: ICelectialDefinition | undefined, day: ICelestialDay): ICelectialDefinitionMinutes | undefined {
    if (!definition) {
        return undefined;
    }

    return {
        rise: toLocalMinute(definition.rise, day),
        set: toLocalMinute(definition.set, day),
    };
}

/**
 * Converts a UTC instant to minutes after local midnight for the selected day.
 * @param instant UTC instant to convert.
 * @param day Selected day whose date and timezone define local midnight.
 * @returns Clamped minute value, or undefined when the instant is unavailable.
 * @sideEffects None.
 */
function toLocalMinute(instant: Date | undefined, day: ICelestialDay): number | undefined {
    if (!instant) {
        return undefined;
    }

    const localInstantMs = instant.getTime() + day.timezone * HOURS_TO_MS;
    const localDayStartMs = Date.UTC(day.date.getFullYear(), day.date.getMonth(), day.date.getDate());
    const minute = (localInstantMs - localDayStartMs) / MS_PER_MINUTE;
    return clampMinute(minute);
}

/**
 * Adds a segment when both endpoints are present and ordered.
 * @param segments Mutable segment list being built.
 * @param startMinute Optional segment start minute.
 * @param endMinute Optional segment end minute.
 * @param className Visual class for the segment shade.
 * @returns Nothing.
 * @sideEffects Mutates the provided segments array.
 */
function addSegment(segments: TimelineSegment[], startMinute: number | undefined, endMinute: number | undefined, className: string): void {
    if (startMinute === undefined || endMinute === undefined) {
        return;
    }

    const start = clampMinute(startMinute);
    const end = clampMinute(endMinute);
    if (end <= start) {
        return;
    }

    segments.push({ startMinute: start, endMinute: end, className });
}

/**
 * Builds the SVG path for the positive half of the selected day's moon sine wave.
 * @param day Selected celestial day with a moon cycle definition.
 * @returns SVG path data, or an empty string when no positive moon arc intersects the day.
 * @sideEffects None.
 */
function buildMoonPath(day: ICelestialDay): string {
    const cycles = day.moonCycles?.length ? day.moonCycles : [day.moonCycle ?? day.moonFunctionConstants].filter(isMoonCycle);
    if (cycles.length === 0) {
        return "";
    }

    const dayStartMs = Date.UTC(day.date.getFullYear(), day.date.getMonth(), day.date.getDate()) - day.timezone * HOURS_TO_MS;
    const commands: string[] = [];

    for (const cycle of cycles) {
        const periodMs = cycle.cycleEnd.getTime() - cycle.cycleStart.getTime();
        if (periodMs <= 0) {
            continue;
        }

        appendMoonCyclePath(commands, cycle, periodMs, dayStartMs);
    }

    return commands.join(" ");
}

/**
 * Appends positive moon sine-wave commands for one moon cycle.
 * @param commands Mutable SVG command list being built.
 * @param cycle Moonrise-to-moonrise cycle definition.
 * @param periodMs Cycle duration in milliseconds.
 * @param dayStartMs UTC millisecond instant for local midnight.
 * @returns Nothing.
 * @sideEffects Mutates the provided commands array.
 */
function appendMoonCyclePath(commands: string[], cycle: IMoonFunctionDefinition, periodMs: number, dayStartMs: number): void {
    let isDrawing = false;

    for (let minute = 0; minute <= MINUTES_PER_DAY; minute += SAMPLE_STEP_MINUTES) {
        const timeMs = dayStartMs + minute * MS_PER_MINUTE;
        const height = getMoonHeight(cycle, periodMs, timeMs);
        if (height <= 0) {
            isDrawing = false;
            continue;
        }

        const command = isDrawing ? "L" : "M";
        commands.push(`${command} ${minuteToX(minute).toFixed(2)} ${moonHeightToY(height).toFixed(2)}`);
        isDrawing = true;
    }
}

/**
 * Estimates normalized moon height for one instant within a moonrise cycle.
 * @param cycle Moonrise-to-moonrise cycle definition.
 * @param periodMs Cycle duration in milliseconds.
 * @param timeMs UTC instant to sample.
 * @returns Positive sine value while above the horizon, otherwise zero.
 * @sideEffects None.
 */
function getMoonHeight(cycle: IMoonFunctionDefinition, periodMs: number, timeMs: number): number {
    if (timeMs < cycle.cycleStart.getTime() || timeMs > cycle.cycleEnd.getTime()) {
        return 0;
    }

    const phase = (timeMs - cycle.cycleStart.getTime()) / periodMs;
    return Math.max(0, Math.sin(phase * 2 * Math.PI));
}

/**
 * Converts local day minutes into an SVG x-coordinate.
 * @param minute Minute of the local day.
 * @returns Horizontal coordinate within the timeline view box.
 * @sideEffects None.
 */
function minuteToX(minute: number): number {
    return (clampMinute(minute) / MINUTES_PER_DAY) * SVG_WIDTH;
}

/**
 * Converts a timeline segment start into an overlapped SVG x-coordinate.
 * @param segment Timeline segment to position.
 * @returns Segment x-coordinate, expanded slightly left except at the chart edge.
 * @sideEffects None.
 */
function getSegmentX(segment: TimelineSegment): number {
    return Math.max(0, minuteToX(segment.startMinute) - BAND_OVERLAP_X);
}

/**
 * Converts a timeline segment duration into an overlapped SVG width.
 * @param segment Timeline segment to size.
 * @returns Segment width, expanded slightly to cover anti-aliased seams.
 * @sideEffects None.
 */
function getSegmentWidth(segment: TimelineSegment): number {
    const startX = getSegmentX(segment);
    const endX = Math.min(SVG_WIDTH, minuteToX(segment.endMinute) + BAND_OVERLAP_X);
    return endX - startX;
}

/**
 * Converts normalized moon height into an SVG y-coordinate.
 * @param height Normalized positive moon height.
 * @returns Vertical coordinate within the moon drawing area.
 * @sideEffects None.
 */
function moonHeightToY(height: number): number {
    return MOON_BASELINE - height * MOON_AMPLITUDE;
}

/**
 * Clamps a minute value into the 24-hour timeline bounds.
 * @param minute Raw minute value.
 * @returns Bounded minute value between 0 and 1440.
 * @sideEffects None.
 */
function clampMinute(minute: number): number {
    return Math.min(MINUTES_PER_DAY, Math.max(0, minute));
}

/**
 * Keeps a tooltip anchor within the visible chart bounds.
 * @param percent Raw percentage value.
 * @returns Percentage value clamped between 0 and 100.
 * @sideEffects None.
 */
function clampPercent(percent: number): number {
    return Math.min(100, Math.max(0, percent));
}

/**
 * Narrows optional moon-cycle values for path rendering.
 * @param cycle Optional moon-cycle metadata.
 * @returns True when a cycle is available.
 * @sideEffects None.
 */
function isMoonCycle(cycle: IMoonFunctionDefinition | undefined): cycle is IMoonFunctionDefinition {
    return cycle !== undefined;
}

interface ICelectialDefinitionMinutes {
    rise?: number;
    set?: number;
}
