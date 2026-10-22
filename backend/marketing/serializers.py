from rest_framework import serializers
from .models import Activity, Campaign, ContentDraft, Lead

class LeadSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.CharField(source="assigned_to.username", read_only=True)

    class Meta:
        model = Lead
        fields = "__all__"
        read_only_fields = ("created_by", "created_at", "updated_at")

    def validate_score(self, value):
        if not 0 <= value <= 100:
            raise serializers.ValidationError("Score must be between 0 and 100.")
        return value


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = "__all__"
        read_only_fields = ("created_by", "created_at")


class ContentDraftSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentDraft
        fields = "__all__"
        read_only_fields = ("created_by", "created_at")


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = "__all__"
        read_only_fields = ("actor", "created_at")
