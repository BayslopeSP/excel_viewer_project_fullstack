from rest_framework import serializers
from .models import Sheet, SheetEntry,Image

class ImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Image
        fields = ['row', 'column', 'image_url']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            return request.build_absolute_uri(obj.image.url)
        return None

class SheetEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = SheetEntry
        fields = '__all__'  # Serialize all fields in SheetEntry


class SheetSerializer(serializers.ModelSerializer):
    entries = SheetEntrySerializer(source='entries', many=True, read_only=True)
    images = ImageSerializer(many=True, read_only=True)  # serialize all images related to this sheet

    class Meta:
        model = Sheet
        fields = '__all__'  # includes id, name, merged_cells, column_widths, row_heights, entries, images
