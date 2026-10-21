import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar, Avatar } from 'react-native-paper';
import { CalcuColors } from '../theme/theme';
import { useProfile } from '../hooks/useProfile';
import { initialsOf } from '../lib/profile';

interface CalcuAppbarProps {
  onProfilePress: () => void;
}

export function CalcuAppbar({ onProfilePress }: CalcuAppbarProps) {
  const { profile } = useProfile();
  return (
    <Appbar.Header style={styles.header} mode="small" elevated={true}>
      <Appbar.Content 
        title="Calcu" 
        titleStyle={styles.title}
      />
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.avatarWrapper}
          onPress={onProfilePress}
          accessibilityLabel="Open profile"
        >
          <Avatar.Text 
            size={40} 
            label={initialsOf(profile.displayName)}
            style={styles.avatar}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: CalcuColors.card,
    borderBottomWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontWeight: '800',
    color: CalcuColors.teal,
    fontSize: 24,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  avatarWrapper: {
    marginRight: 8,
  },
  avatar: {
    backgroundColor: CalcuColors.teal,
    borderWidth: 2,
    borderColor: '#CCFBF1',
  },
});
