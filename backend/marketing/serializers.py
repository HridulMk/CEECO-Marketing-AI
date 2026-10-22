from rest_framework import serializers
from .models import Activity, Campaign, ContentDraft, Lead


def request_user(serializer):
    request = serializer.context.get("request")
    return getattr(request, "user", None)


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

    def validate_assigned_to(self, value):
        user = request_user(self)
        if value and user and user.is_authenticated and not user.is_staff and value != user:
            raise serializers.ValidationError("Only staff accounts may assign a lead to another user.")
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

    def validate_campaign(self, value):
        user = request_user(self)
        if value and user and user.is_authenticated and not user.is_staff and value.created_by_id != user.id:
            raise serializers.ValidationError("You cannot attach a draft to a campaign you do not own.")
        return value


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = "__all__"
        read_only_fields = ("actor", "created_at")

    def validate_lead(self, value):
        user = request_user(self)
        if value and user and user.is_authenticated and not user.is_staff:
            if value.created_by_id != user.id and value.assigned_to_id != user.id:
                raise serializers.ValidationError("You do not have access to this lead.")
        return value
