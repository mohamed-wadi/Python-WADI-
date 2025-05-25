from django.views.generic import View, TemplateView
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.db.models import Avg, Count, Sum, F, Q
from .models import Classe, Matiere, Etudiant, Note, Professeur
from django.urls import reverse

class GestionEtudiantsClasseView(View):
    template_name = 'base/classe/gestion_etudiants.html'
    
    def get(self, request, classe_id):
        classe = get_object_or_404(Classe, id=classe_id)
        etudiants_classe = Etudiant.objects.filter(classe=classe).order_by('nom', 'prenom')
        etudiants_disponibles = Etudiant.objects.filter(
            Q(classe__isnull=True) | 
            ~Q(classe=classe)
        ).order_by('nom', 'prenom')
        
        context = {
            'classe': classe,
            'etudiants_classe': etudiants_classe,
            'etudiants_disponibles': etudiants_disponibles,
        }
        return render(request, self.template_name, context)
    
    def post(self, request, classe_id):
        classe = get_object_or_404(Classe, id=classe_id)
        action = request.POST.get('action')
        etudiant_id = request.POST.get('etudiant_id')
        
        if not etudiant_id:
            messages.error(request, 'Aucun u00e9tudiant su00e9lectionnu00e9.')
            return redirect('base:gestion-etudiants-classe', classe_id=classe.id)
        
        etudiant = get_object_or_404(Etudiant, id=etudiant_id)
        
        if action == 'ajouter':
            etudiant.classe = classe
            etudiant.save()
            messages.success(request, f"L'u00e9tudiant {etudiant.prenom} {etudiant.nom} a u00e9tu00e9 ajoutu00e9 u00e0 la classe {classe.nom}.")
        
        elif action == 'supprimer':
            etudiant.classe = None
            etudiant.save()
            messages.success(request, f"L'u00e9tudiant {etudiant.prenom} {etudiant.nom} a u00e9tu00e9 retiru00e9 de la classe {classe.nom}.")
        
        return redirect('base:gestion-etudiants-classe', classe_id=classe.id)


class GestionMatieresClasseView(View):
    template_name = 'base/classe/gestion_matieres.html'
    
    def get(self, request, classe_id):
        classe = get_object_or_404(Classe, id=classe_id)
        matieres_classe = classe.matieres.all().order_by('nom')
        matieres_disponibles = Matiere.objects.exclude(id__in=matieres_classe.values_list('id', flat=True)).order_by('nom')
        
        context = {
            'classe': classe,
            'matieres_classe': matieres_classe,
            'matieres_disponibles': matieres_disponibles,
        }
        return render(request, self.template_name, context)
    
    def post(self, request, classe_id):
        classe = get_object_or_404(Classe, id=classe_id)
        action = request.POST.get('action')
        matiere_id = request.POST.get('matiere_id')
        
        if not matiere_id:
            messages.error(request, 'Aucune matiu00e8re su00e9lectionnu00e9e.')
            return redirect('base:gestion-matieres-classe', classe_id=classe.id)
        
        matiere = get_object_or_404(Matiere, id=matiere_id)
        
        if action == 'ajouter':
            classe.matieres.add(matiere)
            messages.success(request, f"La matiu00e8re {matiere.nom} a u00e9tu00e9 ajoutu00e9e u00e0 la classe {classe.nom}.")
        
        elif action == 'supprimer':
            classe.matieres.remove(matiere)
            messages.success(request, f"La matiu00e8re {matiere.nom} a u00e9tu00e9 retiru00e9e de la classe {classe.nom}.")
        
        return redirect('base:gestion-matieres-classe', classe_id=classe.id)


class EmploiDuTempsClasseView(TemplateView):
    template_name = 'base/classe/emploi_du_temps.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        classe_id = self.kwargs.get('classe_id')
        classe = get_object_or_404(Classe, id=classe_id)
        
        context['classe'] = classe
        context['matieres'] = classe.matieres.all()
        context['jours'] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        context['heures'] = [
            '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
            '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00'
        ]
        
        return context


class StatistiquesClasseView(TemplateView):
    template_name = 'base/classe/statistiques.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        classe_id = self.kwargs.get('classe_id')
        classe = get_object_or_404(Classe, id=classe_id)
        
        # Informations de base
        context['classe'] = classe
        context['nb_etudiants'] = Etudiant.objects.filter(classe=classe).count()
        context['nb_matieres'] = classe.matieres.count()
        
        # Calculer la moyenne de la classe
        notes_classe = Note.objects.filter(etudiant__classe=classe)
        if notes_classe.exists():
            context['moyenne_classe'] = notes_classe.aggregate(avg=Avg('valeur'))['avg']
        
        # Calculer les moyennes par matiu00e8re
        matieres_classe = classe.matieres.all()
        moyennes_matieres = []
        
        for matiere in matieres_classe:
            notes_matiere = Note.objects.filter(etudiant__classe=classe, matiere=matiere)
            if notes_matiere.exists():
                moyenne = notes_matiere.aggregate(avg=Avg('valeur'))['avg']
                moyennes_matieres.append({
                    'matiere': matiere,
                    'moyenne': moyenne
                })
            else:
                moyennes_matieres.append({
                    'matiere': matiere,
                    'moyenne': None
                })
        
        context['moyennes_matieres'] = moyennes_matieres
        
        return context
