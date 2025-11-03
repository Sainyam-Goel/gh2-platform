from __future__ import annotations

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class SensorReading(BaseModel):
    """Represents a single sensor measurement included in an ingestion packet."""

    id: str = Field(..., description="Unique identifier for the sensor stream.")
    type: str = Field(..., description="Type of measurement, e.g. 'electricity'.")
    v: float = Field(..., description="Numeric value captured for the reading.")


class SensorPacket(BaseModel):
    """Incoming telemetry packet used by the ingestion endpoint."""

    model_config = ConfigDict(extra="ignore")

    site_id: str = Field(..., description="Identifier for the production site.")
    timestamp: datetime = Field(..., description="When the packet was recorded.")
    sensors: List[SensorReading] = Field(
        ..., description="Series of sensor readings captured in this packet."
    )


class ProductionBatch(BaseModel):
    """Summary of an issued hydrogen production batch."""

    model_config = ConfigDict(extra="ignore")

    batch_id: str
    site_id: str
    start: datetime
    end: datetime
    h2_mass_kg: float
    elec_kWh: float
    water_L: float
    purity_pct: float
    renewable_mode: str
    eac_ids: List[str]
    status: str
    vc_hash: Optional[str] = None
