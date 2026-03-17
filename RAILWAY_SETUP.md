# Railway Setup Instructions

## Repositori GitHub
✅ Ja connectat: https://github.com/nimchimsky/freeAIcode.git

## Configuració Railway

### 1. Crear Projecte a Railway

1. Ves a https://railway.app
2. Clica "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Selecciona: `nimchimsky/freeAIcode`

### 2. Afegir Serveis

#### A. PostgreSQL Database
1. Clica "New" → "Database" → "PostgreSQL"
2. Railway crearà automàticament la base de dades

#### B. Web Service
1. Clica "New" → "GitHub Repo" → Selecciona `nimchimsky/freeAIcode`
2. Configuració:
   - **Service Name**: `web`
   - **Root Directory**: (deixar buit)
   - **Start Command**: (deixar buit, usa Procfile)
   - **Branch**: `main`

#### C. Worker Service
1. Clica "New" → "GitHub Repo" → Selecciona `nimchimsky/freeAIcode`
2. Configuració:
   - **Service Name**: `worker`
   - **Root Directory**: (deixar buit)
   - **Start Command**: `npm run worker`
   - **Branch**: `main`

### 3. Variables d'Entorn

Afegeix aquestes variables a **AMBDÓS** serveis (web i worker):

#### Variables Obligatòries

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
APP_URL=https://[el-teu-domini].up.railway.app
ADMIN_USERNAME=admin
ADMIN_PASSWORD=[contrasenya-segura-aquí]
LOG_LEVEL=info
```

#### API Keys (afegeix les que tinguis)

```
OPENROUTER_API_KEY=[la-teva-clau]
GEMINI_API_KEY=[la-teva-clau]
```

#### Opcionals

```
CRON_SECRET=[secret-aleatori]
BENCHMARK_IMPORT_TOKEN=[token-per-uploads]
```

### 4. Configurar Domini

1. Ves al servei **web**
2. Clica "Settings" → "Networking"
3. Clica "Generate Domain"
4. Copia el domini generat
5. Actualitza la variable `APP_URL` amb aquest domini

### 5. Desplegar

Railway desplegarà automàticament quan:
- Facis push a la branca `main`
- Canviïs variables d'entorn
- Facis redeploy manual

### 6. Poblar Dades Inicials

Després del primer desplegament exitós:

```bash
# Instal·la Railway CLI
npm i -g @railway/cli

# Inicia sessió
railway login

# Vincula el projecte
railway link

# Executa el seed
railway run npm run db:seed
```

### 7. Verificar

1. Visita: `https://[el-teu-domini].up.railway.app`
2. Prova: `https://[el-teu-domini].up.railway.app/admin/login`
3. Revisa els logs de cada servei a Railway

## Arquitectura Desplegada

```
┌─────────────────┐
│   PostgreSQL    │
│   (Railway)     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│  Web  │ │Worker │
│Service│ │Service│
└───────┘ └───────┘
```

## Troubleshooting

### Els serveis no arrenquen
- Verifica que totes les variables d'entorn estiguin configurades
- Revisa els logs de build a Railway
- Assegura't que `DATABASE_URL` està disponible

### Migracions fallen
- Verifica que PostgreSQL està running
- Comprova la connexió a la base de dades
- Revisa els logs del servei

### Worker no executa jobs
- Verifica els logs del servei worker
- Comprova que `DATABASE_URL` és correcte
- Assegura't que pg-boss s'ha inicialitzat

## Fitxers de Configuració

- ✅ `Procfile` - Defineix com arrencar web i worker
- ✅ `nixpacks.toml` - Configuració de build per Railway
- ✅ `.env.example` - Template de variables d'entorn
- ✅ `package.json` - Scripts i dependències

## Següents Passos

1. [ ] Crear projecte a Railway
2. [ ] Afegir PostgreSQL
3. [ ] Configurar servei web
4. [ ] Configurar servei worker
5. [ ] Afegir variables d'entorn
6. [ ] Generar domini
7. [ ] Executar seed
8. [ ] Verificar funcionament
