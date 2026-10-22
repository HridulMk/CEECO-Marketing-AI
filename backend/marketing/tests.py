import os
from unittest.mock import patch

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


class HealthEndpointTests(APITestCase):
    def test_health_is_public(self):
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["status"], "ok")


class ProtectedEndpointsTests(APITestCase):
    def test_leads_require_authentication(self):
        response = self.client.get("/api/leads/")
        self.assertIn(response.status_code, (401, 403))

    def test_authenticated_user_can_list_empty_leads(self):
        user = get_user_model().objects.create_user(username="test-marketer", password="SafeTestPassword!123")
        self.client.force_authenticate(user=user)
        response = self.client.get("/api/leads/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["results"], [])


class AIGenerateEndpointTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username="ai-test-marketer",
            password="SafeTestPassword!123",
        )
        self.client.force_authenticate(user=self.user)
        self.payload = {
            "goal": "Promote a study abroad counselling session",
            "audience": "Students planning international education",
            "channel": "Instagram",
            "language": "English",
            "location": "Kerala",
            "tone": "Helpful",
        }

    @patch.dict(os.environ, {}, clear=True)
    def test_returns_service_unavailable_without_groq_key(self):
        response = self.client.post("/api/ai/generate/", self.payload, format="json")
        self.assertEqual(response.status_code, 503)
        self.assertIn("GROQ_API_KEY", response.data["detail"])

    @patch("marketing.views.Groq")
    @patch.dict(os.environ, {"GROQ_API_KEY": "test-groq-key", "GROQ_MODEL": "openai/gpt-oss-120b"})
    def test_generates_and_saves_draft(self, mock_groq):
        mock_response = mock_groq.return_value.chat.completions.create.return_value
        mock_response.choices = [type("Choice", (), {"message": type("Message", (), {"content": "A test draft with a CTA."})()})()]

        response = self.client.post("/api/ai/generate/", self.payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["content"], "A test draft with a CTA.")
        self.assertEqual(response.data["status"], "draft")
        self.assertTrue(response.data["draft_id"])
        mock_groq.assert_called_once()
        mock_groq.return_value.chat.completions.create.assert_called_once()
