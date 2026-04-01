import random
import time
from datetime import datetime

NODES = [
    {"id": "central", "name": "Central Station", "coords": [13.0827, 80.2707]},
    {"id": "t-nagar", "name": "T. Nagar Signal", "coords": [13.0405, 80.2337]},
    {"id": "guindy", "name": "Guindy Kathipara", "coords": [13.0063, 80.2206]},
    {"id": "adyar", "name": "Adyar Signal", "coords": [13.0067, 80.2578]},
    {"id": "omr", "name": "OMR Tidel Park", "coords": [12.9894, 80.2458]},
    {"id": "anna-nagar", "name": "Anna Nagar Arch", "coords": [13.0850, 80.2101]},
    {"id": "marina", "name": "Marina Beach", "coords": [13.0418, 80.2800]}
]

EDGES = [
    ("central", "t-nagar"), ("central", "marina"), ("central", "anna-nagar"),
    ("t-nagar", "central"), ("t-nagar", "guindy"), ("t-nagar", "adyar"), ("t-nagar", "marina"),
    ("guindy", "t-nagar"), ("guindy", "adyar"), ("guindy", "omr"),
    ("adyar", "t-nagar"), ("adyar", "guindy"), ("adyar", "omr"), ("adyar", "marina"),
    ("omr", "guindy"), ("omr", "adyar"),
    ("anna-nagar", "central"),
    ("marina", "central"), ("marina", "t-nagar"), ("marina", "adyar")
]

# In-memory traffic & services state
live_state = {}
utility_history = {
    "water": [],
    "electricity": [],
    "temperature": []
}

shared_alerts = [
    { "id": "1", "type": "critical", "category": "Traffic Dept", "message": "Heavy water logging in Guindy. Avoid.", "time": "5 min ago", "priority": "high" },
    { "id": "2", "type": "warning", "category": "Metro Command", "message": "Signal failure on Blue Line.", "time": "1 hour ago", "priority": "medium" },
]

# Smart City Services Data Structures
cctv_nodes = [
    {"id": "c1", "location": "Central Station Phase 1", "status": "active"},
    {"id": "c2", "location": "T. Nagar Junction", "status": "active"},
    {"id": "c3", "location": "OMR Tech Park Entry", "status": "inactive"},
    {"id": "c4", "location": "Anna Nagar Arch", "status": "active"},
    {"id": "c5", "location": "Marina Beach Road", "status": "inactive"},
]

parking_hubs = [
    {"id": "p1", "name": "Central Transit Parking", "total_slots": 450, "occupied_slots": 412, "active_sessions": {}},
    {"id": "p2", "name": "T. Nagar Multi-level", "total_slots": 800, "occupied_slots": 780, "active_sessions": {}},
    {"id": "p3", "name": "OMR IT Corridor Hub", "total_slots": 1200, "occupied_slots": 900, "active_sessions": {}}
]

sos_alerts = [
    {"id": "sos_demo_1", "user_id": "System Health", "location": "Guindy Kathipara", "status": "active", "timestamp": "Just now"}
]

wifi_zones = [
    {"id": "w1", "location": "Central Plaza", "total_capacity": 500, "active_users": 342, "signal": "Excellent"},
    {"id": "w2", "location": "Marina Promenade", "total_capacity": 1000, "active_users": 890, "signal": "Good"},
    {"id": "w3", "location": "T. Nagar Shopping Dist", "total_capacity": 800, "active_users": 795, "signal": "Poor"}
]

transport_stats = {
    "summary": {"totalTickets": 1240, "totalRevenue": 58200},
    "bus": {"tickets": 540, "revenue": 21000, "activeBuses": 45, "occupancy": 78},
    "metro": {"tickets": 420, "revenue": 32000, "activeTrains": 14, "peakLoad": 85},
    "bikes": {"totalRides": 280, "revenue": 5200, "bikesInUse": 120, "availableBikes": 880}
}

