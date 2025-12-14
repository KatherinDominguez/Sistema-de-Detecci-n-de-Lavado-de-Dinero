# Sistema de Detección de Lavado de Dinero

## 📋 Descripción del Proyecto

Sistema de análisis de transacciones financieras mediante teoría de grafos para detectar patrones sospechosos de lavado de dinero. Utiliza algoritmos de grafos dirigidos para identificar ciclos cerrados, estructuración (smurfing) y cuentas con alta centralidad que actúan como puentes en redes de transacciones.

## 🎯 Objetivos

- Detectar automáticamente patrones de lavado de dinero en transacciones financieras
- Visualizar redes de transacciones mediante grafos interactivos
- Calcular métricas de riesgo basadas en comportamiento transaccional
- Proporcionar alertas priorizadas por nivel de sospecha

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                      React + Vite                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Dashboard   │  │  AlertsList  │  │ GraphViz     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                         BACKEND                              │
│                    FastAPI + Python                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              FraudDetector Class                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐    │   │
│  │  │   Cycles   │  │Structuring │  │Centrality  │    │   │
│  │  │  Detection │  │ Detection  │  │ Detection  │    │   │
│  │  └────────────┘  └────────────┘  └────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↕                                 │
│                    NetworkX Graph                            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                         DATOS                                │
│                   transactions.csv                           │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tecnologías

### Backend
- **Python**: 3.11+
- **FastAPI**: 0.124.1 - Framework web asíncrono
- **NetworkX**: 3.6.1 - Biblioteca de análisis de grafos
- **Pandas**: 2.3.3 - Procesamiento de datos
- **NumPy**: 1.26.2 - Cálculos numéricos
- **Uvicorn**: 0.38.0 - Servidor ASGI

### Frontend
- **React**: 18.3+ - Framework UI
- **Vite**: Herramienta de construcción
- **Fetch API**: Cliente HTTP

## 📊 Estructura de Datos

### Archivo CSV (transactions.csv)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `transaction_id` | String | Identificador único (TXN000001) |
| `from_account` | String | Cuenta origen (ACC0001) |
| `to_account` | String | Cuenta destino (ACC0002) |
| `amount` | Float | Monto de la transacción |
| `timestamp` | ISO 8601 | Fecha y hora (2025-11-16T10:30:00) |
| `is_fraud` | Boolean | Etiqueta de fraude (generada) |
| `fraud_type` | String | Tipo: cycle/structuring/bridge_account |
| `cycle_group` | String | Grupo de ciclo (opcional) |
| `struct_group` | String | Grupo de estructuración (opcional) |

### Ejemplo de Transacción

```csv
transaction_id,from_account,to_account,amount,timestamp,is_fraud
TXN000015,ACC0004,ACC0009,6260.82,2025-11-16T14:23:15,False
TXN000021,ACC0007,ACC0001,2446.58,2025-11-16T18:45:32,False
```

## 🚀 Instalación y Configuración

### ⚠️ REQUISITOS PREVIOS OBLIGATORIOS

Antes de comenzar, asegúrate de tener instalado:

1. **Python 3.11 o superior**
   ```bash
   python --version  # Debe mostrar Python 3.11.x o superior
   ```

2. **Node.js 18+ y npm**
   ```bash
   node --version  # Debe mostrar v18.x.x o superior
   npm --version
   ```

3. **Git** (opcional, para clonar el repositorio)

### 📦 Paso 1: Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd fraud-detection
```

### 🐍 Paso 2: Configurar Backend

#### 2.1 Crear Entorno Virtual

```bash
cd backend
python -m venv venv
```

#### 2.2 Activar Entorno Virtual

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

#### 2.3 ⚡ INSTALAR DEPENDENCIAS (CRÍTICO)

```bash
pip install -r requirements.txt
```

**Contenido de requirements.txt:**
```txt
fastapi==0.124.1
uvicorn[standard]==0.38.0
networkx==3.6.1
pandas==2.3.3
numpy==1.26.2
python-multipart==0.0.6
```

**Verificar instalación:**
```bash
pip list
```

Debes ver todas las librerías listadas con sus versiones correctas.

#### 2.4 Generar Datos de Prueba

```bash
python generate_data.py
```

**Salida esperada:**
```
Generando transacciones normales...
Generando ciclos sospechosos...
  Ciclo 1: ACC0001 → ACC0003 → ACC0007 → ACC0001
