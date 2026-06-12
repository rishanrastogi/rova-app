import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon } from '../Icon';
import { useTheme } from '../../context/ThemeContext';
import { Fonts } from '../../constants/fonts';

export type Widget = { id: string; label: string; description?: string; icon: string };

interface Props {
  widgets: Widget[];
  activeWidgets: Set<string>;
  onToggle: (id: string) => void;
}

const MANDATORY = new Set(['speed', 'battery']);

export default function WidgetGrid({ widgets, activeWidgets, onToggle }: Props) {
  const speedWidget = widgets.find(w => w.id === 'speed');
  const restWidgets = widgets.filter(w => w.id !== 'speed');

  const rows: Widget[][] = [];
  for (let i = 0; i < restWidgets.length; i += 2) {
    rows.push(restWidgets.slice(i, i + 2));
  }

  return (
    <View style={styles.container}>
      {speedWidget && (
        <WidgetCard widget={speedWidget} active={activeWidgets.has(speedWidget.id)} mandatory onToggle={onToggle} hero />
      )}
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map(widget => (
            <WidgetCard key={widget.id} widget={widget} active={activeWidgets.has(widget.id)} mandatory={MANDATORY.has(widget.id)} onToggle={onToggle} />
          ))}
          {row.length === 1 && <View style={styles.cardHalf} />}
        </View>
      ))}
    </View>
  );
}

function WidgetCard({ widget, active, mandatory, onToggle, hero = false }: {
  widget: Widget;
  active: boolean;
  mandatory: boolean;
  onToggle: (id: string) => void;
  hero?: boolean;
}) {
  const { colors, isDark } = useTheme();

  const activeCardBg = isDark ? '#1E3A5F' : '#E0F2FE';
  const bg = active ? activeCardBg : colors.card;
  const borderColor = active ? colors.accent : colors.border;
  const iconColor = active ? colors.accent : colors.textSecondary;
  const checkBorder = active ? colors.accent : (isDark ? '#2A3548' : colors.border);

  return (
    <TouchableOpacity
      onPress={() => { if (!mandatory) onToggle(widget.id); }}
      activeOpacity={mandatory ? 1 : 0.75}
      style={[styles.card, hero ? styles.cardHero : styles.cardHalf, { backgroundColor: bg, borderWidth: 1, borderColor }]}
    >
      <Icon name={widget.icon} size={28} color={iconColor} />

      <View style={[styles.checkBadge, { backgroundColor: active ? colors.accent : 'transparent', borderColor: checkBorder }, active && styles.checkBadgeActive]}>
        {active && <Icon name="checkmark.circle.fill" size={18} color="#FFFFFF" />}
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>{widget.label}</Text>
        {widget.description && (
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{widget.description}</Text>
        )}
        {mandatory && (
          <Text style={[styles.requiredTag, { color: colors.textSecondary }]}>required</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  card: { borderRadius: 20, padding: 18, justifyContent: 'space-between', position: 'relative' },
  cardHero: { height: 170 },
  cardHalf: { flex: 1, height: 165 },
  checkBadge: {
    position: 'absolute', top: 14, right: 14,
    width: 28, height: 28, borderRadius: 14,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center',
  },
  checkBadgeActive: { borderWidth: 0 },
  cardFooter: { gap: 2 },
  cardLabel: { fontSize: 17, fontFamily: Fonts.bold, letterSpacing: -0.3 },
  cardDesc: { fontSize: 12, fontFamily: Fonts.regular },
  requiredTag: { fontSize: 10, fontFamily: Fonts.semiBold, letterSpacing: 0.5, marginTop: 2 },
});
