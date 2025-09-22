from django.urls import path
from .views import (
    ExcelUploadView,
    SheetListView,
    SpecificSheetView,
    UpdateSheetView,
    DeleteExcelFileView,
    UpdateMappingDateView,
    FilterMappingView
)
# from .utils import filter_mapping_by_claim
from django.conf import settings
from django.conf.urls.static import static
from .utils import filter_mapping_rows_by_claim
from .utils import filter_mapping_rows_by_claim

# date_mapped = models.DateTimeField(null=True, blank=True)  # Add this line between row_data and the __str__ method
urlpatterns = [
    path('upload-excel/', ExcelUploadView.as_view(), name='upload_excel'),
    path('sheets/', SheetListView.as_view(), name='sheet_list'),
    path('sheets/<int:file_id>/', SpecificSheetView.as_view(), name='get-specific-excel-file'),
    path('sheets/<int:sheet_id>/update/', UpdateSheetView.as_view(), name='update_sheet'),
    path('excel-files/<int:file_id>/delete/', DeleteExcelFileView.as_view(), name='delete_excel_file'),
    path('update-mapping-date/', UpdateMappingDateView.as_view(), name='update_mapping_date'),
    path('excel/<int:file_id>/mapping/<str:claim_id>/', FilterMappingView.as_view(), name='filter_mapping_by_claim'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
