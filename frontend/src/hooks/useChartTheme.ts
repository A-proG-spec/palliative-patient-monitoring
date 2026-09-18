/**
 * useChartTheme — returns Recharts-compatible style values
 * that automatically adapt to the current light/dark theme.
 *
 * Uses CSS custom properties from globals.css so chart colours
 * follow the design token system.
 */

import { useTheme } from '@/context/ThemeContext';

export interface ChartTheme {
  gridStroke: string;
  axisStroke: string;
  axisTick: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  refLineStroke: string;
  legendText: string;
}

export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === 'dark';

  return {
    gridStroke:     dark ? '#2A2F42' : '#E6EBF4',
    axisStroke:     dark ? '#3A3F54' : '#E6EBF4',
    axisTick:       dark ? '#636A82' : '#8290A7',
    tooltipBg:      dark ? '#1A1D26' : '#FFFFFF',
    tooltipBorder:  dark ? '#2A2F42' : '#E6EBF4',
    tooltipText:    dark ? '#E4E7F0' : '#181C20',
    refLineStroke:  dark ? '#3A3F54' : '#C2C6D6',
    legendText:     dark ? '#AAB0C4' : '#52627A',
  };
}