def init_simulation():
    for node in NODES:
        live_state[node["id"]] = {
            "congestion": "green",
            "services": {
                "power": 98,
                "water": 92,
                "cctv": 100
            },
            "last_updated": datetime.now().isoformat()
        }
    
    # Initialize 20 points of history for utilities
    now = datetime.now()
    for i in range(20, 0, -1):
        ts = (datetime.fromtimestamp(now.timestamp() - i * 10)).strftime("%H:%M:%S")
        utility_history["water"].append({"time": ts, "value": random.randint(70, 85)})
        utility_history["electricity"].append({"time": ts, "value": random.randint(80, 95)})
        utility_history["temperature"].append({"time": ts, "value": random.randint(24, 32)})

def update_simulation():
    for node in NODES:
        node_id = node["id"]
        # Traffic randomization
        rand_traffic = random.random()
        level = "red" if rand_traffic > 0.8 else ("yellow" if rand_traffic > 0.5 else "green")
        
        # Services randomization
        rand_service = random.random()
        services = {
            "power": random.randint(15, 30) if rand_service > 0.85 else random.randint(85, 100),
            "water": random.randint(90, 100),
            "cctv": 100 if random.random() > 0.05 else 0
        }

        live_state[node_id] = {
            "congestion": level,
            "services": services,
            "last_updated": datetime.now().isoformat()
        }

    # Update Utility History (Water, Electricity, Temperature)
    ts = datetime.now().strftime("%H:%M:%S")
    for key in utility_history:
        prev_val = utility_history[key][-1]["value"] if utility_history[key] else 50
        # Random walk for stability
        change = random.uniform(-2, 2)
        new_val = max(10, min(100, prev_val + change))
        
        # Specific overrides for realism
        if key == "temperature": new_val = max(22, min(38, new_val))
        if key == "water": new_val = max(60, min(90, new_val))
        
        utility_history[key].append({"time": ts, "value": round(new_val, 1)})
        if len(utility_history[key]) > 20:
            utility_history[key].pop(0)

    # Update Transport Stats (Simulation of tickets & revenue)
    if random.random() > 0.7:
        type_key = random.choice(["bus", "metro", "bikes"])
        new_tickets = random.randint(1, 5)
        new_rev = new_tickets * (random.randint(20, 100) if type_key != "bikes" else random.randint(5, 15))
        
        transport_stats[type_key]["tickets" if type_key != "bikes" else "totalRides"] += new_tickets
        transport_stats[type_key]["revenue"] += new_rev
        transport_stats["summary"]["totalTickets"] += new_tickets
        transport_stats["summary"]["totalRevenue"] += new_rev
        
        # Randomly fluctuate operational counts
        if type_key == "bus": transport_stats["bus"]["activeBuses"] = max(30, min(60, transport_stats["bus"]["activeBuses"] + random.randint(-1, 1)))
        if type_key == "metro": transport_stats["metro"]["activeTrains"] = max(10, min(20, transport_stats["metro"]["activeTrains"] + random.randint(-1, 1)))
        if type_key == "bikes": transport_stats["bikes"]["bikesInUse"] = max(50, min(500, transport_stats["bikes"]["bikesInUse"] + random.randint(-5, 5)))

    print(f"[Python Simulation] Node states & Utilities history updated at {datetime.now().strftime('%H:%M:%S')}")

def get_weight(node_id):
    level = live_state.get(node_id, {}).get("congestion", "green")
    if level == "red": return 10
    if level == "yellow": return 3
    return 1

def find_best_route(start_id, end_id):
    import heapq
    
    distances = {node["id"]: float('inf') for node in NODES}
    previous = {node["id"]: None for node in NODES}
    distances[start_id] = 0
    pq = [(0, start_id)]

    while pq:
        current_distance, current_node = heapq.heappop(pq)

        if current_distance > distances[current_node]:
            continue

        if current_node == end_id:
            break

        # Find neighbors
        neighbors = [edge[1] for edge in EDGES if edge[0] == current_node]
        for neighbor in neighbors:
            weight = get_weight(neighbor)
            distance = current_distance + weight

            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current_node
                heapq.heappush(pq, (distance, neighbor))

    path = []
    current = end_id
    while current is not None:
        node_data = next((n for n in NODES if n["id"] == current), None)
        if node_data:
            path.insert(0, {"id": node_data["id"], "name": node_data["name"], "coords": node_data["coords"]})
        current = previous[current]

    return path if len(path) > 1 else []

