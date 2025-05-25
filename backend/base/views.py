from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.db.models import Avg, Count, Q, F
from django.http import HttpResponse, JsonResponse
from django.template.loader import get_template
from django.utils import timezone
from django.forms import ModelForm, DateInput, TextInput, Select, Textarea
from django import forms

# Import des vues pour la gestion des cours
# from .cours_views import CoursListView, CoursDetailView, CoursCreateView, CoursUpdateView, CoursDeleteView
# Utilisation de la vue simplifiée pour les cours suite aux problèmes de migration
from .views_cours_simple import CoursSimpleView
from .models import Etudiant, Professeur, Classe, Matiere, Note, Bulletin, Statistique, Absence
import csv
import datetime
from xhtml2pdf import pisa
import io

# Create your views here.

class Home(View):
    def get(self, request):
        # Compter quelques statistiques pour la page d'accueil
        context = {
            'nb_etudiants': Etudiant.objects.count(),
            'nb_professeurs': Professeur.objects.count(),
            'nb_classes': Classe.objects.count(),
            'nb_matieres': Matiere.objects.count(),
        }
        return render(request, 'base/hello.html', context)

# Vues pour la gestion des u00e9tudiants
class EtudiantListView(ListView):
    model = Etudiant
    template_name = 'base/etudiant/list.html'
    context_object_name = 'etudiants'
    paginate_by = 10
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.GET.get('search', '')
        classe_id = self.request.GET.get('classe', '')
        
        if search_query:
            queryset = queryset.filter(nom__icontains=search_query) | queryset.filter(prenom__icontains=search_query) | queryset.filter(numero_matricule__icontains=search_query)
        
        if classe_id:
            queryset = queryset.filter(classe_id=classe_id)
            
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['classes'] = Classe.objects.all()
        context['search'] = self.request.GET.get('search', '')
        context['classe_filter'] = self.request.GET.get('classe', '')
        return context

class EtudiantDetailView(DetailView):
    model = Etudiant
    template_name = 'base/etudiant/detail.html'
    context_object_name = 'etudiant'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        etudiant = self.get_object()
        
        # Ru00e9cupu00e9rer les notes de l'u00e9tudiant
        context['notes'] = Note.objects.filter(etudiant=etudiant).order_by('matiere__nom', 'trimestre')
        
        # Calculer la moyenne par matiu00e8re
        context['moyennes_par_matiere'] = []
        for matiere in Matiere.objects.filter(note__etudiant=etudiant).distinct():
            notes_matiere = Note.objects.filter(etudiant=etudiant, matiere=matiere)
            if notes_matiere.exists():
                moyenne = notes_matiere.aggregate(Avg('valeur'))['valeur__avg']
                context['moyennes_par_matiere'].append({
                    'matiere': matiere,
                    'moyenne': moyenne
                })
        
        # Ru00e9cupu00e9rer les absences
        context['absences'] = Absence.objects.filter(etudiant=etudiant).order_by('-date_debut')
        
        # Ru00e9cupu00e9rer les bulletins
        context['bulletins'] = Bulletin.objects.filter(etudiant=etudiant).order_by('-trimestre')
        
        return context

class EtudiantCreateView(CreateView):
    model = Etudiant
    template_name = 'base/etudiant/form.html'
    fields = ['nom', 'prenom', 'date_naissance', 'sexe', 'adresse', 'email', 'telephone', 'classe', 'numero_matricule']
    success_url = reverse_lazy('base:etudiant-list')
    
    def form_valid(self, form):
        messages.success(self.request, 'u00c9tudiant cru00e9u00e9 avec succu00e8s !')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Ajouter un u00e9tudiant'
        context['button_text'] = 'Ajouter'
        return context

