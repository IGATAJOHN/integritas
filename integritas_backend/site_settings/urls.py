from django.urls import path
from .views import HeroVideoView, CloudinarySignatureView, CloudinaryUploadProxyView

urlpatterns = [
    path('hero-video', HeroVideoView.as_view(), name='hero_video'),
    path('cloudinary-signature', CloudinarySignatureView.as_view(), name='cloudinary_signature'),
    path('cloudinary-upload', CloudinaryUploadProxyView.as_view(), name='cloudinary_upload'),
]
