from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('auth/', views.auth_view, name='auth'),
    path('login/', views.auth_view, name='login'),
    path('owner/', views.owner_portal_view, name='owner-portal'),
    path('trustee/', views.trustee_portal_view, name='trustee-portal'),
    path('admin-portal/', views.admin_portal_view, name='admin-portal'),
]
