from django.views.generic import TemplateView
from django.contrib import messages
from .models import Classe, Matiere, Professeur

class CoursSimpleView(TemplateView):
    template_name = 'base/cours_simple.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['classes'] = Classe.objects.all().order_by('niveau', 'nom')
        context['matieres'] = Matiere.objects.all().order_by('nom')
        context['professeurs'] = Professeur.objects.all().order_by('nom', 'prenom')
        return context
