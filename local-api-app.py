import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

# Create a FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"])

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create test data if it doesn't exist
def ensure_test_data():
    test_data = {
        "discordEvents": [
            {
                "id": "test-discord-1",
                "name": "Test Discord Event 1",
                "description": "This is a test Discord event for local development",
                "scheduled_start_time": "2024-12-20T09:00:00.000Z",
                "scheduled_end_time": "2024-12-20T10:00:00.000Z",
                "creator": {
                    "global_name": "Test User"
                },
                "recurrence_rule": None
            },
            {
                "id": "test-discord-2",
                "name": "Test Discord Event 2 (Recurring)",
                "description": "This is a recurring test Discord event",
                "scheduled_start_time": "2024-12-22T14:00:00.000Z",
                "scheduled_end_time": "2024-12-22T15:00:00.000Z",
                "creator": {
                    "global_name": "Test User"
                },
                "recurrence_rule": {
                    "interval": 1,
                    "start": "2024-12-22T14:00:00.000Z"
                }
            }
        ],
        "twitchEvents": [
            {
                "id": "test-twitch-1",
                "title": "Test Twitch Stream",
                "description": "This is a test Twitch event for local development",
                "scheduled_start_time": "2024-12-21T16:00:00.000Z",
                "platform": "twitch",
                "category": {
                    "name": "AWS"
                }
            }
        ]
    }
    
    # Create test-data directory if it doesn't exist
    Path("test-data").mkdir(exist_ok=True)
    
    # Write test data to file
    with open("test-data/local-events.json", "w") as f:
        json.dump(test_data, f, indent=2)

# Ensure test data exists before starting server
ensure_test_data()

# Define routes before mounting static files
@app.get("/api/events")
async def get_events():
    try:
        with open("test-data/local-events.json") as f:
            events = json.load(f)
        return JSONResponse(content=events)
    except Exception as e:
        print(f"Error reading events file: {e}")
        return JSONResponse(content={"discordEvents": [], "twitchEvents": []})

# Mount static files after defining routes
app.mount("/", StaticFiles(directory=".", html=True), name="static")

if __name__ == "__main__":
    print("Server starting at http://localhost:6969")
    print("API endpoint available at http://localhost:6969/api/events")
    uvicorn.run(app, host="localhost", port=6969)
