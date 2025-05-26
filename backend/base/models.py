from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Avg, Max, Min

# Create your models here.

class Classe(models.Model):
    FILIERE_CHOICES = [
        ('IIR', 'Ingénierie Informatique & Réseaux'),
        ('GESI', 'Génie Électrique et Systèmes Intelligents'),
        ('GCBTP', 'Génie Civil, Bâtiments et Travaux Publics'),
        ('GI', 'Génie Industriel'),
        ('GF', 'Génie Financier'),
    ]
    
    nom = models.CharField(max_length=100)
    niveau = models.CharField(max_length=50)
    filiere = models.CharField(max_length=10, choices=FILIERE_CHOICES, default='IIR')
    annee_scolaire = models.CharField(max_length=9, default='2024-2025')
    
    def __str__(self):
        return f"{self.nom} - {self.get_filiere_display()} - {self.annee_scolaire}"
    
    def nombre_etudiants(self):
        return self.etudiant_set.count()
        
    def moyenne_generale(self):
        notes = Note.objects.filter(etudiant__classe=self)
        if notes.exists():
            return notes.aggregate(Avg('valeur'))['valeur__avg']
        return 0

class Professeur(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=15, blank=True, null=True)
    specialite = models.CharField(max_length=100)
    date_embauche = models.DateField(default=timezone.now)
    
    def __str__(self):
        return f"{self.prenom} {self.nom}"
    
    def nombre_matieres(self):
        return self.matiere_set.count()

class Matiere(models.Model):
    nom = models.CharField(max_length=100)
    code = models.CharField(max_length=10, unique=True)
    coefficient = models.IntegerField(default=1)
    professeur = models.ForeignKey(Professeur, on_delete=models.SET_NULL, null=True, blank=True)
    classes = models.ManyToManyField(Classe)
    
    def __str__(self):
        return self.nom
    
    def moyenne_matiere(self, classe=None):
        notes = Note.objects.filter(matiere=self)
        if classe:
            notes = notes.filter(etudiant__classe=classe)
        if notes.exists():
            return notes.aggregate(Avg('valeur'))['valeur__avg']
        return 0

class Etudiant(models.Model):
    SEXE_CHOICES = [
        ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES)
    adresse = models.TextField(blank=True, null=True)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=15, blank=True, null=True)
    classe = models.ForeignKey(Classe, on_delete=models.SET_NULL, null=True)
    numero_matricule = models.CharField(max_length=20, unique=True)
    date_inscription = models.DateField(default=timezone.now)
    
    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.numero_matricule})"
    
    def age(self):
        today = timezone.now().date()
        return today.year - self.date_naissance.year - ((today.month, today.day) < (self.date_naissance.month, self.date_naissance.day))
    
    def moyenne_generale(self):
        notes = self.note_set.all()
        if notes.exists():
            total_coefficients = sum(note.matiere.coefficient for note in notes)
            total_points = sum(note.valeur * note.matiere.coefficient for note in notes)
            if total_coefficients > 0:
                return total_points / total_coefficients
        return 0

class Note(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE)
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE)
    valeur = models.DecimalField(max_digits=4, decimal_places=2)
    date_evaluation = models.DateField(default=timezone.now)
    type_evaluation = models.CharField(max_length=50, default='Examen')
    commentaire = models.TextField(blank=True, null=True)
    trimestre = models.IntegerField(choices=[(1, '1er Trimestre'), (2, '2ème Trimestre'), (3, '3ème Trimestre')], default=1)
    
    class Meta:
        unique_together = ['etudiant', 'matiere', 'trimestre', 'type_evaluation']
    
    def __str__(self):
        return f"{self.etudiant} - {self.matiere} - {self.valeur}"

