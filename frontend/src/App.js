import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GraphVisualization from './components/GraphVisualization';
import Dashboard from './components/Dashboard';
import AlertsList from './components/AlertsList';
import './App.css';

const API_URL = 'http://localhost:8000';

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analysisRes, graphRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/analyze`),
        axios.get(`${API_URL}/api/graph`),
        axios.get(`${API_URL}/api/stats`)
      ]);

      setAnalysisData(analysisRes.data);
      setGraphData(graphRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error: Asegúrate de que el backend esté corriendo en http://localhost:8000');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando análisis de fraude...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>🔍 Sistema de Detección de Fraude Financiero</h1>
        <p>Análisis con Grafos - Detección de Lavado de Dinero</p>
      </header>

      <nav className="tab-navigation">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'graph' ? 'active' : ''}
          onClick={() => setActiveTab('graph')}
        >
          🕸️ Grafo de Transacciones
        </button>
        <button 
          className={activeTab === 'alerts' ? 'active' : ''}
          onClick={() => setActiveTab('alerts')}
        >
          🚨 Alertas ({analysisData?.total_alerts || 0})
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'dashboard' && (
          <Dashboard stats={stats} summary={analysisData?.summary} graphStats={analysisData?.graph_stats} />
        )}
        
        {activeTab === 'graph' && (
          <GraphVisualization data={graphData} />
        )}
        
        {activeTab === 'alerts' && (
          <AlertsList alerts={analysisData?.alerts || []} />
        )}
      </main>

      <footer className="app-footer">
        <button onClick={loadData} className="refresh-button">
          🔄 Recargar Análisis
        </button>
      </footer>
    </div>
  );
}

export default App;