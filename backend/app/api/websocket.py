import json
import logging
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.processing_worker import job_manager
from app.services.live_stream_service import LiveStreamProcessor

logger = logging.getLogger("traffic_app")
ws_router = APIRouter()

@ws_router.websocket("/videos/{video_id}/ws")
async def websocket_job_status(websocket: WebSocket, video_id: str):
    """
    WebSocket endpoint broadcasting real-time frame processing progress updates.
    """
    await websocket.accept()
    logger.info(f"WebSocket client connected for job {video_id}")

    queue = asyncio.Queue()

    def listener(job_data: dict):
        try:
            queue.put_nowait(job_data)
        except Exception:
            pass

    job_manager.add_listener(video_id, listener)

    # Send initial state
    current_job = job_manager.get_job(video_id)
    if current_job:
        await websocket.send_json(current_job)

    try:
        while True:
            # Wait for next progress event or ping/pong
            try:
                job_update = await asyncio.wait_for(queue.get(), timeout=1.0)
                await websocket.send_json(job_update)
                if job_update.get("status") in ["COMPLETED", "FAILED"]:
                    break
            except asyncio.TimeoutError:
                # Send periodic ping to keep connection alive
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected for job {video_id}")
    except Exception as e:
        logger.error(f"WebSocket error for job {video_id}: {e}")
    finally:
        job_manager.remove_listener(video_id, listener)
        try:
            await websocket.close()
        except Exception:
            pass

@ws_router.websocket("/live-stream/ws")
async def websocket_live_stream(websocket: WebSocket):
    """
    WebSocket endpoint receiving base64 video frames or RTSP stream URLs
    and returning real-time detection & telemetry JSON.
    """
    await websocket.accept()
    logger.info("WebSocket client connected for Live Stream analysis")
    processor = LiveStreamProcessor()

    try:
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                frame_b64 = payload.get("frame")
                rtsp_url = payload.get("rtsp_url")

                if rtsp_url:
                    result = processor.process_rtsp_stream_frame(rtsp_url)
                    await websocket.send_json(result)
                elif frame_b64:
                    result = processor.process_base64_frame(frame_b64)
                    await websocket.send_json(result)
            except json.JSONDecodeError:
                await websocket.send_json({"error": "Invalid JSON format"})
    except WebSocketDisconnect:
        logger.info("WebSocket client disconnected from Live Stream analysis")
    except Exception as e:
        logger.error(f"WebSocket error in Live Stream: {e}")
    finally:
        processor.close()


