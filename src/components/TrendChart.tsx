import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Line, Polyline, Text as SvgText } from 'react-native-svg';

type Props = {
  values: number[];
  height?: number;
  stroke?: string;
  label?: string;
};

export function TrendChart({ values, height = 180, stroke = '#4dd0e1', label }: Props) {
  const width = 340;
  const paddedWidth = width - 32;
  const paddedHeight = height - 32;

  const points = useMemo(() => {
    if (values.length === 0) {
      return '';
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = Math.max(max - min, 0.0001);

    return values
      .map((value, index) => {
        const x = 16 + (index / Math.max(values.length - 1, 1)) * paddedWidth;
        const y = 16 + paddedHeight - ((value - min) / range) * paddedHeight;
        return `${x},${y}`;
      })
      .join(' ');
  }, [paddedHeight, paddedWidth, values]);

  const axisColor = '#274053';

  return (
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line x1="16" y1={height - 16} x2={width - 16} y2={height - 16} stroke={axisColor} strokeWidth="1.5" />
        <Line x1="16" y1="16" x2="16" y2={height - 16} stroke={axisColor} strokeWidth="1.5" />
        <Polyline points={points} fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        {values.map((value, index) => {
          const min = Math.min(...values);
          const max = Math.max(...values);
          const range = Math.max(max - min, 0.0001);
          const x = 16 + (index / Math.max(values.length - 1, 1)) * paddedWidth;
          const y = 16 + paddedHeight - ((value - min) / range) * paddedHeight;

          return <Line key={`${index}-${value}`} x1={x} y1={y} x2={x} y2={y} stroke={stroke} strokeWidth="5" strokeLinecap="round" />;
        })}
        {label ? <SvgText x="24" y="28" fill="#d8e8f6" fontSize="12" fontWeight="700">{label}</SvgText> : null}
      </Svg>
    </View>
  );
}