import React, { memo } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface CircularProgressChartProps {
  correct: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  showPercentage?: boolean;
}

const CircularProgressChart = memo<CircularProgressChartProps>(function CircularProgressChart({
  correct,
  total,
  size = 180,
  strokeWidth = 18,
  showPercentage = true,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.round((correct / total) * 100);
  const offset = circumference - (percentage / 100) * circumference;
  
  const getColor = () => {
    if (percentage >= 70) return "#22c55e";
    if (percentage >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {showPercentage && (
        <View style={{ position: "absolute", alignItems: "center" }}>
          <Text style={{ fontSize: 44, fontWeight: "800", color: "#1e293b" }}>{percentage}%</Text>
        </View>
      )}
    </View>
  );
});

CircularProgressChart.displayName = "CircularProgressChart";

export default CircularProgressChart;
