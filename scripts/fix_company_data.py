#!/usr/bin/env python3
"""
Fix company data JSON files by replacing all Towerbank references
(including Tower Securities, Gente Tower, and all case variants)
with the appropriate company name for each company directory.
"""

import json
import os
import re

BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "data")

# Company configuration
COMPANIES = {
    "novatech": {
        "full_name": "NovaTech Solutions",
        "short_name": "NovaTech",
        "lowercase": "novatech",
    },
    "meridian": {
        "full_name": "Meridian Stores",
        "short_name": "Meridian",
        "lowercase": "meridian",
    },
    "atlas": {
        "full_name": "Atlas Capital Group",
        "short_name": "Atlas Capital",
        "lowercase": "atlas",
    },
    "vitacore": {
        "full_name": "VitaCore Health",
        "short_name": "VitaCore",
        "lowercase": "vitacore",
    },
}

JSON_FILES = [
    "clima_demographics.json",
    "clima_v2_data.json",
    "clustering_data.json",
    "correlations_data.json",
    "predictions_data.json",
    "recognition_data.json",
    "segmentation_data.json",
    "text_analysis_data.json",
    "unified_analysis.json",
]

# Master regex that catches ALL tower-related references
ALL_TOWER_PATTERN = re.compile(r'[Tt]ower\s*[Bb]ank|[Tt]ower\s+[Ss]ecurities|[Gg]ente\s+[Tt]ower', re.IGNORECASE)


def replace_tower_references(content: str, company: dict) -> str:
    """
    Replace ALL Tower-related references in the content string.
    Order matters: do longer/more specific patterns first to avoid partial replacements.
    """
    full_name = company["full_name"]
    short_name = company["short_name"]
    lowercase = company["lowercase"]

    # --- "Tower Securities" -> company short name ---
    content = content.replace("Tower Securities", short_name)
    content = content.replace("tower securities", lowercase)
    content = content.replace("TOWER SECURITIES", short_name.upper())

    # --- "Gente Tower y Administración" -> "Gestión de Personas" (realistic HR dept name) ---
    content = content.replace("Gente Tower y Administración", "Gestión de Personas")
    content = content.replace("Gente Tower y Administracion", "Gestión de Personas")
    content = content.replace("gente tower y administración", "gestión de personas")
    content = content.replace("gente tower y administracion", "gestión de personas")

    # --- "Gente Tower" (standalone, without "y Administración") -> "Gestión de Personas" ---
    content = content.replace("Gente Tower", "Gestión de Personas")
    content = content.replace("gente tower", "gestión de personas")
    content = content.replace("GENTE TOWER", "GESTIÓN DE PERSONAS")

    # --- "Towerbank" (one word) ---
    content = content.replace("Towerbank", short_name)
    content = content.replace("towerbank", lowercase)
    content = content.replace("TOWERBANK", short_name.upper())

    # --- "Tower Bank" (two words) ---
    content = content.replace("Tower Bank", short_name)
    content = content.replace("Tower bank", short_name)
    content = content.replace("tower bank", lowercase)
    content = content.replace("TOWER BANK", short_name.upper())

    # --- Catch any remaining case variations with regex ---
    def towerbank_replacer(match):
        original = match.group(0)
        if original == original.lower():
            return lowercase
        if original == original.upper():
            return short_name.upper()
        return short_name

    content = re.sub(r'[Tt]ower\s*[Bb]ank', towerbank_replacer, content)

    def tower_securities_replacer(match):
        original = match.group(0)
        if original == original.lower():
            return lowercase
        if original == original.upper():
            return short_name.upper()
        return short_name

    content = re.sub(r'[Tt]ower\s+[Ss]ecurities', tower_securities_replacer, content)

    def gente_tower_replacer(match):
        original = match.group(0)
        if original == original.lower():
            return "gestión de personas"
        if original == original.upper():
            return "GESTIÓN DE PERSONAS"
        return "Gestión de Personas"

    content = re.sub(r'[Gg]ente\s+[Tt]ower', gente_tower_replacer, content)

    return content


def process_company(company_dir: str, company: dict) -> int:
    """Process all JSON files for a single company. Returns total replacements made."""
    total_replacements = 0
    company_path = os.path.join(BASE_DIR, company_dir)

    if not os.path.isdir(company_path):
        print(f"  WARNING: Directory not found: {company_path}")
        return 0

    for json_file in JSON_FILES:
        file_path = os.path.join(company_path, json_file)

        if not os.path.isfile(file_path):
            print(f"  WARNING: File not found: {file_path}")
            continue

        # Read file
        with open(file_path, "r", encoding="utf-8") as f:
            original_content = f.read()

        # Count ALL tower-related occurrences before replacement
        count_before = len(ALL_TOWER_PATTERN.findall(original_content))

        if count_before == 0:
            print(f"  {json_file}: No Tower references found (skipped)")
            continue

        # Do replacements on the string
        new_content = replace_tower_references(original_content, company)

        # Validate JSON
        try:
            parsed = json.loads(new_content)
        except json.JSONDecodeError as e:
            print(f"  ERROR: {json_file} - Invalid JSON after replacement: {e}")
            continue

        # Write back with proper formatting
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(parsed, f, indent=2, ensure_ascii=False)
            f.write("\n")  # trailing newline

        # Verify no remaining references
        with open(file_path, "r", encoding="utf-8") as f:
            verify_content = f.read()

        remaining = len(ALL_TOWER_PATTERN.findall(verify_content))

        total_replacements += count_before
        status = "OK" if remaining == 0 else f"WARNING: {remaining} remaining"
        print(f"  {json_file}: {count_before} replacements made [{status}]")

    return total_replacements


def main():
    print("=" * 60)
    print("Fixing ALL Tower references in company data JSON files")
    print("=" * 60)

    grand_total = 0

    for company_dir, company_info in COMPANIES.items():
        print(f"\nProcessing: {company_dir} -> {company_info['short_name']}")
        print("-" * 40)
        count = process_company(company_dir, company_info)
        grand_total += count
        print(f"  Subtotal: {count} replacements")

    print("\n" + "=" * 60)
    print(f"TOTAL: {grand_total} replacements across all companies")
    print("=" * 60)

    # Final verification across all files
    print("\nFinal verification - searching for any remaining 'tower' references...")
    remaining_total = 0
    tower_pattern = re.compile(r'tower', re.IGNORECASE)

    for company_dir in COMPANIES:
        company_path = os.path.join(BASE_DIR, company_dir)
        for json_file in JSON_FILES:
            file_path = os.path.join(company_path, json_file)
            if os.path.isfile(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                matches = tower_pattern.findall(content)
                if matches:
                    remaining_total += len(matches)
                    print(f"  REMAINING: {file_path} has {len(matches)} 'tower' references")

    if remaining_total == 0:
        print("  All Tower references have been successfully removed!")
    else:
        print(f"  WARNING: {remaining_total} 'tower' references still remaining!")


if __name__ == "__main__":
    main()
