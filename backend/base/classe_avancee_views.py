from django.views.generic import View, TemplateView
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.urls import reverse
from django.http import JsonResponse
from .models import Classe, Etudiant, Matiere, Professeur

class GestionEtudiantsClasseView(View):
    template_name = 'base/classe/gestion_etudiants.html'
    
    def get(self, request, pk):
        classe = get_object_or_404(Classe, pk=pk)
        # Étudiants déjà dans la classe
        etudiants_classe = Etudiant.objects.filter(classe=classe)
        # Étudiants non assignés à cette classe
        etudiants_disponibles = Etudiant.objects.filter(classe__isnull=True)
        
        context = {
            'classe': classe,
            'etudiants_classe': etudiants_classe,
            'etudiants_disponibles': etudiants_disponibles
        }
        return render(request, self.template_name, context)
    
    def post(self, request, pk):
        classe = get_object_or_404(Classe, pk=pk)
        action = request.POST.get('action')
        etudiant_id = request.POST.get('etudiant_id')
        
        if not etudiant_id:
            messages.error(request, 'Aucun étudiant sélectionné')
            return redirect('gestion-etudiants-classe', pk=pk)
        
        etudiant = get_object_or_404(Etudiant, pk=etudiant_id)
        
        if action == 'ajouter':
            # Ajouter l'étudiant à la classe
            etudiant.classe = classe
            etudiant.save()
            messages.success(request, f'L\'étudiant {etudiant.prenom} {etudiant.nom} a été ajouté à la classe {classe.nom}')
        
        elif action == 'supprimer':
            # Retirer l'étudiant de la classe
            etudiant.classe = None
            etudiant.save()
            messages.success(request, f'L\'étudiant {etudiant.prenom} {etudiant.nom} a été retiré de la classe {classe.nom}')
        
        return redirect('gestion-etudiants-classe', pk=pk)

class GestionMatieresClasseView(View):
    template_name = 'base/classe/gestion_matieres.html'
    
    def get(self, request, pk):
        classe = get_object_or_404(Classe, pk=pk)
        # Matières déjà associées à la classe
        matieres_classe = classe.matiere_set.all()
        # Matières non associées à cette classe
        matieres_disponibles = Matiere.objects.exclude(classes=classe)
        
        context = {
            'classe': classe,
            'matieres_classe': matieres_classe,
            'matieres_disponibles': matieres_disponibles,
            'professeurs': Professeur.objects.all()
        }
        return render(request, self.template_name, context)
    
    def post(self, request, pk):
        classe = get_object_or_404(Classe, pk=pk)
        action = request.POST.get('action')
        matiere_id = request.POST.get('matiere_id')
        
        if not matiere_id:
            messages.error(request, 'Aucune matière sélectionnée')
            return redirect('gestion-matieres-classe', pk=pk)
        
        matiere = get_object_or_404(Matiere, pk=matiere_id)
        
        if action == 'ajouter':
            # Ajouter la matière à la classe
            matiere.classes.add(classe)
            messages.success(request, f'La matière {matiere.nom} a été ajoutée à la classe {classe.nom}')
        
        elif action == 'supprimer':
            # Retirer la matière de la classe
            matiere.classes.remove(classe)
            messages.success(request, f'La matière {matiere.nom} a été retirée de la classe {classe.nom}')
        
        return redirect('gestion-matieres-classe', pk=pk)

class EmploiDuTempsClasseView(TemplateView):
    template_name = 'base/classe/emploi_du_temps.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        classe_id = self.kwargs.get('pk')
        classe = get_object_or_404(Classe, pk=classe_id)
        
        # Structure de l'emploi du temps
        jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        heures = [
            '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
            '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00'
        ]
        
        # Récupérer les matières de la classe
        matieres = classe.matiere_set.all().prefetch_related('professeur')
        
        context.update({
            'classe': classe,
            'jours': jours,
            'heures': heures,
            'matieres': matieres
        })
        return context

class StatistiquesClasseView(TemplateView):
    template_name = 'base/classe/statistiques.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        classe_id = self.kwargs.get('pk')
        classe = get_object_or_404(Classe, pk=classe_id)
        
        # Statistiques générales
        nb_etudiants = Etudiant.objects.filter(classe=classe).count()
        nb_matieres = classe.matiere_set.count()
        
        # Moyennes par matière
        matieres = classe.matiere_set.all()
        moyennes_matieres = []
        
        for matiere in matieres:
            moyenne = matiere.moyenne_matiere(classe=classe)
            if moyenne:
                moyennes_matieres.append({
                    'matiere': matiere,
                    'moyenne': moyenne
                })
        
        # Moyenne générale de la classe
        moyenne_classe = classe.moyenne_generale()
        
        context.update({
            'classe': classe,
            'nb_etudiants': nb_etudiants,
            'nb_matieres': nb_matieres,
            'moyennes_matieres': moyennes_matieres,
            'moyenne_classe': moyenne_classe
        })
        return context
