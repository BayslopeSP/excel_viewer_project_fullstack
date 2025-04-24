from rest_framework import serializers
from .models import Sheet, SheetEntry

class SheetEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SheetEntry
        fields = '__all__'


class SheetSerializer(serializers.ModelSerializer):
    entries = SheetEntrySerializer(source='sheetentry_set', many=True, read_only=True)

    class Meta:
        model = Sheet
        fields = '__all__'  # include 'entries' if you want sheet data as well
