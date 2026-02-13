#!/usr/bin/env python3
"""
Regenerate all 36 company JSON data files for MRI Organizacional.

Reads 9 template JSONs from clima-dashboard and generates 4 differentiated
company variants with narrative offsets, populated segmentation dimensions,
and company-specific departments/names.
"""

import json
import copy
import os
import random
import re
from datetime import datetime
from pathlib import Path

random.seed(42)

# ─── Paths ───────────────────────────────────────────────────────────────────
TEMPLATE_DIR = Path.home() / "Projects" / "clima-dashboard" / "public" / "data"
OUTPUT_BASE = Path.home() / "Projects" / "pulseorg" / "public" / "data"

# ─── Company definitions ─────────────────────────────────────────────────────
COMPANIES = {
    "novatech": {
        "name": "NovaTech Solutions",
        "industry": "Tech / SaaS",
        "employee_count": 450,
        "departments": [
            ("engineering", "Engineering"),
            ("product", "Product"),
            ("design", "Design"),
            ("devops", "DevOps"),
            ("data_science", "Data Science"),
            ("sales", "Sales"),
            ("customer_success", "Customer Success"),
            ("marketing", "Marketing"),
            ("people_ops", "People Ops"),
            ("finance", "Finance"),
        ],
    },
    "meridian": {
        "name": "Meridian Stores",
        "industry": "Retail",
        "employee_count": 1200,
        "departments": [
            ("ventas_tienda", "Ventas Tienda"),
            ("logistica", "Logística"),
            ("e_commerce", "E-Commerce"),
            ("marketing", "Marketing"),
            ("rrhh", "RRHH"),
            ("finanzas", "Finanzas"),
            ("compras", "Compras"),
            ("atencion_al_cliente", "Atención al Cliente"),
            ("it", "IT"),
            ("operaciones", "Operaciones"),
        ],
    },
    "atlas": {
        "name": "Atlas Capital Group",
        "industry": "Finanzas",
        "employee_count": 350,
        "departments": [
            ("banca_privada", "Banca Privada"),
            ("cumplimiento", "Cumplimiento"),
            ("riesgos", "Riesgos"),
            ("tesoreria", "Tesorería"),
            ("operaciones", "Operaciones"),
            ("tecnologia", "Tecnología"),
            ("legal", "Legal"),
            ("auditoria", "Auditoría"),
            ("rrhh", "RRHH"),
            ("marketing", "Marketing"),
        ],
    },
    "vitacore": {
        "name": "VitaCore Health",
        "industry": "Salud",
        "employee_count": 800,
        "departments": [
            ("medicina_general", "Medicina General"),
            ("enfermeria", "Enfermería"),
            ("farmacia", "Farmacia"),
            ("laboratorio", "Laboratorio"),
            ("administracion", "Administración"),
            ("ti_salud", "TI Salud"),
            ("recursos_humanos", "Recursos Humanos"),
            ("calidad", "Calidad"),
            ("urgencias", "Urgencias"),
            ("investigacion", "Investigación"),
        ],
    },
}

# ─── 17 Dimensions ───────────────────────────────────────────────────────────
DIMENSIONS = [
    ("innovacion_cambio", "Innovación y Gestión del Cambio"),
    ("autonomia", "Autonomía"),
    ("balance_vida_trabajo", "Balance Vida-Trabajo"),
    ("proposito_trabajo", "Propósito del Trabajo"),
    ("seguridad_fisica", "Seguridad Laboral"),
    ("cohesion_equipo", "Trabajo en Equipo"),
    ("cuidado_mutuo", "Cuidado Mutuo"),
    ("liderazgo_efectivo", "Liderazgo Efectivo"),
    ("desarrollo_profesional", "Desarrollo Profesional"),
    ("compensacion", "Compensación"),
    ("equidad_ascensos", "Equidad en Ascensos"),
    ("beneficios_exclusivos", "Beneficios Exclusivos"),
    ("comunicacion_interna", "Comunicación Interna"),
    ("reconocimiento", "Reconocimiento"),
    ("orgullo_institucional", "Sentimiento de Pertenencia"),
    ("resultados_logros", "Resultados y Logros"),
    ("confianza_institucional", "Confianza Institucional"),
]

DIM_CODES = [d[0] for d in DIMENSIONS]
DIM_NAMES = {d[0]: d[1] for d in DIMENSIONS}

