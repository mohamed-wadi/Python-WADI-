from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Classe, Etudiant, Professeur, Matiere, Cours, Note, Bulletin, Absence
from django.forms.models import model_to_dict

# Vue générique qui accepte n'importe quelle donnée et l'enregistre sans vérification
@csrf_exempt
def save_classe(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            new_classe = Classe.objects.create(
                nom=data.get('nom', 'Nouvelle classe'),
                niveau=data.get('niveau', 1),
                annee_scolaire=data.get('annee_scolaire', '2023-2024')
            )
            return JsonResponse({
                'success': True,
                'id': new_classe.id,
                'message': 'Classe créée avec succès'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    return JsonResponse({'message': 'Méthode non autorisée'}, status=405)

@csrf_exempt
def save_etudiant(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Trouver la classe s'il y en a une
            classe = None
            if data.get('classe_id'):
                try:
                    classe = Classe.objects.get(id=data.get('classe_id'))
                except:
                    pass
            
            new_etudiant = Etudiant.objects.create(
                nom=data.get('nom', 'Nom'),
                prenom=data.get('prenom', 'Prénom'),
                date_naissance=data.get('date_naissance', '2000-01-01'),
                sexe=data.get('sexe', 'M'),
                adresse=data.get('adresse', ''),
                telephone=data.get('telephone', ''),
                email=data.get('email', 'etudiant@example.com'),
                classe=classe,
                niveau=data.get('niveau', 1)
            )
            return JsonResponse({
                'success': True,
                'id': new_etudiant.id,
                'message': 'Étudiant créé avec succès'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    return JsonResponse({'message': 'Méthode non autorisée'}, status=405)

@csrf_exempt
def save_professeur(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            new_professeur = Professeur.objects.create(
                nom=data.get('nom', 'Nom'),
                prenom=data.get('prenom', 'Prénom'),
                email=data.get('email', f'prof{Professeur.objects.count()+1}@example.com'),
                telephone=data.get('telephone', ''),
                specialite=data.get('specialite', 'Matière générale'),
                date_embauche=data.get('date_embauche', '2023-01-01'),
                niveaux_enseignes=data.get('niveaux_enseignes', '1,2,3,4,5')
            )
            return JsonResponse({
                'success': True,
                'id': new_professeur.id,
                'message': 'Professeur créé avec succès'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    return JsonResponse({'message': 'Méthode non autorisée'}, status=405)

@csrf_exempt
def save_matiere(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            # Trouver le professeur s'il y en a un
            professeur = None
            if data.get('professeur_id'):
                try:
                    professeur = Professeur.objects.get(id=data.get('professeur_id'))
                except:
                    pass
            
            new_matiere = Matiere.objects.create(
                nom=data.get('nom', 'Nouvelle matière'),
                code=data.get('code', f'MAT{Matiere.objects.count()+1}'),
                description=data.get('description', ''),
                coefficient=data.get('coefficient', 1),
                professeur=professeur,
                niveau=data.get('niveau', 1)
            )
            return JsonResponse({
                'success': True,
                'id': new_matiere.id,
                'message': 'Matière créée avec succès'
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    return JsonResponse({'message': 'Méthode non autorisée'}, status=405)
