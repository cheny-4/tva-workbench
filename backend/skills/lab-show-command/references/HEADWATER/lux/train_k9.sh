#!/usr/bin/env bash
# One 9×9 soil CNN on the Lux GPU this Slurm task was given.
# Same trainer, kernel, and split as frontier/train_k9.sh.
# Python, modules, and the output directory are the Lux copies.
set -euo pipefail

if [[ -n "${SLURM_SUBMIT_DIR:-}" ]]; then
  ROOT="$(cd "${SLURM_SUBMIT_DIR}" && pwd)"
else
  ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
fi
# shellcheck disable=SC1091
source "${ROOT}/lux/env.sh"

NAME="${1:?experiment name}"
EX="${2:?example directory}"
OUT="${ROOT}/runs/lux_rocm/${NAME}"
LOG="${OUT}/train.log"
DEVICE="${CUDA_DEVICE:-cuda:0}"
BAND_FLAG=()
if [[ "${HEADWATER_BAND:-}" == "1" ]]; then
  BAND_FLAG=(--band-10-20)
fi

if [[ ! -x "${PYTHON_BIN}" ]]; then
  echo "Lux ROCm Python missing: ${PYTHON_BIN}" >&2
  exit 1
fi

mapfile -t TRAIN < <(find "$EX" -maxdepth 1 -name 'example_train_*.npz' | sort)
mapfile -t VAL < <(find "$EX" -maxdepth 1 -name 'example_val_2018*.npz' | sort)
if [[ ${#TRAIN[@]} -lt 1 || ${#VAL[@]} -lt 1 ]]; then
  echo "missing train or val 2018 examples under $EX" >&2
  exit 1
fi

mkdir -p "$OUT"
{
  echo "name ${NAME}"
  echo "python ${PYTHON_BIN}"
  "${PYTHON_BIN}" -c 'import torch; print("torch", torch.__version__, "hip", torch.version.hip)'
  echo "train ${#TRAIN[@]}  val ${#VAL[@]}  device ${DEVICE}  out ${OUT}"
} | tee "$LOG"

"${PYTHON_BIN}" "${ROOT}/scripts/train_deterministic.py" \
  --train "${TRAIN[@]}" \
  --val "${VAL[@]}" \
  --out "$OUT" \
  --epochs 400 \
  --lr 0.001 \
  --hidden 64 \
  --patience 50 \
  --kernel-size 9 \
  --map-batch 16 \
  --residual \
  --expect-roadmap-grid \
  --device "$DEVICE" \
  "${BAND_FLAG[@]}" \
  2>&1 | tee -a "$LOG"

"${PYTHON_BIN}" "${ROOT}/scripts/predict_heldout_2019.py" \
  --run-dir "$OUT" \
  --examples-dir "$EX" \
  --device "$DEVICE" \
  2>&1 | tee -a "$LOG"

echo "done: $OUT" | tee -a "$LOG"
