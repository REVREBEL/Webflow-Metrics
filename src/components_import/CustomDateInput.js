import React, { useState, useRef, useCallback, useMemo } from 'react';

/**
 * Functional Date Input (MM/DD/YY)
 * This replaces the DevLink "NotSupported" placeholder with actual logic.
 */
export function CustomDateInput({
  typographyFontFamily = 'Khand, sans-serif',
  typographyFontWeight = '700',
  typographyFontSize = '14px',
  colorsTextColor = '#163666',
  colorsBackground = '#fafafa',
  colorsBorderColor = '#b2d3de',
  colorsFocusColor = '#00a6b6',
  colorsSeparatorColor = '#b2d3de',
}) {
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [focused, setFocused] = useState(null);

  const monthRef = useRef(null);
  const dayRef = useRef(null);
  const yearRef = useRef(null);

  // Formats data for your attribute
  const formattedDate = useMemo(() => {
    if (month && day && year && year.length === 2) {
      return `20${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return '';
  }, [month, day, year]);

  const clamp = (val, max, digits) => {
    let num = val.replace(/\D/g, '').slice(0, digits);
    if (num && parseInt(num, 10) > max) num = String(max);
    return num;
  };

  const handleMonth = (e) => {
    const v = clamp(e.target.value, 12, 2);
    setMonth(v);
    if (v.length === 2) dayRef.current?.focus();
  };

  const handleDay = (e) => {
    const v = clamp(e.target.value, 31, 2);
    setDay(v);
    if (v.length === 2) yearRef.current?.focus();
  };

  const handleYear = (e) => {
    const v = e.target.value.replace(/\D/g, '').slice(0, 2);
    setYear(v);
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Backspace') {
      if (field === 'day' && day === '') monthRef.current?.focus();
      if (field === 'year' && year === '') dayRef.current?.focus();
    }
  };

  const sharedInputStyle = {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    fontFamily: typographyFontFamily,
    fontWeight: typographyFontWeight,
    fontSize: typographyFontSize,
    lineHeight: '1.4',
    color: colorsTextColor,
    textAlign: 'left', // Aligned left to stop character cutoff
    padding: '0 0 0 4px', // Extra left padding to keep "Khand" visible
    margin: '0',
    caretColor: colorsFocusColor,
    width: '4ch', // Slightly wider for safety
    boxSizing: 'border-box',
  };

  const separatorStyle = {
    color: colorsSeparatorColor,
    fontFamily: typographyFontFamily,
    fontWeight: typographyFontWeight,
    fontSize: typographyFontSize,
    userSelect: 'none',
    padding: '0 2px',
  };

  const isFocused = focused !== null;

  return (
    <div
      data-date={formattedDate || undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: colorsBackground,
        border: `1.5px solid ${isFocused ? colorsFocusColor : colorsBorderColor}`,
        borderRadius: '6px',
        padding: '8px 10px',
        transition: 'all 0.2s ease',
        boxShadow: isFocused ? `0 0 0 2px ${colorsFocusColor}33` : 'none',
        cursor: 'text',
      }}
      onClick={() => !focused && monthRef.current?.focus()}
    >
      <input
        ref={monthRef}
        type="text"
        inputMode="numeric"
        placeholder="MM"
        maxLength={2}
        value={month}
        onChange={handleMonth}
        onFocus={() => setFocused('month')}
        onBlur={() => setFocused(null)}
        onKeyDown={(e) => handleKeyDown(e, 'month')}
        style={sharedInputStyle}
      />
      <span style={separatorStyle}>/</span>
      <input
        ref={dayRef}
        type="text"
        inputMode="numeric"
        placeholder="DD"
        maxLength={2}
        value={day}
        onChange={handleDay}
        onFocus={() => setFocused('day')}
        onBlur={() => setFocused(null)}
        onKeyDown={(e) => handleKeyDown(e, 'day')}
        style={sharedInputStyle}
      />
      <span style={separatorStyle}>/</span>
      <input
        ref={yearRef}
        type="text"
        inputMode="numeric"
        placeholder="YY"
        maxLength={2}
        value={year}
        onChange={handleYear}
        onFocus={() => setFocused('year')}
        onBlur={() => setFocused(null)}
        onKeyDown={(e) => handleKeyDown(e, 'year')}
        style={sharedInputStyle}
      />
    </div>
  );
}
