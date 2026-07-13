const roadSigns = [
  {
    id: 1,
    name: 'Stop Sign',
    image: '/road-signs/stop-sign.svg',
    category: 'Regulatory',
    description: 'A red octagonal (8-sided) sign means STOP. Come to a complete stop at the stop line, crosswalk, or before entering the intersection.',
    bookReference: 'Section 1 - Traffic Signals, Section 2 - Stop and Yield Signs'
  },
  {
    id: 2,
    name: 'Yield Sign',
    image: '/road-signs/yield-sign.svg',
    category: 'Regulatory',
    description: 'An upside-down triangle (point down). Slow down and be prepared to stop. Give the right-of-way to other vehicles and pedestrians.',
    bookReference: 'Section 2 - Stop and Yield Signs'
  },
  {
    id: 3,
    name: 'Warning Sign',
    image: '/road-signs/warning-sign.svg',
    category: 'Warning',
    description: 'Yellow diamond-shaped signs warn of upcoming hazards ahead such as sharp curves, slippery roads, or animal crossings.',
    bookReference: 'Section 3 - Warning Signs'
  },
  {
    id: 4,
    name: 'School Zone',
    image: '/road-signs/school-zone.svg',
    category: 'Warning',
    description: 'Pentagonal (5-sided) yellow-green sign indicating a school zone ahead. Reduce speed and watch for children.',
    bookReference: 'Section 3 - Warning Signs, Section 5 - Speed Limits'
  },
  {
    id: 5,
    name: 'No Entry',
    image: '/road-signs/no-entry.svg',
    category: 'Regulatory',
    description: 'A red circle with a white horizontal bar. Vehicles are prohibited from entering this road or lane.',
    bookReference: 'Section 4 - Regulatory Signs'
  },
  {
    id: 6,
    name: 'Speed Limit',
    image: '/road-signs/speed-limit.svg',
    category: 'Regulatory',
    description: 'Shows the maximum legal speed in km/h or mph. Must not exceed this speed under normal conditions.',
    bookReference: 'Section 5 - Speed Limits'
  },
  {
    id: 7,
    name: 'Traffic Light',
    image: '/road-signs/traffic-light.svg',
    category: 'Traffic Control',
    description: 'Red: stop. Green: proceed when clear. Yellow: warning that light is changing to red. Flashing yellow: proceed with caution.',
    bookReference: 'Section 1 - Traffic Signals'
  },
  {
    id: 8,
    name: 'Roundabout',
    image: '/road-signs/roundabout.svg',
    category: 'Guide',
    description: 'Indicates a roundabout ahead. Yield to traffic already in the circle and enter when there is a safe gap.',
    bookReference: 'Section 13 - Roundabouts'
  },
  {
    id: 9,
    name: 'Do Not Enter',
    image: '/road-signs/do-not-enter.svg',
    category: 'Regulatory',
    description: 'Square sign with a red circle and white bar. Do not enter this roadway; you are facing wrong-way traffic.',
    bookReference: 'Section 4 - Regulatory Signs'
  },
  {
    id: 10,
    name: 'One Way',
    image: '/road-signs/one-way.svg',
    category: 'Guide',
    description: 'Black rectangular sign with white arrow. Traffic flows only in the direction of the arrow.',
    bookReference: 'Section 4 - Regulatory Signs'
  },
  {
    id: 11,
    name: 'Pedestrian Crossing',
    image: '/road-signs/pedestrian-crossing.svg',
    category: 'Warning',
    description: 'Warns of a pedestrian crosswalk ahead. Yield to pedestrians in crosswalks at all times.',
    bookReference: 'Section 3 - Warning Signs, Section 4 - Right-of-Way Rules'
  },
  {
    id: 12,
    name: 'No Parking',
    image: '/road-signs/no-parking.svg',
    category: 'Regulatory',
    description: 'Red circle with a diagonal slash over the letter P. Parking is prohibited in this area.',
    bookReference: 'Section 8 - Parking Restrictions'
  },
  {
    id: 13,
    name: 'No U-Turn',
    image: '/road-signs/no-u-turn.svg',
    category: 'Regulatory',
    description: 'Red circle with a diagonal slash over a U-turn arrow. Making a U-turn at this location is prohibited.',
    bookReference: 'Section 4 - Regulatory Signs'
  },
  {
    id: 14,
    name: 'Give Way',
    image: '/road-signs/give-way.svg',
    category: 'Regulatory',
    description: 'Inverted triangle. Slow down and give way to vehicles on the major road.',
    bookReference: 'Section 2 - Stop and Yield Signs'
  },
  {
    id: 15,
    name: 'No Horn',
    image: '/road-signs/no-horn.svg',
    category: 'Regulatory',
    description: 'Red circle with a diagonal slash over a horn icon. Sounding your horn is prohibited in this zone (typically near hospitals).',
    bookReference: 'Section 4 - Regulatory Signs'
  },
  {
    id: 16,
    name: 'Guide Sign',
    image: '/road-signs/guide-sign.svg',
    category: 'Guide',
    description: 'Green signs provide directional guidance, distance to cities, and route information for drivers.',
    bookReference: 'Section 4 - Guide Signs and Information Signs'
  }
];

export const categories = [...new Set(roadSigns.map(s => s.category))];

export default roadSigns;
