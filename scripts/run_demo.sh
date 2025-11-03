#!/usr/bin/env bash
set -euo pipefail

echo "Standow to stop)"
uvicorn backend.app:app --reload
