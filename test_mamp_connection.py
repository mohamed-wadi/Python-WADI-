import MySQLdb
import sys

try:
    # Tentative de connexion avec les paramètres MySQL
    connection = MySQLdb.connect(
        host='127.0.0.1',
        port=3306,  # Port standard MySQL
        user='root',
        passwd='',  # Mot de passe vide
        db='mysql'  # On utilise la base mysql qui existe toujours
    )
    
    cursor = connection.cursor()
    
    # Vérifions si la base de données gestion_ecole existe
    cursor.execute("SHOW DATABASES")
    databases = [db[0] for db in cursor.fetchall()]
    print("Bases de données disponibles:", databases)
    
    if 'gestion_ecole' in databases:
        print("La base de données 'gestion_ecole' existe.")
        
        # Connectons-nous à gestion_ecole
        cursor.execute("USE gestion_ecole")
        
        # Vérifions les tables
        cursor.execute("SHOW TABLES")
        tables = [table[0] for table in cursor.fetchall()]
        print("Tables dans gestion_ecole:", tables)
    else:
        print("La base de données 'gestion_ecole' n'existe PAS.")
        print("Création de la base de données 'gestion_ecole'...")
        cursor.execute("CREATE DATABASE IF NOT EXISTS gestion_ecole")
        print("Base de données 'gestion_ecole' créée avec succès.")
    
    cursor.close()
    connection.close()
    print("Test de connexion réussi!")
    
except Exception as e:
    print(f"Erreur de connexion: {e}")
    print(f"Type d'erreur: {type(e)}")
    sys.exit(1)
