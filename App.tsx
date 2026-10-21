import React, { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';

import { CalcuTheme, CalcuColors } from './src/theme/theme';
import { CalcuAppbar } from './src/components/CalcuAppbar';
import { BottomTabBar } from './src/components/BottomTabBar';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': 
        return <DashboardScreen />;
      case 'foods': 
        return <PlaceholderScreen title="Foods" icon="silverware-fork-knife" />;
      case 'weight': 
        return <PlaceholderScreen title="Weight Tracker" icon="scale-bathroom" />;
      case 'profile': 
        return <PlaceholderScreen title="Profile" icon="account" />;
      default: 
        return <DashboardScreen />;
    }
  };

  return (
    <SafeAreaProvider>
      <PaperProvider theme={CalcuTheme}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <StatusBar style="dark" />
          <CalcuAppbar />
          
          <View style={styles.mainContent}>
            {renderScreen()}
          </View>
          
          <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </SafeAreaView>
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
  }
});
