import os
import asyncio
import pytest
from app.config import settings
from app.services.processing_worker import process_video_background_task, job_manager
from app.database.db_factory import get_repository

@pytest.mark.asyncio
async def test_end_to_end_video_processing():
    sample_video = os.path.join(settings.SAMPLE_DIR, "sample_traffic.mp4")
    output_video = os.path.join(settings.OUTPUT_DIR, "test_e2e_processed.mp4")

    assert os.path.exists(sample_video), "Sample video must be generated first"

    job_id = "test_job_e2e_001"
    job_manager.create_job(job_id, sample_video, {})

    # Run processing worker
    await process_video_background_task(
        job_id=job_id,
        video_path=sample_video,
        output_video_path=output_video,
        config={
            "confidence_threshold": 0.35,
            "pixels_per_meter": 15.0,
            "expected_direction": "EAST"
        }
    )

    job = job_manager.get_job(job_id)
    assert job["status"] == "COMPLETED"
    assert job["progress_percent"] == 100.0
    assert os.path.exists(output_video)

    # Verify Database record
    repo = await get_repository()
    session = await repo.get_session(job_id)
    assert session is not None
    assert session["status"] == "COMPLETED"
    assert session["total_vehicles"] > 0

    analytics = await repo.get_analytics(job_id)
    assert analytics is not None
    assert "summary" in analytics
    assert "time_series" in analytics
