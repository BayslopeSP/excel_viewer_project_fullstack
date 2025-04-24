
import datetime
import openpyxl
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ExcelFile, Sheet, SheetEntry
from django.shortcuts import get_object_or_404
from .utils import parse_sheet_data, filter_mapping_rows_by_claim


# Helper function to process Excel cell values and formatting
def safe_cell_value(cell):
    value = cell.value
    if isinstance(value, (datetime.datetime, datetime.date)):
        value = value.strftime('%Y-%m-%d')

    return {
        "value": value,
        "font_color": cell.font.color.rgb if cell.font.color and cell.font.color.type == "rgb" else None,
        "fill_color": cell.fill.fgColor.rgb if cell.fill and cell.fill.fgColor.type == "rgb" else None,
        "hyperlink": cell.hyperlink.target if cell.hyperlink else None,
        "bold": cell.font.bold,
        "italic": cell.font.italic,
        "alignment": {
            "horizontal": cell.alignment.horizontal,
            "vertical": cell.alignment.vertical
        },
        "is_merged": cell.coordinate in cell.parent.merged_cells,
        "checkbox": str(value).strip() in ['✓', '☑']
    }

class ExcelUploadView(APIView):
    def post(self, request):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "No file provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            wb = openpyxl.load_workbook(file_obj, data_only=False)
        except Exception as e:
            return Response({"error": f"Invalid Excel file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        excel_file = ExcelFile.objects.create(file_name=file_obj.name)
        response_data = {"excel_file_id": excel_file.id, "sheets": []}

        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            sheet = Sheet.objects.create(name=sheet_name, excel_file=excel_file)

            rows = []
            for row in ws.iter_rows():
                row_data = [safe_cell_value(cell) for cell in row]
                rows.append(row_data)

            SheetEntry.objects.create(sheet=sheet, row_data=rows)

            merged_cells = [str(merge) for merge in ws.merged_cells.ranges]
            column_widths = {
                col_letter: ws.column_dimensions[col_letter].width
                for col_letter in ws.column_dimensions
            }
            row_heights = {
                row_num: ws.row_dimensions[row_num].height
                for row_num in ws.row_dimensions
            }

            images = []
            for img in ws._images:
                image_info = {
                    "type": "image",
                    "name": getattr(img, "path", "embedded"),
                    "anchor": str(getattr(img.anchor, "_from", getattr(img.anchor, "cell", "unknown")))
                }
                images.append(image_info)

            response_data["sheets"].append({
                "id": sheet.id,
                "name": sheet.name,
                "columns": rows[0] if rows else [],
                "rows": rows[1:] if rows else [],
                "merged_cells": merged_cells,
                "column_widths": column_widths,
                "row_heights": row_heights,
                "images": images
            })

        return Response(response_data, status=status.HTTP_200_OK)

# GET all Excel files and their sheets
class SheetListView(APIView):
    def get(self, request):
        all_data = []
        excel_file_data = {}

        sheets = Sheet.objects.all()

        for sheet in sheets:
            excel_file = sheet.excel_file
            if excel_file.id not in excel_file_data:
                excel_file_data[excel_file.id] = {
                    "id": excel_file.id,
                    "file_name": excel_file.file_name,
                    "sheets": []
                }

            sheet_index = len(excel_file_data[excel_file.id]["sheets"]) + 1
            entries = SheetEntry.objects.filter(sheet=sheet)

            sheet_data = {
                "id": sheet_index,
                "name": sheet.name,
                "columns": [],
                "rows": []
            }

            if entries.exists():
                for entry in entries:
                    rows = entry.row_data or []
                    sheet_data["columns"] = rows[0] if rows else []
                    sheet_data["rows"] = [
                        [{"value": val} for val in row] for row in rows[1:]
                    ]

            excel_file_data[excel_file.id]["sheets"].append(sheet_data)

        response_data = []
        for file_id, data in excel_file_data.items():
            file_data = data
            file_data["sheets"] = sorted(file_data["sheets"], key=lambda x: x["id"])
            response_data.append(file_data)

        return Response(response_data, status=status.HTTP_200_OK)

# GET single Excel file and its sheets
class SpecificSheetView(APIView):
    def get(self, request, file_id):
        try:
            excel_file = ExcelFile.objects.get(id=file_id)
        except ExcelFile.DoesNotExist:
            return Response({"error": "Excel file not found"}, status=status.HTTP_404_NOT_FOUND)

        file_data = {
            "id": excel_file.id,
            "file_name": excel_file.file_name,
            "sheets": []
        }

        sheets = Sheet.objects.filter(excel_file=excel_file)

        for sheet in sheets:
            entries = SheetEntry.objects.filter(sheet=sheet)
            sheet_data = {
                "id": sheet.id,
                "name": sheet.name,
                "columns": [],
                "rows": [],
                "images": [],
                "merged_cells": [],
                "column_widths": {},
                "row_heights": {}
            }

            if entries.exists():
                for entry in entries:
                    rows = entry.row_data or []
                    if rows:
                        sheet_data["columns"] = rows[0]
                        sheet_data["rows"] = rows[1:]

            file_data["sheets"].append(sheet_data)

        return Response(file_data, status=status.HTTP_200_OK)

# DELETE Excel file and all linked sheets/data
class DeleteExcelFileView(APIView):
    def delete(self, request, file_id):
        try:
            excel_file = ExcelFile.objects.get(id=file_id)
            excel_file.delete()
            return Response({"message": "Excel file and all related data deleted successfully."}, status=status.HTTP_200_OK)
        except ExcelFile.DoesNotExist:
            return Response({"error": "Excel file not found."}, status=status.HTTP_404_NOT_FOUND)

# Simple sheet name update view (can expand later)
class UpdateSheetView(APIView):
    def put(self, request, sheet_id):
        try:
            sheet = Sheet.objects.get(id=sheet_id)
            sheet.name = request.data.get("name", sheet.name)
            sheet.save()
            return Response({"message": "Sheet updated successfully."}, status=status.HTTP_200_OK)
        except Sheet.DoesNotExist:
            return Response({"error": "Sheet not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

from django.http import JsonResponse
from .utils import parse_sheet_data

def filter_mapping_by_claim(request, file_id, claim_id):
    # Get the Excel file
    excel_file = get_object_or_404(ExcelFile, id=file_id)

    # Find the mapping sheet (assuming name is fixed)
    mapping_sheet = excel_file.sheets.filter(name__icontains='mapping').first()
    if not mapping_sheet:
        return JsonResponse({'error': 'Mapping sheet not found'}, status=404)

    # Load parsed rows (assuming you store structured JSON in `data`)
    sheet_data = parse_sheet_data(mapping_sheet)  # You might already have this function

    # Filter rows where the column with value == claim_id has 'P'
    filtered_rows = []
    columns = [col.get('value') for col in sheet_data['columns']]

    if claim_id not in columns:
        return JsonResponse({'error': f'Claim ID "{claim_id}" not found in columns'}, status=404)

    col_index = columns.index(claim_id)

    for row in sheet_data['rows']:
        cell = row[col_index]
        if cell and str(cell.get('value')).strip().upper() == 'P':
            filtered_rows.append(row)

    return JsonResponse({
        'claim_id': claim_id,
        'columns': sheet_data['columns'],
        'rows': filtered_rows,
    })
