from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views
from . import sync_views
from . import no_restriction_views
from . import proxy_views  # Importer les vues proxy sans authentification

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
    # CSRF Token endpoint
    path('csrf-token/', api_views.get_csrf_token, name='csrf-token'),
    
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
    
    # Routes sans restriction pour l'enregistrement direct
    path('direct/save-classe/', no_restriction_views.save_classe, name='direct-save-classe'),
    path('direct/save-etudiant/', no_restriction_views.save_etudiant, name='direct-save-etudiant'),
    path('direct/save-professeur/', no_restriction_views.save_professeur, name='direct-save-professeur'),
    path('direct/save-matiere/', no_restriction_views.save_matiere, name='direct-save-matiere'),
    
    # Routes proxy sans authentification (pour le développement uniquement)
    path('proxy/<str:model_name>/', proxy_views.proxy_get_all, name='proxy-get-all'),
    path('proxy/<str:model_name>/<int:obj_id>/', proxy_views.proxy_get_by_id, name='proxy-get-by-id'),
    path('proxy/<str:model_name>/create/', proxy_views.proxy_create, name='proxy-create'),
    path('proxy/<str:model_name>/<int:obj_id>/update/', proxy_views.proxy_update, name='proxy-update'),
    path('proxy/<str:model_name>/<int:obj_id>/delete/', proxy_views.proxy_delete, name='proxy-delete'),
] 