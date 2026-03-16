# backend/hardware.py
# Detects system hardware at startup and returns a tier config
# that all 5 models use to adjust their parameters dynamically.

import multiprocessing
import psutil
import torch
import platform
import os

# ─── Tier definitions ─────────────────────────────────────────────────────────

TIERS = {
    "LOW": {
        "name":               "LOW",
        "description":        "Low-end CPU, limited RAM, no GPU",
        "lr_max_iter":        100,
        "lr_solver":          "liblinear",
        "lr_n_jobs":          1,
        "rf_n_estimators":    50,
        "rf_max_depth":       10,
        "rf_n_jobs":          1,
        "svm_max_iter":       500,
        "bert_batch_size":    1,
        "bert_max_length":    128,
        "bert_dtype":         "float32",
        "nb_var_smoothing":   1e-9,
    },
    "MID": {
        "name":               "MID",
        "description":        "Mid-range CPU, decent RAM, no GPU",
        "lr_max_iter":        500,
        "lr_solver":          "lbfgs",
        "lr_n_jobs":          2,
        "rf_n_estimators":    150,
        "rf_max_depth":       20,
        "rf_n_jobs":          2,
        "svm_max_iter":       2000,
        "bert_batch_size":    4,
        "bert_max_length":    256,
        "bert_dtype":         "float32",
        "nb_var_smoothing":   1e-9,
    },
    "HIGH": {
        "name":               "HIGH",
        "description":        "High-end CPU or GPU available",
        "lr_max_iter":        1000,
        "lr_solver":          "lbfgs",
        "lr_n_jobs":          -1,
        "rf_n_estimators":    300,
        "rf_max_depth":       None,
        "rf_n_jobs":          -1,
        "svm_max_iter":       5000,
        "bert_batch_size":    16,
        "bert_max_length":    512,
        "bert_dtype":         "float16",
        "nb_var_smoothing":   1e-10,
    },
}

# ─── Main detector ────────────────────────────────────────────────────────────

def detect_hardware():
    """
    Detects CPU cores, available RAM, and GPU presence.
    Returns a full hardware profile dict including the selected tier config.
    """

    # CPU
    cpu_cores      = multiprocessing.cpu_count()
    cpu_model      = platform.processor() or "Unknown CPU"

    # RAM — available (not total) because other processes use some
    mem            = psutil.virtual_memory()
    total_ram_gb   = round(mem.total  / (1024 ** 3), 1)
    avail_ram_gb   = round(mem.available / (1024 ** 3), 1)
    ram_percent    = mem.percent

    # GPU
    has_gpu        = torch.cuda.is_available()
    gpu_name       = torch.cuda.get_device_name(0) if has_gpu else None
    gpu_memory_gb  = None
    if has_gpu:
        gpu_memory_gb = round(
            torch.cuda.get_device_properties(0).total_memory / (1024 ** 3), 1
        )

    # Disk type hint (HDD vs SSD affects load times)
    # We can't detect this reliably cross-platform so we estimate
    # based on read speed if needed — for now just flag it
    disk           = psutil.disk_usage("/")
    disk_free_gb   = round(disk.free / (1024 ** 3), 1)

    # ── Tier selection logic ───────────────────────────────────────────────────
    # Priority: GPU > RAM > CPU cores

    if has_gpu:
        tier_name = "HIGH"
    elif avail_ram_gb >= 12 and cpu_cores >= 6:
        tier_name = "HIGH"
    elif avail_ram_gb >= 6 and cpu_cores >= 4:
        tier_name = "MID"
    else:
        tier_name = "LOW"   # your i3 + 8GB will land here

    tier = TIERS[tier_name]

    # ── Adjust thread count to actual CPU ─────────────────────────────────────
    # Never let n_jobs exceed actual core count
    if tier["lr_n_jobs"] == -1:
        tier = dict(tier)   # copy so we don't mutate the original
        tier["lr_n_jobs"] = cpu_cores
        tier["rf_n_jobs"] = cpu_cores

    profile = {
        # Hardware facts
        "cpu_cores":      cpu_cores,
        "cpu_model":      cpu_model,
        "total_ram_gb":   total_ram_gb,
        "avail_ram_gb":   avail_ram_gb,
        "ram_used_pct":   ram_percent,
        "has_gpu":        has_gpu,
        "gpu_name":       gpu_name,
        "gpu_memory_gb":  gpu_memory_gb,
        "disk_free_gb":   disk_free_gb,
        "os":             platform.system(),
        "python_version": platform.python_version(),

        # Selected tier
        "tier":           tier_name,
        "tier_config":    tier,
        "tier_reason":    _build_reason(
                            tier_name, has_gpu,
                            avail_ram_gb, cpu_cores
                          ),
    }

    _print_profile(profile)
    return profile


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _build_reason(tier, has_gpu, ram, cores):
    if has_gpu:
        return f"GPU detected → maximum performance tier"
    if tier == "HIGH":
        return f"{ram}GB RAM + {cores} cores → high performance tier"
    if tier == "MID":
        return f"{ram}GB available RAM + {cores} cores → mid tier"
    return (
        f"{ram}GB available RAM, {cores} cores, no GPU "
        f"→ optimized for low-end hardware"
    )


def _print_profile(p):
    print("\n" + "="*50)
    print("  HARDWARE DETECTION REPORT")
    print("="*50)
    print(f"  OS            : {p['os']}")
    print(f"  CPU           : {p['cpu_model']}")
    print(f"  CPU Cores     : {p['cpu_cores']}")
    print(f"  Total RAM     : {p['total_ram_gb']} GB")
    print(f"  Available RAM : {p['avail_ram_gb']} GB")
    print(f"  GPU           : {p['gpu_name'] or 'None detected'}")
    print(f"  Disk Free     : {p['disk_free_gb']} GB")
    print(f"  Selected Tier : {p['tier']}")
    print(f"  Reason        : {p['tier_reason']}")
    print("="*50 + "\n")