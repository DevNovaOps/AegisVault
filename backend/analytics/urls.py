"""
AegisVault — Analytics URL Configuration
Endpoints under /api/v1/admin/analytics/
"""
from django.urls import path
from .views import (
    AnalyticsOverviewView, UserGrowthView, VaultActivityView,
    UserRoleDistributionView, VaultCategoriesView
)

urlpatterns = [
    path('overview/', AnalyticsOverviewView.as_view(), name='analytics-overview'),
    path('user-growth/', UserGrowthView.as_view(), name='analytics-user-growth'),
    path('vault-activity/', VaultActivityView.as_view(), name='analytics-vault-activity'),
    path('user-roles/', UserRoleDistributionView.as_view(), name='analytics-user-roles'),
    path('vault-categories/', VaultCategoriesView.as_view(), name='analytics-vault-categories'),
]
