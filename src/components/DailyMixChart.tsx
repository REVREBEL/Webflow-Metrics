import React from 'react';
import Block from '../site-components/webflow_modules/Basic/components/Block';

interface DailyMixChartProps {
  title?: string;
  metric1Label?: string;
  metric2Label?: string;
  chartData?: React.ReactNode;
  horizontalAxis?: React.ReactNode;
}

/**
 * Fixed version of ChartByDayMix that removes the display:contents wrapper.
 * 
 * The original Webflow component wraps everything in a div with display:contents,
 * which removes it from the layout tree and causes rendering issues.
 * This version renders the .bar-mix-card directly.
 */
export function DailyMixChart({
  title = "Daily Mix Chart",
  metric1Label = "Transient",
  metric2Label = "Group",
  chartData,
  horizontalAxis
}: DailyMixChartProps) {
  return (
    <Block className="bar-mix-card add-shadow" tag="div">
      <Block className="bar-mix-card_plot-area" tag="div">
        <Block className="chart-container" tag="div">
          {chartData && (
            <Block className="stacked-bar-chart_slot" tag="div">
              {chartData}
            </Block>
          )}
          {horizontalAxis && (
            <Block className="horizontal_axis" tag="div">
              {horizontalAxis}
            </Block>
          )}
        </Block>
      </Block>
      <Block className="flex_vertical" tag="div">
        <Block className="kpi-card_label is-secondary" tag="div">
          {title}
        </Block>
      </Block>
    </Block>
  );
}
