const { supabase } = require('./supabaseClient');

const NODES = [
  { id: 'central', name: 'Central Station', coords: [13.0827, 80.2707] },
  { id: 't-nagar', name: 'T. Nagar Signal', coords: [13.0405, 80.2337] },
  { id: 'guindy', name: 'Guindy Kathipara', coords: [13.0063, 80.2206] },
  { id: 'adyar', name: 'Adyar Signal', coords: [13.0067, 80.2578] },
  { id: 'omr', name: 'OMR Tidel Park', coords: [12.9894, 80.2458] },
  { id: 'anna-nagar', name: 'Anna Nagar Arch', coords: [13.0850, 80.2101] },
  { id: 'marina', name: 'Marina Beach', coords: [13.0418, 80.2800] }
];

const EDGES = [
  ['central', 't-nagar'], ['central', 'marina'], ['central', 'anna-nagar'],
  ['t-nagar', 'central'], ['t-nagar', 'guindy'], ['t-nagar', 'adyar'], ['t-nagar', 'marina'],
  ['guindy', 't-nagar'], ['guindy', 'adyar'], ['guindy', 'omr'],
  ['adyar', 't-nagar'], ['adyar', 'guindy'], ['adyar', 'omr'], ['adyar', 'marina'],
  ['omr', 'guindy'], ['omr', 'adyar'],
  ['anna-nagar', 'central'],
  ['marina', 'central'], ['marina', 't-nagar'], ['marina', 'adyar']
];

// In-memory traffic state (to represent "Live" simulation)
let liveTrafficState = {};

function initTraffic() {
  NODES.forEach(node => {
    liveTrafficState[node.id] = {
      congestion: 'green',
      services: {
        wifi: 95,
        power: 98,
        water: 92,
        cctv: 100
      },
      last_updated: new Date().toISOString()
    };
  });
}

function updateSimulation() {
  NODES.forEach(node => {
     // Traffic randomization
     const randTraffic = Math.random();
     const level = randTraffic > 0.8 ? 'red' : (randTraffic > 0.5 ? 'yellow' : 'green');
     
     // Services randomization
     const randService = Math.random();
     const services = {
       wifi: Math.floor(Math.random() * 20) + (randService > 0.9 ? 10 : 75), // Occasional drop to 10-30%
       power: Math.floor(Math.random() * 15) + (randService > 0.85 ? 15 : 85), // Occasional drop to 15-30%
       water: Math.floor(Math.random() * 10) + 90,
       cctv: Math.random() > 0.05 ? 100 : 0 // 5% chance of CCTV outage
     };

     liveTrafficState[node.id] = {
       ...liveTrafficState[node.id],
       congestion: level,
       services,
       last_updated: new Date().toISOString()
     };
  });
  console.log(`[Simulation] Node states & Services updated at ${new Date().toLocaleTimeString()}`);
}

function getWeight(nodeId) {
    const level = liveTrafficState[nodeId]?.congestion || 'green';
    if(level === 'red') return 10;
    if(level === 'yellow') return 3;
    return 1;
}

// Simple Dijkstra implementation
function findBestRoute(startId, endId) {
    const distances = {};
    const previous = {};
    const nodes = new Set();

    NODES.forEach(node => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
        nodes.add(node.id);
    });

    distances[startId] = 0;

    while (nodes.size > 0) {
        let shortestNode = null;
        for (let node of nodes) {
            if (shortestNode === null || distances[node] < distances[shortestNode]) {
                shortestNode = node;
            }
        }

        if (distances[shortestNode] === Infinity) break;
        if (shortestNode === endId) break;

        nodes.delete(shortestNode);

        // Find neighbors
        const neighbors = EDGES.filter(e => e[0] === shortestNode).map(e => e[1]);
        for (let neighbor of neighbors) {
            const weight = getWeight(neighbor);
            const alt = distances[shortestNode] + weight;
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = shortestNode;
            }
        }
    }

    const path = [];
    let current = endId;
    while (current !== null) {
        const node = NODES.find(n => n.id === current);
        path.unshift({ id: node.id, name: node.name, coords: node.coords });
        current = previous[current];
    }

    return path.length > 1 ? path : [];
}

function getAnalyticsForNode(nodeId) {
    const status = liveTrafficState[nodeId] || { congestion: 'green' };
    const level = status.congestion;
    
    if (level === 'red') {
        return {
            status: 'Heavy',
            color: 'bg-red-500',
            vehicles: Math.floor(Math.random() * 600) + 1200,
            avgSpeed: `${Math.floor(Math.random() * 12) + 10} km/h`,
            incidents: Math.floor(Math.random() * 3) + 2,
            cameras: 24
        };
    }
    if (level === 'yellow') {
        return {
            status: 'Moderate',
            color: 'bg-yellow-500',
            vehicles: Math.floor(Math.random() * 500) + 600,
            avgSpeed: `${Math.floor(Math.random() * 15) + 25} km/h`,
            incidents: Math.floor(Math.random() * 2),
            cameras: 18
        };
    }
    return {
        status: 'Light',
        color: 'bg-green-500',
        vehicles: Math.floor(Math.random() * 400) + 100,
        avgSpeed: `${Math.floor(Math.random() * 15) + 45} km/h`,
        incidents: 0,
        cameras: 12
    };
}

module.exports = {
  NODES,
  EDGES,
  initTraffic,
  updateSimulation,
  findBestRoute,
  getLiveTraffic: () => {
      const data = {};
      NODES.forEach(n => {
          data[n.id] = {
              ...liveTrafficState[n.id],
              ...getAnalyticsForNode(n.id)
          };
      });
      return data;
  }
};
