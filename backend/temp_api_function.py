# API pour récupérer les étudiants par classe (utilisé dans le formulaire de génération des bulletins)
def etudiants_par_classe(request):
    classe_id = request.GET.get('classe', None)
    if classe_id:
        etudiants = Etudiant.objects.filter(classe_id=classe_id).values('id', 'nom', 'prenom')
        return JsonResponse({'etudiants': list(etudiants)})
    return JsonResponse({'etudiants': []})
