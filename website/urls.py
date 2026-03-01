from django.urls import path
from . import views

app_name = "website"
urlpatterns = [
    path("", views.index, name="index"),
    path("astrolabe", views.astrolabe, name="astrolabe"),
    path("orrery", views.orrery, name="orrery"),
    path("pricing", views.pricing, name="pricing"),
]
