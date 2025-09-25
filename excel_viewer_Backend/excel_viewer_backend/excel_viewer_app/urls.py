from django.urls import path
from .views import (
    ExcelUploadView,
    SheetListView,
    SpecificSheetView,
    UpdateSheetView,
    DeleteExcelFileView,
    UpdateMappingDateView,
    FilterMappingView,
)
from .views_upload import AdminFileUploadView,ClientFileListView,RegisterView,ClientListView,AdminClientFilesView,ClientFileSheetsView
# from .views_c import ClientFileListView
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views_upload import MyTokenObtainPairView
# from .views import RegisterView

urlpatterns = [
    # Old URLs
    path('upload-excel/', ExcelUploadView.as_view(), name='upload_excel'),
    path('sheets/', SheetListView.as_view(), name='sheet_list'),
    path('sheets/<int:file_id>/', SpecificSheetView.as_view(), name='get-specific-excel-file'),
    path('sheets/<int:sheet_id>/update/', UpdateSheetView.as_view(), name='update_sheet'),
    path('excel-files/<int:file_id>/delete/', DeleteExcelFileView.as_view(), name='delete_excel_file'),
    path('update-mapping-date/', UpdateMappingDateView.as_view(), name='update_mapping_date'),
    path('excel/<int:file_id>/mapping/<str:claim_id>/', FilterMappingView.as_view(), name='filter_mapping_by_claim'),
    path('client/files/', ClientFileSheetsView.as_view(), name='client-file-list'),

    # New Admin/Client File APIs
    path('upload-file/', AdminFileUploadView.as_view(), name='admin-upload-file'),
    # path('client/files/', ClientFileListView.as_view(), name='client-file-list'),



    path('register/', RegisterView.as_view(), name='register'),
    # path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('clients/', ClientListView.as_view(), name='client-list'),
    path('admin/client/<int:user_id>/files/', AdminClientFilesView.as_view(), name='admin-client-files'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)