def get_analytics(node_id):
    state = live_state.get(node_id, {"congestion": "green"})
    level = state["congestion"]
    
    if level == "red":
        return {
            "status": "Heavy",
            "color": "bg-red-500",
            "vehicles": random.randint(1200, 1800),
            "avgSpeed": f"{random.randint(10, 22)} km/h",
            "incidents": random.randint(2, 5),
            "cameras": 24
        }
    if level == "yellow":
        return {
            "status": "Moderate",
            "color": "bg-yellow-500",
            "vehicles": random.randint(600, 1100),
            "avgSpeed": f"{random.randint(25, 40)} km/h",
            "incidents": random.randint(0, 1),
            "cameras": 18
        }
    return {
        "status": "Light",
        "color": "bg-green-500",
        "vehicles": random.randint(100, 500),
        "avgSpeed": f"{random.randint(45, 60)} km/h",
        "incidents": 0,
        "cameras": 12
    }

def get_utility_insights():
    latest_water = utility_history["water"][-1]["value"] if utility_history["water"] else 80
    latest_power = utility_history["electricity"][-1]["value"] if utility_history["electricity"] else 80
    latest_temp = utility_history["temperature"][-1]["value"] if utility_history["temperature"] else 30

    insights = []
    
    # Temperature Checks
    if latest_temp >= 35:
        insights.append({"type": "critical", "category": "Climate", "message": f"Heavy sun expected ({latest_temp}°C). High heat warning.", "color": "text-red-500"})
    elif latest_temp >= 30:
        insights.append({"type": "warning", "category": "Climate", "message": f"Warm weather ({latest_temp}°C). Stay hydrated.", "color": "text-orange-500"})
    elif latest_temp <= 25:
        insights.append({"type": "info", "category": "Climate", "message": f"Cooler climate ({latest_temp}°C). Possible rain showers expected.", "color": "text-blue-500"})
    else:
        insights.append({"type": "info", "category": "Climate", "message": f"Weather is stable at {latest_temp}°C.", "color": "text-emerald-500"})

    # Power Checks
    if latest_power >= 90:
        insights.append({"type": "critical", "category": "Grid", "message": f"Grid load critical ({latest_power} GWh). Power cuts expected soon.", "color": "text-red-500"})
    elif latest_power >= 80:
        insights.append({"type": "warning", "category": "Grid", "message": f"High electricity consumption ({latest_power} GWh).", "color": "text-orange-500"})
    else:
        insights.append({"type": "info", "category": "Grid", "message": "Power grid stable.", "color": "text-emerald-500"})

    # Water Checks
    if latest_water <= 60:
        insights.append({"type": "critical", "category": "Water", "message": f"Severe water shortage detected ({latest_water} ML/d).", "color": "text-red-500"})
    elif latest_water <= 75:
        insights.append({"type": "warning", "category": "Water", "message": f"Water pressure low in key nodes ({latest_water} ML/d).", "color": "text-orange-500"})
    else:
        insights.append({"type": "info", "category": "Water", "message": "Water supply optimal.", "color": "text-emerald-500"})
        
    return insights

