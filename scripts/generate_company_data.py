#!/usr/bin/env python3
"""
Generate variant company data for MRI Organizacional demo.
Reads the 9 original JSON files and creates modified copies for each company.
"""

import json
import os
import copy
import random
import re
from pathlib import Path

random.seed(42)

BASE_DIR = Path(__file__).parent.parent / "public" / "data"

COMPANIES = {
    "novatech": {
        "name": "NovaTech Solutions",
        "industry": "Tech / SaaS",
        "employees": 450,
        "departments": [
            "Engineering", "Product", "Design", "DevOps", "Data Science",
            "Sales", "Customer Success", "Marketing", "People Ops", "Finance"
        ],
        "score_offset": 0.05,   # strong innovation
        "narrative": "strong_innovation",
    },
    "meridian": {
        "name": "Meridian Stores",
        "industry": "Retail",
        "employees": 1200,
        "departments": [
            "Ventas Tienda", "Logística", "E-Commerce", "Marketing", "RRHH",
            "Finanzas", "Compras", "Atención al Cliente", "IT", "Operaciones"
        ],
        "score_offset": -0.05,
        "narrative": "good_cohesion",
    },
    "atlas": {
        "name": "Atlas Capital Group",
        "industry": "Finanzas",
        "employees": 350,
        "departments": [
            "Banca Privada", "Cumplimiento", "Riesgos", "Tesorería", "Operaciones",
            "Tecnología", "Legal", "Auditoría", "RRHH", "Marketing"
        ],
        "score_offset": 0.1,
        "narrative": "conservative_culture",
    },
    "vitacore": {
        "name": "VitaCore Health",
        "industry": "Salud",
        "employees": 800,
        "departments": [
            "Medicina General", "Enfermería", "Farmacia", "Laboratorio", "Administración",
            "TI Salud", "Recursos Humanos", "Calidad", "Urgencias", "Investigación"
        ],
        "score_offset": 0.0,
        "narrative": "strong_purpose",
    },
}


def jitter(base_offset: float, magnitude: float = 0.15) -> float:
    return base_offset + random.uniform(-magnitude, magnitude)


def clamp(value: float, min_val: float = 1.0, max_val: float = 5.0) -> float:
    return max(min_val, min(max_val, value))


