import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { useTabBarInset } from '../components/BottomTabBar';
import { useLoad } from '../hooks/useLoad';
import { deleteWeight, fetchWeightLogs, saveWeight } from '../lib/api';
import { WeightLog, localDateString, validateWeight } from '../lib/nutrition';
import { CalcuColors } from '../theme/theme';

const CHART_W = 300;
const CHART_H = 120;
const PAD = 8;

function WeightChart({ logs }: { logs: WeightLog[] }) {
  // logs arrive newest first; draw oldest to newest, last 30 entries.
  const pts = [...logs].slice(0, 30).reverse();
  if (pts.length < 2) return null;
  const kgs = pts.map((p) => p.kg);
  const min = Math.min(...kgs);
  const max = Math.max(...kgs);
  const span = max - min || 1;
  const coords = pts.map((p, i) => ({
    x: PAD + (i / (pts.length - 1)) * (CHART_W - 2 * PAD),
    y: PAD + (1 - (p.kg - min) / span) * (CHART_H - 2 * PAD),
  }));
  return (
    <Svg width="100%" height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`}>
      <Polyline
        points={coords.map((c) => `${c.x},${c.y}`).join(' ')}
        fill="none"
        stroke={CalcuColors.teal}
        strokeWidth={2}
      />
      {coords.map((c, i) => (
        <Circle key={pts[i].id} cx={c.x} cy={c.y} r={3} fill={CalcuColors.teal} />
      ))}
    </Svg>
  );
}

export function WeightScreen() {
  const bottomInset = useTabBarInset();
  const { data: logs, loading, error, reload } = useLoad<WeightLog[]>(fetchWeightLogs, []);
  const [text, setText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (busy) return;
    setFormError(null);
    const kg = validateWeight(text);
    if (kg === null) {
      setFormError('Enter your weight in kg, from 20 to 500 (one decimal at most).');
      return;
    }
    setBusy(true);
    try {
      const err = await saveWeight(localDateString(), kg);
      if (err) {
        setFormError(err);
        return;
      }
      setText('');
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = (log: WeightLog) => {
    Alert.alert('Delete entry', `Remove ${log.kg} kg on ${log.date}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const err = await deleteWeight(log.id);
          if (err) setFormError(err);
          else await reload();
        },
      },
    ]);
  };

  const latest = logs[0];
  const oldest = logs.length > 1 ? logs[logs.length - 1] : null;
  const change = latest && oldest ? Math.round((latest.kg - oldest.kg) * 10) / 10 : null;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.content, { paddingBottom: bottomInset }]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <Text style={styles.title}>Weight Tracker</Text>

      {latest && (
        <View style={styles.summary}>
          <Text style={styles.current}>{latest.kg} kg</Text>
          {change !== null && (
            <Text style={styles.change}>
              {change > 0 ? '+' : ''}
              {change} kg since {oldest!.date}
            </Text>
          )}
        </View>
      )}

      <WeightChart logs={logs} />

      <TextInput
        mode="outlined"
        label="Today's weight (kg)"
        keyboardType="decimal-pad"
        value={text}
        onChangeText={setText}
        style={styles.gap}
      />
      <HelperText type="error" visible={!!formError}>
        {formError}
      </HelperText>
      <Button mode="contained" onPress={save} loading={busy} disabled={busy}>
        Save
      </Button>

      {loading && logs.length === 0 ? (
        <ActivityIndicator color={CalcuColors.teal} style={styles.gap} />
      ) : error ? (
        <View style={styles.gap}>
          <HelperText type="error" visible>
            {error}
          </HelperText>
          <Button mode="outlined" onPress={reload} loading={loading}>
            Retry
          </Button>
        </View>
      ) : logs.length === 0 ? (
        <Text style={styles.empty}>No entries yet. Log your weight above.</Text>
      ) : (
        <View style={styles.card}>
          {logs.map((log, i) => (
            <View key={log.id}>
              <View style={styles.row}>
                <Text style={styles.date}>{log.date}</Text>
                <Text style={styles.kg}>{log.kg} kg</Text>
                <TouchableOpacity
                  onPress={() => confirmDelete(log)}
                  accessibilityLabel={`Delete entry for ${log.date}`}
                  style={styles.iconButton}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={20} color={CalcuColors.textMuted} />
                </TouchableOpacity>
              </View>
              {i < logs.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: CalcuColors.background },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: CalcuColors.textPrimary, marginBottom: 16 },
  gap: { marginTop: 12 },
  summary: { marginBottom: 8 },
  current: { fontSize: 32, fontWeight: '700', color: CalcuColors.teal },
  change: { fontSize: 13, color: CalcuColors.textSecondary, marginTop: 2 },
  empty: { color: CalcuColors.textSecondary, textAlign: 'center', marginTop: 32 },
  card: {
    marginTop: 16,
    backgroundColor: CalcuColors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: CalcuColors.borderMedium,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  date: { flex: 1, fontSize: 15, color: CalcuColors.textSecondary },
  kg: { fontSize: 16, fontWeight: '600', color: CalcuColors.textPrimary },
  iconButton: { marginLeft: 12, padding: 4 },
  divider: { height: 1, backgroundColor: CalcuColors.borderMedium, marginVertical: 8 },
});