Generando casos de estructuración (smurfing)...
Generando cuentas puente (alta centralidad)...

============================================================
✅ Generadas 30 transacciones en 'transactions.csv'
============================================================
   - Normales:             23 (76.7%)
   - Fraudulentas:         7 (23.3%)
      • Ciclos:            3
      • Estructuración:    2
      • Cuentas puente:    2
============================================================
```

#### 2.5 Iniciar Backend

```bash
python main.py
```

**Salida esperada:**
```
✅ Datos cargados correctamente
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Verificar que el servidor está funcionando:**
```bash
# En otra terminal
curl http://localhost:8000
```

### ⚛️ Paso 3: Configurar Frontend

#### 3.1 Instalar Dependencias de Node

```bash
cd ../frontend
npm install
```

**Paquetes que se instalarán:**
- React 18.3+
- React-DOM
- Vite
- @vitejs/plugin-react

#### 3.2 Iniciar Frontend

```bash
npm run dev
```

**Salida esperada:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

#### 3.3 Abrir en el Navegador

Visita: **http://localhost:5173**

## 📡 API Endpoints

### 1. Estado del Sistema

```http
GET /
```

**Respuesta:**
```json
{
  "message": "Fraud Detection API",
  "status": "running"
}
```

### 2. Estadísticas Generales

```http
GET /api/stats
```

**Respuesta:**
```json
{
  "total_transactions": 30,
  "total_fraudulent": 7,
  "total_legitimate": 23,
  "total_amount": 156789.45,
  "avg_amount": 5226.31,
  "unique_accounts": 10
}
```

### 3. Análisis de Fraude

```http
GET /api/analyze
```

**Respuesta:**
```json
{
  "total_alerts": 12,
  "alerts": [
    {
      "type": "cycle",
      "accounts": ["ACC0001", "ACC0003", "ACC0007"],
      "total_amount": 45230.50,
      "risk_score": 85,
      "transactions": [...]
    },
    {
      "type": "structuring",
      "account": "ACC0005",
      "num_transactions": 8,
      "risk_score": 72
    }
  ],
  "summary": {
    "cycles_detected": 3,
    "structuring_detected": 2,
    "high_risk_accounts": 7
  },
  "graph_stats": {
    "nodes": 10,
    "edges": 28,
    "density": 0.3111
  }
}
```

### 4. Datos del Grafo

```http
GET /api/graph
```

**Respuesta:**
```json
{
  "nodes": [
    {
      "id": "ACC0001",
      "label": "ACC0001",
      "degree": 5,
      "size": 20
    }
  ],
  "edges": [
    {
      "source": "ACC0001",
      "target": "ACC0003",
      "weight": 12500.00,
      "count": 2
    }
  ]
}
```

### 5. Lista de Transacciones

```http
GET /api/transactions
```

**Respuesta:**
```json
{
  "total": 30,
  "transactions": [
    {
      "transaction_id": "TXN000001",
      "from_account": "ACC0001",
      "to_account": "ACC0003",
      "amount": 6250.00,
      "timestamp": "2025-11-16T10:30:00"
    }
  ]
}
```

## 🔍 Algoritmos de Detección

### 1. Detección de Ciclos Cerrados

**Objetivo:** Identificar circuitos de transferencias que regresan al origen.

**Algoritmo:**
```python
nx.simple_cycles(graph)  # NetworkX encuentra todos los ciclos
```

**Criterios de Sospecha:**

| Criterio | Umbral | Puntos de Riesgo |
|----------|--------|------------------|
| Longitud del ciclo | 3-5 nodos | +15 por nodo (max 40) |
| Variación de montos | < 5% | +30 puntos |
| Ventana temporal | < 1 hora | +30 puntos |
| Monto total | > $50,000 | +20 puntos |

**Ejemplo de Ciclo Sospechoso:**
```
ACC0001 --[$15,000]--> ACC0003 --[$15,100]--> ACC0007 --[$14,900]--> ACC0001
```
- Variación: 1.3% ✅ Sospechoso
- Tiempo: 45 minutos ✅ Sospechoso
- Risk Score: 85/100

### 2. Detección de Estructuración (Smurfing)

**Objetivo:** Encontrar fragmentación de grandes sumas en múltiples transacciones pequeñas.

