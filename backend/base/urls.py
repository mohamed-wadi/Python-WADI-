from django.urls import path
from . import views
from . import views_cours_simple, views_classe_advanced
from . import auth_views, dashboard_views, professor_views

app_name = 'base'

urlpatterns = [
    # Authentification
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    
    # Tableaux de bord
    path('etudiant/dashboard/', dashboard_views.EtudiantDashboardView.as_view(), name='etudiant-dashboard'),
    path('professeur/dashboard/', dashboard_views.ProfesseurDashboardView.as_view(), name='professeur-dashboard'),
    path('admin/dashboard/', dashboard_views.AdminDashboardView.as_view(), name='admin-dashboard'),
    
    # Page d'accueil
    path('', views.Home.as_view(), name='home'),
    
    # Gestion des étudiants
    path('etudiants/', views.EtudiantListView.as_view(), name='etudiant-list'),
    path('etudiants/<int:pk>/', views.EtudiantDetailView.as_view(), name='etudiant-detail'),
    path('etudiants/ajouter/', views.EtudiantCreateView.as_view(), name='etudiant-create'),
    path('etudiants/<int:pk>/modifier/', views.EtudiantUpdateView.as_view(), name='etudiant-update'),
    path('etudiants/<int:pk>/supprimer/', views.EtudiantDeleteView.as_view(), name='etudiant-delete'),
    
    # Gestion des professeurs
    path('professeurs/', views.ProfesseurListView.as_view(), name='professeur-list'),
    path('professeurs/<int:pk>/', views.ProfesseurDetailView.as_view(), name='professeur-detail'),
    path('professeurs/ajouter/', views.ProfesseurCreateView.as_view(), name='professeur-create'),
    path('professeurs/<int:pk>/modifier/', views.ProfesseurUpdateView.as_view(), name='professeur-update'),
    path('professeurs/<int:pk>/supprimer/', views.ProfesseurDeleteView.as_view(), name='professeur-delete'),
    
    # Gestion des classes
    path('classes/', views.ClasseListView.as_view(), name='classe-list'),
    path('classes/<int:pk>/', views.ClasseDetailView.as_view(), name='classe-detail'),
    path('classes/ajouter/', views.ClasseCreateView.as_view(), name='classe-create'),
    path('classes/<int:pk>/modifier/', views.ClasseUpdateView.as_view(), name='classe-update'),
    path('classes/<int:pk>/supprimer/', views.ClasseDeleteView.as_view(), name='classe-delete'),
    
    # Gestion avancée des classes
    path('classes/<int:classe_id>/gestion-etudiants/', views_classe_advanced.GestionEtudiantsClasseView.as_view(), name='gestion-etudiants-classe'),
    path('classes/<int:classe_id>/gestion-matieres/', views_classe_advanced.GestionMatieresClasseView.as_view(), name='gestion-matieres-classe'),
    path('classes/<int:classe_id>/emploi-du-temps/', views_classe_advanced.EmploiDuTempsClasseView.as_view(), name='emploi-du-temps-classe'),
    path('classes/<int:classe_id>/statistiques/', views_classe_advanced.StatistiquesClasseView.as_view(), name='statistiques-classe'),

    # Gestion des matières
    path('matieres/', views.MatiereListView.as_view(), name='matiere-list'),
    path('matieres/<int:pk>/', views.MatiereDetailView.as_view(), name='matiere-detail'),
    path('matieres/ajouter/', views.MatiereCreateView.as_view(), name='matiere-create'),
    path('matieres/<int:pk>/modifier/', views.MatiereUpdateView.as_view(), name='matiere-update'),
    path('matieres/<int:pk>/supprimer/', views.MatiereDeleteView.as_view(), name='matiere-delete'),
    
    # Gestion des notes
    path('notes/', views.NoteListView.as_view(), name='note-list'),
    path('notes/ajouter/', views.NoteCreateView.as_view(), name='note-create'),
    path('notes/<int:pk>/modifier/', views.NoteUpdateView.as_view(), name='note-update'),
    path('notes/<int:pk>/supprimer/', views.NoteDeleteView.as_view(), name='note-delete'),
    path('notes/par-classe/', views.NotesParClasseView.as_view(), name='notes-par-classe'),
    
    # Gestion des notes (professeur)
    path('professeur/notes/', professor_views.ProfesseurNoteListView.as_view(), name='professeur-note-list'),
    path('professeur/notes/ajouter/', professor_views.ProfesseurNoteCreateView.as_view(), name='professeur-note-create'),
    path('professeur/notes/<int:pk>/modifier/', professor_views.ProfesseurNoteUpdateView.as_view(), name='professeur-note-update'),
    path('professeur/notes/<int:pk>/supprimer/', professor_views.ProfesseurNoteDeleteView.as_view(), name='professeur-note-delete'),
    path('professeur/notes/par-classe/', professor_views.ProfesseurNotesParClasseView.as_view(), name='professeur-notes-par-classe'),
    path('professeur/bulletins/generer/', professor_views.ProfesseurGenererBulletinView.as_view(), name='professeur-generer-bulletin'),
    
    # Gestion des bulletins
    path('bulletins/', views.BulletinListView.as_view(), name='bulletin-list'),
    path('bulletins/<int:pk>/', views.BulletinDetailView.as_view(), name='bulletin-detail'),
    path('bulletins/<int:pk>/pdf/', views.BulletinPDFView.as_view(), name='bulletin-pdf'),
    path('bulletins/<int:pk>/supprimer/', views.BulletinDeleteView.as_view(), name='bulletin-delete'),
    path('bulletins/generer/', views.GenererBulletinView.as_view(), name='bulletin-generer'),
    
    # API pour la génération des bulletins
    path('etudiants-par-classe/', views.etudiants_par_classe, name='etudiants-par-classe'),
    
    # Gestion des cours (vue simplifiée)
    path('cours/', views.CoursSimpleView.as_view(), name='cours-list'),
]
