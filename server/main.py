from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import random
from simulation import init_simulation, update_simulation, find_best_route, get_analytics, NODES, live_state, utility_history, shared_alerts, get_utility_insights, chat_with_city, get_services_state, handle_service_action, get_transport_summary, get_transport_stats
import uuid
from datetime import datetime

app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

class RouteRequest(BaseModel):
    startId: str
    endId: str

class AlertRequest(BaseModel):
    type: str # critical, warning, info
    category: str # Traffic Dept, Water Board, etc
    message: str
    priority: str # high, medium, low

class ChatRequest(BaseModel):
    message: str

@app.on_event("startup")
async def startup_event():
    init_simulation()
    # Start the background heartbeat
    asyncio.create_task(run_simulation())

async def run_simulation():
    while True:
        try:
            update_simulation()
            # Periodically emit transport updates
            if random.random() > 0.8:
                await sio.emit("ticket_booked", get_transport_summary())
        except Exception as e:
            print(f"[Heartbeat] Error in simulation cycle: {e}")
        await asyncio.sleep(1) # Ultra-fast 1-second heartbeat

import socketio

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

shared_notifications = []

def push_notification(msg, n_type):
    notif = {
        "id": str(uuid.uuid4()),
        "message": msg,
        "type": n_type,
        "time": "Just now"
    }
    shared_notifications.insert(0, notif)
    return notif

@app.get("/api/notifications/user/{user_id}")
async def get_user_notifications(user_id: str):
    return shared_notifications

@app.get("/api/traffic/live")
async def get_live_traffic():
    status = {}
    for node in NODES:
        node_id = node["id"]
        analytics = get_analytics(node_id)
        status[node_id] = {
            **live_state[node_id],
            **analytics
        }
    return {"nodes": NODES, "status": status}

@app.get("/api/utilities/history")
async def get_utility_history():
    return utility_history

@app.get("/api/services/live")
async def get_services():
    return get_services_state()

@app.post("/api/services/action")
async def perform_service_action(req: dict):
    res = handle_service_action(req)
    if res.get("success"):
        action = req.get("action")
        if action == "sos_trigger":
            notif = push_notification(f"SOS Triggered! Location: {req.get('location', '')}", "critical")
            await sio.emit("new_notification", notif)
        elif action == "sos_resolve":
            notif = push_notification(f"SOS Emergency Resolved", "success")
            await sio.emit("new_notification", notif)
        elif action == "park_exit":
            notif = push_notification(f"Parking Session Finished. Processing Payment.", "info")
            await sio.emit("new_notification", notif)
        elif action == "park_start":
            await sio.emit("parking_update", {"status": "update"})
            notif = push_notification("Parking Timer Started.", "info")
            await sio.emit("new_notification", notif)
    return res

@app.get("/api/utilities/insights")
async def get_insights():
    return get_utility_insights()

@app.post("/api/chat")
async def process_chat(request: ChatRequest):
    response = chat_with_city(request.message)
    return {"reply": response}

@app.post("/api/traffic/optimize")
async def optimize_route(req: RouteRequest):
    route = find_best_route(req.startId, req.endId)
    return {"route": route}

@app.get("/api/alerts")
async def get_alerts():
    return shared_alerts

@app.post("/api/alerts")
async def add_alert(req: AlertRequest):
    new_alert = {
        "id": str(uuid.uuid4()),
        "type": req.type,
        "category": req.category,
        "message": req.message,
        "priority": req.priority,
        "time": "Just now" # Simple representation
    }
    # Prepend so the newest alert is at the top
    shared_alerts.insert(0, new_alert)
    notif = push_notification(req.message, req.type)
    await sio.emit("new_notification", notif)
    return {"success": True, "alert": new_alert}

@app.post("/api/parking/checkout")
async def process_parking_checkout(req: dict):
    # Process mock payment, then set slot to vacant. Handled physically by handle_service_action('park_exit')?
    # Wait, the user exits BEFORE checkout.
    # The requirement: "Step 6: AFTER PAYMENT SUCCESS Mark slot as vacant ... updateParkingSlot". 
    # Let's adjust handle_service_action to not free the slot immediately if needed, 
    # but for simplicity, the prompt suggests freeing it *after* payment inside this route.
    # For now, we will handle `updateParkingSlot` here.
    from simulation import cctv_nodes, parking_hubs, sos_alerts, wifi_zones
    hub_id = req.get("hub_id")
    for hub in parking_hubs:
        if hub["id"] == hub_id:
            hub["occupied_slots"] -= 1
            if hub["occupied_slots"] < 0: hub["occupied_slots"] = 0
            break
    await sio.emit("parking_update", {"status": "vacant"})
    return {"success": True}

@app.get("/api/admin/transport/summary")
async def get_transport_summary_endpoint(role: str = "user"):
    if role != "admin":
        return {"error": "Unauthorized Access: Admin Eyes Only", "success": False}
    return get_transport_summary()

@app.get("/api/admin/transport/{category}")
async def get_transport_category_endpoint(category: str, role: str = "user"):
    if role != "admin":
        return {"error": "Unauthorized Access", "success": False}
    return get_transport_stats(category)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(socket_app, host="0.0.0.0", port=8000)
