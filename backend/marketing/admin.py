from django.contrib import admin
from .models import Activity, Campaign, ContentDraft, Lead

@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "location", "status", "source", "consent_to_contact", "created_at")
    list_filter = ("status", "source", "location", "consent_to_contact")
    search_fields = ("name", "email", "phone", "interest")


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ("name", "channel", "location", "status", "budget", "starts_on", "ends_on")
    list_filter = ("status", "channel", "location")
    search_fields = ("name", "objective")


@admin.register(ContentDraft)
class ContentDraftAdmin(admin.ModelAdmin):
    list_display = ("channel", "language", "status", "created_by", "created_at")
    list_filter = ("channel", "language", "status")


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ("title", "activity_type", "lead", "actor", "due_at", "completed_at")
    list_filter = ("activity_type",)
    search_fields = ("title", "notes")
