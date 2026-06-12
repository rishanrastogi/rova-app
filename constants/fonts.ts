export const Fonts = {
  thin: 'Inter-Thin',
  extraLight: 'Inter-ExtraLight',
  light: 'Inter-Light',
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
} as const;

export const fontAssets = {
  'Inter-Thin': require('../assets/fonts/Inter-Thin.ttf'),
  'Inter-ExtraLight': require('../assets/fonts/Inter-ExtraLight.ttf'),
  'Inter-Light': require('../assets/fonts/Inter-Light.ttf'),
  'Inter-Regular': require('../assets/fonts/Inter-Regular.ttf'),
  'Inter-Medium': require('../assets/fonts/Inter-Medium.ttf'),
  'Inter-SemiBold': require('../assets/fonts/Inter-SemiBold.ttf'),
  'Inter-Bold': require('../assets/fonts/Inter-Bold.ttf'),
  'Inter-ExtraBold': require('../assets/fonts/Inter-ExtraBold.ttf'),
};

// Maps the numeric `fontWeight` values used throughout the app to the matching
// Inter static font file (custom fonts ignore `fontWeight`, so the weight must
// be selected via `fontFamily` instead).
export const fontForWeight: Record<string, string> = {
  '100': Fonts.thin,
  '200': Fonts.extraLight,
  '300': Fonts.light,
  '400': Fonts.regular,
  '500': Fonts.medium,
  '600': Fonts.semiBold,
  '700': Fonts.bold,
  '800': Fonts.extraBold,
};
