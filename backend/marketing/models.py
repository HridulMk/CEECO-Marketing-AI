from django.conf import settings
from django.db import models

class Lead(models.Model):
    STATUS_CHOICES = [
        ("new", "New lead"), ("contacted", "Contacted"), ("qualified", "Qualified"),
        ("follow_up", "Follow-up"), ("converted", "Converted"), ("lost", "Lost"),
    ]
    SOURCE_CHOICES = [
        ("website", "Website"), ("instagram", "Instagram"), ("facebook", "Facebook"),
        ("whatsapp", "WhatsApp"), ("event", "Event"), ("walk_in", "Walk-in"),
        ("referral", "Referral"), ("import", "Authorized import"), ("other", "Other"),
    ]
    name = models.CharField(max_length=180)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=40, blank=True)
    location = models.CharField(max_length=100, blank=True)
    interest = models.CharField(max_length=250, blank=True)
    source = models.CharField(max_length=30, choices=SOURCE_CHOICES, default="website")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="new")
    score = models.PositiveSmallIntegerField(default=50)
    consent_to_contact = models.BooleanField(default=False)
    notes = models.TextField(blank=True)
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="assigned_leads")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_leads")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.location})"


class Campaign(models.Model):
    STATUS_CHOICES = [("planning", "Planning"), ("active", "Active"), ("paused", "Paused"), ("completed", "Completed")]
    name = models.CharField(max_length=180)
    objective = models.CharField(max_length=250, blank=True)
    channel = models.CharField(max_length=80, blank=True)
    location = models.CharField(max_length=100, blank=True)
    budget = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="planning")
    starts_on = models.DateField(null=True, blank=True)
    ends_on = models.DateField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class ContentDraft(models.Model):
    STATUS_CHOICES = [("draft", "Draft"), ("approved", "Approved"), ("published", "Published"), ("archived", "Archived")]
    campaign = models.ForeignKey(Campaign, on_delete=models.SET_NULL, null=True, blank=True, related_name="drafts")
    channel = models.CharField(max_length=80)
    language = models.CharField(max_length=80, default="English")
    prompt = models.TextField()
    content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Activity(models.Model):
    TYPE_CHOICES = [("call", "Call"), ("email", "Email"), ("message", "Message"), ("meeting", "Meeting"), ("task", "Task"), ("note", "Note")]
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name="activities", null=True, blank=True)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    activity_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="task")
    title = models.CharField(max_length=180)
    notes = models.TextField(blank=True)
    due_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["due_at", "-created_at"]
