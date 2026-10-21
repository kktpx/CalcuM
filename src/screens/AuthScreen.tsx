import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { useAuth } from '../auth/AuthProvider';
import { validateCredentials } from '../lib/validation';
import { CalcuColors } from '../theme/theme';

export function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    setError(null);
    setNotice(null);
    const check = validateCredentials(email, password);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setBusy(true);
    try {
      if (mode === 'signIn') {
        setError(await signIn(check.email, password));
      } else {
        const result = await signUp(check.email, password);
        setError(result.error);
        if (result.needsConfirmation) setNotice('If this email is new, check your inbox to confirm your account.');
      }
    } finally {
      setBusy(false);
    }
  };

  const isSignIn = mode === 'signIn';

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
        <Text style={styles.brand}>Calcu</Text>
        <Text style={styles.subtitle}>{isSignIn ? 'Sign in to continue' : 'Create your account'}</Text>

        <View style={styles.form}>
          <TextInput
            mode="outlined"
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <TextInput
            mode="outlined"
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword((v) => !v)}
              />
            }
            style={styles.gap}
          />
          <HelperText type="error" visible={!!error}>
            {error}
          </HelperText>
          <HelperText type="info" visible={!!notice}>
            {notice}
          </HelperText>

          <Button mode="contained" onPress={submit} loading={busy} disabled={busy} style={styles.gap}>
            {isSignIn ? 'Sign in' : 'Create account'}
          </Button>
          <Button
            onPress={() => {
              setMode(isSignIn ? 'signUp' : 'signIn');
              setError(null);
              setNotice(null);
            }}
            disabled={busy}
          >
            {isSignIn ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </Button>
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: CalcuColors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  brand: { fontSize: 40, fontWeight: '800', color: CalcuColors.teal, textAlign: 'center' },
  subtitle: { fontSize: 16, color: CalcuColors.textSecondary, textAlign: 'center', marginTop: 8, marginBottom: 32 },
  form: { width: '100%' },
  gap: { marginTop: 12 },
});
