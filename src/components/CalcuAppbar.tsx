import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Appbar, Avatar, Badge } from 'react-native-paper';
import { CalcuColors } from '../theme/theme';
import { mockNotificationCount } from '../data/mockData';
import { useProfile } from '../hooks/useProfile';
import { initialsOf } from '../lib/profile';

export function CalcuAppbar() {
  const { profile } = useProfile();
  return (
    <Appbar.Header style={styles.header} mode="small" elevated={true}>
      <Appbar.Content 
        title="Calcu" 
        titleStyle={styles.title}
      />
      
      <View style={styles.actionContainer}>
        <View style={styles.bellWrapper}>
          <Appbar.Action 
            icon="bell-outline" 
            color={CalcuColors.textPrimary}
            onPress={() => console.log("Notifications clicked")} 
          />
          <Badge 
            visible={mockNotificationCount > 0} 
            size={18} 
            style={styles.badge}
          >
            {mockNotificationCount}
          </Badge>
        </View>

        <TouchableOpacity 
          style={styles.avatarWrapper}
          onPress={() => console.log("Profile clicked")}
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
  bellWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