class EtudiantUpdateView(UpdateView):
    model = Etudiant
    template_name = 'base/etudiant/form.html'
    fields = ['nom', 'prenom', 'date_naissance', 'sexe', 'adresse', 'email', 'telephone', 'classe', 'numero_matricule']
    
    def get_success_url(self):
        return reverse_lazy('base:etudiant-detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        messages.success(self.request, 'u00c9tudiant mis u00e0 jour avec succu00e8s !')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Modifier un u00e9tudiant'
        context['button_text'] = 'Modifier'
        return context

class EtudiantDeleteView(DeleteView):
    model = Etudiant
    template_name = 'base/etudiant/confirm_delete.html'
    success_url = reverse_lazy('base:etudiant-list')
    context_object_name = 'etudiant'
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'u00c9tudiant supprimu00e9 avec succu00e8s !')
        return super().delete(request, *args, **kwargs)

# Vues pour la gestion des professeurs
class ProfesseurListView(ListView):
    model = Professeur
    template_name = 'base/professeur/list.html'
    context_object_name = 'professeurs'
    paginate_by = 10
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.GET.get('search', '')
        specialite = self.request.GET.get('specialite', '')
        
        if search_query:
            queryset = queryset.filter(nom__icontains=search_query) | queryset.filter(prenom__icontains=search_query) | queryset.filter(email__icontains=search_query)
            
        if specialite:
            queryset = queryset.filter(specialite__icontains=specialite)
            
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['specialites'] = Professeur.objects.values_list('specialite', flat=True).distinct()
        context['search'] = self.request.GET.get('search', '')
        context['specialite_filter'] = self.request.GET.get('specialite', '')
        return context

class ProfesseurDetailView(DetailView):
    model = Professeur
    template_name = 'base/professeur/detail.html'
    context_object_name = 'professeur'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        professeur = self.get_object()
        
        # Ru00e9cupu00e9rer les matiu00e8res enseigner par le professeur
        context['matieres'] = Matiere.objects.filter(professeur=professeur)
        
        # Ru00e9cupu00e9rer les classes associu00e9es aux matiu00e8res du professeur
        classes_ids = context['matieres'].values_list('classes', flat=True)
        context['classes'] = Classe.objects.filter(id__in=classes_ids).distinct()
        
        return context

class ProfesseurCreateView(CreateView):
    model = Professeur
    template_name = 'base/professeur/form.html'
    fields = ['nom', 'prenom', 'email', 'telephone', 'specialite', 'date_embauche']
    success_url = reverse_lazy('base:professeur-list')
    
    def form_valid(self, form):
        messages.success(self.request, 'Professeur cru00e9u00e9 avec succu00e8s !')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Ajouter un professeur'
        context['button_text'] = 'Ajouter'
        return context

