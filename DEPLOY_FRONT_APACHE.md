# Déploiement Front (Vite + React) sur Apache (Ubuntu 24.04)

Ce guide suppose :
- Backend Django accessible à `https://back.charlesago.com`
- Apache 2 installé avec un VirtualHost pour le front (ex: `front.charlesago.com`)

## 1) Build de production

Les URLs d'API/Médias sont configurables avec Vite:
- `VITE_API_BASE_URL` (par défaut `https://back.charlesago.com/api`)
- `VITE_MEDIA_BASE_URL` (par défaut `https://back.charlesago.com/media`)

Locally (ou en CI) :

```
# Optionnel: adapter les URLs si besoin
setx VITE_API_BASE_URL https://back.charlesago.com/api
setx VITE_MEDIA_BASE_URL https://back.charlesago.com/media

npm ci
npm run build
```

Le build génère `dist/`.

## 2) Déploiement sur le serveur

Sur Ubuntu 24.04 (Apache 2):

1. Copier le dossier `dist/` sur le serveur, par ex:
   - `/var/www/learnfront/dist`

2. Activer `mod_rewrite` si pas déjà:

```
sudo a2enmod rewrite
sudo systemctl reload apache2
```

3. VirtualHost pour le front (ex: `front.charlesago.com`):

```
<VirtualHost *:80>
    ServerName front.charlesago.com
    DocumentRoot /var/www/learnfront/dist

    <Directory /var/www/learnfront/dist>
        Options FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/front_error.log
    CustomLog ${APACHE_LOG_DIR}/front_access.log combined
</VirtualHost>
```

4. SPA routing: le fichier `public/.htaccess` est inclus et permet le fallback vers `index.html`.

5. Activer le site et recharger Apache:

```
sudo a2ensite front.conf
sudo systemctl reload apache2
```

## 3) Variables d’environnement (optionnel)

Si vous voulez surcharger les URLs d’API:
- Méthode simple: builder avec `.env.production` (déjà fourni) avant d’envoyer `dist/`.
- Méthode avancée: builder directement sur le serveur avec Node:

```
cd /var/www/learnfront
export VITE_API_BASE_URL=https://back.charlesago.com/api
export VITE_MEDIA_BASE_URL=https://back.charlesago.com/media
npm ci && npm run build
```

## 4) Sécurité / HTTPS

- Placez le VirtualHost en HTTPS (Let’s Encrypt) si ce n’est pas déjà fait.
- CORS doit être correctement configuré côté Django pour `front.charlesago.com`.

## 5) Dépannage rapide

- Page blanche ou 404 sur rafraîchissement: vérifier `mod_rewrite` et `AllowOverride All`, et que `.htaccess` est bien lu dans `dist/`.
- API en erreur: inspecter la console réseau du navigateur, vérifier `VITE_API_BASE_URL` et `CORS` côté backend.
- Cache agressif: vider le cache du navigateur ou ajouter des headers de cache appropriés si nécessaire.
