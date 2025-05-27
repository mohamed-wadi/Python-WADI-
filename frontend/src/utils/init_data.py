import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.models import User, Group
from base.models import Classe, Professeur, Etudiant, Matiere, Cours, Note
from django.db import transaction
from datetime import datetime, time
import random

def create_test_data(force=True): # DISABLED_BY_FIX
    # Vérifier si des données utilisateur existent déjà
    if Classe.objects.count() > 0 or Matiere.objects.count() > 0:
        print("Données utilisateur existantes, pas de création de nouvelles données.")
        return

    print("Initialisation des données de test...")
    
    # Vérifier si des données existent déjà
    if Classe.objects.count() > 0 and Professeur.objects.count() > 0 and not force:
        print("Des données existent déjà dans la base de données. Utilisez force=True pour ajouter quand même.")
        print("Opération annulée.")
        return
    
    try:
        with transaction.atomic():
            # Création des groupes
            for group_name in ['Etudiants', 'Professeurs', 'Admins']:
                Group.objects.get_or_create(name=group_name)
            
            # Vérifier si des classes et matières existent déjà
            # Si oui, ne pas en créer de nouvelles pour éviter les doublons
            if Classe.objects.count() > 0 and Matiere.objects.count() > 0:
                print("Des classes et matières existent déjà, pas de création de nouvelles données pour ces entités.")
                create_classes_and_matieres = False
            else:
                create_classes_and_matieres = True
            
            # Création des classes seulement si nécessaire
            classes = list(Classe.objects.all())
            if create_classes_and_matieres and not classes:
                for niveau in range(1, 6):  # ING1 à ING5
                    for lettre in ['A', 'B']:
                        nom = f"Classe ING{niveau}-{lettre}"
                        classe, created = Classe.objects.get_or_create(
                            nom=nom,
                            niveau=niveau
                        )
                        classes.append(classe)
                        if created:
                            print(f"Classe créée: {nom}")
            
            # Création des professeurs
            professeurs = []
            noms = ["Dupont", "Martin", "Durand", "Petit", "Moreau", "Simon", "Laurent"]
            prenoms = ["Jean", "Marie", "Pierre", "Sophie", "Thomas", "Claire", "Michel", "Anne"]
            
            for i in range(7):
                nom = noms[i]
                prenom = prenoms[i]
                email = f"{prenom.lower()}.{nom.lower()}@ecole.fr"
                
                # Niveaux enseignés (entre 1 et 3 niveaux aléatoires)
                niveaux_enseignes = random.sample(range(1, 6), random.randint(1, 3))
                niveaux_str = ",".join([str(n) for n in niveaux_enseignes])
                
                professeur, created = Professeur.objects.get_or_create(
                    nom=nom,
                    prenom=prenom,
                    email=email,
                    defaults={
                        'telephone': f"06{random.randint(10000000, 99999999)}",
                        'specialite': random.choice(["Mathématiques", "Informatique", "Physique", "Langues", "Économie"]),
                        'niveaux_enseignes': niveaux_str
                    }
                )
                professeurs.append(professeur)
                if created:
                    print(f"Professeur créé: {prenom} {nom}")
            
            # Création des étudiants
            etudiants = []
            for classe in classes:
                for i in range(5):  # 5 étudiants par classe
                    nom = random.choice(noms)
                    prenom = random.choice(prenoms)
                    # Générer un numéro de matricule unique
                    matricule = f"ET{classe.niveau}{random.randint(1000, 9999)}"
                    while Etudiant.objects.filter(numero_matricule=matricule).exists():
                        matricule = f"ET{classe.niveau}{random.randint(1000, 9999)}"
                    
                    email = f"{prenom.lower()}.{nom.lower()}{random.randint(10, 99)}@etudiant.fr"
                    
                    etudiant, created = Etudiant.objects.get_or_create(
                        email=email,
                        defaults={
                            'nom': nom,
                            'prenom': prenom,
                            'date_naissance': datetime(random.randint(1990, 2000), random.randint(1, 12), random.randint(1, 28)),
                            'telephone': f"07{random.randint(10000000, 99999999)}",
                            'classe': classe,
                            'niveau': int(classe.niveau),
                            'numero_matricule': matricule,
                            'sexe': random.choice(['M', 'F'])
                        }
                    )
                    etudiants.append(etudiant)
                    if created:
                        print(f"Étudiant créé: {prenom} {nom} (Classe: {classe.nom})")
            
            # Création des matières seulement si nécessaire
            matieres = list(Matiere.objects.all())
            if create_classes_and_matieres and not matieres:
                noms_matieres = ["Mathématiques", "Informatique", "Physique", "Anglais", "Économie", "Chimie"]
                
                for nom_matiere in noms_matieres:
                    # Trouver un professeur qualifié aléatoirement
                    if professeurs:
                        professeur_qualifie = random.choice(professeurs)
                        
                        # Générer un code unique pour la matière
                        code = nom_matiere[:3].upper() + str(random.randint(100, 999))
                        while Matiere.objects.filter(code=code).exists():
                            code = nom_matiere[:3].upper() + str(random.randint(100, 999))
                        
                        matiere, created = Matiere.objects.get_or_create(
                            nom=nom_matiere,
                            defaults={
                                'code': code,
                                'coefficient': random.randint(1, 5),
                                'professeur': professeur_qualifie
                            }
                        )
                        matieres.append(matiere)
                        if created:
                            print(f"Matière créée: {nom_matiere} (Prof: {professeur_qualifie.prenom} {professeur_qualifie.nom})")
                        
                        # Associer la matière à quelques classes
                        if classes:
                            for classe in random.sample(classes, min(random.randint(2, 5), len(classes))):
                                matiere.classes.add(classe)
            
            # Création des cours
            jours = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
            heures_debut = [time(8, 0), time(10, 0), time(13, 0), time(15, 0)]
            heures_fin = [time(10, 0), time(12, 0), time(15, 0), time(17, 0)]
            
            for classe in classes:
                # 3 cours par classe
                for i in range(3):
                    matiere = random.choice(matieres)
                    professeur = matiere.professeur
                    
                    # Vérifier que le professeur enseigne à ce niveau
                    if str(classe.niveau) in professeur.niveaux_enseignes.split(','):
                        jour = random.choice(jours)
                        index = random.randint(0, len(heures_debut) - 1)
                        
                        cours, created = Cours.objects.get_or_create(
                            matiere=matiere,
                            professeur=professeur,
                            classe=classe,
                            jour=jour,
                            heure_debut=heures_debut[index],
                            heure_fin=heures_fin[index],
                            defaults={
                                'salle': f"S{random.randint(100, 999)}",
                                'niveau': int(classe.niveau)
                            }
                        )
                        if created:
                            print(f"Cours créé: {matiere.nom} - {classe.nom} - {jour}")
            
            # Création des notes
            for etudiant in etudiants:
                # 3 notes par étudiant
                matieres_etudiant = Matiere.objects.filter(classes=etudiant.classe)
                for matiere in matieres_etudiant[:3]:  # Prendre les 3 premières matières
                    note, created = Note.objects.get_or_create(
                        etudiant=etudiant,
                        matiere=matiere,
                        trimestre=random.randint(1, 3),
                        type_evaluation='Examen',
                        defaults={
                            'valeur': random.randint(8, 20),  # Notes entre 8 et 20
                            'date_evaluation': datetime(2023, random.randint(1, 12), random.randint(1, 28)),
                            'commentaire': random.choice([
                                "Bon travail", "Peut mieux faire", "Excellent", "Satisfaisant", 
                                "À améliorer", "Très bon travail", "Progrès constants"
                            ])
                        }
                    )
                    if created:
                        print(f"Note créée: {etudiant.prenom} {etudiant.nom} - {matiere.nom} - {note.valeur}/20")
        
        print("Initialisation des données terminée avec succès!")
    
    except Exception as e:
        print(f"Erreur lors de l'initialisation des données: {e}")

if __name__ == "__main__":
    pass  # Aucun appel automatique, bloc vide pour éviter l'erreur d'indentation
