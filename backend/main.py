from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import networkx as nx
from fraud_detector import FraudDetector
import json

app = FastAPI(title="Fraud Detection API")

# Configurar CORS para permitir peticiones del frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cargar datos al iniciar
detector = None

@app.on_event("startup")
async def startup_event():
    global detector
    try:
        df = pd.read_csv('transactions.csv')
        detector = FraudDetector(df)
        print("✅ Datos cargados correctamente")
    except FileNotFoundError:
        print("⚠️  Archivo transactions.csv no encontrado. Ejecuta generate_data.py primero")

@app.get("/")
def root():
    return {"message": "Fraud Detection API", "status": "running"}

@app.get("/api/analyze")
def analyze_fraud():
    """Analiza transacciones y detecta fraudes"""
    if detector is None:
        return {"error": "No hay datos cargados"}
    
    results = detector.analyze_all()
    return results

@app.get("/api/graph")
def get_graph_data():
    """Obtiene datos del grafo para visualización"""
    if detector is None:
        return {"error": "No hay datos cargados"}
    
    G = detector.graph
    
    # Preparar nodos
    nodes = []
    for node in G.nodes():
        degree = G.degree(node)
        nodes.append({
            'id': node,
            'label': node,
            'degree': degree,
            'size': min(10 + degree * 2, 50)
        })
    
    # Preparar aristas
    edges = []
    for from_node, to_node, data in G.edges(data=True):
        edges.append({
            'source': from_node,
            'target': to_node,
            'weight': data['weight'],
            'count': data['count']
        })
    
    return {
        'nodes': nodes,
        'edges': edges
    }

@app.get("/api/transactions")
def get_transactions():
    """Obtiene lista de transacciones"""
    if detector is None:
        return {"error": "No hay datos cargados"}
    
    df = detector.df
    return {
        'total': len(df),
        'transactions': df.to_dict('records')[:100]  # Primeras 100
    }

@app.get("/api/stats")
def get_statistics():
    """Obtiene estadísticas generales"""
    if detector is None:
        return {"error": "No hay datos cargados"}
    
    df = detector.df
    
    return {
        'total_transactions': len(df),
        'total_fraudulent': len(df[df['is_fraud']]),
        'total_legitimate': len(df[~df['is_fraud']]),
        'total_amount': round(df['amount'].sum(), 2),
        'avg_amount': round(df['amount'].mean(), 2),
        'unique_accounts': df['from_account'].nunique() + df['to_account'].nunique()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)