import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CampusScreen } from '../screens/CampusScreen';
import { HostelScreen } from '../screens/HostelScreen';
import { FloorScreen } from '../screens/FloorScreen';
import { RoDetailScreen } from '../screens/RoDetailScreen';

export type AppStackParamList = {
  Campus: undefined;
  Hostel: { hostelId: string };
  Floor: { hostelId: string; floorNumber: number };
  RoDetail: { roId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Campus"
      screenOptions={{
        headerStyle: { backgroundColor: '#08131f' },
        headerTintColor: '#f0f7ff',
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#071019' },
      }}
    >
      <Stack.Screen name="Campus" component={CampusScreen} options={{ title: 'Campus Dashboard' }} />
      <Stack.Screen name="Hostel" component={HostelScreen} options={{ title: 'Hostel View' }} />
      <Stack.Screen name="Floor" component={FloorScreen} options={{ title: 'Floor View' }} />
      <Stack.Screen name="RoDetail" component={RoDetailScreen} options={{ title: 'RO Detail' }} />
    </Stack.Navigator>
  );
}