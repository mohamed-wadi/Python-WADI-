from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate, login, logout
from django.db.models import Avg, Count, Q
from datetime import datetime

from .models import Etudiant, Professeur, Classe, Matiere, Note, Bulletin, Cours, Absence
from .api_serializers import (
    UserSerializer, GroupSerializer, EtudiantSerializer, ProfesseurSerializer,
    ClasseSerializer, MatiereSerializer, NoteSerializer, BulletinSerializer,
    CoursSerializer, AbsenceSerializer
)

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin users to edit objects.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.groups.filter(name='Admins').exists()

class IsProfesseurOrAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission for professors to manage their resources.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (request.user.groups.filter(name='Professeurs').exists() or 
                request.user.groups.filter(name='Admins').exists())
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.groups.filter(name='Admins').exists():
            return True
        if hasattr(obj, 'professeur') and hasattr(request.user, 'professeur'):
            return obj.professeur.id == request.user.professeur.id
        return False

# Authentication
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            login(request, user)
            
            # Get user profile and role
            profile = None
            role = None
            
            if user.groups.filter(name='Etudiants').exists():
                try:
                    profile = Etudiant.objects.get(user=user)
                    serializer = EtudiantSerializer(profile)
                    role = 'etudiant'
                except Etudiant.DoesNotExist:
                    pass
            elif user.groups.filter(name='Professeurs').exists():
                try:
                    profile = Professeur.objects.get(user=user)
                    serializer = ProfesseurSerializer(profile)
                    role = 'professeur'
                except Professeur.DoesNotExist:
                    pass
            elif user.groups.filter(name='Admins').exists() or user.is_staff:
                serializer = UserSerializer(user)
                role = 'admin'
            else:
                serializer = UserSerializer(user)
                role = 'user'
            
            return Response({
                'user': UserSerializer(user).data,
                'profile': serializer.data if profile else None,
                'role': role
            })
        
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)

class UserView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        
        # Get user profile and role
        profile = None
        role = None
        
        if request.user.groups.filter(name='Etudiants').exists():
            try:
                profile = Etudiant.objects.get(user=request.user)
                serializer = EtudiantSerializer(profile)
                role = 'etudiant'
            except Etudiant.DoesNotExist:
                pass
        elif request.user.groups.filter(name='Professeurs').exists():
            try:
                profile = Professeur.objects.get(user=request.user)
                serializer = ProfesseurSerializer(profile)
                role = 'professeur'
            except Professeur.DoesNotExist:
                pass
        elif request.user.groups.filter(name='Admins').exists() or request.user.is_staff:
            serializer = UserSerializer(request.user)
            role = 'admin'
        else:
            serializer = UserSerializer(request.user)
            role = 'user'
        
        return Response({
            'user': UserSerializer(request.user).data,
            'profile': serializer.data if profile else None,
            'role': role
        })

