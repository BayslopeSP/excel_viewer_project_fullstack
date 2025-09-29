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


# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status, permissions
# from django.contrib.auth.models import User
from .models import ClientFile, ExcelFile, Sheet, SheetEntry, Image
# import os
# import openpyxl
# from .views import safe_cell_value, save_image_to_disk

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
                            "url": image_instance.image.url,
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

            file_url = request.build_absolute_uri(pdf_file.file.url) if pdf_file.file else None
            return Response({
                "type": "pdf",
                "pdf_file_id": pdf_file.id,
                "client_file_id": client_file.id,
                "file_name": pdf_file.file_name,
                "file_url": pdf_file.file.url if pdf_file.file else "",
                "num_pages": num_pages,
                "pdf_info": {k: str(v) for k, v in pdf_info.items()} if pdf_info else {},
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