import os
from django.db.models import Count, Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from groq import Groq
from .models import Activity, Campaign, ContentDraft, Lead
from .serializers import ActivitySerializer, CampaignSerializer, ContentDraftSerializer, LeadSerializer


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health(request):
    return Response({"status": "ok", "service": "ceeco-marketing-ai-api"})


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Lead.objects.select_related("assigned_to", "created_by")
        if not user.is_staff:
            qs = qs.filter(Q(assigned_to=user) | Q(created_by=user))
        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(email__icontains=q) | Q(location__icontains=q) | Q(interest__icontains=q))
        location = self.request.query_params.get("location")
        if location:
            qs = qs.filter(location__iexact=location)
        state = self.request.query_params.get("status")
        if state:
            qs = qs.filter(status=state)
        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CampaignViewSet(viewsets.ModelViewSet):
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Campaign.objects.all()
        if not self.request.user.is_staff:
            qs = qs.filter(created_by=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ContentDraftViewSet(viewsets.ModelViewSet):
    serializer_class = ContentDraftSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ContentDraft.objects.all()
        if not self.request.user.is_staff:
            qs = qs.filter(created_by=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ActivityViewSet(viewsets.ModelViewSet):
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Activity.objects.select_related("lead", "actor")
        if not self.request.user.is_staff:
            qs = qs.filter(Q(actor=self.request.user) | Q(lead__created_by=self.request.user) | Q(lead__assigned_to=self.request.user))
        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save(actor=self.request.user)


class AIGenerateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        keys = ["goal", "audience", "channel", "language", "location", "tone"]
        brief = {key: str(request.data.get(key, "")).strip()[:2000] for key in keys}
        if not brief["goal"] or not brief["audience"]:
            return Response({"detail": "goal and audience are required."}, status=status.HTTP_400_BAD_REQUEST)

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return Response(
                {"detail": "AI provider is not configured. Set GROQ_API_KEY on the backend host."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        try:
            client = Groq(api_key=api_key, timeout=30.0, max_retries=1)
            response = client.chat.completions.create(
                model=os.getenv("GROQ_MODEL", "openai/gpt-oss-120b"),
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a careful marketing assistant for CEECO International, an international education consultancy. "
                            "Create a first draft for human review. Do not invent admission or visa guarantees, rankings, statistics, "
                            "prices, testimonials, or official partnerships. Do not claim any post has been published. "
                            "Return a hook, main copy, CTA and a few relevant hashtags where useful."
                        ),
                    },
                    {
                        "role": "user",
                        "content": "Write a marketing draft from this brief:\n"
                        + "\n".join(f"{key}: {value}" for key, value in brief.items()),
                    },
                ],
                max_completion_tokens=900,
            )
            content = response.choices[0].message.content or ""
            if not content.strip():
                return Response(
                    {"detail": "The AI provider returned an empty draft. Please try again."},
                    status=status.HTTP_502_BAD_GATEWAY,
                )

            saved = ContentDraft.objects.create(
                channel=brief["channel"] or "General",
                language=brief["language"] or "English",
                prompt="; ".join(f"{key}: {value}" for key, value in brief.items()),
                content=content,
                created_by=request.user,
            )
            return Response({"content": content, "draft_id": saved.id, "status": "draft"})
        except Exception:
            return Response(
                {"detail": "AI generation failed. Check the server configuration and provider logs."},
                status=status.HTTP_502_BAD_GATEWAY,
            )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def dashboard_summary(request):
    user = request.user
    leads = Lead.objects.all()
    campaigns = Campaign.objects.all()
    if not user.is_staff:
        leads = leads.filter(Q(assigned_to=user) | Q(created_by=user))
        campaigns = campaigns.filter(created_by=user)
    return Response({
        "total_leads": leads.count(),
        "by_status": list(leads.values("status").annotate(count=Count("id"))),
        "active_campaigns": campaigns.filter(status="active").count(),
        "metrics_note": "Counts reflect records visible to the authenticated account; empty datasets return zero.",
    })
