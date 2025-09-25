from django.db import models

class Image(models.Model):
    
    image = models.ImageField(upload_to='images/')  # Store image in the `sheet_images/` directory
    row = models.IntegerField(null=True, blank=True)
    column = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image {self.id}"


class ExcelFile(models.Model):
    file_name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/', null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name


class Sheet(models.Model):
    excel_file = models.ForeignKey(ExcelFile, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    merged_cells = models.TextField(default="[]")
    column_widths = models.JSONField(default=dict)
    row_heights = models.JSONField(default=dict)
    images = models.ManyToManyField(Image, blank=True)  # Store the image as a file

    def __str__(self):
        return self.name


class SheetEntry(models.Model):
    sheet = models.ForeignKey(Sheet, on_delete=models.CASCADE, related_name='entries')
    row_data = models.JSONField()
    date_mapped = models.DateTimeField(null=True, blank=True)  # Add this line

    def __str__(self):
        return f"Data for {self.sheet.name}"


from django.contrib.auth.models import User
import uuid

class ClientProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=255, unique=True)
    client_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    def __str__(self):
        return f"{self.company_name} ({self.user.email})"




from django.db import models
from django.contrib.auth.models import User

class ClientFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='client_files')
    file = models.FileField(upload_to='client_files/')
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    sheet = models.OneToOneField('Sheet', on_delete=models.SET_NULL, null=True, blank=True) 
    excel_file = models.ForeignKey(ExcelFile, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.file_name} ({self.user.username})"