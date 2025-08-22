import { formatMinutesSinceNoon } from "../../core/helpers";
import type { ICelestialDay } from "../../core/interfaces";
import React from "react";
import { Moon } from "../Moon/Moon";
import "../../components/Moon/Moon.css";

export interface DateDisplayProps {
    celestialDay: ICelestialDay;
}

export function DateInfoDisplayChip({ celestialDay }: DateDisplayProps): React.ReactElement {
    const date = new Date(celestialDay.date);
    const debug = false;
    const illumination = 100 * (celestialDay.illuminationPercentage ?? 0);

    const cardStyle: React.CSSProperties = {
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
        color: '#f8fafc',
        maxWidth: '500px',
        margin: '0 auto',
        backdropFilter: 'blur(10px)',

        display: 'flex',
        flexDirection: 'column',
    };

    const headerStyle: React.CSSProperties = {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#e2e8f0',
        marginBottom: '20px',
        textAlign: 'center',
        borderBottom: '2px solid rgba(148, 163, 184, 0.2)',
        paddingBottom: '12px',
    };

    const moonSectionStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        margin: '24px 0',
        padding: '20px',
        background: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
    };

    const dataGridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginTop: '20px',
    };

    const dataItemStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        border: '1px solid rgba(148, 163, 184, 0.1)',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '0.875rem',
        color: '#94a3b8',
        marginBottom: '4px',
        fontWeight: '500',
    };

    const valueStyle: React.CSSProperties = {
        fontSize: '1rem',
        color: '#f1f5f9',
        fontWeight: '600',
    };

    const scoreStyle: React.CSSProperties = {
        ...dataItemStyle,
        gridColumn: '1 / -1',
        textAlign: 'center',
        background: 'rgba(34, 197, 94, 0.1)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
    };

    const topRowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    };

    const cardContentStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
    };

    return (
        <div style={cardStyle}>
            <div style={cardContentStyle}>
                <div style={headerStyle}>
                    {date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
                <div style={topRowStyle}>
                    <div style={moonSectionStyle}>
                    <Moon 
                        illuminationPercentage={illumination}
                        size={80}
                        className="moon"
                    />
                    <div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#e2e8f0' }}>
                            Moon Phase
                        </div>
                        <div style={{ fontSize: '1.1rem', color: '#cbd5e1', marginTop: '4px' }}>
                            {illumination?.toFixed(0)}% Illuminated
                        </div>
                    </div>
                

                    <div style={dataGridStyle}>
                        <div style={dataItemStyle}>
                            <div style={labelStyle}>Sunrise</div>
                            <div style={valueStyle}>{formatMinutesSinceNoon(celestialDay.sun?.rise)}</div>
                        </div>
                        
                        <div style={dataItemStyle}>
                            <div style={labelStyle}>Sunset</div>
                            <div style={valueStyle}>{formatMinutesSinceNoon(celestialDay.sun?.set)}</div>
                        </div>
                        
                        <div style={dataItemStyle}>
                            <div style={labelStyle}>Moonrise</div>
                            <div style={valueStyle}>{formatMinutesSinceNoon(celestialDay?.moon?.rise)}</div>
                        </div>
                        
                        <div style={dataItemStyle}>
                            <div style={labelStyle}>Moonset</div>
                            <div style={valueStyle}>{formatMinutesSinceNoon(celestialDay?.moon?.set)}</div>
                        </div>
                    </div>
                </div>
                </div>

                <div style={scoreStyle}>
                        <div style={labelStyle}>Stargazing Score</div>
                        <div style={{ ...valueStyle, fontSize: '1.5rem', color: '#10b981' }}>
                            {celestialDay.stargazingScore?.toFixed(1)}
                        </div>
                    </div>
                </div>
                
                {debug && celestialDay.moonFunctionConstants && (
                    <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', color: '#fca5a5' }}>Debug Info</div>
                        <div>Moon Period: {celestialDay.moonFunctionConstants.MoonPeriod}</div>
                        <div>Moon Width: {celestialDay.moonFunctionConstants.MoonWidth}</div>
                        <div>h Constant: {celestialDay.moonFunctionConstants.hConstant}</div>
                        <div>Phase Shift: {celestialDay.moonFunctionConstants.phaseShift}</div>
                    </div>
                )}

            </div>
    );
}
