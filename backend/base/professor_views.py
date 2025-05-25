from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import Avg, Count, Q
from django.contrib import messages
from django.http import JsonResponse
from django import forms
from .models import Etudiant, Classe, Matiere, Note, Bulletin, Professeur
from .dashboard_views import ProfesseurRequiredMixin

# Formulaire pour ajouter/modifier des notes
class NoteForm(forms.ModelForm):
    class Meta:
        model = Note
        fields = ['etudiant', 'matiere', 'valeur', 'date_evaluation', 'type_evaluation', 'commentaire', 'trimestre']
        widgets = {
            'date_evaluation': forms.DateInput(attrs={'type': 'date'}),
            'commentaire': forms.Textarea(attrs={'rows': 3}),
        }
    
    def __init__(self, professeur=None, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if professeur:
            # Filtrer les matières enseignées par ce professeur
            self.fields['matiere'].queryset = Matiere.objects.filter(professeur=professeur)
            # Filtrer les étudiants dans les classes où ce professeur enseigne
            matieres = Matiere.objects.filter(professeur=professeur)
            classes = Classe.objects.filter(matiere__in=matieres).distinct()
            self.fields['etudiant'].queryset = Etudiant.objects.filter(classe__in=classes)

# Vue pour la liste des notes du professeur
class ProfesseurNoteListView(LoginRequiredMixin, ProfesseurRequiredMixin, ListView):
    model = Note
    template_name = 'base/professeur/note_list.html'
    context_object_name = 'notes'
    paginate_by = 20
    
    def get_queryset(self):
        professeur = get_object_or_404(Professeur, user=self.request.user)
        queryset = Note.objects.filter(matiere__professeur=professeur)
        
        # Filtres
        etudiant_id = self.request.GET.get('etudiant')
        classe_id = self.request.GET.get('classe')
        matiere_id = self.request.GET.get('matiere')
        trimestre = self.request.GET.get('trimestre')
        
        if etudiant_id:
            queryset = queryset.filter(etudiant_id=etudiant_id)
        if classe_id:
            queryset = queryset.filter(etudiant__classe_id=classe_id)
        if matiere_id:
            queryset = queryset.filter(matiere_id=matiere_id)
        if trimestre:
            queryset = queryset.filter(trimestre=trimestre)
            
        return queryset.order_by('-date_evaluation')
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        professeur = get_object_or_404(Professeur, user=self.request.user)
        
        matieres = Matiere.objects.filter(professeur=professeur)
        classes = Classe.objects.filter(matiere__in=matieres).distinct()
        etudiants = Etudiant.objects.filter(classe__in=classes)
        
        context['matieres'] = matieres
        context['classes'] = classes
        context['etudiants'] = etudiants
        context['trimestres'] = [(1, '1er Trimestre'), (2, '2ème Trimestre'), (3, '3ème Trimestre')]
        context['professeur'] = professeur
        
        return context

# Vue pour ajouter une note
class ProfesseurNoteCreateView(LoginRequiredMixin, ProfesseurRequiredMixin, CreateView):
    model = Note
    template_name = 'base/professeur/note_form.html'
    form_class = NoteForm
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['professeur'] = get_object_or_404(Professeur, user=self.request.user)
        return kwargs
    
    def get_success_url(self):
        return reverse_lazy('base:professeur-note-list')
    
    def form_valid(self, form):
        messages.success(self.request, 'Note ajoutée avec succès!')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Ajouter une note'
        context['button_text'] = 'Ajouter'
        return context

# Vue pour modifier une note
class ProfesseurNoteUpdateView(LoginRequiredMixin, ProfesseurRequiredMixin, UpdateView):
    model = Note
    template_name = 'base/professeur/note_form.html'
    form_class = NoteForm
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['professeur'] = get_object_or_404(Professeur, user=self.request.user)
        return kwargs
    
    def get_queryset(self):
        professeur = get_object_or_404(Professeur, user=self.request.user)
        return Note.objects.filter(matiere__professeur=professeur)
    
    def get_success_url(self):
        return reverse_lazy('base:professeur-note-list')
    
    def form_valid(self, form):
        messages.success(self.request, 'Note mise à jour avec succès!')
        return super().form_valid(form)
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['title'] = 'Modifier une note'
        context['button_text'] = 'Enregistrer'
        return context

# Vue pour supprimer une note
class ProfesseurNoteDeleteView(LoginRequiredMixin, ProfesseurRequiredMixin, DeleteView):
    model = Note
    template_name = 'base/professeur/note_confirm_delete.html'
    context_object_name = 'note'
    
    def get_queryset(self):
        professeur = get_object_or_404(Professeur, user=self.request.user)
        return Note.objects.filter(matiere__professeur=professeur)
    
    def get_success_url(self):
        return reverse_lazy('base:professeur-note-list')
    
    def delete(self, request, *args, **kwargs):
        messages.success(self.request, 'Note supprimée avec succès!')
        return super().delete(request, *args, **kwargs)

# Vue pour la gestion des notes par classe (plus pratique pour le professeur)
class ProfesseurNotesParClasseView(LoginRequiredMixin, ProfesseurRequiredMixin, View):
    template_name = 'base/professeur/notes_par_classe.html'
    
    def get(self, request):
        professeur = get_object_or_404(Professeur, user=request.user)
        matieres = Matiere.objects.filter(professeur=professeur)
        classes = Classe.objects.filter(matiere__in=matieres).distinct()
        
        context = {
            'professeur': professeur,
            'classes': classes,
            'matieres': matieres,
            'trimestres': [(1, '1er Trimestre'), (2, '2ème Trimestre'), (3, '3ème Trimestre')],
        }
        
        # Si des filtres sont sélectionnés, récupérer les étudiants et leurs notes
        classe_id = request.GET.get('classe')
        matiere_id = request.GET.get('matiere')
        trimestre = request.GET.get('trimestre')
        
        if classe_id and matiere_id and trimestre:
            classe = get_object_or_404(Classe, id=classe_id)
            matiere = get_object_or_404(Matiere, id=matiere_id)
            
            # Vérifier que le professeur enseigne cette matière
            if matiere.professeur != professeur:
                messages.error(request, "Vous n'êtes pas autorisé à gérer cette matière.")
                return redirect('base:professeur-dashboard')
            
            etudiants = Etudiant.objects.filter(classe=classe).order_by('nom', 'prenom')
            notes_data = []
            
            for etudiant in etudiants:
                note = Note.objects.filter(
                    etudiant=etudiant,
                    matiere=matiere,
                    trimestre=trimestre
                ).first()
                
                notes_data.append({
                    'etudiant': etudiant,
                    'note': note
                })
            
            context['etudiants'] = etudiants
            context['notes_data'] = notes_data
            context['selected_classe'] = classe
            context['selected_matiere'] = matiere
            context['selected_trimestre'] = int(trimestre)
        
        return render(request, self.template_name, context)
    
    def post(self, request):
        professeur = get_object_or_404(Professeur, user=request.user)
        classe_id = request.POST.get('classe_id')
        matiere_id = request.POST.get('matiere_id')
        trimestre = request.POST.get('trimestre')
        
        if not all([classe_id, matiere_id, trimestre]):
            messages.error(request, "Données manquantes.")
            return redirect('base:professeur-notes-par-classe')
        
        classe = get_object_or_404(Classe, id=classe_id)
        matiere = get_object_or_404(Matiere, id=matiere_id, professeur=professeur)
        
        # Traiter les notes pour tous les étudiants
        etudiants = Etudiant.objects.filter(classe=classe)
        for etudiant in etudiants:
            valeur_key = f'valeur_{etudiant.id}'
            commentaire_key = f'commentaire_{etudiant.id}'
            
            if valeur_key in request.POST and request.POST[valeur_key]:
                valeur = request.POST[valeur_key]
                commentaire = request.POST.get(commentaire_key, '')
                
                # Créer ou mettre à jour la note
                note, created = Note.objects.update_or_create(
                    etudiant=etudiant,
                    matiere=matiere,
                    trimestre=trimestre,
                    type_evaluation='Examen',  # Valeur par défaut
                    defaults={
                        'valeur': valeur,
                        'commentaire': commentaire
                    }
                )
        
        messages.success(request, "Notes enregistrées avec succès!")
        return redirect(f'{request.path}?classe={classe_id}&matiere={matiere_id}&trimestre={trimestre}')

# Vue pour générer des bulletins
class ProfesseurGenererBulletinView(LoginRequiredMixin, ProfesseurRequiredMixin, View):
    template_name = 'base/professeur/generer_bulletin.html'
    
    def get(self, request):
        professeur = get_object_or_404(Professeur, user=request.user)
        matieres = Matiere.objects.filter(professeur=professeur)
        classes = Classe.objects.filter(matiere__in=matieres).distinct()
        
        context = {
            'professeur': professeur,
            'classes': classes,
            'trimestres': [(1, '1er Trimestre'), (2, '2ème Trimestre'), (3, '3ème Trimestre')],
        }
        
        # Si une classe est sélectionnée, afficher les étudiants
        classe_id = request.GET.get('classe')
        if classe_id:
            classe = get_object_or_404(Classe, id=classe_id)
            etudiants = Etudiant.objects.filter(classe=classe).order_by('nom', 'prenom')
            context['etudiants'] = etudiants
            context['selected_classe'] = classe
        
        return render(request, self.template_name, context)
    
    def post(self, request):
        professeur = get_object_or_404(Professeur, user=request.user)
        classe_id = request.POST.get('classe')
        trimestre = request.POST.get('trimestre')
        annee_scolaire = request.POST.get('annee_scolaire', '2024-2025')
        selected_etudiants = request.POST.getlist('etudiants')
        
        if not all([classe_id, trimestre, annee_scolaire]) or not selected_etudiants:
            messages.error(request, "Données manquantes.")
            return redirect('base:professeur-generer-bulletin')
        
        classe = get_object_or_404(Classe, id=classe_id)
        
        # Vérifier que le professeur enseigne bien dans cette classe
        matieres_professeur = Matiere.objects.filter(professeur=professeur)
        if not classe.matiere_set.filter(id__in=matieres_professeur.values_list('id', flat=True)).exists():
            messages.error(request, "Vous n'êtes pas autorisé à générer des bulletins pour cette classe.")
            return redirect('base:professeur-dashboard')
        
        # Générer les bulletins pour les étudiants sélectionnés
        bulletins_generes = 0
        for etudiant_id in selected_etudiants:
            etudiant = get_object_or_404(Etudiant, id=etudiant_id, classe=classe)
            
            # Vérifier que l'étudiant a des notes pour le trimestre concerné
            notes = Note.objects.filter(etudiant=etudiant, trimestre=trimestre)
            if not notes.exists():
                continue
            
            # Créer ou mettre à jour le bulletin
            bulletin, created = Bulletin.objects.update_or_create(
                etudiant=etudiant,
                trimestre=trimestre,
                annee_scolaire=annee_scolaire,
                defaults={
                    'appreciation': f"Bulletin généré par {professeur.prenom} {professeur.nom}"
                }
            )
            
            # Calculer la moyenne et le rang
            bulletin.calculer_moyenne()
            bulletin.calculer_rang()
            bulletins_generes += 1
        
        if bulletins_generes > 0:
            messages.success(request, f"{bulletins_generes} bulletin(s) généré(s) avec succès!")
        else:
            messages.warning(request, "Aucun bulletin n'a été généré. Vérifiez que les étudiants ont des notes pour ce trimestre.")
        
        return redirect('base:professeur-generer-bulletin') 