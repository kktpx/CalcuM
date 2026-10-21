import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { useAuth } from '../auth/AuthProvider';
import { useProfile } from '../hooks/useProfile';
import { ProfileForm, validateProfileForm } from '../lib/validation';
import { CalcuColors } from '../theme/theme';

export function ProfileScreen() {
  const { signOut } = useAuth();
  const { profile, loading, loadError, reload, updateProfile } = useProfile();
  const [form, setForm] = useState<ProfileForm>(toForm(profile));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Refill the form whenever a (re)load delivers a new profile.
  useEffect(() => {
    setForm(toForm(profile));
  }, [profile]);

  const set = (key: keyof ProfileForm) => (text: string) => {
    setSaved(false);
    setForm((f) => ({ ...f, [key]: text }));
  };

  const save = async () => {
    if (busy) return;
    setError(null);
    setSaved(false);
    const check = validateProfileForm(form);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setBusy(true);
    try {
      const err = await updateProfile(check.patch);
      if (err) setError(err);
      else setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Profile</Text>

        {loadError && (
          <>
            <HelperText type="error" visible>
              {loadError}
            </HelperText>
            <Button mode="outlined" onPress={reload} loading={loading}>
              Retry
            </Button>
          </>
        )}

        <TextInput mode="outlined" label="Name" value={form.displayName} onChangeText={set('displayName')} />
        <TextInput
          mode="outlined"
          label="Calorie target (kcal)"
          keyboardType="number-pad"
          value={form.calorie}
          onChangeText={set('calorie')}
          style={styles.gap}
        />
        <TextInput
          mode="outlined"
          label="Protein target (g)"
          keyboardType="number-pad"
          value={form.protein}
          onChangeText={set('protein')}
          style={styles.gap}
        />
        <TextInput
          mode="outlined"
          label="Carbs target (g)"
          keyboardType="number-pad"
          value={form.carbs}
          onChangeText={set('carbs')}
          style={styles.gap}
        />
        <TextInput
          mode="outlined"
          label="Fat target (g)"
          keyboardType="number-pad"
          value={form.fat}
          onChangeText={set('fat')}
          style={styles.gap}
        />

        <HelperText type="error" visible={!!error}>
          {error}
        </HelperText>
        <HelperText type="info" visible={saved}>
          Saved
        </HelperText>

        <Button mode="contained" onPress={save} loading={busy} disabled={busy} style={styles.gap}>
          Save
        </Button>
        <Button onPress={signOut} disabled={busy} textColor="#EF4444" style={styles.gap}>
          Sign out
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function toForm(p: {
  displayName: string;
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
}): ProfileForm {
  return {
    displayName: p.displayName,
    calorie: String(p.calorieTarget),
    protein: String(p.proteinTarget),
    carbs: String(p.carbsTarget),
    fat: String(p.fatTarget),
  };
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: CalcuColors.background },
  content: { padding: 16, paddingBottom: 120 },
  title: { fontSize: 24, fontWeight: '700', color: CalcuColors.textPrimary, marginBottom: 16 },
  gap: { marginTop: 12 },
});
