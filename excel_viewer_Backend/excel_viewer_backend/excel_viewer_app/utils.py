import json

import base64


def parse_sheet_data(sheet):
    """
    Returns structured sheet data with rows and injected images.
    """
    # Get all rows
    entries = sheet.entries.all().order_by("id")  # each entry is a full row (JSONField)

    sheet_data = []
    for entry in entries:
        row_data = entry.row_data  # already list of dicts (cells)
        sheet_data.append(row_data)

    # Inject images
    for img in sheet.images.all():
        try:
            if img.row is not None and img.column is not None:
                # Ensure row exists
                while len(sheet_data) <= img.row:
                    sheet_data.append([])

                # Ensure column exists in this row
                row = sheet_data[img.row]
                while len(row) <= img.column:
                    row.append({"value": None})

                # Convert file to base64 for frontend
                with open(img.image.path, "rb") as f:
                    img_base64 = base64.b64encode(f.read()).decode("utf-8")

                sheet_data[img.row][img.column]["image"] = img_base64

        except Exception as e:
            print(
                f"⚠️ Failed to inject image {img.id} at ({img.row}, {img.column}): {e}"
            )

    return {
        "id": sheet.id,
        "name": sheet.name,
        "rows": sheet_data,
        "merged_cells": sheet.merged_cells,
        "column_widths": sheet.column_widths,
        "row_heights": sheet.row_heights,
    }


def filter_mapping_rows_by_claim(sheet_data, claim_id):
    """
    Filter rows in a Mapping sheet where given claim_id column has 'P' or checkbox=True.
    """
    if not sheet_data or "rows" not in sheet_data:
        return []

    rows = sheet_data["rows"]
    if not rows:
        return []

    # First row is header (columns)
    header_row = rows[0]

    # Find column index of the claim_id
    column_index = None
    for idx, col in enumerate(header_row):
        if (
            isinstance(col, dict)
            and str(col.get("value", "")).strip().lower() == claim_id.lower()
        ):
            column_index = idx
            break

    if column_index is None:
        return []  # claim_id column not found

    # Collect only those rows where that column has mapping
    filtered_rows = []
    for row in rows[1:]:  # skip header
        if column_index < len(row):
            cell = row[column_index]
            value = cell.get("value", "")
            if (isinstance(value, str) and value.strip().upper() == "P") or cell.get(
                "checkbox"
            ) is True:
                filtered_rows.append(row)

    return filtered_rows
