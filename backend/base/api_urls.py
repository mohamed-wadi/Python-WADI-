from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import api_views

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
] 