class ProfesseurUpdateView(UpdateView):
    model = Professeur
    template_name = 'base/professeur/form.html'
    fields = ['nom', 'prenom', 'email', 'telephone', 'specialite', 'date_embauche']
    
    def get_success_url(self):
        return reverse_lazy('base:professeur-detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        messages.success(self.request, 'Professeur mis u00e0 jour avec succu00e8s !')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Modifier un professeur'
        context['button_text'] = 'Modifier'
        return context

class ProfesseurDeleteView(DeleteView):
    model = Professeur
    template_name = 'base/professeur/confirm_delete.html'
    success_url = reverse_lazy('base:professeur-list')
    context_object_name = 'professeur'
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Professeur supprimé avec succès !')
        return super().delete(request, *args, **kwargs)

# Vues pour la gestion des classes
class ClasseListView(ListView):
    model = Classe
    template_name = 'base/classe/list.html'
    context_object_name = 'classes'
    paginate_by = 10
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.GET.get('search', '')
        niveau = self.request.GET.get('niveau', '')
        annee = self.request.GET.get('annee_scolaire', '')
        
        if search_query:
            queryset = queryset.filter(nom__icontains=search_query)
            
        if niveau:
            queryset = queryset.filter(niveau__icontains=niveau)
            
        if annee:
            queryset = queryset.filter(annee_scolaire__icontains=annee)
            
        return queryset
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['niveaux'] = Classe.objects.values_list('niveau', flat=True).distinct()
        context['annees'] = Classe.objects.values_list('annee_scolaire', flat=True).distinct()
        context['search'] = self.request.GET.get('search', '')
        context['niveau_filter'] = self.request.GET.get('niveau', '')
        context['annee_filter'] = self.request.GET.get('annee_scolaire', '')
        return context

class ClasseDetailView(DetailView):
    model = Classe
    template_name = 'base/classe/detail_enhanced.html'
    context_object_name = 'classe'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        classe = self.get_object()
        
        # Récupérer les étudiants de la classe
        context['etudiants'] = Etudiant.objects.filter(classe=classe)
        
        # Récupérer les matières associées à cette classe
        context['matieres'] = Matiere.objects.filter(classes=classe)
        
        # Statistiques de la classe
        context['statistiques'] = Statistique.objects.filter(classe=classe)
        
        # Calculer quelques statistiques supplémentaires
        etudiants_count = context['etudiants'].count()
        context['etudiants_count'] = etudiants_count
        
        garcons_count = context['etudiants'].filter(sexe='M').count()
        filles_count = context['etudiants'].filter(sexe='F').count()
        context['garcons_count'] = garcons_count
        context['filles_count'] = filles_count
        
        # Moyennes par trimestre
        moyennes_par_trimestre = []
        for trimestre in [1, 2, 3]:
            notes = Note.objects.filter(etudiant__classe=classe, trimestre=trimestre)
            if notes.exists():
                moyenne = notes.aggregate(Avg('valeur'))['valeur__avg']
                moyennes_par_trimestre.append({
                    'trimestre': trimestre,
                    'moyenne': moyenne
                })
        context['moyennes_par_trimestre'] = moyennes_par_trimestre
        
        return context

class ClasseCreateView(CreateView):
    model = Classe
    template_name = 'base/classe/form.html'
    fields = ['nom', 'niveau', 'annee_scolaire']
    success_url = reverse_lazy('base:classe-list')
    
    def form_valid(self, form):
        messages.success(self.request, 'Classe créée avec succès !')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Ajouter une classe'
        context['button_text'] = 'Ajouter'
        return context

class ClasseUpdateView(UpdateView):
    model = Classe
    template_name = 'base/classe/form.html'
    fields = ['nom', 'niveau', 'annee_scolaire']
    
    def get_success_url(self):
        return reverse_lazy('base:classe-detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        messages.success(self.request, 'Classe mise à jour avec succès !')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Modifier une classe'
        context['button_text'] = 'Modifier'
        return context

class ClasseDeleteView(DeleteView):
    model = Classe
    template_name = 'base/classe/confirm_delete.html'
    success_url = reverse_lazy('base:classe-list')
    context_object_name = 'classe'
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Classe supprimée avec succès !')
        return super().delete(request, *args, **kwargs)

# Vues pour la gestion des matières
class MatiereListView(ListView):
    model = Matiere
    template_name = 'base/matiere/list.html'
    context_object_name = 'matieres'
    paginate_by = 10
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.GET.get('search', '')
        professeur_id = self.request.GET.get('professeur', '')
        classe_id = self.request.GET.get('classe', '')
        
        if search_query:
            queryset = queryset.filter(nom__icontains=search_query) | queryset.filter(code__icontains=search_query)
            
        if professeur_id:
            queryset = queryset.filter(professeur_id=professeur_id)
            
        if classe_id:
            queryset = queryset.filter(classes__id=classe_id)
            
        return queryset.distinct()
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['professeurs'] = Professeur.objects.all()
        context['classes'] = Classe.objects.all()
        context['search'] = self.request.GET.get('search', '')
        context['professeur_filter'] = self.request.GET.get('professeur', '')
        context['classe_filter'] = self.request.GET.get('classe', '')
        return context

class MatiereDetailView(DetailView):
    model = Matiere
    template_name = 'base/matiere/detail.html'
    context_object_name = 'matiere'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        matiere = self.get_object()
        
        # Ru00e9cupu00e9rer les classes associu00e9es
        context['classes'] = matiere.classes.all()
        
        # Calculer les statistiques par classe
        context['stats_par_classe'] = []
        for classe in context['classes']:
            notes = Note.objects.filter(matiere=matiere, etudiant__classe=classe)
            if notes.exists():
                stats = {
                    'classe': classe,
                    'moyenne': notes.aggregate(Avg('valeur'))['valeur__avg'],
                    'nb_notes': notes.count(),
                    'nb_etudiants': notes.values('etudiant').distinct().count()
                }
                context['stats_par_classe'].append(stats)
        
        return context

class MatiereCreateView(CreateView):
    model = Matiere
    template_name = 'base/matiere/form.html'
    fields = ['nom', 'code', 'coefficient', 'professeur', 'classes']
    success_url = reverse_lazy('base:matiere-list')
    
    def form_valid(self, form):
        messages.success(self.request, 'Matiu00e8re cru00e9u00e9e avec succu00e8s !')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Ajouter une matiu00e8re'
        context['button_text'] = 'Ajouter'
        return context

class MatiereUpdateView(UpdateView):
    model = Matiere
    template_name = 'base/matiere/form.html'
    fields = ['nom', 'code', 'coefficient', 'professeur', 'classes']
    
    def get_success_url(self):
        return reverse_lazy('base:matiere-detail', kwargs={'pk': self.object.pk})
    
    def form_valid(self, form):
        messages.success(self.request, 'Matiu00e8re mise u00e0 jour avec succu00e8s !')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Modifier une matiu00e8re'
        context['button_text'] = 'Modifier'
        return context

class MatiereDeleteView(DeleteView):
    model = Matiere
    template_name = 'base/matiere/confirm_delete.html'
    success_url = reverse_lazy('base:matiere-list')
    context_object_name = 'matiere'
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Matière supprimée avec succès !')
        return super().delete(request, *args, **kwargs)

# Vues pour la gestion des notes
class NoteListView(ListView):
    model = Note
    template_name = 'base/note/list.html'
    context_object_name = 'notes'
    paginate_by = 20
    
    def get_queryset(self):
        queryset = super().get_queryset()
        etudiant_id = self.request.GET.get('etudiant', '')
        matiere_id = self.request.GET.get('matiere', '')
        classe_id = self.request.GET.get('classe', '')
        trimestre = self.request.GET.get('trimestre', '')
        
        if etudiant_id:
            queryset = queryset.filter(etudiant_id=etudiant_id)
            
        if matiere_id:
            queryset = queryset.filter(matiere_id=matiere_id)
            
        if classe_id:
            queryset = queryset.filter(etudiant__classe_id=classe_id)
            
        if trimestre:
            queryset = queryset.filter(trimestre=trimestre)
            
        return queryset.order_by('-date_evaluation')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['etudiants'] = Etudiant.objects.all()
        context['matieres'] = Matiere.objects.all()
        context['classes'] = Classe.objects.all()
        context['etudiant_filter'] = self.request.GET.get('etudiant', '')
        context['matiere_filter'] = self.request.GET.get('matiere', '')
        context['classe_filter'] = self.request.GET.get('classe', '')
        context['trimestre_filter'] = self.request.GET.get('trimestre', '')
        return context

class NoteCreateView(CreateView):
    model = Note
    template_name = 'base/note/form.html'
    fields = ['etudiant', 'matiere', 'valeur', 'date_evaluation', 'type_evaluation', 'commentaire', 'trimestre']
    
    def get_success_url(self):
        messages.success(self.request, 'Note ajoutée avec succès !')
        return reverse_lazy('base:note-list')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Ajouter une note'
        context['button_text'] = 'Ajouter'
        return context

class NoteUpdateView(UpdateView):
    model = Note
    template_name = 'base/note/form.html'
    fields = ['etudiant', 'matiere', 'valeur', 'date_evaluation', 'type_evaluation', 'commentaire', 'trimestre']
    
    def get_success_url(self):
        messages.success(self.request, 'Note mise à jour avec succès !')
        if 'etudiant_id' in self.request.GET:
            etudiant_id = self.request.GET.get('etudiant_id')
            return reverse_lazy('base:etudiant-detail', kwargs={'pk': etudiant_id})
        return reverse_lazy('base:note-list')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Modifier une note'
        context['button_text'] = 'Modifier'
        return context

class NoteDeleteView(DeleteView):
    model = Note
    template_name = 'base/note/confirm_delete.html'
    context_object_name = 'note'
    
    def get_success_url(self):
        messages.success(self.request, 'Note supprimée avec succès !')
        if 'etudiant_id' in self.request.GET:
            etudiant_id = self.request.GET.get('etudiant_id')
            return reverse_lazy('base:etudiant-detail', kwargs={'pk': etudiant_id})
        return reverse_lazy('base:note-list')

class NotesParClasseView(View):
    template_name = 'base/note/par_classe.html'
    
    def get(self, request):
        form = {}
        classes = Classe.objects.all()
        matieres = Matiere.objects.all()
        form['classe'] = request.GET.get('classe', '')
        form['matiere'] = request.GET.get('matiere', '')
        form['trimestre'] = request.GET.get('trimestre', '')
        
        etudiants = []
        if form['classe'] and form['matiere'] and form['trimestre']:
            classe = get_object_or_404(Classe, id=form['classe'])
            matiere = get_object_or_404(Matiere, id=form['matiere'])
            etudiants = Etudiant.objects.filter(classe=classe).order_by('nom', 'prenom')
            
            # Récupérer les notes existantes pour chaque étudiant
            for etudiant in etudiants:
                notes = Note.objects.filter(
                    etudiant=etudiant,
                    matiere=matiere,
                    trimestre=form['trimestre']
                )
                etudiant.notes = notes
                etudiant.moyenne = notes.aggregate(Avg('valeur'))['valeur__avg'] if notes.exists() else None
        
        return render(request, self.template_name, {
            'classes': classes,
            'matieres': matieres,
            'form': form,
            'etudiants': etudiants,
            'selected_classe': Classe.objects.get(id=form['classe']) if form['classe'] else None,
            'selected_matiere': Matiere.objects.get(id=form['matiere']) if form['matiere'] else None,
            'selected_trimestre': form['trimestre'],
        })
    
    def post(self, request):
        classe_id = request.POST.get('classe')
        matiere_id = request.POST.get('matiere')
        trimestre = request.POST.get('trimestre')
        etudiant_ids = request.POST.getlist('etudiant_id')
        valeurs = request.POST.getlist('valeur')
        date_evaluation = request.POST.get('date_evaluation')
        type_evaluation = request.POST.get('type_evaluation')
        
        if not date_evaluation:
            date_evaluation = timezone.now().date()
        
        if classe_id and matiere_id and trimestre and etudiant_ids and valeurs:
            classe = get_object_or_404(Classe, id=classe_id)
            matiere = get_object_or_404(Matiere, id=matiere_id)
            
            notes_ajoutees = 0
            
            for i, etudiant_id in enumerate(etudiant_ids):
                if i < len(valeurs) and valeurs[i].strip():
                    try:
                        valeur = float(valeurs[i])
                        etudiant = get_object_or_404(Etudiant, id=etudiant_id)
                        
                        # Vérifier si une note existe déjà pour cet étudiant, cette matière, ce trimestre et ce type d'évaluation
                        note, created = Note.objects.update_or_create(
                            etudiant=etudiant,
                            matiere=matiere,
                            trimestre=trimestre,
                            type_evaluation=type_evaluation,
                            defaults={
                                'valeur': valeur,
                                'date_evaluation': date_evaluation
                            }
                        )
                        
                        notes_ajoutees += 1
                    except (ValueError, TypeError):
                        # Ignorer les valeurs non valides
                        pass
            
            if notes_ajoutees > 0:
                messages.success(request, f'{notes_ajoutees} note(s) enregistrée(s) avec succès.')
            else:
                messages.warning(request, 'Aucune note n\'a été enregistrée. Vérifiez les valeurs saisies.')
        
        return redirect(f'{reverse("base:notes-par-classe")}?classe={classe_id}&matiere={matiere_id}&trimestre={trimestre}')


# Vues pour la gestion des bulletins
class BulletinListView(ListView):
    model = Bulletin
    template_name = 'base/bulletin/list.html'
    context_object_name = 'bulletins'
    paginate_by = 10
    
    def get_queryset(self):
        queryset = super().get_queryset()
        classe_id = self.request.GET.get('classe', '')
        etudiant_id = self.request.GET.get('etudiant', '')
        trimestre = self.request.GET.get('trimestre', '')
        annee = self.request.GET.get('annee_scolaire', '')
        
        if classe_id:
            queryset = queryset.filter(etudiant__classe_id=classe_id)
            
        if etudiant_id:
            queryset = queryset.filter(etudiant_id=etudiant_id)
            
        if trimestre:
            queryset = queryset.filter(trimestre=trimestre)
            
        if annee:
            queryset = queryset.filter(annee_scolaire=annee)
            
        return queryset.order_by('-date_generation')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['classes'] = Classe.objects.all().order_by('nom')
        context['etudiants'] = Etudiant.objects.all().order_by('nom', 'prenom')
        context['annees_scolaires'] = Bulletin.objects.values_list('annee_scolaire', flat=True).distinct()
        
        context['classe_filter'] = self.request.GET.get('classe', '')
        context['etudiant_filter'] = self.request.GET.get('etudiant', '')
        context['trimestre_filter'] = self.request.GET.get('trimestre', '')
        context['annee_filter'] = self.request.GET.get('annee_scolaire', '')
        
        return context

class BulletinDetailView(DetailView):
    model = Bulletin
    template_name = 'base/bulletin/detail.html'
    context_object_name = 'bulletin'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        bulletin = self.get_object()
        
        # Rechercher les résultats par matière
        resultats_matieres = []
        for matiere in Matiere.objects.filter(classes=bulletin.etudiant.classe):
            notes = Note.objects.filter(
                etudiant=bulletin.etudiant,
                matiere=matiere,
                trimestre=bulletin.trimestre
            )
            
            if notes.exists():
                moyenne = notes.aggregate(Avg('valeur'))['valeur__avg']
                
                # Calculer le rang de l'étudiant dans cette matière
                rang = 1
                for etudiant in Etudiant.objects.filter(classe=bulletin.etudiant.classe):
                    notes_etudiant = Note.objects.filter(
                        etudiant=etudiant,
                        matiere=matiere,
                        trimestre=bulletin.trimestre
                    )
                    if notes_etudiant.exists():
                        moyenne_etudiant = notes_etudiant.aggregate(Avg('valeur'))['valeur__avg']
                        if moyenne_etudiant > moyenne and etudiant.id != bulletin.etudiant.id:
                            rang += 1
                
                # Statistiques de la classe pour cette matière
                notes_classe = Note.objects.filter(
                    etudiant__classe=bulletin.etudiant.classe,
                    matiere=matiere,
                    trimestre=bulletin.trimestre
                )
                
                moyenne_classe = notes_classe.aggregate(Avg('valeur'))['valeur__avg'] or 0
                moyenne_min = notes_classe.aggregate(Min('valeur'))['valeur__min'] or 0
                moyenne_max = notes_classe.aggregate(Max('valeur'))['valeur__max'] or 0
                
                resultats_matieres.append({
                    'matiere': matiere,
                    'moyenne': moyenne,
                    'rang': rang,
                    'moyenne_classe': moyenne_classe,
                    'moyenne_min': moyenne_min,
                    'moyenne_max': moyenne_max
                })
        
        context['resultats_matieres'] = resultats_matieres
        
        # Récupérer les absences
        absences = Absence.objects.filter(
            etudiant=bulletin.etudiant,
            date_debut__year=int(bulletin.annee_scolaire.split('-')[0])
        )
        context['absences_count'] = sum(absence.duree() for absence in absences)
        context['retards_count'] = absences.filter(motif__icontains='retard').count()
        
        return context

class BulletinPDFView(View):
    def get(self, request, pk):
        bulletin = get_object_or_404(Bulletin, pk=pk)
        
        # Récupérer les résultats par matière (identique à BulletinDetailView)
        resultats_matieres = []
        for matiere in Matiere.objects.filter(classes=bulletin.etudiant.classe):
            notes = Note.objects.filter(
                etudiant=bulletin.etudiant,
                matiere=matiere,
                trimestre=bulletin.trimestre
            )
            
            if notes.exists():
                moyenne = notes.aggregate(Avg('valeur'))['valeur__avg']
                
                # Rang
                rang = 1
                for etudiant in Etudiant.objects.filter(classe=bulletin.etudiant.classe):
                    notes_etudiant = Note.objects.filter(
                        etudiant=etudiant,
                        matiere=matiere,
                        trimestre=bulletin.trimestre
                    )
                    if notes_etudiant.exists():
                        moyenne_etudiant = notes_etudiant.aggregate(Avg('valeur'))['valeur__avg']
                        if moyenne_etudiant > moyenne and etudiant.id != bulletin.etudiant.id:
                            rang += 1
                
                # Statistiques
                notes_classe = Note.objects.filter(
                    etudiant__classe=bulletin.etudiant.classe,
                    matiere=matiere,
                    trimestre=bulletin.trimestre
                )
                
                moyenne_classe = notes_classe.aggregate(Avg('valeur'))['valeur__avg'] or 0
                moyenne_min = notes_classe.aggregate(Min('valeur'))['valeur__min'] or 0
                moyenne_max = notes_classe.aggregate(Max('valeur'))['valeur__max'] or 0
                
                resultats_matieres.append({
                    'matiere': matiere,
                    'moyenne': moyenne,
                    'rang': rang,
                    'moyenne_classe': moyenne_classe,
                    'moyenne_min': moyenne_min,
                    'moyenne_max': moyenne_max
                })
        
        # Récupérer les absences
        absences = Absence.objects.filter(
            etudiant=bulletin.etudiant,
            date_debut__year=int(bulletin.annee_scolaire.split('-')[0])
        )
        absences_count = sum(absence.duree() for absence in absences)
        retards_count = absences.filter(motif__icontains='retard').count()
        
        # Préparer le contexte pour le template PDF
        context = {
            'bulletin': bulletin,
            'resultats_matieres': resultats_matieres,
            'absences_count': absences_count,
            'retards_count': retards_count,
        }
        
        # Générer le PDF
        template = get_template('base/bulletin/pdf_template.html')
        html = template.render(context)
        
        # Créer la réponse PDF
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename=bulletin_{bulletin.etudiant.nom}_{bulletin.trimestre}_{bulletin.annee_scolaire}.pdf'
        
        # Convertir HTML en PDF
        buffer = io.BytesIO()
        pisa_status = pisa.CreatePDF(html, dest=buffer)
        
        if not pisa_status.err:
            response.write(buffer.getvalue())
            buffer.close()
            return response
        return HttpResponse('Erreur lors de la génération du PDF', status=400)

class BulletinDeleteView(DeleteView):
    model = Bulletin
    template_name = 'base/bulletin/confirm_delete.html'
    context_object_name = 'bulletin'
    success_url = reverse_lazy('base:bulletin-list')
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Bulletin supprimé avec succès !')
        return super().delete(request, *args, **kwargs)

# Classe pour le formulaire de génération de bulletins
class BulletinGenerationForm(forms.Form):
    classe = forms.ModelChoiceField(queryset=Classe.objects.all(), required=False)
    etudiant = forms.ModelChoiceField(queryset=Etudiant.objects.all(), required=False)
    trimestre = forms.ChoiceField(choices=[(1, '1er Trimestre'), (2, '2ème Trimestre'), (3, '3ème Trimestre')])
    annee_scolaire = forms.CharField(max_length=9)
    type_generation = forms.ChoiceField(choices=[('classe', 'Par classe'), ('etudiant', 'Par étudiant')])
    appreciation = forms.CharField(widget=forms.Textarea, required=False)
    date_emission = forms.DateField(initial=timezone.now().date())

class GenererBulletinView(View):
    template_name = 'base/bulletin/generer.html'
    
    def get(self, request):
        form = BulletinGenerationForm(initial={
            'annee_scolaire': f'{timezone.now().year}-{timezone.now().year + 1}',
            'type_generation': 'classe',
            'date_emission': timezone.now().date()
        })
        
        context = {
            'form': form,
            'classes': Classe.objects.all().order_by('nom'),
            'etudiants': Etudiant.objects.all().order_by('nom', 'prenom'),
            'today': timezone.now().date().strftime('%Y-%m-%d'),
            'annee_actuelle': f'{timezone.now().year}-{timezone.now().year + 1}'
        }
        
        return render(request, self.template_name, context)
    
    def post(self, request):
        form = BulletinGenerationForm(request.POST)
        
        if form.is_valid():
            # Récupérer les données du formulaire
            type_generation = form.cleaned_data['type_generation']
            trimestre = int(form.cleaned_data['trimestre'])
            annee_scolaire = form.cleaned_data['annee_scolaire']
            appreciation = form.cleaned_data['appreciation']
            date_emission = form.cleaned_data['date_emission']
            
            bulletins_crees = 0
            
            # Génération par classe
            if type_generation == 'classe' and form.cleaned_data['classe']:
                classe = form.cleaned_data['classe']
                etudiants = Etudiant.objects.filter(classe=classe)
                
                for etudiant in etudiants:
                    # Vérifier si un bulletin existe déjà pour cet étudiant, ce trimestre et cette année scolaire
                    bulletin, created = Bulletin.objects.get_or_create(
                        etudiant=etudiant,
                        trimestre=trimestre,
                        annee_scolaire=annee_scolaire,
                        defaults={
                            'date_generation': date_emission,
                            'appreciation': appreciation
                        }
                    )
                    
                    if not created:
                        # Mettre à jour le bulletin existant
                        bulletin.date_generation = date_emission
                        bulletin.appreciation = appreciation
                        bulletin.save()
                    
                    # Calculer la moyenne générale
                    bulletin.calculer_moyenne()
                    
                    # Calculer le rang de l'étudiant
                    bulletin.calculer_rang()
                    
                    bulletins_crees += 1
            
            # Génération pour un étudiant spécifique
            elif type_generation == 'etudiant' and form.cleaned_data['etudiant']:
                etudiant = form.cleaned_data['etudiant']
                
                # Vérifier si un bulletin existe déjà
                bulletin, created = Bulletin.objects.get_or_create(
                    etudiant=etudiant,
                    trimestre=trimestre,
                    annee_scolaire=annee_scolaire,
                    defaults={
                        'date_generation': date_emission,
                        'appreciation': appreciation
                    }
                )
                
                if not created:
                    # Mettre à jour le bulletin existant
                    bulletin.date_generation = date_emission
                    bulletin.appreciation = appreciation
                    bulletin.save()
                
                # Calculer la moyenne générale
                bulletin.calculer_moyenne()
                
                # Calculer le rang de l'étudiant
                bulletin.calculer_rang()
                
                bulletins_crees += 1
            
            # Générer les statistiques de la classe
            if form.cleaned_data['classe']:
                classe = form.cleaned_data['classe']
                stat, created = Statistique.objects.get_or_create(
                    classe=classe,
                    trimestre=trimestre,
                    annee_scolaire=annee_scolaire,
                    defaults={
                        'date_generation': date_emission
                    }
                )
                
                # Générer les statistiques
                stat.generer()
            
            if bulletins_crees > 0:
                messages.success(request, f'{bulletins_crees} bulletin(s) généré(s) avec succès.')
                return redirect('base:bulletin-list')
            else:
                messages.error(request, 'Aucun bulletin généré. Vérifiez les paramètres.')
        
        # En cas d'erreur, réafficher le formulaire
        context = {
            'form': form,
            'classes': Classe.objects.all().order_by('nom'),
            'etudiants': Etudiant.objects.all().order_by('nom', 'prenom'),
            'today': timezone.now().date().strftime('%Y-%m-%d'),
            'annee_actuelle': f'{timezone.now().year}-{timezone.now().year + 1}'
        }
        
        return render(request, self.template_name, context)
# API pour récupérer les étudiants par classe (utilisé dans le formulaire de génération des bulletins)
def etudiants_par_classe(request):
    classe_id = request.GET.get('classe', None)
    if classe_id:
        etudiants = Etudiant.objects.filter(classe_id=classe_id).values('id', 'nom', 'prenom')
        return JsonResponse({'etudiants': list(etudiants)})
    return JsonResponse({'etudiants': []})
