from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import Etudiant, Professeur, Classe, Matiere, Note, Bulletin, Cours, Absence

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'groups']
        extra_kwargs = {'password': {'write_only': True}}

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class EtudiantSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    classe_nom = serializers.CharField(source='classe.nom', read_only=True)
    
    class Meta:
        model = Etudiant
        fields = ['id', 'user', 'user_details', 'nom', 'prenom', 
                  'date_naissance', 'sexe', 'adresse', 'email', 'telephone',
                  'classe', 'classe_nom', 'numero_matricule', 'date_inscription']

class ProfesseurSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Professeur
        fields = ['id', 'user', 'user_details', 'nom', 'prenom', 'specialite', 
                  'email', 'telephone', 'date_embauche']

class ClasseSerializer(serializers.ModelSerializer):
    nb_etudiants = serializers.SerializerMethodField()
    filiere_display = serializers.CharField(source='get_filiere_display', read_only=True)
    
    class Meta:
        model = Classe
        fields = ['id', 'nom', 'niveau', 'filiere', 'filiere_display', 'annee_scolaire', 'nb_etudiants']
    
    def get_nb_etudiants(self, obj):
        return obj.etudiant_set.count()

class MatiereSerializer(serializers.ModelSerializer):
    professeur_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Matiere
        fields = ['id', 'code', 'nom', 'coefficient', 
                  'professeur', 'professeur_nom']
    
    def get_professeur_nom(self, obj):
        if obj.professeur:
            return f"{obj.professeur.prenom} {obj.professeur.nom}"
        return None

class CoursSerializer(serializers.ModelSerializer):
    matiere_nom = serializers.SerializerMethodField()
    professeur_nom = serializers.SerializerMethodField()
    classe_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Cours
        fields = ['id', 'matiere', 'matiere_nom', 'professeur', 'professeur_nom', 
                 'classe', 'classe_nom', 'jour', 'heure_debut', 'heure_fin', 
                 'salle', 'description']
    
    def get_matiere_nom(self, obj):
        return obj.matiere.nom if obj.matiere else None
    
    def get_professeur_nom(self, obj):
        if obj.professeur:
            return f"{obj.professeur.prenom} {obj.professeur.nom}"
        return None
    
    def get_classe_nom(self, obj):
        return obj.classe.nom if obj.classe else None

class NoteSerializer(serializers.ModelSerializer):
    etudiant_nom = serializers.SerializerMethodField()
    matiere_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Note
        fields = ['id', 'etudiant', 'etudiant_nom', 'matiere', 'matiere_nom', 
                  'valeur', 'date_evaluation', 'type_evaluation', 
                  'commentaire', 'trimestre']
    
    def get_etudiant_nom(self, obj):
        return f"{obj.etudiant.prenom} {obj.etudiant.nom}"
    
    def get_matiere_nom(self, obj):
        return obj.matiere.nom

class BulletinSerializer(serializers.ModelSerializer):
    etudiant_nom = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()
    
    class Meta:
        model = Bulletin
        fields = ['id', 'etudiant', 'etudiant_nom', 'trimestre', 'annee_scolaire', 
                  'date_generation', 'moyenne_generale', 'rang', 
                  'appreciation', 'notes']
    
    def get_etudiant_nom(self, obj):
        return f"{obj.etudiant.prenom} {obj.etudiant.nom}"
    
    def get_notes(self, obj):
        notes = Note.objects.filter(etudiant=obj.etudiant, trimestre=obj.trimestre)
        return NoteSerializer(notes, many=True).data

class CoursSerializer(serializers.ModelSerializer):
    professeur_nom = serializers.SerializerMethodField()
    matiere_nom = serializers.CharField(source='matiere.nom', read_only=True)
    classe_nom = serializers.CharField(source='classe.nom', read_only=True)
    
    class Meta:
        model = Cours
        fields = ['id', 'jour', 'heure_debut', 'heure_fin', 'matiere', 
                  'matiere_nom', 'professeur', 'professeur_nom', 
                  'classe', 'classe_nom', 'salle']
    
    def get_professeur_nom(self, obj):
        if obj.professeur:
            return f"{obj.professeur.prenom} {obj.professeur.nom}"
        return None

class AbsenceSerializer(serializers.ModelSerializer):
    etudiant_nom = serializers.SerializerMethodField()
    
    class Meta:
        model = Absence
        fields = ['id', 'etudiant', 'etudiant_nom', 'date_debut', 'date_fin', 
                  'justifiee', 'motif']
    
    def get_etudiant_nom(self, obj):
        return f"{obj.etudiant.prenom} {obj.etudiant.nom}" 