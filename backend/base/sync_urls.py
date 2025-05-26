from django.urls import path
from . import sync_views

urlpatterns = [
    path('professeurs/', sync_views.sync_professeurs, name='sync_professeurs'),
    path('classes/', sync_views.sync_classes, name='sync_classes'),
    path('etudiants/', sync_views.sync_etudiants, name='sync_etudiants'),
    path('matieres/', sync_views.sync_matieres, name='sync_matieres'),
    path('notes/', sync_views.sync_notes, name='sync_notes'),
    path('cours/', sync_views.sync_cours, name='sync_cours'),
]
