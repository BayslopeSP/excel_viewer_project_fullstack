import json

def parse_sheet_data(sheet):
    from .models import SheetEntry

    # Fetch all SheetEntry records for this sheet
    entries = SheetEntry.objects.filter(sheet=sheet).order_by('row_index', 'col_index')

    # Build a 2D array (list of rows, each a list of cells)
    sheet_data = []
    current_row = -1
    row_data = []

    for entry in entries:
        if entry.row_index != current_row:
            if row_data:
                sheet_data.append(row_data)
            row_data = []
            current_row = entry.row_index

        row_data.append({
            "value": entry.value,
            "checkbox": entry.checkbox,
            "hyperlink": entry.hyperlink,
            "bold": entry.bold,
            "italic": entry.italic,
            "alignment": entry.alignment,
            "fill_color": entry.fill_color,
            "font_color": entry.font_color,
            "is_merged": entry.is_merged,
        })

    # Add the last row
    if row_data:
        sheet_data.append(row_data)

    return sheet_data



def filter_mapping_rows_by_claim(sheet_data, claim_id):
    """
    Filters rows from a 'Mapping' sheet where the given claim_id column has a 'P' or checkbox=True.

    Args:
        sheet_data: Dict with keys 'columns' (list of cell dicts) and 'rows' (2D array of cell dicts)
        claim_id: e.g., '9a', '5b', etc.

    Returns:
        Filtered list of rows (as-is from the sheet_data['rows']) where claim_id column contains mapping
    """
    if not sheet_data:
        return []

    columns = sheet_data.get('columns', [])
    rows = sheet_data.get('rows', [])

    # Find index of the column with value == claim_id (case-insensitive match)
    column_index = None
    for idx, col in enumerate(columns):
        if isinstance(col, dict) and col.get('value', '').strip().lower() == claim_id.lower():
            column_index = idx
            break

    if column_index is None:
        return []  # Claim ID not found

    # Filter rows where that column has 'P' or checkbox=True
    filtered_rows = []
    for row in rows:
        if column_index < len(row):
            cell = row[column_index]
            value = cell.get('value', '')
            if (isinstance(value, str) and value.strip().upper() == 'P') or cell.get('checkbox') is True:
                filtered_rows.append(row)

    return filtered_rows