# ─── Narrative offsets per dimension per company ──────────────────────────────
OFFSETS = {
    "novatech": {
        "innovacion_cambio": 0.25, "autonomia": 0.20, "balance_vida_trabajo": -0.35,
        "proposito_trabajo": 0.0, "seguridad_fisica": -0.10, "cohesion_equipo": 0.0,
        "cuidado_mutuo": -0.05, "liderazgo_efectivo": 0.05, "desarrollo_profesional": 0.10,
        "compensacion": -0.10, "equidad_ascensos": -0.15, "beneficios_exclusivos": 0.0,
        "comunicacion_interna": 0.05, "reconocimiento": 0.10, "orgullo_institucional": 0.10,
        "resultados_logros": 0.10, "confianza_institucional": 0.10,
    },
    "meridian": {
        "innovacion_cambio": -0.15, "autonomia": -0.10, "balance_vida_trabajo": -0.20,
        "proposito_trabajo": 0.05, "seguridad_fisica": 0.10, "cohesion_equipo": 0.20,
        "cuidado_mutuo": 0.15, "liderazgo_efectivo": 0.0, "desarrollo_profesional": -0.25,
        "compensacion": -0.30, "equidad_ascensos": -0.20, "beneficios_exclusivos": -0.20,
        "comunicacion_interna": -0.10, "reconocimiento": -0.10, "orgullo_institucional": 0.05,
        "resultados_logros": -0.05, "confianza_institucional": 0.05,
    },
    "atlas": {
        "innovacion_cambio": -0.30, "autonomia": -0.15, "balance_vida_trabajo": 0.05,
        "proposito_trabajo": 0.05, "seguridad_fisica": 0.15, "cohesion_equipo": -0.10,
        "cuidado_mutuo": -0.10, "liderazgo_efectivo": 0.20, "desarrollo_profesional": 0.10,
        "compensacion": 0.20, "equidad_ascensos": -0.05, "beneficios_exclusivos": 0.15,
        "comunicacion_interna": -0.15, "reconocimiento": 0.05, "orgullo_institucional": 0.15,
        "resultados_logros": 0.15, "confianza_institucional": 0.15,
    },
    "vitacore": {
        "innovacion_cambio": -0.10, "autonomia": 0.0, "balance_vida_trabajo": -0.25,
        "proposito_trabajo": 0.30, "seguridad_fisica": 0.25, "cohesion_equipo": 0.10,
        "cuidado_mutuo": 0.20, "liderazgo_efectivo": 0.05, "desarrollo_profesional": -0.30,
        "compensacion": -0.20, "equidad_ascensos": -0.15, "beneficios_exclusivos": -0.10,
        "comunicacion_interna": 0.10, "reconocimiento": -0.05, "orgullo_institucional": 0.10,
        "resultados_logros": 0.0, "confianza_institucional": 0.10,
    },
}

# Engagement profile distributions per company
ENGAGEMENT_PROFILES = {
    "novatech": {"Embajadores": 35, "Comprometidos Pragmáticos": 40, "Neutrales": 15, "Desvinculados": 10},
    "meridian": {"Embajadores": 20, "Comprometidos Pragmáticos": 30, "Neutrales": 35, "Desvinculados": 15},
    "atlas":    {"Embajadores": 25, "Comprometidos Pragmáticos": 45, "Neutrales": 20, "Desvinculados": 10},
    "vitacore": {"Embajadores": 28, "Comprometidos Pragmáticos": 38, "Neutrales": 22, "Desvinculados": 12},
}

# Company-specific risk narratives
RISK_NARRATIVES = {
    "novatech": {
        "primary": ("rf_balance", "Carga de trabajo excesiva en tech", "balance_vida_trabajo", 0.28),
        "secondary": ("rf_equidad", "Falta de equidad en ascensos", "equidad_ascensos", 0.18),
        "tertiary": ("rf_compensacion", "Compensación debajo del mercado tech", "compensacion", 0.14),
    },
    "meridian": {
        "primary": ("rf_compensacion", "Satisfacción con compensación baja", "compensacion", 0.30),
        "secondary": ("rf_desarrollo", "Oportunidades de desarrollo limitadas", "desarrollo_profesional", 0.22),
        "tertiary": ("rf_beneficios", "Beneficios poco competitivos", "beneficios_exclusivos", 0.15),
    },
    "atlas": {
        "primary": ("rf_innovacion", "Resistencia a la innovación", "innovacion_cambio", 0.25),
        "secondary": ("rf_comunicacion", "Comunicación deficiente entre áreas", "comunicacion_interna", 0.18),
        "tertiary": ("rf_cohesion", "Baja cohesión entre equipos", "cohesion_equipo", 0.12),
    },
    "vitacore": {
        "primary": ("rf_desarrollo", "Pocas oportunidades de crecimiento", "desarrollo_profesional", 0.27),
        "secondary": ("rf_balance", "Carga asistencial excesiva", "balance_vida_trabajo", 0.20),
        "tertiary": ("rf_compensacion", "Compensación debajo del sector salud", "compensacion", 0.16),
    },
}


# ─── Helpers ──────────────────────────────────────────────────────────────────

def clamp(v, lo=1.0, hi=5.0):
    return round(max(lo, min(hi, v)), 2)

def jitter(amount=0.05):
    return random.uniform(-amount, amount)

def score_to_segment(score):
    if score >= 4.5: return "fortaleza_excepcional"
    if score >= 4.2: return "fortaleza_solida"
    if score >= 4.0: return "aceptable"
    if score >= 3.5: return "atencion"
    return "crisis"

def score_to_favorability(score):
    """Convert 1-5 score to a favorability percentage."""
    base = (score - 1.0) / 4.0 * 100
    return clamp(base + jitter(3), 0, 100)

