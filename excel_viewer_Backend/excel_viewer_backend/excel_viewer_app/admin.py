from django.contrib import admin
from .models import Sheet, SheetEntry

@admin.register(Sheet)
class SheetAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

@admin.register(SheetEntry)
class SheetEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'sheet', 'short_row_data')
    list_filter = ('sheet',)

    def short_row_data(self, obj):
        return str(obj.row_data)[:100] + '...'