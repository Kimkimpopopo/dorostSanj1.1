from django.shortcuts import render
from django.db.models import Sum
from .models import session




def sanjesh(request):
    dorost_list = list(session.objects.values_list("dorost", flat=True))
    best_of_dorost_list_oneday = list(session.objects.values_list("dorost", flat=True))
    best_of_dorost_list_onemin = list(session.objects.values_list("best_of_dorost", flat=True))
    total_dorost = sum(dorost_list)
    sessions = session.objects.order_by("sess")
    chart_labels = list(sessions.values_list("sess", flat=True))
    chart_data = list(sessions.values_list("dorost", flat=True))
    d = max(best_of_dorost_list_oneday, default=False)
    m = max(best_of_dorost_list_onemin, default=False)
    sessions = session.objects.order_by("sess")

    context = {
      "alldorost": total_dorost,
      "best_of_dorost": d,
      "best_in_1_min" : m,
      "sessions": sessions,
      "session_count": sessions.count(),
      "chart_labels": chart_labels,
      "chart_data": chart_data,
    }

    return render(request, "index.html", context)