# ViewSets for models
class EtudiantViewSet(viewsets.ModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer
    permission_classes = [permissions.AllowAny]  # Temporairement AllowAny pour le développement

class ProfesseurViewSet(viewsets.ModelViewSet):
    queryset = Professeur.objects.all()
    serializer_class = ProfesseurSerializer
    permission_classes = [permissions.AllowAny]  # Temporairement AllowAny pour le développement

class ClasseViewSet(viewsets.ModelViewSet):
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer
    permission_classes = [permissions.AllowAny]  # Temporairement AllowAny pour le développement

class MatiereViewSet(viewsets.ModelViewSet):
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer
    permission_classes = [permissions.AllowAny]  # Temporairement AllowAny pour le développement

class CoursViewSet(viewsets.ModelViewSet):
    queryset = Cours.objects.all()
    serializer_class = CoursSerializer
    permission_classes = [permissions.AllowAny]  # Temporairement AllowAny pour le développement
    authentication_classes = []  # Désactiver l'authentification pour le développement
    
    def get_queryset(self):
        queryset = Cours.objects.all()
        
        # Filtrage par classe
        classe_id = self.request.query_params.get('classe', None)
        if classe_id is not None:
            queryset = queryset.filter(classe_id=classe_id)
            
        # Filtrage par professeur
        professeur_id = self.request.query_params.get('professeur', None)
        if professeur_id is not None:
            queryset = queryset.filter(professeur_id=professeur_id)
            
        # Filtrage par jour
        jour = self.request.query_params.get('jour', None)
        if jour is not None:
            queryset = queryset.filter(jour=jour)
            
        return queryset

class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [IsProfesseurOrAdminOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.groups.filter(name='Admins').exists() or user.is_staff:
            return Note.objects.all()
        
        elif user.groups.filter(name='Professeurs').exists():
            try:
                professeur = Professeur.objects.get(user=user)
                return Note.objects.filter(matiere__professeur=professeur)
            except Professeur.DoesNotExist:
                return Note.objects.none()
        
        elif user.groups.filter(name='Etudiants').exists():
            try:
                etudiant = Etudiant.objects.get(user=user)
                return Note.objects.filter(etudiant=etudiant)
            except Etudiant.DoesNotExist:
                return Note.objects.none()
        
        return Note.objects.none()

class BulletinViewSet(viewsets.ModelViewSet):
    queryset = Bulletin.objects.all()
    serializer_class = BulletinSerializer
    permission_classes = [IsProfesseurOrAdminOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.groups.filter(name='Admins').exists() or user.is_staff:
            return Bulletin.objects.all()
        
        elif user.groups.filter(name='Professeurs').exists():
            try:
                professeur = Professeur.objects.get(user=user)
                # Get classes where this professor teaches
                matieres = Matiere.objects.filter(professeur=professeur)
                classes = Classe.objects.filter(matiere__in=matieres).distinct()
                # Get bulletins for students in these classes
                return Bulletin.objects.filter(etudiant__classe__in=classes)
            except Professeur.DoesNotExist:
                return Bulletin.objects.none()
        
        elif user.groups.filter(name='Etudiants').exists():
            try:
                etudiant = Etudiant.objects.get(user=user)
                return Bulletin.objects.filter(etudiant=etudiant)
            except Etudiant.DoesNotExist:
                return Bulletin.objects.none()
        
        return Bulletin.objects.none()

class CoursViewSet(viewsets.ModelViewSet):
    queryset = Cours.objects.all()
    serializer_class = CoursSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.groups.filter(name='Admins').exists() or user.is_staff:
            return Cours.objects.all()
        
        elif user.groups.filter(name='Professeurs').exists():
            try:
                professeur = Professeur.objects.get(user=user)
                return Cours.objects.filter(professeur=professeur)
            except Professeur.DoesNotExist:
                return Cours.objects.none()
        
        elif user.groups.filter(name='Etudiants').exists():
            try:
                etudiant = Etudiant.objects.get(user=user)
                return Cours.objects.filter(classe=etudiant.classe)
            except Etudiant.DoesNotExist:
                return Cours.objects.none()
        
        return Cours.objects.none()

class AbsenceViewSet(viewsets.ModelViewSet):
    queryset = Absence.objects.all()
    serializer_class = AbsenceSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        
        if user.groups.filter(name='Admins').exists() or user.is_staff:
            return Absence.objects.all()
        
        elif user.groups.filter(name='Professeurs').exists():
            try:
                professeur = Professeur.objects.get(user=user)
                # Get classes where this professor teaches
                matieres = Matiere.objects.filter(professeur=professeur)
                classes = Classe.objects.filter(matiere__in=matieres).distinct()
                # Get absences for students in these classes
                return Absence.objects.filter(etudiant__classe__in=classes)
            except Professeur.DoesNotExist:
                return Absence.objects.none()
        
        elif user.groups.filter(name='Etudiants').exists():
            try:
                etudiant = Etudiant.objects.get(user=user)
                return Absence.objects.filter(etudiant=etudiant)
            except Etudiant.DoesNotExist:
                return Absence.objects.none()
        
        return Absence.objects.none()

# Dashboard data for each user type
@api_view(['GET'])
def etudiant_dashboard_data(request):
    if not request.user.is_authenticated or not request.user.groups.filter(name='Etudiants').exists():
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    try:
        etudiant = Etudiant.objects.get(user=request.user)
    except Etudiant.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    # Get notes
    notes = Note.objects.filter(etudiant=etudiant)
    
    # Get bulletins
    bulletins = Bulletin.objects.filter(etudiant=etudiant).order_by('-trimestre')
    
    # Get absences
    absences = Absence.objects.filter(etudiant=etudiant)
    
    # Get cours (schedule)
    cours = Cours.objects.filter(classe=etudiant.classe)
    
    # Calculate statistics
    moyenne_generale = 0
    if notes.exists():
        moyenne_generale = notes.aggregate(Avg('valeur'))['valeur__avg']
    
    # Group notes by matiere and trimestre
    moyennes_par_matiere = []
    matieres = Matiere.objects.filter(note__etudiant=etudiant).distinct()
    
    for matiere in matieres:
        matiere_notes = notes.filter(matiere=matiere)
        
        for trimestre in [1, 2, 3]:
            trimestre_notes = matiere_notes.filter(trimestre=trimestre)
            if trimestre_notes.exists():
                moyenne = trimestre_notes.aggregate(Avg('valeur'))['valeur__avg']
                moyennes_par_matiere.append({
                    'matiere': MatiereSerializer(matiere).data,
                    'trimestre': trimestre,
                    'moyenne': moyenne
                })
    
    return Response({
        'etudiant': EtudiantSerializer(etudiant).data,
        'bulletins': BulletinSerializer(bulletins, many=True).data,
        'moyenne_generale': moyenne_generale,
        'moyennes_par_matiere': moyennes_par_matiere,
        'absences': AbsenceSerializer(absences, many=True).data,
        'emploi_du_temps': CoursSerializer(cours, many=True).data
    })

@api_view(['GET'])
def professeur_dashboard_data(request):
    if not request.user.is_authenticated or not request.user.groups.filter(name='Professeurs').exists():
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    try:
        professeur = Professeur.objects.get(user=request.user)
    except Professeur.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
    # Get matieres
    matieres = Matiere.objects.filter(professeur=professeur)
    
    # Get classes where this professor teaches
    classes = Classe.objects.filter(matiere__in=matieres).distinct()
    
    # Get cours (schedule)
    cours = Cours.objects.filter(professeur=professeur)
    
    # Calculate statistics for each class
    statistiques_classes = []
    
    for classe in classes:
        etudiants = Etudiant.objects.filter(classe=classe)
        nb_etudiants = etudiants.count()
        
        # Calculate average grade for this class in this professor's subjects
        notes = Note.objects.filter(
            etudiant__classe=classe,
            matiere__in=matieres
        )
        
        moyenne_generale = 0
        if notes.exists():
            moyenne_generale = notes.aggregate(Avg('valeur'))['valeur__avg']
        
        statistiques_classes.append({
            'classe': ClasseSerializer(classe).data,
            'nb_etudiants': nb_etudiants,
            'moyenne_generale': moyenne_generale
        })
    
    return Response({
        'professeur': ProfesseurSerializer(professeur).data,
        'matieres': MatiereSerializer(matieres, many=True).data,
        'statistiques_classes': statistiques_classes,
        'nombre_matieres': matieres.count(),
        'emploi_du_temps': CoursSerializer(cours, many=True).data
    })

@api_view(['GET'])
def admin_dashboard_data(request):
    if not request.user.is_authenticated or not (request.user.groups.filter(name='Admins').exists() or request.user.is_staff):
        return Response(status=status.HTTP_403_FORBIDDEN)
    
    # Count statistics
    nb_etudiants = Etudiant.objects.count()
    nb_professeurs = Professeur.objects.count()
    nb_classes = Classe.objects.count()
    nb_matieres = Matiere.objects.count()
    
    # Calculate class distribution
    repartition_classes = []
    for classe in Classe.objects.all():
        nb_etudiants_classe = Etudiant.objects.filter(classe=classe).count()
        repartition_classes.append({
            'classe': ClasseSerializer(classe).data,
            'nb_etudiants': nb_etudiants_classe
        })
    
    # Calculate subject distribution by professor
    repartition_matieres = []
    for professeur in Professeur.objects.all():
        nb_matieres_prof = Matiere.objects.filter(professeur=professeur).count()
        repartition_matieres.append({
            'professeur': ProfesseurSerializer(professeur).data,
            'nb_matieres': nb_matieres_prof
        })
    
    return Response({
        'nb_etudiants': nb_etudiants,
        'nb_professeurs': nb_professeurs,
        'nb_classes': nb_classes,
        'nb_matieres': nb_matieres,
        'repartition_classes': repartition_classes,
        'repartition_matieres': repartition_matieres
    }) 