def chat_with_city(message: str) -> str:
    msg = message.lower()
    
    latest_temp = utility_history["temperature"][-1]["value"] if utility_history["temperature"] else 30
    latest_power = utility_history["electricity"][-1]["value"] if utility_history["electricity"] else 80
    latest_water = utility_history["water"][-1]["value"] if utility_history["water"] else 80
    
    # Analyze general congestion
    red_nodes = [n for n, s in live_state.items() if s["congestion"] == "red"]
    traffic_status = "heavy" if len(red_nodes) > 2 else "moderate" if red_nodes else "clear"
    
    # GREETINGS & IDENTITY
    if any(q in msg for q in ["hello", "hi ", "hey", "who are you", "what are you"]):
        return "Greetings, Citizen. I am the City Neural Assistant. I monitor traffic, utilities, and emergency services in real-time. How can I assist you today?"
        
    # TEMPERATURE / LIFESTYLE
    elif any(q in msg for q in ["icecream", "ice cream", "cold drink", "swimming", "beach"]):
        if latest_temp >= 32:
            return f"Yes! It's currently scorching at {latest_temp}°C. Perfect weather for ice cream or a swim to cool down."
        elif latest_temp <= 25:
            return f"It's currently a bit chilly ({latest_temp}°C). You might prefer a hot beverage, but ice cream is always a choice!"
        else:
            return f"The weather is pleasant at {latest_temp}°C. It's a great time for an ice cream."
            
    elif any(q in msg for q in ["weather", "sun", "rain", "umbrella", "hot", "cold"]):
        if latest_temp >= 32:
            return f"Expect heavy sun. The ambient temperature is currently {latest_temp}°C. Stay hydrated and avoid direct sunlight."
        elif latest_temp <= 25:
            return f"It's currently {latest_temp}°C. The climate is cool, and there is a high probability of rain. Carry an umbrella."
        else:
            return f"The weather is clear and temperate at {latest_temp}°C."

    elif any(q in msg for q in ["ac", "aircon", "air conditioning", "heater"]):
        if latest_power >= 90:
            return f"Grid usage is critical ({latest_power} GWh). Please avoid using high-power appliances like ACs right now."
        elif latest_temp >= 30:
            return f"It is {latest_temp}°C. The grid is stable ({latest_power} GWh), so you can safely use your AC."
        else:
            return f"It's only {latest_temp}°C outside. Natural ventilation is recommended to save energy."

    # ELECTRICITY / POWER
    elif any(q in msg for q in ["washing machine", "wash", "laundry", "dishwasher", "microwave", "oven"]):
        if latest_power >= 88:
            return f"I strongly recommend waiting until tomorrow. The power grid is currently under high stress ({latest_power} GWh) and using heavy appliances might trigger a local breaker trip."
        else:
            return f"You can use it now! The power grid is entirely stable currently ({latest_power} GWh) with no expected power cuts."
            
    elif any(q in msg for q in ["power cut", "electricity", "outage", "blackout"]):
        if latest_power >= 88:
            return f"Warning: Due to heavy grid load ({latest_power} GWh), scheduled power cuts may occur in the next hour to balance generation."
        else:
            return "No power cuts are expected. The grid load is operating within normal parameters."
            
    # WATER SUMMARY
    elif any(q in msg for q in ["water", "shortage", "shower", "bath", "drink", "farming", "garden"]):
        if latest_water <= 65:
            return f"Please conserve water. The city is experiencing a critical water shortage (Flow: {latest_water} ML/day). Fix leaks and minimize usage."
        elif latest_water <= 75:
            return f"Water supply is slightly lower than normal ({latest_water} ML/day). Basic needs are met, but avoid washing cars or watering large lawns."
        else:
            return f"Water supply is perfectly normal ({latest_water} ML/day). All municipal reservoirs are optimally pressurized."
            
    # TRANSPORT & COMMUTE
    elif any(q in msg for q in ["traffic", "drive", "car", "congestion", "jam", "route"]):
        if traffic_status == "heavy":
            return f"Traffic is extremely bad right now. I detect heavy congestion at {', '.join(red_nodes).title()}. Highly recommend using the Metro."
        elif traffic_status == "moderate":
            return "Traffic is moderate. Some arterial roads show yellow congestion lines. Commute times may be slightly elevated."
        else:
            return "The roads are mostly clear! You should have a smooth, green drive across the city."
            
    elif any(q in msg for q in ["bus", "metro", "transport", "bike", "bicycle", "transit", "book"]):
        return "Public transport is fully operational. The Metro is the fastest way to bypass current surface traffic. You can book an automated EV or Bus ticket directly from the Transport tab."
        
    elif any(q in msg for q in ["parking", "park"]):
        if traffic_status == "heavy":
            return "Due to heavy city traffic, central parking nodes are nearing 98% capacity. Consider using peripheral parking and riding the Metro in."
        else:
            return "There are roughly 1,240 open smart-parking spots across the city grid."

    # EMERGENCY & SECURITY
    elif any(q in msg for q in ["emergency", "police", "sos", "crime", "robbery", "fire", "accident"]):
        return "EMERGENCY: If you are in immediate danger, use the SOS Nodes mapped in the Services tab or dial 911. We have 45 active Neural SOS dispatchers standing by, and 127 CCTV cameras monitoring the grid."
        
    elif any(q in msg for q in ["safe", "cctv", "security", "camera"]):
        return "The city is highly secure. Our neural network processes feeds from 127 active CCTV cameras and ensures rapid response times for any anomalies."

    # DEFAULT
    else:
        return (
            "I couldn't match your exact query. However, I can still help!\n\n"
            "Try asking me about:\n"
            "🌤️ Weather: 'Can I go to the beach?' or 'Will it rain?'\n"
            "⚡ Grid: 'Should I do laundry?' or 'Is there a power outage?'\n"
            "💧 Water: 'Are there water shortages today?'\n"
            "🚗 Transport: 'How is the traffic?' or 'Where can I park?'\n"
            "🚨 Emergency: 'Is the city safe?'"
        )