class Bulletin(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE)
    trimestre = models.IntegerField(choices=[(1, '1er Trimestre'), (2, '2ème Trimestre'), (3, '3ème Trimestre')])
    annee_scolaire = models.CharField(max_length=9, default='2024-2025')
    date_generation = models.DateField(default=timezone.now)
    moyenne_generale = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    rang = models.IntegerField(null=True, blank=True)
    appreciation = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['etudiant', 'trimestre', 'annee_scolaire']
    
    def __str__(self):
        return f"Bulletin de {self.etudiant} - Trimestre {self.trimestre} - {self.annee_scolaire}"
    
    def calculer_moyenne(self):
        notes = Note.objects.filter(etudiant=self.etudiant, trimestre=self.trimestre)
        if notes.exists():
            total_coefficients = sum(note.matiere.coefficient for note in notes)
            total_points = sum(note.valeur * note.matiere.coefficient for note in notes)
            if total_coefficients > 0:
                self.moyenne_generale = total_points / total_coefficients
                self.save()
                return self.moyenne_generale
        return 0
    
    def calculer_rang(self):
        bulletins = Bulletin.objects.filter(
            trimestre=self.trimestre,
            annee_scolaire=self.annee_scolaire,
            etudiant__classe=self.etudiant.classe
        ).exclude(id=self.id)
        
        if not self.moyenne_generale:
            self.calculer_moyenne()
            
        rang = 1
        for bulletin in bulletins:
            if not bulletin.moyenne_generale:
                bulletin.calculer_moyenne()
            if bulletin.moyenne_generale > self.moyenne_generale:
                rang += 1
        
        self.rang = rang
        self.save()
        return rang

class Absence(models.Model):
    etudiant = models.ForeignKey(Etudiant, on_delete=models.CASCADE)
    date_debut = models.DateField()
    date_fin = models.DateField()
    justifiee = models.BooleanField(default=False)
    motif = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.etudiant} - {self.date_debut}"
    
    def duree(self):
        return (self.date_fin - self.date_debut).days + 1

class Statistique(models.Model):
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE)
    trimestre = models.IntegerField(choices=[(1, '1er Trimestre'), (2, '2ème Trimestre'), (3, '3ème Trimestre')])
    annee_scolaire = models.CharField(max_length=9, default='2024-2025')
    date_generation = models.DateField(default=timezone.now)
    moyenne_classe = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    taux_reussite = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)  # en pourcentage
    meilleure_note = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    moins_bonne_note = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    
    class Meta:
        unique_together = ['classe', 'trimestre', 'annee_scolaire']
    
    def __str__(self):
        return f"Stats {self.classe} - Trimestre {self.trimestre} - {self.annee_scolaire}"
    
    def generer(self):
        notes = Note.objects.filter(
            etudiant__classe=self.classe,
            trimestre=self.trimestre
        )
        
        bulletins = Bulletin.objects.filter(
            etudiant__classe=self.classe,
            trimestre=self.trimestre,
            annee_scolaire=self.annee_scolaire
        )
        
        if notes.exists():
            self.moyenne_classe = notes.aggregate(Avg('valeur'))['valeur__avg']
            self.meilleure_note = notes.aggregate(Max('valeur'))['valeur__max']
            self.moins_bonne_note = notes.aggregate(Min('valeur'))['valeur__min']
            
            # Calcul du taux de réussite (moyenne >= 10)
            if bulletins.exists():
                nb_reussite = bulletins.filter(moyenne_generale__gte=10).count()
                self.taux_reussite = (nb_reussite / bulletins.count()) * 100
                
            self.save()
            return True
        return False


class Cours(models.Model):
    JOURS_CHOICES = [
        ('Lundi', 'Lundi'),
        ('Mardi', 'Mardi'),
        ('Mercredi', 'Mercredi'),
        ('Jeudi', 'Jeudi'),
        ('Vendredi', 'Vendredi'),
        ('Samedi', 'Samedi'),
    ]
    
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE)
    professeur = models.ForeignKey(Professeur, on_delete=models.CASCADE)
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE)
    jour = models.CharField(max_length=10, choices=JOURS_CHOICES)
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    salle = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    
    class Meta:
        unique_together = ['matiere', 'professeur', 'classe', 'jour', 'heure_debut']
        verbose_name_plural = 'Cours'
    
    def __str__(self):
        return f"{self.matiere.nom} - {self.classe.nom} ({self.jour} {self.heure_debut.strftime('%H:%M')}-{self.heure_fin.strftime('%H:%M')})"
    
    def duree(self):
        return (datetime.datetime.combine(datetime.date.today(), self.heure_fin) - 
                datetime.datetime.combine(datetime.date.today(), self.heure_debut)).seconds / 60
