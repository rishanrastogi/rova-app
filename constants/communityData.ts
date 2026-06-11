export interface RoutePoint {
  x: number;
  y: number;
}

export interface CommunityRide {
  id: string;
  user: {
    name: string;
    initials: string;
    color: string;
  };
  activity: string;
  timeAgo: string;
  title: string;
  distance: number; // km
  duration: string;
  avgSpeed: number; // km/h
  elevation: number; // m
  kudos: number;
  comments: number;
  // Normalized route points in a 200x100 viewBox, used to draw a route preview
  route: RoutePoint[];
}

export const communityFeed: CommunityRide[] = [
  {
    id: '1',
    user: { name: 'Maya Chen', initials: 'MC', color: '#FF5C7A' },
    activity: 'Morning Ride',
    timeAgo: '2h ago',
    title: 'Sunrise loop around the harbor',
    distance: 18.4,
    duration: '52m',
    avgSpeed: 21.2,
    elevation: 142,
    kudos: 24,
    comments: 3,
    route: [
      { x: 20, y: 80 }, { x: 60, y: 30 }, { x: 120, y: 20 },
      { x: 170, y: 50 }, { x: 140, y: 85 }, { x: 70, y: 90 }, { x: 20, y: 80 },
    ],
  },
  {
    id: '2',
    user: { name: 'Jordan Pierce', initials: 'JP', color: '#38BDF8' },
    activity: 'Commute',
    timeAgo: '4h ago',
    title: 'Quick ride to the office',
    distance: 9.1,
    duration: '24m',
    avgSpeed: 22.8,
    elevation: 38,
    kudos: 11,
    comments: 1,
    route: [
      { x: 15, y: 90 }, { x: 15, y: 60 }, { x: 60, y: 60 },
      { x: 60, y: 30 }, { x: 110, y: 30 }, { x: 110, y: 10 }, { x: 160, y: 10 },
    ],
  },
  {
    id: '3',
    user: { name: 'Sam Okafor', initials: 'SO', color: '#34D399' },
    activity: 'Evening Ride',
    timeAgo: '7h ago',
    title: 'Hill repeats up Ridge Road',
    distance: 27.6,
    duration: '1h 38m',
    avgSpeed: 16.9,
    elevation: 412,
    kudos: 41,
    comments: 6,
    route: [
      { x: 10, y: 95 }, { x: 40, y: 80 }, { x: 30, y: 60 }, { x: 65, y: 50 },
      { x: 55, y: 30 }, { x: 90, y: 20 }, { x: 80, y: 5 }, { x: 120, y: 8 },
    ],
  },
  {
    id: '4',
    user: { name: 'Priya Nair', initials: 'PN', color: '#A78BFA' },
    activity: 'Weekend Ride',
    timeAgo: '1d ago',
    title: 'Lakeside loop with the crew',
    distance: 34.2,
    duration: '1h 49m',
    avgSpeed: 18.8,
    elevation: 210,
    kudos: 67,
    comments: 12,
    route: [
      { x: 100, y: 20 }, { x: 150, y: 40 }, { x: 160, y: 80 }, { x: 110, y: 95 },
      { x: 60, y: 85 }, { x: 40, y: 50 }, { x: 70, y: 25 }, { x: 100, y: 20 },
    ],
  },
  {
    id: '5',
    user: { name: 'Leo Martins', initials: 'LM', color: '#FFB547' },
    activity: 'Recovery Ride',
    timeAgo: '1d ago',
    title: 'Easy spin along the river path',
    distance: 12.7,
    duration: '41m',
    avgSpeed: 18.6,
    elevation: 24,
    kudos: 19,
    comments: 2,
    route: [
      { x: 5, y: 70 }, { x: 50, y: 50 }, { x: 100, y: 60 }, { x: 150, y: 35 }, { x: 195, y: 45 },
    ],
  },
  {
    id: '6',
    user: { name: 'Ava Thompson', initials: 'AT', color: '#FF8A65' },
    activity: 'Gravel Ride',
    timeAgo: '2d ago',
    title: 'Exploring the back trails',
    distance: 41.5,
    duration: '2h 12m',
    avgSpeed: 18.8,
    elevation: 365,
    kudos: 53,
    comments: 8,
    route: [
      { x: 12, y: 30 }, { x: 45, y: 55 }, { x: 35, y: 90 }, { x: 80, y: 95 },
      { x: 95, y: 60 }, { x: 140, y: 65 }, { x: 160, y: 30 }, { x: 188, y: 20 },
    ],
  },
];
