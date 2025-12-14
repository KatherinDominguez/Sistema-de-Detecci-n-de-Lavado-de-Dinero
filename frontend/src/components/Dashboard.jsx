import React from 'react';
import './Dashboard.css';

function Dashboard({ stats, summary, graphStats }) {
  if (!stats || !summary || !graphStats) {
    return <div>Cargando estadísticas...</div>;
  }

  return (
    <div className="dashboard">
      <h2>📊 Panel de Control</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💳</div>
          <div className="stat-content">
            <h3>{stats.total_transactions}</h3>
            <p>Total Transacciones</p>
          </div>
        </div>

        <div className="stat-card fraud">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.total_fraudulent}</h3>
            <p>Transacciones Fraudulentas</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.total_legitimate}</h3>
            <p>Transacciones Legítimas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>${stats.total_amount.toLocaleString()}</h3>
            <p>Monto Total</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>${stats.avg_amount.toLocaleString()}</h3>
            <p>Monto Promedio</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.unique_accounts}</h3>
            <p>Cuentas Únicas</p>
          </div>
        </div>
      </div>

      <div className="analysis-section">
        <h3>🔍 Resultados del Análisis</h3>
        
        <div className="analysis-grid">
          <div className="analysis-card">
            <h4>🔄 Ciclos Detectados</h4>
            <div className="analysis-number">{summary.cycles_detected}</div>
            <p>Patrones de dinero circular</p>
          </div>

          <div className="analysis-card">
            <h4>🔀 Estructuración (Smurfing)</h4>
            <div className="analysis-number">{summary.structuring_detected}</div>
            <p>Múltiples transacciones pequeñas</p>
          </div>

          <div className="analysis-card">
            <h4>🎯 Cuentas de Alto Riesgo</h4>
            <div className="analysis-number">{summary.high_risk_accounts}</div>
            <p>Alta centralidad en la red</p>
          </div>
        </div>
      </div>

      <div className="graph-info">
        <h3>🕸️ Información del Grafo</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Nodos:</span>
            <span className="info-value">{graphStats.nodes}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Aristas:</span>
            <span className="info-value">{graphStats.edges}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Densidad:</span>
            <span className="info-value">{graphStats.density}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;