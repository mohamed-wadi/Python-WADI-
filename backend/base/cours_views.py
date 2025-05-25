from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib import messages
from django.shortcuts import redirect
from .models import Cours, Classe, Professeur, Matiere

class CoursListView(ListView):
    model = Cours
    template_name = 'base/cours/list.html'
    context_object_name = 'cours'
    paginate_by = 10
    
    def get_queryset(self):
        queryset = super().get_queryset()
        classe = self.request.GET.get('classe')
        professeur = self.request.GET.get('professeur')
        matiere = self.request.GET.get('matiere')
        jour = self.request.GET.get('jour')
        
        if classe:
            queryset = queryset.filter(classe_id=classe)
        if professeur:
            queryset = queryset.filter(professeur_id=professeur)
        if matiere:
            queryset = queryset.filter(matiere_id=matiere)
        if jour:
            queryset = queryset.filter(jour=jour)
            
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['classes'] = Classe.objects.all()
        context['professeurs'] = Professeur.objects.all()
        context['matieres'] = Matiere.objects.all()
        context['jours'] = [choice[0] for choice in Cours.JOURS_CHOICES]
        return context

class CoursDetailView(DetailView):
    model = Cours
    template_name = 'base/cours/detail.html'
    context_object_name = 'cours'

class CoursCreateView(CreateView):
    model = Cours
    template_name = 'base/cours/form.html'
    fields = ['matiere', 'professeur', 'classe', 'jour', 'heure_debut', 'heure_fin', 'salle', 'description']
    success_url = reverse_lazy('cours-list')
    
    def form_valid(self, form):
        messages.success(self.request, 'Le cours a été créé avec succès.')
        return super().form_valid(form)

class CoursUpdateView(UpdateView):
    model = Cours
    template_name = 'base/cours/form.html'
    fields = ['matiere', 'professeur', 'classe', 'jour', 'heure_debut', 'heure_fin', 'salle', 'description']
    
    def get_success_url(self):
        return reverse_lazy('cours-detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        messages.success(self.request, 'Le cours a été mis à jour avec succès.')
        return super().form_valid(form)

class CoursDeleteView(DeleteView):
    model = Cours
    template_name = 'base/cours/confirm_delete.html'
    success_url = reverse_lazy('cours-list')
    
    def delete(self, request, *args, **kwargs):
        messages.success(request, 'Le cours a été supprimé avec succès.')
        return super().delete(request, *args, **kwargs)