def get_services_state():
    return {
        "cctv": cctv_nodes,
        "parking": parking_hubs,
        "sos": sos_alerts,
        "wifi": wifi_zones
    }

def handle_service_action(action_data: dict):
    action = action_data.get("action")
    
    if action == "sos_trigger":
        location = action_data.get("location", "Unknown Location")
        user_id = action_data.get("user_id", "Citizen")
        new_sos = {
            "id": f"sos_{int(time.time())}",
            "user_id": user_id,
            "location": location,
            "status": "active",
            "timestamp": "Just now"
        }
        sos_alerts.insert(0, new_sos)
        return {"success": True, "sos": new_sos}
        
    elif action == "sos_resolve":
        sos_id = action_data.get("sos_id")
        for sos in sos_alerts:
            if sos["id"] == sos_id:
                sos["status"] = "resolved"
                return {"success": True}
        return {"success": False}
        
    elif action == "park_start":
        hub_id = action_data.get("hub_id")
        user_id = action_data.get("user_id", "Anonymous")
        for hub in parking_hubs:
            if hub["id"] == hub_id and hub["occupied_slots"] < hub["total_slots"]:
                # Ensure the user doesn't already have an active session in this hub
                if user_id not in hub["active_sessions"]:
                    hub["occupied_slots"] += 1
                    hub["active_sessions"][user_id] = int(time.time())
                    print("Park started!", hub["active_sessions"])
                    return {"success": True, "message": "Parking started."}
                else:
                    return {"success": True, "message": "Already parked."}
        return {"success": False, "message": "Hub full or not found."}
        
    elif action == "park_exit":
        hub_id = action_data.get("hub_id")
        user_id = action_data.get("user_id", "Anonymous")
        for hub in parking_hubs:
            if hub["id"] == hub_id and user_id in hub["active_sessions"]:
                start_time = hub["active_sessions"].pop(user_id)
                duration_seconds = int(time.time()) - start_time
                # $0.05 per second mock fee
                fee = round(duration_seconds * 0.05, 2)
                return {
                    "success": True, 
                    "duration": duration_seconds, 
                    "fee": fee,
                    "hub_id": hub_id,
                    "location": hub["location"]
                }
        return {"success": False, "message": "Session not found."}
        
    elif action == "wifi_connect":
        zone_id = action_data.get("zone_id")
        for zone in wifi_zones:
            if zone["id"] == zone_id and zone["active_users"] < zone["total_capacity"]:
                zone["active_users"] += 1
                return {"success": True}
        return {"success": False, "message": "Zone at full capacity."}
        
    elif action == "wifi_disconnect":
        zone_id = action_data.get("zone_id")
        for zone in wifi_zones:
            if zone["id"] == zone_id and zone["active_users"] > 0:
                zone["active_users"] -= 1
                return {"success": True}
        return {"success": False}
        
    return {"success": False, "message": "Unknown action."}

def get_transport_stats(category: str):
    return transport_stats.get(category, {})

def get_transport_summary():
    return transport_stats["summary"]
