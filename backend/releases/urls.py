"""
AegisVault — Release URL Configuration
Endpoints under /api/v1/owner/
"""
from django.urls import path
from .views import ReleaseListCreateView, ReleaseDetailView, ReleaseCancelView

urlpatterns = [
    path('releases/', ReleaseListCreateView.as_view(), name='release-list-create'),
    path('releases/<uuid:pk>/', ReleaseDetailView.as_view(), name='release-detail'),
    path('releases/<uuid:pk>/cancel/', ReleaseCancelView.as_view(), name='release-cancel'),
]
