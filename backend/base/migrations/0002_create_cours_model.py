# Generated by Django 2.2 on 2025-05-20 13:31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('base', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='absence',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='bulletin',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='classe',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='etudiant',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='matiere',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='note',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='professeur',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.AlterField(
            model_name='statistique',
            name='id',
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
        migrations.CreateModel(
            name='Cours',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('jour', models.CharField(choices=[('Lundi', 'Lundi'), ('Mardi', 'Mardi'), ('Mercredi', 'Mercredi'), ('Jeudi', 'Jeudi'), ('Vendredi', 'Vendredi'), ('Samedi', 'Samedi')], max_length=10)),
                ('heure_debut', models.TimeField()),
                ('heure_fin', models.TimeField()),
                ('salle', models.CharField(max_length=50)),
                ('description', models.TextField(blank=True, null=True)),
                ('classe', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.Classe')),
                ('matiere', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.Matiere')),
                ('professeur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='base.Professeur')),
            ],
            options={
                'verbose_name_plural': 'Cours',
                'unique_together': {('matiere', 'professeur', 'classe', 'jour', 'heure_debut')},
            },
        ),
    ]