def load_template(name):
    with open(TEMPLATE_DIR / name, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(company_id, name, data):
    outdir = OUTPUT_BASE / company_id
    outdir.mkdir(parents=True, exist_ok=True)
    with open(outdir / name, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def distribute_respondents(total, n_groups):
    """Distribute total respondents across n groups roughly evenly with variance."""
    base = total // n_groups
    remainder = total % n_groups
    counts = []
    for i in range(n_groups):
        c = base + (1 if i < remainder else 0)
        c = max(3, c + random.randint(-max(2, c // 5), max(2, c // 5)))
        counts.append(c)
    # Normalize to match total
    diff = total - sum(counts)
    for i in range(abs(diff)):
        idx = random.randint(0, n_groups - 1)
        counts[idx] += 1 if diff > 0 else -1
        counts[idx] = max(3, counts[idx])
    return counts


# ─── Generator functions ─────────────────────────────────────────────────────

def generate_clima_v2(template, company_id, company):
    """Generate clima_v2_data.json with narrative offsets."""
    data = copy.deepcopy(template)
    data["generated_at"] = datetime.now().isoformat()
    offsets = OFFSETS[company_id]
    profiles = ENGAGEMENT_PROFILES[company_id]

    respondent_scale = company["employee_count"] / 200  # base template had ~200

    for year_key, year_data in data["years"].items():
        resp_count = max(50, int(year_data["respondent_count"] * respondent_scale))
        year_data["respondent_count"] = resp_count

        # Apply offsets to dimensions
        for dim in year_data["dimensions"]:
            code = dim["dimension_code"]
            offset = offsets.get(code, 0)
            # Scale offset: earlier years get less offset (building narrative)
            year_int = int(year_key)
            year_factor = 0.5 + 0.5 * ((year_int - 2023) / 3)  # 0.5 for 2023, 1.0 for 2026
            effective_offset = offset * year_factor + jitter()

            dim["avg_score"] = clamp(dim["avg_score"] + effective_offset)
            dim["respondent_count"] = resp_count
            dim["favorability_pct"] = round(score_to_favorability(dim["avg_score"]), 1)
            dim["segment"] = score_to_segment(dim["avg_score"])
            dim["gap_vs_benchmark"] = round(dim["favorability_pct"] - dim["benchmark"], 1)

        # Re-rank by score
        year_data["dimensions"].sort(key=lambda d: d["avg_score"], reverse=True)
        for i, dim in enumerate(year_data["dimensions"]):
            dim["rank"] = i + 1

        # Engagement
        if "engagement" in year_data:
            eng = year_data["engagement"]
            avg_offset = sum(offsets.values()) / len(offsets)
            eng["engagement_score"] = clamp(eng["engagement_score"] + avg_offset * 0.5 + jitter(0.03))
            eng["engagement_pct"] = clamp(eng["engagement_pct"] + avg_offset * 8 + jitter(1), 50, 100)
            eng["respondent_count"] = resp_count

            total_n = resp_count
            eng["profiles"] = {}
            remaining = total_n
            for i, (profile_name, pct) in enumerate(profiles.items()):
                actual_pct = pct + random.uniform(-3, 3)
                if i == len(profiles) - 1:
                    n = remaining
                else:
                    n = max(0, int(total_n * actual_pct / 100))
                    remaining -= n
                eng["profiles"][profile_name] = {
                    "n": n,
                    "pct": round(n / total_n * 100, 1)
                }

    return data


def generate_segmentation(template, company_id, company, clima_data):
    """Generate segmentation_data.json with POPULATED dimensions."""
    data = copy.deepcopy(template)
    data["generated_at"] = datetime.now().isoformat()

    offsets = OFFSETS[company_id]
    depts = company["departments"]
    total = company["employee_count"]
    dept_counts = distribute_respondents(int(total * 0.85), len(depts))

    # Get global scores from 2026 (latest year) clima data
    latest_year = max(clima_data["years"].keys())
    global_dims = {d["dimension_code"]: d for d in clima_data["years"][latest_year]["dimensions"]}
    global_eng = clima_data["years"][latest_year].get("engagement", {})

    data["global_engagement"] = global_eng.get("engagement_pct", 88.0)
    data["global_score"] = global_eng.get("engagement_score", 4.4)
    data["total_respondents"] = total

    def make_segment_dimensions(segment_offset_factor):
        """Create 17 SegmentDimensionScore entries with variance from global."""
        dims = []
        for code, name in DIMENSIONS:
            g = global_dims.get(code)
            if not g:
                continue
            variance = random.uniform(-0.15, 0.15) * segment_offset_factor + jitter(0.05)
            seg_score = clamp(g["avg_score"] + variance)
            fav = round(score_to_favorability(seg_score), 1)
            dims.append({
                "dimension_code": code,
                "dimension_name": name,
                "avg_score": seg_score,
                "favorability_pct": fav,
                "gap_vs_global": round(seg_score - g["avg_score"], 2),
            })
        return dims

    # by_department
    data["by_department"] = []
    for i, (dept_id, dept_name) in enumerate(depts):
        resp = dept_counts[i]
        dept_eng = clamp(data["global_score"] + random.uniform(-0.3, 0.3) + jitter())
        data["by_department"].append({
            "segment_id": dept_id,
            "segment_name": dept_name,
            "segment_type": "department",
            "respondent_count": resp,
            "engagement_score": dept_eng,
            "engagement_pct": clamp(dept_eng / 5.0 * 100, 50, 100),
            "dimensions": make_segment_dimensions(1.0 + random.uniform(-0.3, 0.3)),
        })

    # by_tenure
    tenures = [
        ("menos_de_1_año", "Menos de 1 año"),
        ("entre_1_y_3_años", "1-3 años"),
        ("entre_3_y_5_años", "3-5 años"),
        ("entre_5_y_7_años", "5-7 años"),
        ("mas_de_7_años", "Más de 7 años"),
    ]
    tenure_pcts = [0.22, 0.30, 0.18, 0.12, 0.18]
    data["by_tenure"] = []
    for (tid, tname), pct in zip(tenures, tenure_pcts):
        resp = max(10, int(total * pct * random.uniform(0.85, 1.15)))
        eng = clamp(data["global_score"] + random.uniform(-0.2, 0.2) + jitter())
        data["by_tenure"].append({
            "segment_id": tid,
            "segment_name": tname,
            "segment_type": "tenure",
            "respondent_count": resp,
            "engagement_score": eng,
            "engagement_pct": clamp(eng / 5.0 * 100, 50, 100),
            "dimensions": make_segment_dimensions(0.8),
        })

    # by_gender
    genders = [
        ("masculino", "Masculino", 0.45),
        ("femenino", "Femenino", 0.50),
        ("otro", "Otro", 0.05),
    ]
    data["by_gender"] = []
    for gid, gname, pct in genders:
        resp = max(5, int(total * pct * random.uniform(0.9, 1.1)))
        eng = clamp(data["global_score"] + random.uniform(-0.15, 0.15) + jitter())
        data["by_gender"].append({
            "segment_id": gid,
            "segment_name": gname,
            "segment_type": "gender",
            "respondent_count": resp,
            "engagement_score": eng,
            "engagement_pct": clamp(eng / 5.0 * 100, 50, 100),
            "dimensions": make_segment_dimensions(0.6),
        })

    # risk_groups
    risk_narrative = RISK_NARRATIVES[company_id]
    data["risk_groups"] = [
        {
            "group_name": "Alto Riesgo",
            "description": f"Colaboradores con indicadores críticos en {risk_narrative['primary'][1].lower()}",
            "count": max(5, int(total * 0.08)),
            "percentage": 8.0,
            "avg_engagement": clamp(data["global_score"] - 0.8 + jitter(0.1)),
            "key_factors": [risk_narrative["primary"][2], risk_narrative["secondary"][2]],
        },
        {
            "group_name": "Riesgo Moderado",
            "description": "Colaboradores con señales de alerta en satisfacción general",
            "count": max(10, int(total * 0.15)),
            "percentage": 15.0,
            "avg_engagement": clamp(data["global_score"] - 0.4 + jitter(0.1)),
            "key_factors": [risk_narrative["secondary"][2], risk_narrative["tertiary"][2]],
        },
        {
            "group_name": "Bajo Riesgo",
            "description": "Colaboradores con buena satisfacción general",
            "count": max(20, int(total * 0.77)),
            "percentage": 77.0,
            "avg_engagement": clamp(data["global_score"] + 0.15 + jitter(0.05)),
            "key_factors": [],
        },
    ]

    # heatmap
    key_dims = ["innovacion_cambio", "balance_vida_trabajo", "liderazgo_efectivo",
                "compensacion", "desarrollo_profesional", "cohesion_equipo"]
    cells = []
    for dept_id, dept_name in depts:
        for dim_code in key_dims:
            g = global_dims.get(dim_code)
            base = g["avg_score"] if g else 4.0
            score = clamp(base + random.uniform(-0.4, 0.4) + jitter())
            cells.append({
                "department": dept_name,
                "dimension": DIM_NAMES.get(dim_code, dim_code),
                "score": score,
                "segment": score_to_segment(score),
            })

    data["heatmap"] = {
        "dimensions": [DIM_NAMES[d] for d in key_dims],
        "departments": [d[1] for d in depts],
        "cells": cells,
    }

    return data


def generate_demographics(template, company_id, company, clima_data):
    """Generate clima_demographics.json."""
    data = copy.deepcopy(template)
    data["generated_at"] = datetime.now().isoformat()
    data["model_version"] = "v2_demographics"

    depts = company["departments"]
    total = company["employee_count"]
    offsets = OFFSETS[company_id]

    respondent_scale = total / 200

    for year_key, year_data in data["years"].items():
        ft = year_data["ficha_tecnica"]
        pop = max(50, int(ft["population_n"] * respondent_scale))
        sample = max(40, int(pop * ft["response_rate"] / 100))
        ft["population_n"] = pop
        ft["sample_n"] = sample
        ft["response_rate"] = round(sample / pop * 100, 1)
        ft["margin_of_error"] = round(max(1.0, ft["margin_of_error"] * (200 / total) ** 0.5), 2)

        # Departments
        dept_counts = distribute_respondents(sample, len(depts))
        year_data["demographics"]["departments"] = {
            name: count for (_, name), count in zip(depts, dept_counts)
        }

        # Genders - redistribute
        total_gender = sample
        m = int(total_gender * random.uniform(0.40, 0.55))
        f = int(total_gender * random.uniform(0.40, 0.50))
        o = max(1, total_gender - m - f)
        year_data["demographics"]["genders"] = {
            "Masculino": m, "Femenino": f, "Otro": o
        }

        # Tenures
        tenure_labels = ["<1 año", "1-3 años", "3-5 años", "5-7 años", ">7 años"]
        tenure_pcts = [0.22, 0.30, 0.18, 0.12, 0.18]
        year_data["demographics"]["tenures"] = {}
        remaining_t = sample
        for i, (label, pct) in enumerate(zip(tenure_labels, tenure_pcts)):
            if i == len(tenure_labels) - 1:
                n = remaining_t
            else:
                n = max(2, int(sample * pct * random.uniform(0.85, 1.15)))
                remaining_t -= n
            year_data["demographics"]["tenures"][label] = n

        # Generations
        gen_labels = ["Gen Z / Nuevos", "Millennials Recientes", "Millennials", "Gen X / Senior", "Veteranos"]
        year_data["demographics"]["generations"] = {}
        remaining_g = sample
        for i, label in enumerate(gen_labels):
            if i == len(gen_labels) - 1:
                n = remaining_g
            else:
                n = max(2, int(sample * tenure_pcts[i] * random.uniform(0.85, 1.15)))
                remaining_g -= n
            year_data["demographics"]["generations"][label] = n

        # eNPS - derive from engagement
        avg_offset = sum(offsets.values()) / len(offsets)
        if "enps" in year_data:
            enps_data = year_data["enps"]
            if isinstance(enps_data, dict) and "enps" in enps_data:
                enps_data["enps"] = round(clamp(enps_data["enps"] + avg_offset * 15 + jitter(3), -100, 100), 1)
                # Recalculate promoters/passives/detractors
                enps_val = enps_data["enps"]
                prom_pct = clamp(50 + enps_val * 0.3 + jitter(2), 20, 90)
                det_pct = clamp(max(2, 50 - enps_val * 0.3 + jitter(2)), 2, 40)
                pass_pct = 100 - prom_pct - det_pct
                total_n = sample
                enps_data["promoters_n"] = int(total_n * prom_pct / 100)
                enps_data["promoters_pct"] = round(prom_pct, 1)
                enps_data["passives_n"] = int(total_n * pass_pct / 100)
                enps_data["passives_pct"] = round(pass_pct, 1)
                enps_data["detractors_n"] = int(total_n * det_pct / 100)
                enps_data["detractors_pct"] = round(det_pct, 1)

        # Top/bottom items - adjust scores with offsets
        for item_list_key in ["top_5_items", "bottom_5_items"]:
            if item_list_key in year_data:
                for item in year_data[item_list_key]:
                    item["avg_score"] = clamp(item["avg_score"] + avg_offset * 0.3 + jitter(0.05))
                    item["favorability"] = clamp(item["favorability"] + avg_offset * 5 + jitter(1), 0, 100)
                    item["n"] = max(5, int(item["n"] * respondent_scale))

    return data


def generate_predictions(template, company_id, company, clima_data):
    """Generate predictions_data.json."""
    data = copy.deepcopy(template)
    data["generated_at"] = datetime.now().isoformat()
    data["total_respondents"] = company["employee_count"]

    offsets = OFFSETS[company_id]
    depts = company["departments"]
    risk_narr = RISK_NARRATIVES[company_id]

    avg_offset = sum(offsets.values()) / len(offsets)

    # Rotation risk
    rr = data["rotation_risk"]
    rr["overall_index"] = max(3, min(40, int(rr["overall_index"] - avg_offset * 10 + jitter(2))))

    # Risk factors - use company-specific narratives
    rr["risk_factors"] = [
        {
            "id": risk_narr["primary"][0],
            "factor": risk_narr["primary"][1],
            "impact_score": round(risk_narr["primary"][3] + jitter(0.02), 2),
            "affected_percentage": max(5, int(24 + random.uniform(-5, 5))),
            "dimension": risk_narr["primary"][2],
            "avg_score": clamp(3.8 + offsets.get(risk_narr["primary"][2], 0) + jitter()),
        },
        {
            "id": risk_narr["secondary"][0],
            "factor": risk_narr["secondary"][1],
            "impact_score": round(risk_narr["secondary"][3] + jitter(0.02), 2),
            "affected_percentage": max(5, int(18 + random.uniform(-4, 4))),
            "dimension": risk_narr["secondary"][2],
            "avg_score": clamp(4.0 + offsets.get(risk_narr["secondary"][2], 0) + jitter()),
        },
        {
            "id": risk_narr["tertiary"][0],
            "factor": risk_narr["tertiary"][1],
            "impact_score": round(risk_narr["tertiary"][3] + jitter(0.02), 2),
            "affected_percentage": max(5, int(12 + random.uniform(-3, 3))),
            "dimension": risk_narr["tertiary"][2],
            "avg_score": clamp(4.2 + offsets.get(risk_narr["tertiary"][2], 0) + jitter()),
        },
    ]

    # High risk areas - use company departments
    chosen_depts = random.sample(depts, min(5, len(depts)))
    rr["high_risk_areas"] = []
    for i, (dept_id, dept_name) in enumerate(chosen_depts):
        risk_level = max(3, 18 - i * 3 + random.randint(-2, 2))
        eng = clamp(3.7 + i * 0.15 + avg_offset + jitter(0.1))
        headcount = max(5, int(company["employee_count"] / len(depts) * random.uniform(0.5, 1.5)))
        issues = random.sample(
            [risk_narr["primary"][1].split(" ")[0], risk_narr["secondary"][1].split(" ")[0],
             "Reconocimiento", "Comunicación", "Liderazgo"],
            k=random.randint(1, 2)
        )
        rr["high_risk_areas"].append({
            "area": dept_name,
            "risk_level": risk_level,
            "engagement_score": eng,
            "headcount": headcount,
            "key_issues": issues,
        })

    # Engagement-rotation correlation - apply offset
    if "engagement_rotation_correlation" in rr:
        for point in rr["engagement_rotation_correlation"]:
            point["rotation"] = max(1, int(point["rotation"] - avg_offset * 5 + jitter(2)))

    # Projections - apply offsets
    if "projections" in data:
        proj = data["projections"]
        # Overall
        if "overall" in proj:
            ov = proj["overall"]
            ov["current_score"] = clamp(ov["current_score"] + avg_offset + jitter())
            for h in ov.get("historical", []):
                h["score"] = clamp(h["score"] + avg_offset + jitter(0.03))
            for f in ov.get("forecast", []):
                for k in ["optimistic", "expected", "pessimistic"]:
                    if k in f:
                        f[k] = clamp(f[k] + avg_offset + jitter(0.03))

        # By dimension
        if "by_dimension" in proj:
            for dim_proj in proj["by_dimension"]:
                # Find matching dimension code
                dim_name = dim_proj.get("dimension", dim_proj.get("label", ""))
                matching_code = None
                for code, name in DIMENSIONS:
                    if name == dim_name:
                        matching_code = code
                        break
                dim_offset = offsets.get(matching_code, 0) if matching_code else 0

                dim_proj["current_score"] = clamp(dim_proj["current_score"] + dim_offset + jitter())
                for f in dim_proj.get("forecast", []):
                    for k in ["optimistic", "expected", "pessimistic"]:
                        if k in f:
                            f[k] = clamp(f[k] + dim_offset + jitter(0.03))

    return data


def generate_correlations(template, company_id, company):
    """Generate correlations_data.json."""
    data = copy.deepcopy(template)
    data["generated_at"] = datetime.now().isoformat()
    data["total_respondents"] = company["employee_count"]

    offsets = OFFSETS[company_id]

    # Adjust correlation matrix with small perturbations
    if "correlation_matrix" in data:
        matrix = data["correlation_matrix"]
        n = len(matrix)
        for i in range(n):
            for j in range(n):
                if i == j:
                    matrix[i][j] = 1.0
                else:
                    perturbation = jitter(0.08)
                    matrix[i][j] = round(clamp(matrix[i][j] + perturbation, -1.0, 1.0), 3)
                    matrix[j][i] = matrix[i][j]  # Keep symmetric

    return data


def replace_company_refs(text, company_name, company_id):
    """Replace Towerbank/Tower references with company name in text."""
    # Case-insensitive replacements
    text = re.sub(r'[Tt][Oo][Ww][Ee][Rr]\s*[Bb][Aa][Nn][Kk]', company_name, text)
    text = re.sub(r'\b[Tt][Oo][Ww][Ee][Rr]\b', company_name.split()[0], text)
    if company_id != "atlas":
        text = re.sub(r'\bel banco\b', 'la empresa', text, flags=re.IGNORECASE)
        text = re.sub(r'\bdel banco\b', 'de la empresa', text, flags=re.IGNORECASE)
    return text


def deep_replace_refs(obj, company_name, company_id):
    """Recursively replace Towerbank/Tower references in all strings."""
    if isinstance(obj, str):
        return replace_company_refs(obj, company_name, company_id)
    elif isinstance(obj, dict):
        return {k: deep_replace_refs(v, company_name, company_id) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [deep_replace_refs(item, company_name, company_id) for item in obj]
    return obj


def generate_clustering(template, company_id, company):
    """Generate clustering_data.json."""
    data = copy.deepcopy(template)
    data["generated_at"] = datetime.now().isoformat()

    total = company["employee_count"]
    depts = company["departments"]
    dept_names = [d[1] for d in depts]
    dept_ids = [d[0] for d in depts]

    # Update nodes with company departments
    if "nodes" in data:
        for node in data["nodes"]:
            if node.get("type") == "participant":
                # Assign a random department from this company
                idx = random.randint(0, len(depts) - 1)
                node["department"] = dept_ids[idx]
                node["department_name"] = dept_names[idx]

    # Adjust cluster sizes
    if "clusters" in data:
        total_comments = data.get("total_comments_processed", 500)
        scale = total / 200
        data["total_comments_processed"] = int(total_comments * scale)

    # Replace all Towerbank/Tower references
    data = deep_replace_refs(data, company["name"], company_id)

    return data


def generate_recognition(template, company_id, company, clima_data):
    """Generate recognition_data.json."""
    data = copy.deepcopy(template)
    data["generated_at"] = datetime.now().isoformat()

    depts = company["departments"]
    offsets = OFFSETS[company_id]
    avg_offset = sum(offsets.values()) / len(offsets)

    # Replace department rankings
    rankings = []
    dept_scores = []
    for dept_id, dept_name in depts:
        base_eng = 4.3 + avg_offset + random.uniform(-0.4, 0.4) + jitter()
        dept_scores.append((dept_id, dept_name, clamp(base_eng)))

    dept_scores.sort(key=lambda x: x[2], reverse=True)

    medals = ["gold", "gold", "silver", "silver", "silver", "bronze", "bronze", "bronze", None, None]
    for i, (dept_id, dept_name, eng_score) in enumerate(dept_scores):
        dim_scores = {}
        for dim_code in ["orgullo_institucional", "liderazgo_efectivo", "comunicacion_interna",
                         "desarrollo_profesional", "compensacion", "reconocimiento",
                         "balance_vida_trabajo", "cohesion_equipo", "engagement_global"]:
            dim_offset = offsets.get(dim_code, 0)
            dim_scores[dim_code.replace("_efectivo", "").replace("_interna", "")
                       .replace("_vida_trabajo", "").replace("_profesional", "")
                       .replace("_equipo", "").replace("_institucional", "")
                       .replace("_global", "")] = clamp(eng_score + dim_offset * 0.5 + jitter(0.1))

        # Simplified dimension keys matching template
        dims = {
            "orgullo_institucional": clamp(eng_score + offsets.get("orgullo_institucional", 0) * 0.5 + jitter(0.1)),
            "engagement": eng_score,
            "liderazgo": clamp(eng_score + offsets.get("liderazgo_efectivo", 0) * 0.5 + jitter(0.1)),
            "comunicacion": clamp(eng_score + offsets.get("comunicacion_interna", 0) * 0.5 + jitter(0.1)),
            "desarrollo": clamp(eng_score + offsets.get("desarrollo_profesional", 0) * 0.5 + jitter(0.1)),
            "compensacion": clamp(eng_score + offsets.get("compensacion", 0) * 0.5 + jitter(0.1)),
            "reconocimiento": clamp(eng_score + offsets.get("reconocimiento", 0) * 0.5 + jitter(0.1)),
            "balance": clamp(eng_score + offsets.get("balance_vida_trabajo", 0) * 0.5 + jitter(0.1)),
            "cohesion": clamp(eng_score + offsets.get("cohesion_equipo", 0) * 0.5 + jitter(0.1)),
        }

        respondents = max(5, int(company["employee_count"] / len(depts) * random.uniform(0.7, 1.3)))

        # Badges
        badges = []
        if eng_score >= 4.3:
            badges.append({"id": "consistency", "name": "Consistencia",
                           "description": "Mantiene engagement superior a 4.3",
                           "icon": "check-circle", "color": "green"})
        if dims["balance"] >= 4.4:
            badges.append({"id": "wellness_leader", "name": "Líder en Bienestar",
                           "description": "Top en Balance Vida-Trabajo",
                           "icon": "heart", "color": "pink"})
        if dims["cohesion"] >= 4.4:
            badges.append({"id": "team_spirit", "name": "Espíritu de Equipo",
                           "description": "Excelente cohesión de equipo",
                           "icon": "users", "color": "blue"})
        if dims["liderazgo"] >= 4.5:
            badges.append({"id": "leadership_excellence", "name": "Excelencia en Liderazgo",
                           "description": "Liderazgo destacado",
                           "icon": "award", "color": "purple"})

        rankings.append({
            "area": dept_name,
            "engagement": eng_score,
            "respondents": respondents,
            "dimensions": dims,
            "medal": medals[i] if i < len(medals) else None,
            "rank": i + 1,
            "change": round(random.uniform(-0.15, 0.2), 2),
            "trend": random.choice(["up", "stable", "down"]) if i > 0 else "up",
            "badges": badges,
        })

    data["rankings"] = rankings
    return data


def generate_text_analysis(template, company_id, company):
    """Generate text_analysis_data.json."""
    data = copy.deepcopy(template)
    data["generated_at"] = datetime.now().isoformat()

    # Replace all Towerbank/Tower references throughout
    data = deep_replace_refs(data, company["name"], company_id)

    depts = company["departments"]
    dept_ids = [d[0] for d in depts]
    dept_names = [d[1] for d in depts]
    company_name = company["name"]

    total_scale = company["employee_count"] / 200
    data["total_comments"] = max(100, int(data.get("total_comments", 500) * total_scale))

    # Update comments - replace Towerbank references and departments
    if "comments" in data:
        for comment in data["comments"]:
            # Replace department
            idx = random.randint(0, len(depts) - 1)
            comment["department"] = dept_ids[idx]

            # Replace company name references
            comment["text"] = replace_company_refs(comment.get("text", ""), company_name, company_id)

    return data


def generate_unified_analysis(template, company_id, company, clima_data):
    """Generate unified_analysis.json."""
    data = copy.deepcopy(template)
    data["generated_at"] = datetime.now().isoformat()

    # Replace all Towerbank/Tower references throughout
    data = deep_replace_refs(data, company["name"], company_id)

    offsets = OFFSETS[company_id]
    company_name = company["name"]
    avg_offset = sum(offsets.values()) / len(offsets)

    # Update keyword analysis - scale counts
    if "keyword_analysis" in data:
        for year_key, year_data in data["keyword_analysis"].items():
            for section_key, section in year_data.items():
                if isinstance(section, dict):
                    # Scale response counts
                    if "response_count" in section:
                        section["response_count"] = max(20, int(
                            section["response_count"] * company["employee_count"] / 200
                        ))
                    # Adjust keyword counts
                    if "keywords" in section:
                        for kw in section["keywords"]:
                            kw["count"] = max(1, int(kw["count"] * company["employee_count"] / 200 * random.uniform(0.7, 1.3)))
                            kw["frequency"] = round(kw["count"] / max(1, section.get("response_count", 100)) * 100, 2)
                    if "bigrams" in section:
                        for bg in section["bigrams"]:
                            bg["count"] = max(1, int(bg["count"] * company["employee_count"] / 200 * random.uniform(0.7, 1.3)))
                            bg["frequency"] = round(bg["count"] / max(1, section.get("response_count", 100)) * 100, 2)

    # Update global_engagement
    if "global_engagement" in data:
        for entry in data["global_engagement"]:
            entry["engagement_score"] = clamp(entry["engagement_score"] + avg_offset * 0.5 + jitter(0.03))
            entry["engagement_pct"] = clamp(entry["engagement_pct"] + avg_offset * 8 + jitter(1), 50, 100)
            entry["respondent_count"] = max(50, int(
                entry["respondent_count"] * company["employee_count"] / 200
            ))

    return data


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    print("Loading templates...")
    templates = {}
    for name in [
        "clima_v2_data.json", "clima_demographics.json", "segmentation_data.json",
        "predictions_data.json", "correlations_data.json", "clustering_data.json",
        "recognition_data.json", "text_analysis_data.json", "unified_analysis.json",
    ]:
        templates[name] = load_template(name)
        print(f"  Loaded {name}")

    for company_id, company in COMPANIES.items():
        print(f"\nGenerating data for {company['name']} ({company_id})...")
        random.seed(hash(company_id) + 42)  # Deterministic per company

        # 1. clima_v2_data.json
        clima = generate_clima_v2(templates["clima_v2_data.json"], company_id, company)
        save_json(company_id, "clima_v2_data.json", clima)
        print(f"  clima_v2_data.json")

        # 2. segmentation_data.json (needs clima data)
        seg = generate_segmentation(templates["segmentation_data.json"], company_id, company, clima)
        save_json(company_id, "segmentation_data.json", seg)
        print(f"  segmentation_data.json")

        # 3. clima_demographics.json
        demo = generate_demographics(templates["clima_demographics.json"], company_id, company, clima)
        save_json(company_id, "clima_demographics.json", demo)
        print(f"  clima_demographics.json")

        # 4. predictions_data.json
        pred = generate_predictions(templates["predictions_data.json"], company_id, company, clima)
        save_json(company_id, "predictions_data.json", pred)
        print(f"  predictions_data.json")

        # 5. correlations_data.json
        corr = generate_correlations(templates["correlations_data.json"], company_id, company)
        save_json(company_id, "correlations_data.json", corr)
        print(f"  correlations_data.json")

        # 6. clustering_data.json
        clust = generate_clustering(templates["clustering_data.json"], company_id, company)
        save_json(company_id, "clustering_data.json", clust)
        print(f"  clustering_data.json")

        # 7. recognition_data.json
        recog = generate_recognition(templates["recognition_data.json"], company_id, company, clima)
        save_json(company_id, "recognition_data.json", recog)
        print(f"  recognition_data.json")

        # 8. text_analysis_data.json
        text = generate_text_analysis(templates["text_analysis_data.json"], company_id, company)
        save_json(company_id, "text_analysis_data.json", text)
        print(f"  text_analysis_data.json")

        # 9. unified_analysis.json
        unified = generate_unified_analysis(templates["unified_analysis.json"], company_id, company, clima)
        save_json(company_id, "unified_analysis.json", unified)
        print(f"  unified_analysis.json")

    # Verification
    print("\n─── Verification ───")
    for company_id in COMPANIES:
        outdir = OUTPUT_BASE / company_id
        files = sorted(f.name for f in outdir.glob("*.json"))
        print(f"\n{company_id}: {len(files)} files")
        for f in files:
            fpath = outdir / f
            with open(fpath, "r") as fp:
                d = json.load(fp)
            size_kb = fpath.stat().st_size / 1024
            print(f"  {f}: {size_kb:.1f} KB")

    # Check segmentation dimensions populated
    print("\n─── Segmentation dimensions check ───")
    for company_id in COMPANIES:
        seg_path = OUTPUT_BASE / company_id / "segmentation_data.json"
        with open(seg_path) as f:
            seg = json.load(f)
        dept_dims = len(seg["by_department"][0]["dimensions"]) if seg["by_department"] else 0
        tenure_dims = len(seg["by_tenure"][0]["dimensions"]) if seg["by_tenure"] else 0
        gender_dims = len(seg["by_gender"][0]["dimensions"]) if seg["by_gender"] else 0
        print(f"  {company_id}: dept_dims={dept_dims}, tenure_dims={tenure_dims}, gender_dims={gender_dims}")

    # Check no Towerbank references
    print("\n─── Towerbank reference check ───")
    for company_id in COMPANIES:
        outdir = OUTPUT_BASE / company_id
        for fpath in outdir.glob("*.json"):
            with open(fpath) as f:
                content = f.read().lower()
            if "towerbank" in content or "tower" in content.split('"'):
                print(f"  WARNING: {company_id}/{fpath.name} still has Towerbank references!")
                break
        else:
            print(f"  {company_id}: Clean (no Towerbank/Tower references)")

    # Show score differentiation
    print("\n─── Score differentiation (2026 dimensions) ───")
    for company_id in COMPANIES:
        clima_path = OUTPUT_BASE / company_id / "clima_v2_data.json"
        with open(clima_path) as f:
            clima = json.load(f)
        latest = max(clima["years"].keys())
        dims = clima["years"][latest]["dimensions"]
        top = dims[0]
        bottom = dims[-1]
        eng = clima["years"][latest].get("engagement", {})
        print(f"  {company_id}: top={top['dimension_name']}({top['avg_score']}), "
              f"bottom={bottom['dimension_name']}({bottom['avg_score']}), "
              f"engagement={eng.get('engagement_score', 'N/A')}")

    print("\nDone! All 36 files generated.")


if __name__ == "__main__":
    main()
