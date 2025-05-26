from rest_framework import serializers
from .models import Classe, Professeur, Matiere, Etudiant, Note
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

class ClasseSerializer(serializers.ModelSerializer):
    nombre_etudiants = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Classe
        fields = '__all__'

class ProfesseurSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    nombre_matieres = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Professeur
        fields = '__all__'

class MatiereSerializer(serializers.ModelSerializer):
    professeur_nom = serializers.CharField(source='professeur.nom', read_only=True)
    
    class Meta:
        model = Matiere
        fields = '__all__'

class EtudiantSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    classe_nom = serializers.CharField(source='classe.nom', read_only=True)
    age = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Etudiant
        fields = '__all__'
        
    def create(self, validated_data):
        # Créer un utilisateur associé si les données d'utilisateur sont fournies
        user_data = self.context.get('user_data')
        if user_data:
            user = User.objects.create_user(
                username=user_data.get('username', validated_data['email']),
                email=validated_data['email'],
                password=user_data.get('password', f"{validated_data['nom'].lower()}@{validated_data['prenom'].lower()}"),
                first_name=validated_data['prenom'],
                last_name=validated_data['nom']
            )
            validated_data['user'] = user
        return super().create(validated_data)

class NoteSerializer(serializers.ModelSerializer):
    etudiant_nom = serializers.CharField(source='etudiant.nom', read_only=True)
    etudiant_prenom = serializers.CharField(source='etudiant.prenom', read_only=True)
    matiere_nom = serializers.CharField(source='matiere.nom', read_only=True)
    
    class Meta:
        model = Note
        fields = '__all__'

class CoursSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    titre = serializers.CharField(max_length=200)
    professeur = serializers.PrimaryKeyRelatedField(queryset=Professeur.objects.all())
    classe = serializers.PrimaryKeyRelatedField(queryset=Classe.objects.all())
    matiere = serializers.PrimaryKeyRelatedField(queryset=Matiere.objects.all())
    jour = serializers.CharField(max_length=20)
    heure_debut = serializers.TimeField()
    heure_fin = serializers.TimeField()
    salle = serializers.CharField(max_length=50, required=False, allow_blank=True)
    niveau = serializers.IntegerField(required=False)
    
    def create(self, validated_data):
        # Comme Cours n'est pas un modèle Django, nous simulons la création
        # Dans une vraie application, il faudrait créer un modèle Cours
        validated_data['id'] = validated_data.get('id', hash(frozenset(validated_data.items())))
        return validated_data

    def update(self, instance, validated_data):
        # Simuler la mise à jour
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        return instance

class DashboardStatsSerializer(serializers.Serializer):
    etudiants_count = serializers.IntegerField()
    professeurs_count = serializers.IntegerField()
    classes_count = serializers.IntegerField()
    matieres_count = serializers.IntegerField()
