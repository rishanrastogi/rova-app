import { Tabs } from 'expo-router';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Icon } from '../../components/Icon';
import DriveIcon from '../../components/DriveIcon';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../constants/fonts';

interface TabIconProps {
  name: string;
  color: string;
  size: number;
  focused: boolean;
  isCenter?: boolean;
}

function TabIcon({ name, color, size, focused, isCenter }: TabIconProps) {
  const { colors, isDark } = useTheme();
  if (isCenter) {
    return (
      <View style={[
        styles.centerTabIcon,
        {
          backgroundColor: isDark ? '#0D1520' : '#EEF4FF',
          borderColor: focused ? colors.primary : (isDark ? '#1E2A3A' : '#C7D7F0'),
        },
        focused && { shadowColor: colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
      ]}>
        <Icon name={name} size={size + 6} color={focused ? colors.primary : (isDark ? '#888' : '#9CA3AF')} />
      </View>
    );
  }
  return <Icon name={name} size={size} color={color} />;
}

export default function TabLayout() {
  const { width, height } = useWindowDimensions();
  const { colors, isDark } = useTheme();
  const isLandscape = width > height;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: isLandscape ? { display: 'none' } : {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: isDark ? '#1A1A2E' : '#E2E8F0',
          borderTopWidth: 1,
          height: 76,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Screen
        name="drive"
        options={{
          title: 'Drive',
          tabBarIcon: ({ color, size }) => (
            <DriveIcon color={color} size={size + 4} />
          ),
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'Health',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="heart.fill" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="rovaplay"
        options={{
          title: 'Play',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="play.circle.fill" color={color} size={22} focused={focused} isCenter />
          ),
          tabBarLabelStyle: [styles.tabLabel, { color: colors.primary, fontFamily: Fonts.bold }],
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="person.2.fill" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="person.fill" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
  },
  centerTabIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -7,
    borderWidth: 1.5,
  },
});
