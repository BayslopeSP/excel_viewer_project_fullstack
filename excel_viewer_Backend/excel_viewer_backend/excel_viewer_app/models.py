from django.db import models

class ExcelFile(models.Model):
    file_name = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file_name

class Sheet(models.Model):
    name = models.CharField(max_length=255)
    excel_file = models.ForeignKey(ExcelFile, on_delete=models.CASCADE, related_name='sheets')

    def __str__(self):
        return self.name

class SheetEntry(models.Model):
    sheet = models.ForeignKey(Sheet, on_delete=models.CASCADE, related_name='entries')
    row_data = models.JSONField()

    def __str__(self):
        return f"Data for {self.sheet.name}"
