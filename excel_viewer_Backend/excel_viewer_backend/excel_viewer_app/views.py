import datetime
import openpyxl
from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.files import File
from rest_framework import status
from .models import ExcelFile, Sheet, SheetEntry, Image
from django.shortcuts import get_object_or_404
from django.core.files.temp import NamedTemporaryFile
from .utils import parse_sheet_data, filter_mapping_rows_by_claim
from io import BytesIO
import base64
import os
from django.conf import settings
import uuid
from openpyxl.drawing.image import Image as OpenpyxlImage
from PIL import Image as PILImage
from django.http import JsonResponse
# from PIL import Image as PILImage
# from io import BytesIO
import os
import uuid
from django.core.files import File
from django.conf import settings
from openpyxl.drawing.image import Image as OpenpyxlImage
# Helper function to save image to disk
from PIL import Image as PILImage
from io import BytesIO
import os
import uuid
from django.core.files import File
from django.conf import settings

# Helper function to save image to disk
def save_image_to_disk(img: OpenpyxlImage):
    try:
        # Create a directory for images if it doesn't exist
        image_dir = os.path.join(settings.MEDIA_ROOT, 'images')
        os.makedirs(image_dir, exist_ok=True)

        # Generate a unique filename for the image using UUID
        image_filename = f"{uuid.uuid4()}.png"
        image_path = os.path.join(image_dir, image_filename)

        # Get image data
        image_stream = img._data()  # This returns a bytes object

        if not image_stream:
            print("No image data found.")
            return None

        # Open the image using PIL
        pil_image = PILImage.open(BytesIO(image_stream))

        # Save image to disk
        pil_image.save(image_path, format="PNG")

        # Save to DB
        image_instance = Image.objects.create(
            image=File(open(image_path, 'rb'), name=image_filename)
        )

        return image_instance
    except Exception as e:
        print(f"Error saving image: {e}")
        return None




def safe_cell_value(cell, sheet_name):
    value = cell.value
    if isinstance(value, (datetime.datetime, datetime.date)):
        value = value.strftime('%Y-%m-%d')

    hyperlink = cell.hyperlink.target if cell.hyperlink else None
    target_sheet = None
    target_column = None

    # If there's a hyperlink, extract target sheet and column info (assuming format like 'Sheet2!A1')
    if hyperlink:
        link_parts = hyperlink.split("!")
        if len(link_parts) == 2:
            target_sheet = link_parts[0]
            target_column = link_parts[1]

    return {
        "value": value,
        "font_color": cell.font.color.rgb if cell.font.color and cell.font.color.type == "rgb" else None,
        "fill_color": cell.fill.fgColor.rgb if cell.fill and cell.fill.fgColor.type == "rgb" else None,
        "hyperlink": hyperlink,
        "target_sheet": target_sheet,
        "target_column": target_column,
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
            sheet = Sheet.objects.create(
                name=sheet_name, 
                excel_file=excel_file,
                merged_cells=[str(merge) for merge in ws.merged_cells.ranges],
                column_widths={ 
                    col_letter: ws.column_dimensions[col_letter].width 
                    for col_letter in ws.column_dimensions
                },
                row_heights={ 
                    row_num: ws.row_dimensions[row_num].height 
                    for row_num in ws.row_dimensions
                },
            )

            rows = []
            for row in ws.iter_rows():
                row_data = [safe_cell_value(cell, sheet_name) for cell in row]
                rows.append(row_data)

            # Creating SheetEntry for storing row data
            SheetEntry.objects.create(sheet=sheet, row_data=rows)

            # Process images from the Excel sheet and save them
            images = [
                 {
        "url": image.image.url,
        "row": image.row,
        "column": image.column
    }
    for image in sheet.images.all()
            ]
            for img in ws._images:
                image_instance = save_image_to_disk(img)
                if image_instance:
        # Extract image anchor (cell location)
                    anchor = img.anchor._from  # only works for openpyxl images
                    row = anchor.row  # 0-based index
                    col = anchor.col  # 0-based index

                    image_instance.row = row
                    image_instance.column = col
                    image_instance.save()

                    images.append(image_instance)

            # Now add the image instances to the ManyToManyField
            sheet.images.set(images)
            sheet.save()

            response_data["sheets"].append({
                "id": sheet.id,
                "name": sheet.name,
                "columns": rows[0] if rows else [],
                "rows": rows[1:] if rows else [],
                "merged_cells": sheet.merged_cells,
                "column_widths": sheet.column_widths,
                "row_heights": sheet.row_heights,
                "images": [image.image.url for image in images]  # Return the image URLs
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
                "rows": [],
                "images": [image.image.url for image in sheet.images.all()],  # <-- ADD THIS

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
                "images": [image.image.url for image in sheet.images.all()],  # <-- ADD THIS
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

# Update the sheet (if necessary)
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


def filter_mapping_by_claim(request, file_id, claim_id):
    # Get the Excel file using file_id
    excel_file = get_object_or_404(ExcelFile, id=file_id)

    # Find the mapping sheet (assuming name is fixed)
    mapping_sheet = excel_file.sheets.filter(name__icontains='mapping').first()
    if not mapping_sheet:
        return JsonResponse({'error': 'Mapping sheet not found'}, status=404)

    # Parse rows from the mapping sheet
    rows = parse_sheet_data(mapping_sheet)

    # Filter rows using your custom logic for claim_id
    filtered_rows = filter_mapping_rows_by_claim(rows, claim_id)

    # Extract image metadata for the filtered mapping sheet rows
    images = [
        {
            "url": image.image.url,
            "row": image.row,
            "column": image.column
        }
        for image in mapping_sheet.images.all()
    ]

    # Return the filtered rows along with the image metadata
    return JsonResponse({
        "sheet_name": mapping_sheet.name,
        "rows": filtered_rows,
        "images": images
    })