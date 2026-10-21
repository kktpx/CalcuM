import React, { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { CalcuTheme, CalcuColors } from './src/theme/theme';
import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import { ProfileProvider } from './src/hooks/useProfile';
import { CalcuAppbar } from './src/components/CalcuAppbar';
import { BottomTabBar } from './src/components/BottomTabBar';
import { AuthScreen } from './src/screens/AuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { FoodsScreen } from './src/screens/FoodsScreen';
import { WeightScreen } from './src/screens/WeightScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { useKeyboardVisible } from './src/hooks/useKeyboardVisible';

function Root() {
  const { session, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const keyboardVisible = useKeyboardVisible();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={CalcuColors.teal} size="large" />
      </View>
    );
  }

  if (!session) {
    return <AuthScreen />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'foods':
        return <FoodsScreen />;
      case 'weight':
        return <WeightScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'home':
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <>
      <CalcuAppbar onProfilePress={() => setActiveTab('profile')} />
      <View style={styles.mainContent}>{renderScreen()}</View>
      {!keyboardVisible && <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={CalcuTheme}>
        <AuthProvider>
          <ProfileProvider>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
              <StatusBar style="dark" />
              <Root />
            </SafeAreaView>
          </ProfileProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CalcuColors.card, // Match the Appbar header background
  },
  mainContent: {
    flex: 1,
    backgroundColor: CalcuColors.background,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CalcuColors.background,
  },
});
