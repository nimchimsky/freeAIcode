# Railway Deployment Credentials

## 🌐 URL de l'aplicació
https://freeaicode.up.railway.app

## 🔐 Credencials Admin
- **Username**: admin
- **Password**: FreeAI2024Secure!
- **Login URL**: https://freeaicode.up.railway.app/admin/login

## 📊 Estat actual del projecte

### Serveis configurats:
- ✅ PostgreSQL Database (actiu)
- ✅ Web Service (freeAIcode) - desplegant...
- ⏳ Worker Service - PENDENT DE CREAR

### Variables d'entorn configurades:
- ✅ DATABASE_URL
- ✅ NODE_ENV=production
- ✅ APP_URL
- ✅ ADMIN_USERNAME
- ✅ ADMIN_PASSWORD
- ✅ LOG_LEVEL=info

### Pendent:
- ⚠️ API Keys (OpenRouter, Gemini) - opcionals per ara
- ⚠️ Worker Service - necessari per actualitzacions automàtiques

## 📝 Següents passos

### 1. Verificar el deploy del servei web
Espera que el deploy actual acabi (Railway ho farà automàticament després del push a GitHub).

### 2. Crear el Worker Service
```bash
# A Railway dashboard:
1. Clica "New" → "GitHub Repo"
2. Selecciona: nimchimsky/freeAIcode
3. Configura:
   - Service Name: worker
   - Start Command: npm run worker
4. Afegeix les MATEIXES variables d'entorn que el servei web
```

### 3. Poblar dades inicials
Un cop ambdós serveis estiguin running:
```bash
railway run npm run db:seed
```

### 4. Afegir API Keys (opcional)
Per obtenir dades reals dels connectors:
```bash
railway variables --set OPENROUTER_API_KEY=sk-or-v1-...
railway variables --set GEMINI_API_KEY=...
```

## 🔍 Comandes útils

```bash
# Veure logs en temps real
railway logs

# Veure estat del projecte
railway status

# Veure variables
railway variables

# Executar comandes al servidor
railway run <command>

# Canviar de servei
railway link
```

## ⚠️ IMPORTANT
- Guarda aquestes credencials en un lloc segur
- Canvia la contrasenya després del primer login
- No comparteixis aquest fitxer públicament