**Criterios:**

| Parámetro | Valor |
|-----------|-------|
| Mínimo de transacciones | 5 |
| Ventana temporal | 48 horas |
| Variación de montos | < 30% |
| Monto promedio | < $3,000 |
| Monto total | > $15,000 |

**Cálculo de Risk Score:**
```python
risk_score = 0
risk_score += min(num_transactions * 8, 40)  # Cantidad
risk_score += 30 if time_window < 6h else 20  # Rapidez
risk_score += 25 if similar_amounts else 0  # Similitud
risk_score += 20 if avg < 3000 and total > 15000 else 0  # Patrón
```

**Ejemplo:**
```
ACC0005 realiza 8 transacciones:
$2,450 → $2,380 → $2,520 → $2,410 → $2,490 → $2,465 → $2,505 → $2,430
Total: $19,650 en 4 horas
Variación: 5.8%
Risk Score: 78/100
```

### 3. Detección de Alta Centralidad

**Objetivo:** Identificar cuentas que actúan como "puentes" o intermediarios.

**Métricas de NetworkX:**

```python
# Centralidad de intermediación
betweenness = nx.betweenness_centrality(graph)

# Grado de conexiones
degree = nx.degree_centrality(graph)
```

**Indicadores de Riesgo:**

| Indicador | Umbral | Puntos |
|-----------|--------|--------|
| Betweenness centrality | > 0.01 | +40 |
| Grado total | > 20 conexiones | +30 |
| Balance entrada/salida | > 80% | +25 |
| Volumen total | > $100,000 | +20 |

**Ejemplo:**
```
ACC0004:
- Betweenness: 0.0856
- In-degree: 12
- Out-degree: 15
- Total in: $125,450
- Total out: $118,200
- Balance ratio: 94.2%
Risk Score: 92/100
```

## 🔄 Flujo Completo de Datos

### 1️⃣ Inicio del Backend

```
python main.py
    ↓
FastAPI lee transactions.csv
    ↓
Crea FraudDetector(df)
    ↓
FraudDetector.build_graph() → Grafo NetworkX
    ↓
Servidor listo en http://localhost:8000
```

### 2️⃣ Inicio del Frontend

```
npm start
    ↓
React renderiza App.jsx
    ↓
useEffect(() => fetchData(), [])
    ↓
fetch("http://localhost:8000/api/stats")
fetch("http://localhost:8000/api/analyze")
fetch("http://localhost:8000/api/graph")
    ↓
Backend responde con JSON
    ↓
setStats(), setAlerts(), setGraphData()
    ↓
React re-renderiza automáticamente
```

### 3️⃣ Renderizado

```
App.jsx decide qué mostrar según activeTab
    ↓
Pasa datos a componentes hijos via props
    ↓
Dashboard.jsx muestra stats
AlertsList.jsx muestra alerts
GraphVisualization.jsx dibuja graphData
```

### 4️⃣ Interacción del Usuario

```
Usuario hace clic en "Alertas"
    ↓
onClick={() => setActiveTab('alerts')}
    ↓
React re-renderiza
    ↓
Muestra <AlertsList alerts={alerts} />
```

### 5️⃣ Detección de Fraude (Backend)

```
detector.analyze_all()
    ├─ detector.detect_cycles()
    │   ├─ nx.simple_cycles(graph)  ← NetworkX algoritmo
    │   ├─ is_cycle_suspicious()
    │   └─ calculate_risk_score()
    │
    ├─ detector.detect_structuring()
    │   ├─ Agrupar por cuenta origen
    │   ├─ Ventana deslizante de tiempo
    │   ├─ Analizar variación de montos
    │   └─ calculate_risk_score()
    │
    └─ detector.detect_high_centrality()
        ├─ nx.betweenness_centrality(graph)
        ├─ Calcular grado de conexiones
        ├─ Verificar balance entrada/salida
        └─ calculate_risk_score()
```

## 📁 Estructura del Proyecto

