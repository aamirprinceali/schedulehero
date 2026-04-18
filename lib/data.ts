// Initial seed data — districts, schools, and a sample provider to start
// Everything here can be added to / removed from within the app

import { District, Provider } from './types';

export const INITIAL_DISTRICTS: District[] = [
  {
    id: 'wsd',
    name: 'Wilmington School District',
    schools: ['Denver', 'Holmes', 'Wilmington Middle School', 'Wilmington High School'],
  },
  {
    id: 'gasd',
    name: 'Greater Albany School District',
    schools: ['North Albany Middle School', 'Oak Grove Elementary', 'Oak Elementary', 'Lafayette'],
  },
  {
    id: 'scisd',
    name: 'St. Clairesville ISD',
    schools: ['St. Clairesville Elementary'],
  },
];

// Provider colors — rotate through these for new providers
export const PROVIDER_COLORS = [
  '#4ECDC4', // teal
  '#FF6B35', // orange
  '#6C5CE7', // purple
  '#00B894', // green
  '#FDCB6E', // yellow
  '#E17055', // coral
  '#74B9FF', // blue
  '#A29BFE', // lavender
  '#55EFC4', // mint
  '#FD79A8', // pink
];

// Sample provider so the app isn't empty on first load
export const SAMPLE_PROVIDERS: Provider[] = [
  {
    id: 'provider-sample-1',
    name: 'Sample Provider',
    active: true,
    role: 'Clinical Provider',
    color: '#4ECDC4',
    schedule: {
      // All 1:1 at Denver all day
      Monday: {
        isOff: false,
        morning: { school: 'Denver', sessionType: '1:1' },
      },
      // Mixed: 1:1 in morning + WC in afternoon at same school
      Tuesday: {
        isOff: false,
        morning: { school: 'Holmes', sessionType: '1:1' },
        afternoon: { school: 'Holmes', sessionType: 'WC' },
      },
      // Split day: different schools
      Wednesday: {
        isOff: false,
        morning: { school: 'Denver', sessionType: '1:1' },
        afternoon: { school: 'Wilmington Middle School', sessionType: 'WC' },
      },
      // Assessment all day
      Thursday: {
        isOff: false,
        morning: { school: 'Wilmington High School', sessionType: 'Assessment' },
      },
      Friday: { isOff: true },
    },
    createdAt: new Date().toISOString(),
  },
];
