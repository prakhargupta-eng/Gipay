import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient as SVGLinearGradient, Stop, Rect } from 'react-native-svg';

interface LinearGradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  locations?: number[];
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

const LinearGradient: React.FC<LinearGradientProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 0, y: 1 },
  locations,
  style,
  children,
}) => {
  // Safe check for colors array
  if (!colors || colors.length === 0) {
    colors = ['#transparent', '#transparent'];
  } else if (colors.length === 1) {
    colors = [colors[0], colors[0]];
  }

  return (
    <View style={[styles.container, style]}>
      <View style={StyleSheet.absoluteFill}>
        <Svg width="100%" height="100%">
          <Defs>
            <SVGLinearGradient
              id="svg-linear-grad"
              x1={`${start.x * 100}%`}
              y1={`${start.y * 100}%`}
              x2={`${end.x * 100}%`}
              y2={`${end.y * 100}%`}
            >
              {colors.map((color, index) => {
                const offset = locations && locations[index] !== undefined
                  ? `${locations[index] * 100}%`
                  : `${(index / (colors.length - 1)) * 100}%`;
                return (
                  <Stop
                    key={index}
                    offset={offset}
                    stopColor={color}
                  />
                );
              })}
            </SVGLinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#svg-linear-grad)" />
        </Svg>
      </View>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});

export default LinearGradient;
