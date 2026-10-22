from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ActivityViewSet, AIGenerateView, CampaignViewSet, ContentDraftViewSet, LeadViewSet, dashboard_summary

router = DefaultRouter()
router.register("leads", LeadViewSet, basename="lead")
router.register("campaigns", CampaignViewSet, basename="campaign")
router.register("drafts", ContentDraftViewSet, basename="draft")
router.register("activities", ActivityViewSet, basename="activity")

urlpatterns = [
    path("", include(router.urls)),
    path("ai/generate/", AIGenerateView.as_view(), name="ai-generate"),
    path("dashboard/summary/", dashboard_summary, name="dashboard-summary"),
]