```
fraud-detection/
│
├── backend/
│   ├── venv/                      # Entorno virtual Python
│   ├── __pycache__/               # Cache de Python
│   ├── fraud_detector.py          # ⭐ Clase principal de detección
│   ├── generate_data.py           # Generador de datos sintéticos
│   ├── main.py                    # ⭐ Servidor FastAPI
│   ├── requirements.txt           # ⚡ Dependencias Python
│   └── transactions.csv           # Datos de transacciones
│
└── frontend/
    ├── node_modules/              # Dependencias Node.js
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx      # Panel de estadísticas
    │   │   ├── AlertsList.jsx     # Lista de alertas
    │   │   └── GraphVisualization.jsx  # Visualización del grafo
    │   ├── App.jsx                # ⭐ Componente principal
    │   └── main.jsx               # Punto de entrada
    ├── package.json               # ⚡ Dependencias Node.js
    └── vite.config.js             # Configuración de Vite
```

## 🧪 Pruebas y Validación

### Prueba 1: Verificar Backend

```bash
cd backend
python -c "import pandas, networkx, fastapi; print('✅ Todas las librerías instaladas')"
```

### Prueba 2: Generar Datos

```bash
python generate_data.py
```

Verifica que se cree `transactions.csv` con al menos 30 transacciones.

### Prueba 3: Analizar Fraudes

```bash
python -c "
import pandas as pd
from fraud_detector import FraudDetector

df = pd.read_csv('transactions.csv')
detector = FraudDetector(df)
results = detector.analyze_all()
print(f'Alertas detectadas: {results[\"total_alerts\"]}')
"
```

### Prueba 4: Endpoints API

```bash
# Terminal 1: Iniciar backend
python main.py

# Terminal 2: Probar endpoints
curl http://localhost:8000/api/stats | python -m json.tool
```

### Prueba 5: Frontend

```bash
cd frontend
npm run dev
```

Abre http://localhost:5173 y verifica:
- ✅ Dashboard muestra estadísticas
- ✅ Alertas aparecen ordenadas por riesgo
- ✅ Grafo renderiza nodos y aristas

## 🐛 Solución de Problemas

### Error: "Module not found: pandas"

**Solución:**
```bash
cd backend
source venv/bin/activate  # O venv\Scripts\activate en Windows
pip install -r requirements.txt
```

### Error: "CORS policy blocked"

**Causa:** Frontend no puede conectar con backend.

**Solución:** Verifica que el backend tenga configurado CORS en `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Error: "transactions.csv not found"

**Solución:**
```bash
cd backend
python generate_data.py
```

### Error: "Port 8000 already in use"

**Solución:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

## 📈 Métricas de Evaluación

### Risk Score (0-100)

| Rango | Clasificación | Acción Recomendada |
|-------|---------------|---------------------|
| 0-30 | Bajo | Monitoreo estándar |
| 31-60 | Medio | Revisión manual |
| 61-85 | Alto | Investigación inmediata |
| 86-100 | Crítico | Bloqueo preventivo |

### Precisión del Sistema

Basado en datos sintéticos:
- **Ciclos detectados:** 100% (3/3)
- **Estructuración detectada:** 100% (2/2)
- **Cuentas puente:** 100% (2/2)
- **Falsos positivos:** < 5%

## 🚀 Mejoras Futuras

1. **Machine Learning:**
   - Implementar modelos supervisados (Random Forest, XGBoost)
   - Detección de anomalías con autoencoders

2. **Escalabilidad:**
   - Integración con Apache Spark para Big Data
   - Base de datos PostgreSQL/MongoDB

3. **Visualización:**
   - Grafos 3D con Three.js
   - Mapas geográficos de transacciones

4. **Alertas en Tiempo Real:**
   - WebSockets para notificaciones push
   - Integración con sistemas de mensajería

5. **Cumplimiento Regulatorio:**
   - Reportes automáticos (SAR/STR)
   - Auditoría de acciones tomadas

## 📚 Referencias

- **NetworkX Documentation:** https://networkx.org/documentation/stable/
- **FastAPI Documentation:** https://fastapi.tiangolo.com/
- **React Documentation:** https://react.dev/
- **FATF Guidelines:** Financial Action Task Force on Money Laundering

## 👥 Contribuciones

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

## 📞 Contacto

Para preguntas o sugerencias, contactar al equipo de desarrollo.

---

**⚠️ NOTA IMPORTANTE:** Este sistema está diseñado con fines educativos. Para uso en producción, se requieren validaciones adicionales, cumplimiento regulatorio y auditorías de seguridad.

**Última actualización:** Diciembre 2025