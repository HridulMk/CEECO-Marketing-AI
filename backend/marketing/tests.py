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
