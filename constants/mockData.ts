export const cyclingDefaults = {
  maxSpeed: 20,
  battery: 78,
  range: 42,
  mode: 'Assist',
  currentSong: 'Blinding Lights - The Weeknd',
};

export const widgets = [
  { id: 'speed',     label: 'Speed',            description: 'Current, avg and max speed',    icon: 'speedometer' },
  { id: 'battery',   label: 'Battery',           description: 'Charge level and range',        icon: 'battery.100.bolt' },
  { id: 'map',       label: 'Map',               description: 'Live navigation and route',     icon: 'map.fill' },
  { id: 'camera',    label: 'Rear Camera',        description: 'Live rear view feed',           icon: 'camera.fill' },
  { id: 'proximity', label: 'Proximity',          description: 'Proximity alerts for nearby risks',icon: 'checkmark.shield' },
  { id: 'music',     label: 'Music',              description: 'Playback and controls',         icon: 'music.note' },
  { id: 'weather',   label: 'Weather',            description: 'Temperature and conditions',    icon: 'cloud.sun.fill' },
  { id: 'hydration', label: 'Hydration',          description: 'Reminders and tracking',        icon: 'drop.fill' },
  { id: 'calendar',  label: 'Calendar',           description: 'Upcoming events and schedule',  icon: 'calendar' },
];
