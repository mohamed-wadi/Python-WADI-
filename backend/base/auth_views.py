from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib import messages
from django.contrib.auth.models import User, Group
from .models import Etudiant, Professeur
from django.views import View
from django import forms

class UserLoginForm(AuthenticationForm):
    username = forms.CharField(widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Nom d\'utilisateur'}))
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Mot de passe'}))

class LoginView(View):
    template_name = 'base/auth/login.html'
    
    def get(self, request):
        form = UserLoginForm()
        return render(request, self.template_name, {'form': form})
    
    def post(self, request):
        form = UserLoginForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, f'Bienvenue, {username}!')
                # Rediriger selon le rôle de l'utilisateur
                if user.groups.filter(name='Etudiants').exists():
                    return redirect('base:etudiant-dashboard')
                elif user.groups.filter(name='Professeurs').exists():
                    return redirect('base:professeur-dashboard')
                elif user.is_staff or user.is_superuser:
                    return redirect('base:admin-dashboard')
                else:
                    return redirect('base:home')
            else:
                messages.error(request, 'Nom d\'utilisateur ou mot de passe incorrect.')
        else:
            messages.error(request, 'Erreur de connexion. Veuillez réessayer.')
        
        return render(request, self.template_name, {'form': form})

class LogoutView(View):
    def get(self, request):
        logout(request)
        messages.success(request, 'Vous avez été déconnecté.')
        return redirect('base:login')

# Fonction utilitaire pour créer les groupes de base si nécessaires
def create_default_groups():
    groups = ['Etudiants', 'Professeurs', 'Admins']
    for group_name in groups:
        Group.objects.get_or_create(name=group_name)

# Fonction pour associer un utilisateur à un profil étudiant ou professeur
def link_user_to_profile(user, profile_type, profile_id):
    if profile_type == 'etudiant':
        etudiant = Etudiant.objects.get(id=profile_id)
        etudiant.user = user
        etudiant.save()
        group = Group.objects.get(name='Etudiants')
        user.groups.add(group)
    elif profile_type == 'professeur':
        professeur = Professeur.objects.get(id=profile_id)
        professeur.user = user
        professeur.save()
        group = Group.objects.get(name='Professeurs')
        user.groups.add(group) 