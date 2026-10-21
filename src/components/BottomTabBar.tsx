import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalcuColors } from '../theme/theme';

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Approximate height of the tab bar content (icon + label + top padding).
const TAB_BAR_CONTENT_HEIGHT = 56;

/** Space scrollable screens must leave at the bottom so the absolute tab bar never covers content. */
export function useTabBarInset(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_CONTENT_HEIGHT + Math.max(insets.bottom, 12) + 16;
}

export function BottomTabBar({ activeTab, onTabChange }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const tabs = [
    { key: 'home', label: 'Home', icon: 'home' },
    { key: 'foods', label: 'Foods', icon: 'silverware-fork-knife' },
    { key: 'weight', label: 'Weight', icon: 'scale-bathroom' },
    { key: 'profile', label: 'Profile', icon: 'account' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const color = isActive ? CalcuColors.teal : CalcuColors.textMuted;
        
        return (
          <TouchableOpacity 
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onTabChange(tab.key)}
          >
            <MaterialCommunityIcons name={tab.icon as any} size={24} color={color} />
            <Text style={[styles.tabLabel, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 1,
    borderTopColor: CalcuColors.borderMedium,
    paddingTop: 12,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
