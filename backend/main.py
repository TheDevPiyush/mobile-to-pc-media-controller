import os
from fastapi import FastAPI, HTTPException, Query
import ctypes
from enum import IntEnum
from pycaw.pycaw import AudioUtilities, IAudioSessionControl2
from pycaw.constants import DEVICE_STATE, EDataFlow, ERole, AudioDeviceState
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- CONFIG -------------------
VK_MEDIA_PLAY_PAUSE = 0xB3
VK_MEDIA_NEXT_TRACK = 0xB0
VK_MEDIA_PREV_TRACK = 0xB1
VK_VOLUME_MUTE = 0xAD
VK_VOLUME_UP = 0xAF
VK_VOLUME_DOWN = 0xAE
PASSCODE = os.getenv("PASSCODE")
AUDIO_ROLES = (ERole.eConsole, ERole.eMultimedia, ERole.eCommunications)


# ------------------- UTIL ---------------------
def require_passcode(code: str):
    if code != PASSCODE:
        raise HTTPException(status_code=401, detail="Invalid passcode")


def media_key(key_code):
    ctypes.windll.user32.keybd_event(key_code, 0, 0, 0)
    ctypes.windll.user32.keybd_event(key_code, 0, 2, 0)


def _default_render_ids():
    ids = set()
    try:
        enumerator = AudioUtilities.GetDeviceEnumerator()
    except Exception:
        return ids

    if not enumerator:
        return ids

    for role in AUDIO_ROLES:
        try:
            device = enumerator.GetDefaultAudioEndpoint(
                EDataFlow.eRender.value, role.value
            )
            if device:
                ids.add(device.GetId())
        except Exception:
            continue
    return ids


def get_output_devices():
    defaults = _default_render_ids()
    try:
        raw_devices = AudioUtilities.GetAllDevices(
            data_flow=EDataFlow.eRender.value,
            device_state=DEVICE_STATE.MASK_ALL.value,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail="Unable to enumerate devices"
        ) from exc

    devices = []
    for device in raw_devices:
        if device is None:
            continue
        state = device.state.name.lower()
        if state != AudioDeviceState.Active.name.lower():
            continue
        devices.append(
            {
                "id": device.id,
                "name": device.FriendlyName or "Unknown output",
                "state": state,
                "is_default": device.id in defaults,
            }
        )

    devices.sort(
        key=lambda d: (
            not d["is_default"],
            d["state"] != AudioDeviceState.Active.name.lower(),
            d["name"].lower(),
        )
    )
    return devices


def require_device(device_id: str):
    try:
        devices = AudioUtilities.GetAllDevices(
            data_flow=EDataFlow.eRender.value,
            device_state=DEVICE_STATE.MASK_ALL.value,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500, detail="Unable to enumerate devices"
        ) from exc

    for device in devices:
        if device and device.id == device_id:
            return device

    raise HTTPException(status_code=404, detail="Device not found")


@app.get("/check-passcode")
async def check_passcode(passcode: str = Query(...)):
    require_passcode(passcode)
    return {"valid": True}


# ------------------- MEDIA ACTIONS ------------
@app.get("/toggle")
async def toggle_play_pause(passcode: str = Query(...)):
    require_passcode(passcode)
    media_key(VK_MEDIA_PLAY_PAUSE)
    return {"action": "toggle_play_pause", "success": True}


@app.get("/next")
async def next_track(passcode: str = Query(...)):
    require_passcode(passcode)
    media_key(VK_MEDIA_NEXT_TRACK)
    return {"action": "next_track", "success": True}


@app.get("/prev")
async def prev_track(passcode: str = Query(...)):
    require_passcode(passcode)
    media_key(VK_MEDIA_PREV_TRACK)
    return {"action": "previous_track", "success": True}


@app.get("/mute")
async def mute_toggle(passcode: str = Query(...)):
    require_passcode(passcode)
    media_key(VK_VOLUME_MUTE)
    return {"action": "mute", "success": True}


@app.get("/volume-up")
async def volume_up(passcode: str = Query(...)):
    require_passcode(passcode)
    media_key(VK_VOLUME_UP)
    return {"action": "volume_up", "success": True}


@app.get("/volume-down")
async def volume_down(passcode: str = Query(...)):
    require_passcode(passcode)
    media_key(VK_VOLUME_DOWN)
    return {"action": "volume_down", "success": True}


@app.get("/audio-devices")
async def audio_devices(passcode: str = Query(...)):
    require_passcode(passcode)
    return {"devices": get_output_devices()}


@app.post("/audio-devices/select")
async def select_audio_device(device_id: str = Query(...), passcode: str = Query(...)):
    require_passcode(passcode)
    require_device(device_id)
    try:
        AudioUtilities.SetDefaultDevice(device_id, roles=AUDIO_ROLES)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to switch device") from exc
    return {"success": True, "device_id": device_id}


# ------------------- STATUS -------------------
class SessionState(IntEnum):
    INACTIVE = 0
    ACTIVE = 1
    PAUSED = 2


def get_media_status():
    sessions = AudioUtilities.GetAllSessions()

    for session in sessions:
        try:
            ctl = session._ctl.QueryInterface(IAudioSessionControl2)
            state = ctl.GetState()

            if state == SessionState.ACTIVE:
                session.Process.name() if session.Process else "unknown"
                return {"status": "playing"}

            if state == SessionState.PAUSED:
                return {"status": "paused"}

        except:
            continue

    return {"status": "idle"}


@app.get("/status")
async def media_status(passcode: str = Query(...)):
    require_passcode(passcode)
    return get_media_status()


# ------------------- ROOT ---------------------
@app.get("/")
async def root():
    return {"message": "Media Controller API Running!"}
