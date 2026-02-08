import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

import { useApp } from '../contexts/AppContext';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const { currentFontSizes } = useApp() as { currentFontSizes: { base: number; title: number; subtitle: number } };

  const typeStyles = {
    default: { fontSize: currentFontSizes.base, lineHeight: currentFontSizes.base * 1.5 },
    defaultSemiBold: { fontSize: currentFontSizes.base, lineHeight: currentFontSizes.base * 1.5, fontWeight: '600' as const },
    title: { fontSize: currentFontSizes.title, fontWeight: 'bold' as const, lineHeight: currentFontSizes.title },
    subtitle: { fontSize: currentFontSizes.subtitle, fontWeight: 'bold' as const },
    link: { lineHeight: currentFontSizes.base * 1.875, fontSize: currentFontSizes.base, color: '#0a7ea4' },
  };

  const typeStyle = typeStyles[type === 'defaultSemiBold' ? 'defaultSemiBold' : type === 'link' ? 'link' : type];

  return (
    <Text
      style={[{ color }, typeStyle, style]}
      {...rest}
    />
  );
}

