from django.shortcuts import render

# Create your views here.


def index(request):
    return render(request, "website/index.html")


def astrolabe(request):
    return render(request, "website/astrolabe.html")


def orrery(request):
    return render(request, "website/orrery.html")


def pricing(request):
    return render(request, "website/pricing.html")
