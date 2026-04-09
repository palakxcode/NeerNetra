import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HostelCard } from '../components/HostelCard';
import { MetricPill } from '../components/MetricPill';
import { SectionCard } from '../components/SectionCard';
import { SearchFilters } from '../components/SearchFilters';
import { StatusPill } from '../components/StatusPill';
import { useMonitoring } from '../context/MonitoringContext';
import { AppStackParamList } from '../navigation/AppNavigator';
import { assessRo, formatLastUpdated } from '../utils/monitoring';
import { FilterState } from '../types/monitoring';

type Props = NativeStackScreenProps<AppStackParamList, 'Campus'>;

const initialFilters: FilterState = {
  query: '',
  unsafeOnly: false,
  monkeyOnly: false,
};

export function CampusScreen({ navigation }: Props) {
  const { campus, lastRefresh, refreshNow } = useMonitoring();
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const hostelSummaries = useMemo(() => {
    return campus.hostels.map((hostel) => {
      const roAssessments = hostel.floors.flatMap((floor) => floor.ro_list.map(assessRo));
      const status = roAssessments.some((assessment) => assessment.status === 'critical')
        ? 'critical'
        : roAssessments.some((assessment) => assessment.status === 'warning')
          ? 'warning'
          : 'safe';
      const activeAlertsCount = roAssessments.reduce((sum, assessment) => sum + assessment.alerts.length, 0);

      return {
        hostel,
        totalRos: hostel.floors.reduce((sum, floor) => sum + floor.ro_list.length, 0),
        activeAlertsCount,
        status,
        criticalCount: roAssessments.filter((assessment) => assessment.status === 'critical').length,
        hasMonkeyAlert: roAssessments.some((assessment) => assessment.alerts.some((alert) => alert.type === 'monkey')),
      };
    });
  }, [campus]);

  const filteredHostels = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return hostelSummaries.filter(({ hostel, activeAlertsCount, criticalCount, hasMonkeyAlert }) => {
      const matchesQuery =
        !query ||
        hostel.name.toLowerCase().includes(query) ||
        hostel.id.toLowerCase().includes(query) ||
        hostel.floors.some((floor) => String(floor.floor_number).includes(query)) ||
        hostel.floors.some((floor) => floor.ro_list.some((ro) => ro.id.toLowerCase().includes(query)));

      const unsafeMatch = !filters.unsafeOnly || activeAlertsCount > 0 || criticalCount > 0;
      const monkeyMatch = !filters.monkeyOnly || hasMonkeyAlert;

      return matchesQuery && unsafeMatch && monkeyMatch;
    });
  }, [filters, hostelSummaries]);

  const campusTotals = useMemo(() => {
    const allAssessments = campus.hostels.flatMap((hostel) => hostel.floors.flatMap((floor) => floor.ro_list.map(assessRo)));
    return {
      totalRos: allAssessments.length,
      critical: allAssessments.filter((assessment) => assessment.status === 'critical').length,
      warning: allAssessments.filter((assessment) => assessment.status === 'warning').length,
      activeAlerts: allAssessments.reduce((sum, assessment) => sum + assessment.alerts.length, 0),
    };
  }, [campus]);

  return (
    <View style={styles.screen}>
      <LinearGradient colors={['#0d1f30', '#071019']} style={styles.hero}>
        <View style={styles.heroRow}>
          <View style={styles.heroTextBlock}>
            <Text style={styles.kicker}>Real-time water safety</Text>
            <Text style={styles.heroTitle}>Campus status first. Drill down fast.</Text>
            <Text style={styles.heroCopy}>186 RO units across 6 hostels, with alerts prioritized by severity and contamination risk.</Text>
          </View>
          <Pressable onPress={refreshNow} style={styles.refreshButton}>
            <Feather name="refresh-cw" size={16} color="#071019" />
          </Pressable>
        </View>
        <View style={styles.summaryRow}>
          <MetricPill label="ROs" value={campusTotals.totalRos} tone="cyan" />
          <MetricPill label="Alerts" value={campusTotals.activeAlerts} tone="rose" />
          <MetricPill label="Critical" value={campusTotals.critical} tone="amber" />
          <MetricPill label="Warning" value={campusTotals.warning} tone="green" />
        </View>
        <View style={styles.statusRow}>
          <StatusPill status={campusTotals.critical > 0 ? 'critical' : campusTotals.warning > 0 ? 'warning' : 'safe'} />
          <Text style={styles.timestamp}>Last sync {formatLastUpdated(lastRefresh)}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionCard>
          <SearchFilters filters={filters} onChange={setFilters} />
        </SectionCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hostels</Text>
          <Text style={styles.sectionMeta}>{filteredHostels.length} visible</Text>
        </View>

        <FlatList
          data={filteredHostels}
          scrollEnabled={false}
          keyExtractor={({ hostel }) => hostel.id}
          renderItem={({ item }) => (
            <HostelCard hostel={item.hostel} onPress={() => navigation.navigate('Hostel', { hostelId: item.hostel.id })} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={<SectionCard><Text style={styles.empty}>No hostels match the current filters.</Text></SectionCard>}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#071019',
  },
  hero: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    borderBottomWidth: 1,
    borderColor: '#1a2d3f',
    gap: 16,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroTextBlock: {
    flex: 1,
    gap: 8,
  },
  kicker: {
    color: '#77e4f0',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroTitle: {
    color: '#f2f7ff',
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  heroCopy: {
    color: '#b8c8d6',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 360,
  },
  refreshButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#71e4ef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    color: '#91a5b8',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#eff6ff',
    fontSize: 18,
    fontWeight: '900',
  },
  sectionMeta: {
    color: '#7d90a3',
    fontWeight: '700',
  },
  empty: {
    color: '#a5bacd',
  },
});