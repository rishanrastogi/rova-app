import { View, Text } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function HealthScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: colors.textPrimary, fontSize: 24, fontWeight: '600' }}>Health</Text>
    </View>
  );
}
