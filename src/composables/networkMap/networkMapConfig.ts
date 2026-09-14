export const MAP_CONFIG = {
  width: 800,
  height: 600,
  zoom: {
    min: 0.3,
    max: 3,
  },
  simulation: {
    linkDistance: 150,
    collideRadius: 100,
    centerStrength: 0.05,
    velocityDecay: 0.4,
    chargePerLink: 300,
    reheadAlpha: 0.01,
  },
  node: {
    radius: 26,
    colors: {
      primary: "#F2C14E",
      secondary: "#2F4B7C",
    },
  },
  edge: {
    strokeWidth: 2,
    openStrokeDasharray: 8,
    closeStrokeDasharray: 0,
    colors: {
      added: "green",
      removed: "#FF7276",
      switched: "yellow",
      default: "black",
    },
  },
  label: {
    fontSize: 15,
  },
} as const;

export const GEO_MAP_CONFIG = {
  width: 800,
  height: 600,
  node: {
    minRadius: 2,
    maxRadius: 13,
    colors: {
      primary: "#F2C14E",
      secondary: "#2F4B7C",
    },
  },
  edge: {
    minStrokeWidth: 1,
    maxStrokeWidth: 5,
    openStrokeDasharray: 8,
    closeStrokeDasharray: 0,
    colors: {
      added: "green",
      removed: "#FF7276",
      switched: "yellow",
      default: "#2C2D2D",
    },
  },
  label: {
    minFontSize: 2,
    maxFontSize: 11,
  },
  urlTemplate: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: "&copy; OpenStreetMap contributors"
} as const;