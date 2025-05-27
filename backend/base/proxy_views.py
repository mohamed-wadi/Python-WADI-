"""
Vues proxy qui contournent les restrictions d'authentification
pour le développement uniquement. À NE PAS utiliser en production.
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from .models import Professeur, Classe, Matiere, Cours, Etudiant
from .api_serializers import ProfesseurSerializer, ClasseSerializer, MatiereSerializer, CoursSerializer, EtudiantSerializer
import json

@csrf_exempt
def proxy_get_all(request, model_name):
    """Récupère tous les objets d'un modèle donné sans authentification"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    
    try:
        # Mapper le nom du modèle au modèle et sérialiseur appropriés
        model_map = {
            'professeurs': (Professeur, ProfesseurSerializer),
            'classes': (Classe, ClasseSerializer),
            'matieres': (Matiere, MatiereSerializer),
            'cours': (Cours, CoursSerializer),
            'etudiants': (Etudiant, EtudiantSerializer),
        }
        
        if model_name not in model_map:
            return JsonResponse({'error': f'Modèle {model_name} non supporté'}, status=400)
        
        model, serializer_class = model_map[model_name]
        objects = model.objects.all()
        serializer = serializer_class(objects, many=True)
        
        # Enregistrer dans le journal pour le débogage
        print(f"Proxy: GET /{model_name}/ - {len(objects)} objets récupérés")
        
        return JsonResponse(serializer.data, safe=False)
    
    except Exception as e:
        print(f"Erreur dans proxy_get_all pour {model_name}: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def proxy_get_by_id(request, model_name, obj_id):
    """Récupère un objet spécifique par ID sans authentification"""
    if request.method != 'GET':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    
    try:
        # Mapper le nom du modèle au modèle et sérialiseur appropriés
        model_map = {
            'professeurs': (Professeur, ProfesseurSerializer),
            'classes': (Classe, ClasseSerializer),
            'matieres': (Matiere, MatiereSerializer),
            'cours': (Cours, CoursSerializer),
            'etudiants': (Etudiant, EtudiantSerializer),
        }
        
        if model_name not in model_map:
            return JsonResponse({'error': f'Modèle {model_name} non supporté'}, status=400)
        
        model, serializer_class = model_map[model_name]
        obj = model.objects.get(id=obj_id)
        serializer = serializer_class(obj)
        
        return JsonResponse(serializer.data)
    
    except model.DoesNotExist:
        return JsonResponse({'error': f'{model_name} avec id {obj_id} non trouvé'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def proxy_create(request, model_name):
    """Crée un objet sans authentification"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    
    try:
        # Mapper le nom du modèle au modèle et sérialiseur appropriés
        model_map = {
            'professeurs': (Professeur, ProfesseurSerializer),
            'classes': (Classe, ClasseSerializer),
            'matieres': (Matiere, MatiereSerializer),
            'cours': (Cours, CoursSerializer),
            'etudiants': (Etudiant, EtudiantSerializer),
        }
        
        if model_name not in model_map:
            return JsonResponse({'error': f'Modèle {model_name} non supporté'}, status=400)
        
        model, serializer_class = model_map[model_name]
        
        data = json.loads(request.body)
        serializer = serializer_class(data=data)
        
        if serializer.is_valid():
            instance = serializer.save()
            return JsonResponse(serializer_class(instance).data, status=201)
        else:
            return JsonResponse(serializer.errors, status=400)
    
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def proxy_update(request, model_name, obj_id):
    """Met à jour un objet sans authentification"""
    if request.method != 'PUT':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    
    try:
        # Mapper le nom du modèle au modèle et sérialiseur appropriés
        model_map = {
            'professeurs': (Professeur, ProfesseurSerializer),
            'classes': (Classe, ClasseSerializer),
            'matieres': (Matiere, MatiereSerializer),
            'cours': (Cours, CoursSerializer),
            'etudiants': (Etudiant, EtudiantSerializer),
        }
        
        if model_name not in model_map:
            return JsonResponse({'error': f'Modèle {model_name} non supporté'}, status=400)
        
        model, serializer_class = model_map[model_name]
        
        obj = model.objects.get(id=obj_id)
        data = json.loads(request.body)
        serializer = serializer_class(obj, data=data)
        
        if serializer.is_valid():
            instance = serializer.save()
            return JsonResponse(serializer_class(instance).data)
        else:
            return JsonResponse(serializer.errors, status=400)
    
    except model.DoesNotExist:
        return JsonResponse({'error': f'{model_name} avec id {obj_id} non trouvé'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def proxy_delete(request, model_name, obj_id):
    """Supprime un objet sans authentification"""
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Méthode non autorisée'}, status=405)
    
    try:
        # Mapper le nom du modèle au modèle et sérialiseur appropriés
        model_map = {
            'professeurs': (Professeur, ProfesseurSerializer),
            'classes': (Classe, ClasseSerializer),
            'matieres': (Matiere, MatiereSerializer),
            'cours': (Cours, CoursSerializer),
            'etudiants': (Etudiant, EtudiantSerializer),
        }
        
        if model_name not in model_map:
            return JsonResponse({'error': f'Modèle {model_name} non supporté'}, status=400)
        
        model, serializer_class = model_map[model_name]
        
        obj = model.objects.get(id=obj_id)
        obj.delete()
        
        return JsonResponse({'success': True})
    
    except model.DoesNotExist:
        return JsonResponse({'error': f'{model_name} avec id {obj_id} non trouvé'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
