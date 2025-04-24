from django.urls import path
from .views import (
    ExcelUploadView,
    SheetListView,
    SpecificSheetView,
    UpdateSheetView,
    DeleteExcelFileView,
    
    filter_mapping_by_claim

)

urlpatterns = [
    path('upload-excel/', ExcelUploadView.as_view(), name='upload_excel'),
    path('sheets/', SheetListView.as_view(), name='sheet_list'),
    path('sheets/<int:file_id>/', SpecificSheetView.as_view(), name='get-specific-excel-file'),
    path('sheets/<int:sheet_id>/update/', UpdateSheetView.as_view(), name='update_sheet'),
    path('excel-files/<int:file_id>/delete/', DeleteExcelFileView.as_view(), name='delete_excel_file'),
    path('excel/<int:file_id>/mapping/<str:claim_id>/', filter_mapping_by_claim),
]
