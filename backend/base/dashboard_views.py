from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.db.models import Avg, Count, Q
from django.contrib import messages
from .models import Etudiant, Professeur, Classe, Matiere, Note, Bulletin, Cours, Absence

# Mixins pour vérifier les rôles des utilisateurs
class EtudiantRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.groups.filter(name='Etudiants').exists()

class ProfesseurRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.groups.filter(name='Professeurs').exists()

class AdminRequiredMixin(UserPassesTestMixin):
    def test_func(self):
        return self.request.user.is_staff or self.request.user.is_superuser

# Dashboard pour les étudiants
class EtudiantDashboardView(LoginRequiredMixin, EtudiantRequiredMixin, View):
    template_name = 'base/dashboard/etudiant_dashboard.html'
    
    def get(self, request):
        # Récupérer le profil étudiant associé à l'utilisateur
        etudiant = get_object_or_404(Etudiant, user=request.user)
        
        # Récupérer les notes de l'étudiant
        notes = Note.objects.filter(etudiant=etudiant).order_by('matiere__nom', 'trimestre')
        
        # Calculer la moyenne par matière et par trimestre
        moyennes_par_matiere = []
        for matiere in Matiere.objects.filter(note__etudiant=etudiant).distinct():
            for trimestre in [1, 2, 3]:
                notes_matiere_trimestre = Note.objects.filter(
                    etudiant=etudiant, 
                    matiere=matiere,
                    trimestre=trimestre
                )
                if notes_matiere_trimestre.exists():
                    moyenne = notes_matiere_trimestre.aggregate(Avg('valeur'))['valeur__avg']
                    moyennes_par_matiere.append({
                        'matiere': matiere,
                        'trimestre': trimestre,
                        'moyenne': moyenne
                    })
        
        # Récupérer les bulletins
        bulletins = Bulletin.objects.filter(etudiant=etudiant).order_by('-trimestre')
        
        # Récupérer l'emploi du temps
        emploi_du_temps = Cours.objects.filter(
            classe=etudiant.classe
        ).order_by('jour', 'heure_debut')
        
        # Récupérer les absences
        absences = Absence.objects.filter(etudiant=etudiant).order_by('-date_debut')
        
        context = {
            'etudiant': etudiant,
            'notes': notes,
            'moyennes_par_matiere': moyennes_par_matiere,
            'bulletins': bulletins,
            'emploi_du_temps': emploi_du_temps,
            'absences': absences,
        }
        return render(request, self.template_name, context)

# Dashboard pour les professeurs
class ProfesseurDashboardView(LoginRequiredMixin, ProfesseurRequiredMixin, View):
    template_name = 'base/dashboard/professeur_dashboard.html'
    
    def get(self, request):
        # Récupérer le profil professeur associé à l'utilisateur
        professeur = get_object_or_404(Professeur, user=request.user)
        
        # Récupérer les matières enseignées par le professeur
        matieres = Matiere.objects.filter(professeur=professeur)
        
        # Récupérer les classes du professeur
        classes = Classe.objects.filter(matiere__professeur=professeur).distinct()
        
        # Récupérer l'emploi du temps du professeur
        emploi_du_temps = Cours.objects.filter(
            professeur=professeur
        ).order_by('jour', 'heure_debut')
        
        # Statistiques: nombre d'étudiants par classe
        statistiques_classes = []
        for classe in classes:
            statistiques_classes.append({
                'classe': classe,
                'nb_etudiants': Etudiant.objects.filter(classe=classe).count(),
                'moyenne_generale': classe.moyenne_generale()
            })
        
        context = {
            'professeur': professeur,
            'matieres': matieres,
            'classes': classes,
            'emploi_du_temps': emploi_du_temps,
            'statistiques_classes': statistiques_classes,
        }
        return render(request, self.template_name, context)

# Dashboard pour les administrateurs
class AdminDashboardView(LoginRequiredMixin, AdminRequiredMixin, View):
    template_name = 'base/dashboard/admin_dashboard.html'
    
    def get(self, request):
        # Statistiques générales
        nb_etudiants = Etudiant.objects.count()
        nb_professeurs = Professeur.objects.count()
        nb_classes = Classe.objects.count()
        nb_matieres = Matiere.objects.count()
        
        # Répartition des étudiants par classe
        classes = Classe.objects.all()
        repartition_classes = []
        for classe in classes:
            repartition_classes.append({
                'classe': classe,
                'nb_etudiants': Etudiant.objects.filter(classe=classe).count(),
            })
        
        # Répartition des matières par professeur
        professeurs = Professeur.objects.all()
        repartition_matieres = []
        for prof in professeurs:
            repartition_matieres.append({
                'professeur': prof,
                'nb_matieres': Matiere.objects.filter(professeur=prof).count(),
            })
        
        context = {
            'nb_etudiants': nb_etudiants,
            'nb_professeurs': nb_professeurs,
            'nb_classes': nb_classes,
            'nb_matieres': nb_matieres,
            'repartition_classes': repartition_classes,
            'repartition_matieres': repartition_matieres,
        }
        return render(request, self.template_name, context) 