from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import Professeur, Etudiant, Classe, Matiere, Note, Cours
import json
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
def sync_professeurs(request):
    """
    Synchronise les données des professeurs depuis le localStorage vers la base de données Django
    """
    try:
        data = request.data.get('data', [])
        if not data:
            return Response({"error": "Aucune donnée reçue"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Garder une trace des IDs traités pour la suppression
        processed_ids = []
        
        # Traiter chaque professeur
        for prof_data in data:
            prof_id = prof_data.get('id')
            processed_ids.append(prof_id)
            
            # Chercher si le professeur existe déjà
            try:
                professeur = Professeur.objects.get(id=prof_id)
                # Mettre à jour les données
                professeur.prenom = prof_data.get('prenom', '')
                professeur.nom = prof_data.get('nom', '')
                professeur.email = prof_data.get('email', '')
                professeur.specialite = prof_data.get('specialite', '')
                # Stocker les niveaux comme JSON si le champ existe
                if hasattr(professeur, 'niveaux'):
                    professeur.niveaux = json.dumps(prof_data.get('niveaux', []))
                professeur.save()
                logger.info(f"Professeur mis à jour: {professeur.id}")
            except Professeur.DoesNotExist:
                # Créer un nouveau professeur
                professeur = Professeur(
                    id=prof_id,
                    prenom=prof_data.get('prenom', ''),
                    nom=prof_data.get('nom', ''),
                    email=prof_data.get('email', ''),
                    specialite=prof_data.get('specialite', '')
                )
                professeur.save()
                logger.info(f"Nouveau professeur créé: {professeur.id}")
        
        # Supprimer les professeurs qui ne sont pas dans les données reçues
        Professeur.objects.exclude(id__in=processed_ids).delete()
        
        return Response({"message": f"{len(data)} professeurs synchronisés avec succès"}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Erreur lors de la synchronisation des professeurs: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def sync_classes(request):
    """
    Synchronise les données des classes depuis le localStorage vers la base de données Django
    """
    try:
        data = request.data.get('data', [])
        if not data:
            return Response({"error": "Aucune donnée reçue"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Garder une trace des IDs traités pour la suppression
        processed_ids = []
        
        # Traiter chaque classe
        for class_data in data:
            class_id = class_data.get('id')
            processed_ids.append(class_id)
            
            # Chercher si la classe existe déjà
            try:
                classe = Classe.objects.get(id=class_id)
                # Mettre à jour les données
                classe.nom = class_data.get('nom', '')
                classe.niveau = class_data.get('niveau', '')
                classe.annee_scolaire = class_data.get('annee_scolaire', '')
                classe.save()
                logger.info(f"Classe mise à jour: {classe.id}")
            except Classe.DoesNotExist:
                # Créer une nouvelle classe
                classe = Classe(
                    id=class_id,
                    nom=class_data.get('nom', ''),
                    niveau=class_data.get('niveau', ''),
                    annee_scolaire=class_data.get('annee_scolaire', ''),
                )
                classe.save()
                logger.info(f"Nouvelle classe créée: {classe.id}")
        
        # Supprimer les classes qui ne sont pas dans les données reçues
        Classe.objects.exclude(id__in=processed_ids).delete()
        
        return Response({"message": f"{len(data)} classes synchronisées avec succès"}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Erreur lors de la synchronisation des classes: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def sync_etudiants(request):
    """
    Synchronise les données des étudiants depuis le localStorage vers la base de données Django
    """
    try:
        data = request.data.get('data', [])
        if not data:
            return Response({"error": "Aucune donnée reçue"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Garder une trace des IDs traités pour la suppression
        processed_ids = []
        
        # Traiter chaque étudiant
        for student_data in data:
            student_id = student_data.get('id')
            processed_ids.append(student_id)
            
            # Chercher si l'étudiant existe déjà
            try:
                etudiant = Etudiant.objects.get(id=student_id)
                # Mettre à jour les données
                etudiant.prenom = student_data.get('prenom', '')
                etudiant.nom = student_data.get('nom', '')
                etudiant.email = student_data.get('email', '')
                if hasattr(etudiant, 'date_naissance'):
                    etudiant.date_naissance = student_data.get('date_naissance', None)
                etudiant.niveau = student_data.get('niveau', '')
                
                # Gérer la référence à la classe
                classe_id = student_data.get('classe')
                if classe_id:
                    try:
                        classe = Classe.objects.get(id=classe_id)
                        etudiant.classe = classe
                    except Classe.DoesNotExist:
                        pass
                
                etudiant.save()
                logger.info(f"Étudiant mis à jour: {etudiant.id}")
            except Etudiant.DoesNotExist:
                # Créer un nouvel étudiant
                etudiant = Etudiant(
                    id=student_id,
                    prenom=student_data.get('prenom', ''),
                    nom=student_data.get('nom', ''),
                    email=student_data.get('email', ''),
                    niveau=student_data.get('niveau', '')
                )
                # Ajout de la date de naissance si le champ existe
                if hasattr(Etudiant, 'date_naissance'):
                    etudiant.date_naissance = student_data.get('date_naissance', None)
                
                # Gérer la référence à la classe
                classe_id = student_data.get('classe')
                if classe_id:
                    try:
                        classe = Classe.objects.get(id=classe_id)
                        etudiant.classe = classe
                    except Classe.DoesNotExist:
                        pass
                
                etudiant.save()
                logger.info(f"Nouvel étudiant créé: {etudiant.id}")
        
        # Supprimer les étudiants qui ne sont pas dans les données reçues
        Etudiant.objects.exclude(id__in=processed_ids).delete()
        
        return Response({"message": f"{len(data)} étudiants synchronisés avec succès"}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Erreur lors de la synchronisation des étudiants: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def sync_matieres(request):
    """
    Synchronise les données des matières depuis le localStorage vers la base de données Django
    """
    try:
        data = request.data.get('data', [])
        if not data:
            return Response({"error": "Aucune donnée reçue"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Garder une trace des IDs traités pour la suppression
        processed_ids = []
        
        # Traiter chaque matière
        for subject_data in data:
            subject_id = subject_data.get('id')
            processed_ids.append(subject_id)
            
            # Chercher si la matière existe déjà
            try:
                matiere = Matiere.objects.get(id=subject_id)
                # Mettre à jour les données
                matiere.nom = subject_data.get('nom', '')
                matiere.code = subject_data.get('code', '')
                matiere.coefficient = subject_data.get('coefficient', 1)
                matiere.save()
                logger.info(f"Matière mise à jour: {matiere.id}")
            except Matiere.DoesNotExist:
                # Créer une nouvelle matière
                matiere = Matiere(
                    id=subject_id,
                    nom=subject_data.get('nom', ''),
                    code=subject_data.get('code', ''),
                    coefficient=subject_data.get('coefficient', 1)
                )
                matiere.save()
                logger.info(f"Nouvelle matière créée: {matiere.id}")
        
        # Supprimer les matières qui ne sont pas dans les données reçues
        Matiere.objects.exclude(id__in=processed_ids).delete()
        
        return Response({"message": f"{len(data)} matières synchronisées avec succès"}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Erreur lors de la synchronisation des matières: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def sync_notes(request):
    """
    Synchronise les données des notes depuis le localStorage vers la base de données Django
    """
    try:
        data = request.data.get('data', [])
        if not data:
            return Response({"error": "Aucune donnée reçue"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Garder une trace des IDs traités pour la suppression
        processed_ids = []
        
        # Traiter chaque note
        for grade_data in data:
            grade_id = grade_data.get('id')
            processed_ids.append(grade_id)
            
            # Chercher si la note existe déjà
            try:
                note = Note.objects.get(id=grade_id)
                # Mettre à jour les données
                note.valeur = grade_data.get('valeur', 0)
                if hasattr(note, 'commentaire'):
                    note.commentaire = grade_data.get('commentaire', '')
                if hasattr(note, 'type'):
                    note.type = grade_data.get('type', '')
                if hasattr(note, 'niveau'):
                    note.niveau = grade_data.get('niveau', '')
                if hasattr(note, 'trimestre'):
                    note.trimestre = grade_data.get('trimestre', 1)
                
                # Gérer les références
                student_id = grade_data.get('etudiant')
                subject_id = grade_data.get('matiere')
                professor_id = grade_data.get('professeur')
                
                if student_id:
                    try:
                        etudiant = Etudiant.objects.get(id=student_id)
                        note.etudiant = etudiant
                    except Etudiant.DoesNotExist:
                        pass
                
                if subject_id:
                    try:
                        matiere = Matiere.objects.get(id=subject_id)
                        note.matiere = matiere
                    except Matiere.DoesNotExist:
                        pass
                
                if professor_id:
                    try:
                        professeur = Professeur.objects.get(id=professor_id)
                        note.professeur = professeur
                    except Professeur.DoesNotExist:
                        pass
                
                note.save()
                logger.info(f"Note mise à jour: {note.id}")
            except Note.DoesNotExist:
                # Créer une nouvelle note
                note = Note(
                    id=grade_id,
                    valeur=grade_data.get('valeur', 0)
                )
                
                # Ajout des champs optionnels si existants
                if hasattr(Note, 'commentaire'):
                    note.commentaire = grade_data.get('commentaire', '')
                if hasattr(Note, 'type'):
                    note.type = grade_data.get('type', '')
                if hasattr(Note, 'niveau'):
                    note.niveau = grade_data.get('niveau', '')
                if hasattr(Note, 'trimestre'):
                    note.trimestre = grade_data.get('trimestre', 1)
                
                # Gérer les références
                student_id = grade_data.get('etudiant')
                subject_id = grade_data.get('matiere')
                professor_id = grade_data.get('professeur')
                
                if student_id:
                    try:
                        etudiant = Etudiant.objects.get(id=student_id)
                        note.etudiant = etudiant
                    except Etudiant.DoesNotExist:
                        pass
                
                if subject_id:
                    try:
                        matiere = Matiere.objects.get(id=subject_id)
                        note.matiere = matiere
                    except Matiere.DoesNotExist:
                        pass
                
                if professor_id:
                    try:
                        professeur = Professeur.objects.get(id=professor_id)
                        note.professeur = professeur
                    except Professeur.DoesNotExist:
                        pass
                
                note.save()
                logger.info(f"Nouvelle note créée: {note.id}")
        
        # Supprimer les notes qui ne sont pas dans les données reçues
        Note.objects.exclude(id__in=processed_ids).delete()
        
        return Response({"message": f"{len(data)} notes synchronisées avec succès"}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Erreur lors de la synchronisation des notes: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def sync_cours(request):
    """
    Synchronise les données des cours depuis le localStorage vers la base de données Django
    """
    try:
        data = request.data.get('data', [])
        if not data:
            return Response({"error": "Aucune donnée reçue"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Garder une trace des IDs traités pour la suppression
        processed_ids = []
        
        # Traiter chaque cours
        for course_data in data:
            course_id = course_data.get('id')
            processed_ids.append(course_id)
            
            # Chercher si le cours existe déjà
            try:
                cours = Cours.objects.get(id=course_id)
                # Mettre à jour les données
                if hasattr(cours, 'jour'):
                    cours.jour = course_data.get('jour', '')
                if hasattr(cours, 'heure_debut'):
                    cours.heure_debut = course_data.get('heure_debut', '')
                if hasattr(cours, 'heure_fin'):
                    cours.heure_fin = course_data.get('heure_fin', '')
                if hasattr(cours, 'salle'):
                    cours.salle = course_data.get('salle', '')
                if hasattr(cours, 'niveau'):
                    cours.niveau = course_data.get('niveau', '')
                
                # Gérer les références
                classroom_id = course_data.get('classe')
                subject_id = course_data.get('matiere')
                professor_id = course_data.get('professeur')
                
                if classroom_id:
                    try:
                        classe = Classe.objects.get(id=classroom_id)
                        cours.classe = classe
                    except Classe.DoesNotExist:
                        pass
                
                if subject_id:
                    try:
                        matiere = Matiere.objects.get(id=subject_id)
                        cours.matiere = matiere
                    except Matiere.DoesNotExist:
                        pass
                
                if professor_id:
                    try:
                        professeur = Professeur.objects.get(id=professor_id)
                        cours.professeur = professeur
                    except Professeur.DoesNotExist:
                        pass
                
                cours.save()
                logger.info(f"Cours mis à jour: {cours.id}")
            except Cours.DoesNotExist:
                # Créer un nouveau cours
                cours = Cours(
                    id=course_id
                )
                
                # Ajout des champs optionnels si existants
                if hasattr(Cours, 'jour'):
                    cours.jour = course_data.get('jour', '')
                if hasattr(Cours, 'heure_debut'):
                    cours.heure_debut = course_data.get('heure_debut', '')
                if hasattr(Cours, 'heure_fin'):
                    cours.heure_fin = course_data.get('heure_fin', '')
                if hasattr(Cours, 'salle'):
                    cours.salle = course_data.get('salle', '')
                if hasattr(Cours, 'niveau'):
                    cours.niveau = course_data.get('niveau', '')
                
                # Gérer les références
                classroom_id = course_data.get('classe')
                subject_id = course_data.get('matiere')
                professor_id = course_data.get('professeur')
                
                if classroom_id:
                    try:
                        classe = Classe.objects.get(id=classroom_id)
                        cours.classe = classe
                    except Classe.DoesNotExist:
                        pass
                
                if subject_id:
                    try:
                        matiere = Matiere.objects.get(id=subject_id)
                        cours.matiere = matiere
                    except Matiere.DoesNotExist:
                        pass
                
                if professor_id:
                    try:
                        professeur = Professeur.objects.get(id=professor_id)
                        cours.professeur = professeur
                    except Professeur.DoesNotExist:
                        pass
                
                cours.save()
                logger.info(f"Nouveau cours créé: {cours.id}")
        
        # Supprimer les cours qui ne sont pas dans les données reçues
        Cours.objects.exclude(id__in=processed_ids).delete()
        
        return Response({"message": f"{len(data)} cours synchronisés avec succès"}, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Erreur lors de la synchronisation des cours: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
