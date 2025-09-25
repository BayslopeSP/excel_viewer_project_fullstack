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



# -----------------------------

from rest_framework import serializers
from .models import ClientFile

class ClientFileSerializer(serializers.ModelSerializer):
    sheet_id = serializers.IntegerField(source='sheet.id', read_only=True) 
    class Meta:
        model = ClientFile
        fields = ['id', 'file_name', 'file', 'uploaded_at','sheet_id']


    




from rest_framework import serializers
from django.contrib.auth.models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    

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



from rest_framework import serializers
from .models import ExcelFile

class ExcelFileSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = ExcelFile
        fields = ['id', 'file_name', 'file', 'file_url', 'uploaded_at']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None