def clamp_pct(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    return max(min_val, min(max_val, value))


def scale_count(original: int, original_total: int, new_total: int) -> int:
    if original_total == 0:
        return 0
    ratio = new_total / original_total
    return max(1, int(round(original * ratio)))


def replace_company_name(text: str, new_name: str) -> str:
    text = text.replace("Towerbank", new_name)
    text = text.replace("towerbank", new_name.lower())
    text = text.replace("Tower Bank", new_name)
    return text


def slugify(name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '_', name.lower().strip()).strip('_')


def pick_dept(departments: list) -> str:
    return random.choice(departments)


def map_department(original_dept: str, new_departments: list) -> str:
    """Map original department to a new department deterministically."""
    idx = hash(original_dept) % len(new_departments)
    return new_departments[idx]


# ============================================================
# clima_v2_data.json
# ============================================================
def transform_clima_v2(data: dict, company: dict) -> dict:
    out = copy.deepcopy(data)
    offset = company["score_offset"]

    for year_key, year_data in out.get("years", {}).items():
        # Scale respondent count
        year_data["respondent_count"] = scale_count(
            year_data.get("respondent_count", 189), 189, company["employees"]
        )

        # Adjust dimensions
        for dim in year_data.get("dimensions", []):
            j = jitter(offset)
            dim["avg_score"] = round(clamp(dim["avg_score"] + j), 2)
            dim["favorability_pct"] = round(clamp_pct(dim["favorability_pct"] + j * 10), 1)
            dim["benchmark"] = round(clamp(dim["benchmark"] + random.uniform(-0.05, 0.05)), 2)
            dim["gap_vs_benchmark"] = round(dim["avg_score"] - dim["benchmark"], 2)
            dim["respondent_count"] = year_data["respondent_count"]

        # Adjust engagement
        eng = year_data.get("engagement")
        if eng:
            j = jitter(offset)
            eng["engagement_score"] = round(clamp(eng["engagement_score"] + j), 2)
            eng["engagement_pct"] = round(clamp_pct(eng["engagement_pct"] + j * 10), 1)
            eng["total_respondents"] = year_data["respondent_count"]
            for profile_name, profile_data in eng.get("profiles", {}).items():
                profile_data["n"] = scale_count(
                    profile_data["n"], 189, year_data["respondent_count"]
                )
                profile_data["pct"] = round(profile_data["n"] / max(1, year_data["respondent_count"]) * 100, 1)

    out["generated_at"] = "2026-02-01T00:00:00"
    return out


# ============================================================
# clima_demographics.json
# ============================================================
def transform_demographics(data: dict, company: dict) -> dict:
    out = copy.deepcopy(data)
    new_depts = company["departments"]
    emp = company["employees"]

    for year_key, year_data in out.get("years", {}).items():
        ft = year_data.get("ficha_tecnica", {})
        original_pop = ft.get("population_n", 200)
        ft["population_n"] = emp
        ft["sample_n"] = scale_count(ft.get("sample_n", 189), original_pop, emp)
        ft["response_rate"] = round(ft["sample_n"] / emp * 100, 1)

        demo = year_data.get("demographics", {})
        if demo:
            # Rebuild departments
            old_depts = demo.get("departments", {})
            total_old = sum(old_depts.values())
            new_dept_dict = {}
            remaining = ft["sample_n"]
            for i, dept in enumerate(new_depts):
                if i == len(new_depts) - 1:
                    new_dept_dict[dept] = remaining
                else:
                    count = max(3, int(remaining / (len(new_depts) - i) + random.randint(-5, 5)))
                    count = min(count, remaining - (len(new_depts) - i - 1))
                    new_dept_dict[dept] = count
                    remaining -= count
            demo["departments"] = new_dept_dict

            # Scale genders
            old_total_gender = sum(demo.get("genders", {}).values())
            if old_total_gender > 0:
                for g in demo.get("genders", {}):
                    demo["genders"][g] = scale_count(demo["genders"][g], old_total_gender, ft["sample_n"])

            # Scale tenures
            old_total_tenure = sum(demo.get("tenures", {}).values())
            if old_total_tenure > 0:
                for t in demo.get("tenures", {}):
                    demo["tenures"][t] = scale_count(demo["tenures"][t], old_total_tenure, ft["sample_n"])

        # Adjust eNPS
        enps = year_data.get("enps", {})
        if enps:
            j = jitter(company["score_offset"], 5)
            enps["score"] = round(clamp(enps.get("score", 40) + j, -100, 100), 1)
            for cat in ["promoters", "passives", "detractors"]:
                if cat in enps:
                    enps[cat] = scale_count(enps.get(cat, 0), original_pop, ft["sample_n"])

        # Adjust top/bottom items
        offset = company["score_offset"]
        for item in year_data.get("top_5_items", []):
            item["avg_score"] = round(clamp(item["avg_score"] + jitter(offset, 0.1)), 2)
        for item in year_data.get("bottom_5_items", []):
            item["avg_score"] = round(clamp(item["avg_score"] + jitter(offset, 0.1)), 2)

    return out


# ============================================================
# segmentation_data.json
# ============================================================
def transform_segmentation(data: dict, company: dict) -> dict:
    out = copy.deepcopy(data)
    new_depts = company["departments"]
    emp = company["employees"]
    offset = company["score_offset"]
    original_total = out.get("total_respondents", 189)

    out["total_respondents"] = emp
    out["global_score"] = round(clamp(out.get("global_score", 4.46) + jitter(offset, 0.1)), 2)
    out["global_engagement"] = round(clamp_pct(out.get("global_engagement", 89.2) + jitter(offset * 10, 3)), 1)

    # Rebuild by_department
    new_by_dept = []
    for i, dept in enumerate(new_depts):
        # Use original department as template if available, otherwise first
        template = out["by_department"][i % len(out["by_department"])] if out["by_department"] else {}
        seg = copy.deepcopy(template)
        seg["segment_id"] = slugify(dept)
        seg["segment_name"] = dept
        seg["segment_type"] = "department"
        seg["respondent_count"] = max(5, emp // len(new_depts) + random.randint(-10, 10))
        j = jitter(offset)
        seg["engagement_score"] = round(clamp(seg.get("engagement_score", 4.2) + j), 2)
        seg["engagement_pct"] = round(clamp_pct(seg.get("engagement_pct", 85) + j * 10), 1)
        for dim in seg.get("dimensions", []):
            dj = jitter(offset, 0.1)
            dim["avg_score"] = round(clamp(dim["avg_score"] + dj), 2)
            dim["favorability_pct"] = round(clamp_pct(dim["favorability_pct"] + dj * 10), 1)
            dim["gap_vs_global"] = round(dim["avg_score"] - out["global_score"], 2)
        new_by_dept.append(seg)
    out["by_department"] = new_by_dept

    # Adjust tenure segments
    for seg in out.get("by_tenure", []):
        seg["respondent_count"] = scale_count(seg["respondent_count"], original_total, emp)
        j = jitter(offset)
        seg["engagement_score"] = round(clamp(seg["engagement_score"] + j), 2)
        seg["engagement_pct"] = round(clamp_pct(seg["engagement_pct"] + j * 10), 1)
        for dim in seg.get("dimensions", []):
            dim["avg_score"] = round(clamp(dim["avg_score"] + jitter(offset, 0.1)), 2)
            dim["gap_vs_global"] = round(dim["avg_score"] - out["global_score"], 2)

    # Adjust gender segments
    for seg in out.get("by_gender", []):
        seg["respondent_count"] = scale_count(seg["respondent_count"], original_total, emp)
        j = jitter(offset)
        seg["engagement_score"] = round(clamp(seg["engagement_score"] + j), 2)
        seg["engagement_pct"] = round(clamp_pct(seg["engagement_pct"] + j * 10), 1)
        for dim in seg.get("dimensions", []):
            dim["avg_score"] = round(clamp(dim["avg_score"] + jitter(offset, 0.1)), 2)

    # Rebuild heatmap
    heatmap = out.get("heatmap", {})
    if heatmap:
        heatmap["segments"] = [d["segment_name"] for d in new_by_dept]
        heatmap["segment_keys"] = [d["segment_id"] for d in new_by_dept]
        new_cells = []
        for dept in new_by_dept:
            for dim in dept.get("dimensions", []):
                new_cells.append({
                    "segment": dept["segment_id"],
                    "segment_name": dept["segment_name"],
                    "dimension": dim["dimension_code"],
                    "dimension_name": dim["dimension_name"],
                    "score": dim["avg_score"],
                    "favorability": dim["favorability_pct"],
                    "color": _score_to_color(dim["avg_score"]),
                })
        heatmap["cells"] = new_cells

    return out


def _score_to_color(score: float) -> str:
    if score >= 4.5:
        return "#22c55e"
    elif score >= 4.0:
        return "#3b82f6"
    elif score >= 3.5:
        return "#f59e0b"
    elif score >= 3.0:
        return "#f97316"
    else:
        return "#ef4444"


# ============================================================
# text_analysis_data.json
# ============================================================
def transform_text_analysis(data: dict, company: dict) -> dict:
    out = copy.deepcopy(data)
    new_depts = company["departments"]
    name = company["name"]

    # Scale total comments
    original_total = out.get("total_comments", 812)
    emp = company["employees"]
    new_total = scale_count(original_total, 200, emp)
    out["total_comments"] = new_total

    # Transform comments
    comments = out.get("comments", [])
    # Keep a subset proportional to company size
    if len(comments) > new_total:
        comments = comments[:new_total]
    elif len(comments) < new_total:
        # Duplicate some comments to fill
        while len(comments) < new_total:
            c = copy.deepcopy(random.choice(out["comments"]))
            c["id"] = f"comment_{len(comments)+1}"
            comments.append(c)

    for comment in comments:
        comment["department"] = pick_dept(new_depts)
        comment["text"] = replace_company_name(comment.get("text", ""), name)

    out["comments"] = comments

    # Update word frequencies
    for wf in out.get("word_frequencies", []):
        wf["count"] = scale_count(wf["count"], original_total, new_total)

    # Update themes
    for theme in out.get("themes", []):
        theme["count"] = scale_count(theme.get("count", 50), original_total, new_total)

    # Update sentiment summary
    ss = out.get("sentiment_summary", {})
    for k in ["positive", "neutral", "negative"]:
        if k in ss:
            ss[k] = scale_count(ss[k], original_total, new_total)
    ss["total"] = new_total

    return out


# ============================================================
# predictions_data.json
# ============================================================
def transform_predictions(data: dict, company: dict) -> dict:
    out = copy.deepcopy(data)
    emp = company["employees"]
    offset = company["score_offset"]

    out["total_respondents"] = emp
    out["data_source"] = f"Generated data for {company['name']}"

    # Rotation risk
    rr = out.get("rotation_risk", {})
    rr["overall_index"] = round(clamp_pct(rr.get("overall_index", 25) - offset * 20 + random.uniform(-5, 5)), 1)
    for area in rr.get("high_risk_areas", []):
        area["department"] = pick_dept(company["departments"])
        area["risk_score"] = round(clamp_pct(area.get("risk_score", 50) + random.uniform(-10, 10)), 1)

    # Projections
    proj = out.get("projections", {})
    overall = proj.get("overall", {})
    for point in overall.get("historical", []):
        point["score"] = round(clamp(point["score"] + jitter(offset, 0.1)), 2)
    for point in overall.get("forecast", []):
        j = jitter(offset, 0.1)
        point["expected"] = round(clamp(point["expected"] + j), 2)
        point["optimistic"] = round(clamp(point["optimistic"] + j), 2)
        point["pessimistic"] = round(clamp(point["pessimistic"] + j), 2)

    by_dim = proj.get("by_dimension", [])
    if isinstance(by_dim, list):
        for dim_data in by_dim:
            j = jitter(offset, 0.1)
            dim_data["current_score"] = round(clamp(dim_data.get("current_score", 4.0) + j), 2)
            dim_data["projected_6m"] = round(clamp(dim_data.get("projected_6m", 4.0) + j), 2)
            dim_data["projected_12m"] = round(clamp(dim_data.get("projected_12m", 4.0) + j), 2)
    elif isinstance(by_dim, dict):
        for dim_key, dim_data in by_dim.items():
            for point in dim_data.get("historical", []):
                point["score"] = round(clamp(point["score"] + jitter(offset, 0.1)), 2)
            for point in dim_data.get("forecast", []):
                j = jitter(offset, 0.1)
                point["expected"] = round(clamp(point["expected"] + j), 2)
                point["optimistic"] = round(clamp(point["optimistic"] + j), 2)
                point["pessimistic"] = round(clamp(point["pessimistic"] + j), 2)

    # Add early_alerts and summary if not present
    if "early_alerts" not in out:
        out["early_alerts"] = _generate_early_alerts(company)
    else:
        for alert in out["early_alerts"]:
            alert["area"] = pick_dept(company["departments"])

    if "summary" not in out:
        out["summary"] = {
            "total_alerts": len(out.get("early_alerts", [])),
            "new_alerts": random.randint(1, 4),
            "high_severity_alerts": random.randint(0, 2),
            "risk_index": rr.get("overall_index", 25),
        }

    return out


def _generate_early_alerts(company: dict) -> list:
    dimensions = [
        ("balance_vida_trabajo", "Balance Vida-Trabajo"),
        ("compensacion", "Compensación y Beneficios"),
        ("desarrollo", "Desarrollo Profesional"),
        ("liderazgo", "Liderazgo"),
        ("comunicacion", "Comunicación"),
    ]
    alerts = []
    for code, name in random.sample(dimensions, k=random.randint(2, 4)):
        alerts.append({
            "id": f"alert_{code}",
            "dimension": code,
            "dimension_name": name,
            "area": pick_dept(company["departments"]),
            "severity": random.choice(["high", "medium", "low"]),
            "change": round(random.uniform(-0.5, -0.1), 2),
            "months_declining": random.randint(2, 6),
            "current_score": round(random.uniform(3.0, 4.0), 2),
            "previous_score": round(random.uniform(3.5, 4.5), 2),
            "description": f"{name} muestra deterioro continuo",
        })
    return alerts


# ============================================================
# correlations_data.json
# ============================================================
def transform_correlations(data: dict, company: dict) -> dict:
    out = copy.deepcopy(data)
    offset = company["score_offset"]
    emp = company["employees"]

    out["total_respondents"] = emp
    out["data_source"] = f"Generated data for {company['name']}"

    # Adjust scatter data scores
    scatter = out.get("scatter_data", {})
    for dim_scores in scatter.get("dimension_scores", []):
        dim_scores["scores"] = [
            round(clamp(s + jitter(offset, 0.1)), 2)
            for s in dim_scores.get("scores", [])
        ]

    # Adjust business indicators monthly data
    bi = out.get("business_indicators", {})
    for month_data in bi.get("monthly_data", []):
        month_data["rotation"] = round(month_data.get("rotation", 5) + random.uniform(-2, 2), 1)
        month_data["absenteeism"] = round(month_data.get("absenteeism", 3) + random.uniform(-1, 1), 1)
        month_data["productivity"] = round(clamp_pct(month_data.get("productivity", 80) + random.uniform(-5, 5)), 1)
        month_data["nps"] = round(clamp(month_data.get("nps", 40) + random.uniform(-10, 10), -100, 100), 1)

    # Adjust engagement drivers
    for driver in out.get("engagement_drivers", []):
        driver["impact"] = round(clamp(driver.get("impact", 0.5) + random.uniform(-0.1, 0.1), 0, 1), 3)

    return out


# ============================================================
# clustering_data.json
# ============================================================
def transform_clustering(data: dict, company: dict) -> dict:
    out = copy.deepcopy(data)
    new_depts = company["departments"]
    emp = company["employees"]
    name = company["name"]

    # Update nodes
    for node in out.get("nodes", []):
        if node.get("type") == "participant":
            node["department"] = slugify(pick_dept(new_depts))
            node["department_name"] = map_department(node.get("department_name", ""), new_depts)

    # Update clusters
    for cluster in out.get("clusters", []):
        if "departments" in cluster:
            cluster["departments"] = random.sample(new_depts, min(len(new_depts), len(cluster["departments"])))
        cluster["size"] = scale_count(cluster.get("size", 20), 189, emp)

    # Update filters
    filters = out.get("filters", {})
    if "departments" in filters:
        filters["departments"] = [{"id": slugify(d), "name": d} for d in new_depts]

    # Update metrics
    metrics = out.get("metrics", {})
    metrics["total_participants"] = emp
    for dist in metrics.get("department_distribution", []):
        dist["department"] = pick_dept(new_depts)
        dist["count"] = scale_count(dist.get("count", 10), 189, emp)

    return out


# ============================================================
# recognition_data.json
# ============================================================
def transform_recognition(data: dict, company: dict) -> dict:
    out = copy.deepcopy(data)
    new_depts = company["departments"]
    emp = company["employees"]
    offset = company["score_offset"]
    name = company["name"]

    # Rankings - rebuild with new departments
    new_rankings = []
    medals = ["gold", "silver", "bronze"] + ["none"] * (len(new_depts) - 3)
    for i, dept in enumerate(new_depts):
        template = out["rankings"][i % len(out["rankings"])] if out.get("rankings") else {}
        ranking = copy.deepcopy(template)
        ranking["id"] = slugify(dept)
        ranking["area"] = dept
        ranking["medal"] = medals[i] if i < len(medals) else "none"
        ranking["rank"] = i + 1
        ranking["score"] = round(clamp(ranking.get("score", 80) + jitter(offset * 10, 5), 0, 100), 1)
        ranking["respondent_count"] = max(5, emp // len(new_depts) + random.randint(-5, 5))
        new_rankings.append(ranking)
    new_rankings.sort(key=lambda x: x["score"], reverse=True)
    for i, r in enumerate(new_rankings):
        r["rank"] = i + 1
        r["medal"] = ["gold", "silver", "bronze"][i] if i < 3 else "none"
    out["rankings"] = new_rankings

    # Podium
    out["podium"] = new_rankings[:3]

    # Area of month
    aom = out.get("area_of_month", {})
    best = new_rankings[0]
    aom["area"] = best["area"]
    aom["score"] = best["score"]

    # Goals
    for goal in out.get("goals_progress", []):
        goal["current"] = round(clamp_pct(goal.get("current", 70) + jitter(offset * 10, 5)), 1)

    # Achievements
    for ach in out.get("achievements", []):
        ach["area"] = pick_dept(new_depts)
        ach["description"] = replace_company_name(ach.get("description", ""), name)

    # Summary
    summary = out.get("summary", {})
    summary["total_areas"] = len(new_depts)
    summary["total_respondents"] = emp

    return out


# ============================================================
# unified_analysis.json
# ============================================================
def transform_unified_analysis(data: dict, company: dict) -> dict:
    out = copy.deepcopy(data)
    offset = company["score_offset"]
    name = company["name"]

    # Keyword analysis - replace company name in keywords
    for year_key, year_data in out.get("keyword_analysis", {}).items():
        for question_key, question_data in year_data.items():
            for kw in question_data.get("keywords", []):
                kw["word"] = replace_company_name(kw.get("word", ""), name)
                kw["count"] = max(1, kw["count"] + random.randint(-5, 5))

    # Historical trends
    trends = out.get("historical_trends", {})
    for point in trends.get("global_engagement", []):
        j = jitter(offset, 0.1)
        if "engagement_score" in point:
            point["engagement_score"] = round(clamp(point["engagement_score"] + j), 2)
        if "score" in point:
            point["score"] = round(clamp(point["score"] + j), 2)
        point["engagement_pct"] = round(clamp_pct(point.get("engagement_pct", 85) + jitter(offset * 10, 3)), 1)

    for dim_code, dim_data in trends.get("by_dimension", {}).items():
        for point in dim_data.get("data", []):
            point["score"] = round(clamp(point["score"] + jitter(offset, 0.1)), 2)

    # Year comparison
    for dim in out.get("year_comparison", []):
        for key in ["score_2023", "score_2024", "score_2025", "score_2026"]:
            if key in dim:
                dim[key] = round(clamp(dim[key] + jitter(offset, 0.1)), 2)

    return out


# ============================================================
# Main
# ============================================================
TRANSFORMS = {
    "clima_v2_data.json": transform_clima_v2,
    "clima_demographics.json": transform_demographics,
    "segmentation_data.json": transform_segmentation,
    "text_analysis_data.json": transform_text_analysis,
    "predictions_data.json": transform_predictions,
    "correlations_data.json": transform_correlations,
    "clustering_data.json": transform_clustering,
    "recognition_data.json": transform_recognition,
    "unified_analysis.json": transform_unified_analysis,
}


def main():
    # Load original data
    originals = {}
    for filename in TRANSFORMS:
        filepath = BASE_DIR / filename
        with open(filepath, "r", encoding="utf-8") as f:
            originals[filename] = json.load(f)
        print(f"Loaded {filename}")

    # Generate for each company
    for company_id, company_info in COMPANIES.items():
        company_dir = BASE_DIR / company_id
        company_dir.mkdir(parents=True, exist_ok=True)

        for filename, transform_fn in TRANSFORMS.items():
            random.seed(hash(company_id + filename) % (2**32))
            data = transform_fn(originals[filename], company_info)

            output_path = company_dir / filename
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"Generated {len(TRANSFORMS)} files for {company_info['name']} -> {company_dir}")

    print(f"\nDone! Generated {len(COMPANIES) * len(TRANSFORMS)} total files.")


if __name__ == "__main__":
    main()
