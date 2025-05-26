from django.contrib import admin
from .models import Classe, Professeur, Matiere, Etudiant, Note, Bulletin, Absence, Statistique, Cours

# Personnalisation des interfaces d'administration

class ClasseAdmin(admin.ModelAdmin):
    list_display = ('nom', 'niveau', 'filiere', 'annee_scolaire', 'nombre_etudiants')
    search_fields = ('nom', 'niveau')
    list_filter = ('niveau', 'filiere', 'annee_scolaire')

class ProfesseurAdmin(admin.ModelAdmin):
    list_display = ('nom', 'prenom', 'email', 'specialite', 'date_embauche')
    search_fields = ('nom', 'prenom', 'email', 'specialite')
    list_filter = ('specialite', 'date_embauche')

class MatiereAdmin(admin.ModelAdmin):
    list_display = ('nom', 'code', 'coefficient', 'professeur')
    search_fields = ('nom', 'code')
    list_filter = ('coefficient', 'professeur')
    filter_horizontal = ('classes',)

class EtudiantAdmin(admin.ModelAdmin):
    list_display = ('nom', 'prenom', 'email', 'numero_matricule', 'classe', 'date_inscription')
    search_fields = ('nom', 'prenom', 'email', 'numero_matricule')
    list_filter = ('classe', 'sexe', 'date_inscription')

class NoteAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'matiere', 'valeur', 'type_evaluation', 'trimestre', 'date_evaluation')
    search_fields = ('etudiant__nom', 'etudiant__prenom', 'matiere__nom')
    list_filter = ('trimestre', 'type_evaluation', 'date_evaluation', 'matiere')

class BulletinAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'trimestre', 'annee_scolaire', 'moyenne_generale', 'rang', 'date_generation')
    search_fields = ('etudiant__nom', 'etudiant__prenom')
    list_filter = ('trimestre', 'annee_scolaire')

class AbsenceAdmin(admin.ModelAdmin):
    list_display = ('etudiant', 'date_debut', 'date_fin', 'justifiee', 'duree')
    search_fields = ('etudiant__nom', 'etudiant__prenom')
    list_filter = ('justifiee', 'date_debut')

class StatistiqueAdmin(admin.ModelAdmin):
    list_display = ('classe', 'trimestre', 'annee_scolaire', 'moyenne_classe', 'taux_reussite')
    search_fields = ('classe__nom',)
    list_filter = ('trimestre', 'annee_scolaire')

class CoursAdmin(admin.ModelAdmin):
    list_display = ('matiere', 'professeur', 'classe', 'jour', 'heure_debut', 'heure_fin', 'salle')
    search_fields = ('matiere__nom', 'professeur__nom', 'classe__nom', 'salle')
    list_filter = ('jour', 'classe', 'professeur', 'matiere')

# Enregistrement des modèles avec leurs configurations admin
admin.site.register(Classe, ClasseAdmin)
admin.site.register(Professeur, ProfesseurAdmin)
admin.site.register(Matiere, MatiereAdmin)
admin.site.register(Etudiant, EtudiantAdmin)
admin.site.register(Note, NoteAdmin)
admin.site.register(Bulletin, BulletinAdmin)
admin.site.register(Absence, AbsenceAdmin)
admin.site.register(Statistique, StatistiqueAdmin)
admin.site.register(Cours, CoursAdmin)
