from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.models import User
from .models import ClientFile, ExcelFile
from .models import Sheet
import os
import openpyxl
from .views import safe_cell_value,save_image_to_disk
from .models import ExcelFile, Sheet, SheetEntry, Image
from rest_framework.permissions import AllowAny

from .models import ClientFile, ExcelFile, Sheet, SheetEntry, Image

# import pdfplumber
# import re


import pdfplumber

def extract_pdf_full(pdf_path):
    extracted = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            # Extract all tables from this page
            tables = page.extract_tables()
            # Extract all text lines from this page
            text = page.extract_text()
            lines = text.split('\n') if text else []

            # Merge tables and text in order (line by line)
            # pdfplumber does not give table position, so we add all text first, then all tables
            for line in lines:
                extracted.append(line)
            for table in tables:
                extracted.append({"table": table})
    return extracted

class PdfFullExtractView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, file_id):
        try:
            excel_file = ExcelFile.objects.get(id=file_id)
        except ExcelFile.DoesNotExist:
            return Response({"error": "PDF not found"}, status=404)

        pdf_path = excel_file.file.path
        full_data = extract_pdf_full(pdf_path)
        return Response(full_data)

import pdfplumber
import re

def extract_pdf_tabs(pdf_path):
    tabs = []
    current_tab = None
    intro_content = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            tables = page.extract_tables()
            print("Page tables:", tables)
            text = page.extract_text()
            if not text:
                continue
            lines = text.split('\n')
            
            table_idx = 0
            for line in lines:
                # Heading detection
                if (
                    re.match(r'^\d+\.\d+ ', line.strip()) or
                    'disclaimer' in line.strip().lower() or
                    'central references' in line.strip().lower() or
                    'feature matrix' in line.strip().lower()
                ):
                    heading = line.strip()
                    if (
                        heading.lower().startswith('intro') or
                        'feature matrix' in heading.lower() or
                        'central references' in heading.lower() or
                        'disclaimer' in heading.lower()
                    ):
                        if current_tab is None and intro_content:
                            tabs.append({"heading": "INTRO", "content": intro_content})
                        current_tab = {"heading": heading, "content": []}
                        tabs.append(current_tab)
                        continue

                # Central References: Result detection
                if current_tab and "central references" in current_tab["heading"].lower():
                    if re.match(r'^\s*result\s+\d+', line.strip(), re.IGNORECASE):
                        current_tab["content"].append({"result_heading": line.strip(), "content": []})
                        continue
                    if current_tab["content"] and table_idx < len(tables):
                        last = current_tab["content"][-1]
                        if isinstance(last, dict) and "content" in last and not last.get("table_added"):
                            last["content"].append({"table": tables[table_idx]})
                            last["table_added"] = True
                            table_idx += 1
                            continue
                    if current_tab["content"]:
                        last = current_tab["content"][-1]
                        if isinstance(last, dict) and "content" in last:
                            last["content"].append(line)
                        else:
                            current_tab["content"].append(line)
                    else:
                        current_tab["content"].append(line)
                    continue

                # Feature Matrix: Table detection
                if current_tab and "feature matrix" in current_tab["heading"].lower():
                    if table_idx < len(tables):
                        current_tab["content"].append({"table": tables[table_idx]})
                        table_idx += 1
                        continue

                # Normal line append
                if current_tab:
                    current_tab["content"].append(line)
                else:
                    intro_content.append(line)

            # YAHAN TABLES KO ADD KARO (for table in tables ...)
            for table in tables:
                if current_tab and "feature matrix" in current_tab["heading"].lower():
                    current_tab["content"].append({"table": table})
                elif current_tab and "central references" in current_tab["heading"].lower():
                    current_tab["content"].append({"table": table})
                elif current_tab:
                    current_tab["content"].append({"table": table})
                elif intro_content is not None:
                    intro_content.append({"table": table})

    if intro_content and (not tabs or tabs[0]["heading"] != "INTRO"):
        tabs.insert(0, {"heading": "INTRO", "content": intro_content})

    return tabs


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import ExcelFile

class PdfTabsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, file_id):
        try:
            excel_file = ExcelFile.objects.get(id=file_id)
        except ExcelFile.DoesNotExist:
            return Response({"error": "PDF not found"}, status=404)

        pdf_path = excel_file.file.path
        tabs = extract_pdf_tabs(pdf_path)
        for tab in tabs:
            if "feature matrix" in tab["heading"].lower():
                print("Feature Matrix Tab Content:", tab["content"])
        return Response(excel_file.pdf_full or [])



