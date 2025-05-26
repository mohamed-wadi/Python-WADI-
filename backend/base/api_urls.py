from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views
from . import sync_views

router = DefaultRouter()
router.register(r'etudiants', api_views.EtudiantViewSet)
router.register(r'professeurs', api_views.ProfesseurViewSet)
router.register(r'classes', api_views.ClasseViewSet)
router.register(r'matieres', api_views.MatiereViewSet)
router.register(r'notes', api_views.NoteViewSet)
router.register(r'bulletins', api_views.BulletinViewSet)
router.register(r'cours', api_views.CoursViewSet)
router.register(r'absences', api_views.AbsenceViewSet)

urlpatterns = [
    # Authentication
    path('auth/login/', api_views.LoginView.as_view(), name='api-login'),
    path('auth/logout/', api_views.LogoutView.as_view(), name='api-logout'),
    path('auth/user/', api_views.UserView.as_view(), name='api-user'),
    
    # Dashboard data
    path('dashboard/etudiant/', api_views.etudiant_dashboard_data, name='api-etudiant-dashboard'),
    path('dashboard/professeur/', api_views.professeur_dashboard_data, name='api-professeur-dashboard'),
    path('dashboard/admin/', api_views.admin_dashboard_data, name='api-admin-dashboard'),
    
    # Router API URLs
    path('', include(router.urls)),
    
    # Synchronisation URLs
    path('sync/professeurs/', sync_views.sync_professeurs, name='sync-professeurs'),
    path('sync/classes/', sync_views.sync_classes, name='sync-classes'),
    path('sync/etudiants/', sync_views.sync_etudiants, name='sync-etudiants'),
    path('sync/matieres/', sync_views.sync_matieres, name='sync-matieres'),
    path('sync/notes/', sync_views.sync_notes, name='sync-notes'),
    path('sync/cours/', sync_views.sync_cours, name='sync-cours'),
] 