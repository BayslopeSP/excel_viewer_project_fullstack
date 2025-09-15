from rest_framework import serializers
from .models import Sheet, SheetEntry

class SheetEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SheetEntry
        fields = '__all__'  # Serialize all fields in SheetEntry


class SheetSerializer(serializers.ModelSerializer):
    # Include SheetEntry data for each Sheet (reverse relationship)
    entries = SheetEntrySerializer(source='sheetentry_set', many=True, read_only=True)
    
    # Adding image_url field to get the image URL from the Sheet model
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Sheet
        fields = '__all__'  # Include all fields from Sheet model, along with 'entries' and 'image_url'
    
    # Method to get image URL (if image exists)
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url  # Return the full URL of the image
        return None  # Return None if there's no image