class AdminFileUploadView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        user_id = request.data.get('user_id')
        file_obj = request.FILES.get('file')
        file_name = file_obj.name if file_obj else None

        if not user_id or not file_obj:
            return Response({'error': 'user_id and file are required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        filename = file_obj.name
        ext = os.path.splitext(filename)[1].lower()

        if ext in ['.xlsx', '.xls']:
            try:
                wb = openpyxl.load_workbook(file_obj, data_only=False)
            except Exception as e:
                return Response({"error": f"Invalid Excel file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

            # Reset file pointer for saving
            file_obj.seek(0)
            excel_file = ExcelFile.objects.create(file_name=filename, file=file_obj)
            client_file = ClientFile.objects.create(
                user=user,
                file=file_obj,
                file_name=filename,
                excel_file=excel_file
            )

            response_data = {"type": "excel", "excel_file_id": excel_file.id, "client_file_id": client_file.id, "sheets": []}

            for sheet_name in wb.sheetnames:
                ws = wb[sheet_name]
                sheet = Sheet.objects.create(
                    name=sheet_name,
                    excel_file=excel_file,
                    merged_cells=[str(merge) for merge in ws.merged_cells.ranges],
                    column_widths={col_letter: ws.column_dimensions[col_letter].width for col_letter in ws.column_dimensions},
                    row_heights={row_num: ws.row_dimensions[row_num].height for row_num in ws.row_dimensions},
                )

                rows = []
                for row in ws.iter_rows():
                    row_data = [safe_cell_value(cell, sheet_name) for cell in row]
                    rows.append(row_data)

                SheetEntry.objects.create(sheet=sheet, row_data=rows)

                # Images
                image_instances = []
                images_json = []
                for img in getattr(ws, '_images', []):
                    image_instance = save_image_to_disk(img)
                    if image_instance:
                        anchor = img.anchor._from
                        row = anchor.row
                        col = anchor.col
                        try:
                            cell = ws.cell(row=row + 1, column=col + 1)
                            cell_value = str(cell.value).strip() if cell.value else ''
                        except Exception as e:
                            cell_value = ''
                        image_instance.row = row
                        image_instance.column = col
                        image_instance.save()
                        image_instances.append(image_instance)
                        images_json.append({
                            "url": request.build_absolute_uri(f"/media/{image_instance.image.name}"),
                            "row": row + 1,
                            "column": col + 1,
                            "cell_value": cell_value,
                        })

                sheet.images.set(image_instances)
                sheet.save()

                response_data["sheets"].append({
                    "id": sheet.id,
                    "name": sheet.name,
                    "columns": rows[0] if rows else [],
                    "rows": rows[1:] if rows else [],
                    "merged_cells": sheet.merged_cells,
                    "column_widths": sheet.column_widths,
                    "row_heights": sheet.row_heights,
                    "images": images_json,
                })

            return Response(response_data, status=status.HTTP_201_CREATED)

        elif ext == '.pdf':
            # --- PDF Handling ---
            from PyPDF2 import PdfReader
            file_obj.seek(0)
            pdf_file = ExcelFile.objects.create(file_name=filename, file=file_obj)
            client_file = ClientFile.objects.create(
                user=user,
                file=file_obj,
                file_name=filename,
                excel_file=pdf_file
            )
            try:
                reader = PdfReader(file_obj)
                num_pages = len(reader.pages)
                pdf_info = reader.metadata
            except Exception as e:
                num_pages = None
                pdf_info = {}

            pdf_path = pdf_file.file.path
            full_data = extract_pdf_full(pdf_path)  # <-- Yeh line
            # tabs = extract_pdf_tabs(pdf_path)
            # pdf_file.pdf_tabs = tabs
            pdf_file.pdf_full = full_data
            pdf_file.save()

            file_url = request.build_absolute_uri(pdf_file.file.url) if pdf_file.file else None
            return Response({
                "type": "pdf",
                "pdf_file_id": pdf_file.id,
                "client_file_id": client_file.id,
                "file_name": pdf_file.file_name,
                "file_url": pdf_file.file.url if pdf_file.file else "",
                "num_pages": num_pages,
                "pdf_info": {k: str(v) for k, v in pdf_info.items()} if pdf_info else {},
                # "pdf_tabs": tabs,
                "pdf_full": full_data,
                "message": "PDF uploaded successfully."
            }, status=status.HTTP_201_CREATED)

        else:
            return Response({"error": "Unsupported file type."}, status=status.HTTP_400_BAD_REQUEST)



from rest_framework import generics, permissions
from .models import ClientFile
from .serializers import ClientFileSerializer

class ClientFileListView(generics.ListAPIView):
    serializer_class = ClientFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ClientFile.objects.filter(user=self.request.user)



# from rest_framework import generics
from .serializers import RegisterSerializer
from django.contrib.auth.models import User
from rest_framework import generics, permissions

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]



from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['is_staff'] = self.user.is_staff
        return data

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.contrib.auth.models import User

class ClientListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        users = User.objects.all()
        data = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            }
            for user in users
        ]
        return Response(data)



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import ClientFile

class AdminClientFilesView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, user_id):
        files = ClientFile.objects.filter(user_id=user_id)
        data = [
            {
                "id": f.id,
                "file_name": f.file_name,
                "file": request.build_absolute_uri(f.file.url),
                "uploaded_at": f.uploaded_at
            }
            for f in files
        ]
        return Response(data)




class ClientFileSheetsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        all_data = []
        user_files = ExcelFile.objects.filter(clientfile__user=user).distinct()

        for excel_file in user_files:
            sheets = Sheet.objects.filter(excel_file=excel_file)
            file_data = {
                "id": excel_file.id,
                "file_name": excel_file.file_name,
                "sheets": [],
                "file_url": request.build_absolute_uri(excel_file.file.url) if excel_file.file else "",
            }

            for sheet in sheets:
                entries = SheetEntry.objects.filter(sheet=sheet).order_by("-date_mapped")
                images = sheet.images.all()
                images_list = [
                    {
                        "url": image.image.url,
                        "row": image.row + 1,
                        "column": image.column + 1,
                    }
                    for image in images
                    if image.row is not None and image.column is not None
                ]

                sheet_data = {
                    "id": sheet.id,
                    "name": sheet.name,
                    "columns": [],
                    "rows": [],
                    "images": images_list,
                }

                if entries.exists():
                    for entry in entries:
                        rows = entry.row_data or []
                        sheet_data["columns"] = rows[0] if rows else []
                        sheet_data["rows"] = rows[1:] if rows else []

                file_data["sheets"].append(sheet_data)

            all_data.append(file_data)

        return Response(all_data)
    
from django.http import FileResponse, Http404
import mimetypes
import os
from django.conf import settings

def serve_media(request, path):
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if not os.path.exists(file_path):
        raise Http404("File not found")
    mime_type, _ = mimetypes.guess_type(file_path)
    return FileResponse(open(file_path, "rb"), content_type=mime_type or "application/octet-stream")
