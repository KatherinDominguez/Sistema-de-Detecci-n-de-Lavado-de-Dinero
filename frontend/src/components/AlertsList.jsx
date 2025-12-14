import React, { useState } from 'react';
import './AlertsList.css';

function AlertsList({ alerts }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('risk-desc');

  if (!alerts || alerts.length === 0) {
    return (
      <div className="no-alerts">
        <div className="no-alerts-icon">✅</div>
        <h3>No se detectaron alertas</h3>
        <p>Todas las transacciones parecen legítimas</p>
      </div>
    );
  }

  // Filtrar alertas
  let filteredAlerts = alerts;
  if (filter !== 'all') {
    filteredAlerts = alerts.filter(alert => alert.type === filter);
  }

  // Ordenar alertas
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (sortBy === 'risk-desc') {
      return b.risk_score - a.risk_score; // Mayor a Menor
    } else if (sortBy === 'risk-asc') {
      return a.risk_score - b.risk_score; // Menor a Mayor
    }
    return 0;
  });

  const getRiskLevel = (score) => {
    if (score >= 80) return { label: 'CRÍTICO', class: 'critical' };
    if (score >= 60) return { label: 'ALTO', class: 'high' };
    if (score >= 40) return { label: 'MEDIO', class: 'medium' };
    return { label: 'BAJO', class: 'low' };
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'cycle': return '🔄';
      case 'structuring': return '🔀';
      case 'high_centrality': return '🎯';
      default: return '⚠️';
    }
  };

  const getAlertTitle = (type) => {
    switch(type) {
      case 'cycle': return 'Ciclo Detectado';
      case 'structuring': return 'Estructuración (Smurfing)';
      case 'high_centrality': return 'Alta Centralidad';
      default: return 'Alerta';
    }
  };

  // ✅ Función para formatear fecha/hora
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Función para construir tabla de transacciones del ciclo
  const renderCycleTransactions = (alert) => {
    if (!alert.transactions || alert.transactions.length === 0) {
      return null;
    }

    // Ordenar transacciones por timestamp
    const sortedTxns = [...alert.transactions].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    // Mapear transacciones a la secuencia del ciclo
    const cycleSequence = [];
    for (let i = 0; i < alert.accounts.length; i++) {
      const fromAcc = alert.accounts[i];
      const toAcc = alert.accounts[(i + 1) % alert.accounts.length];
      
      // Buscar la transacción correspondiente
      const txn = sortedTxns.find(t => 
        t.from_account === fromAcc && t.to_account === toAcc
      );
      
      if (txn) {
        cycleSequence.push({
          ...txn,
          from_account: fromAcc,
          to_account: toAcc,
          step: i + 1
        });
      }
    }

    return (
      <div className="transactions-table">
        <h4>📋 Transacciones del Ciclo</h4>
        <table>
          <thead>
            <tr>
              <th>Paso</th>
              <th>ID Transacción</th>
              <th>Desde</th>
              <th>→</th>
              <th>Hacia</th>
              <th>Monto</th>
              <th>Fecha/Hora</th>
            </tr>
          </thead>
          <tbody>
            {cycleSequence.map((txn, idx) => (
              <tr key={idx}>
                <td className="step-number">{txn.step}</td>
                <td className="txn-id">{txn.id}</td>
                <td><span className="account-mini">{txn.from_account}</span></td>
                <td className="arrow-cell">→</td>
                <td><span className="account-mini">{txn.to_account}</span></td>
                <td className="amount">${txn.amount.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td className="timestamp">{formatTimestamp(txn.timestamp)}</td>
              </tr>
            ))}
            {/* Fila visual que muestra el cierre del ciclo */}
            <tr className="cycle-closure">
              <td colSpan="7" className="closure-note">
                ↻ El dinero regresa a <span className="account-mini">{alert.accounts[0]}</span> completando el ciclo
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="alerts-container">
      <div className="alerts-header">
        <h2>🚨 Alertas de Fraude Detectadas</h2>
        <p>Total: {alerts.length} alertas</p>
      </div>

      <div className="alerts-controls">
        <div className="filter-group">
          <label>Filtrar por tipo:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todos ({alerts.length})</option>
            <option value="cycle">Ciclos ({alerts.filter(a => a.type === 'cycle').length})</option>
            <option value="structuring">Estructuración ({alerts.filter(a => a.type === 'structuring').length})</option>
            <option value="high_centrality">Alta Centralidad ({alerts.filter(a => a.type === 'high_centrality').length})</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Ordenar por:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="risk-desc">Riesgo: Mayor a Menor ⬇️</option>
            <option value="risk-asc">Riesgo: Menor a Mayor ⬆️</option>
          </select>
        </div>
      </div>

      <div className="alerts-list">
        {sortedAlerts.map((alert, index) => {
          const riskLevel = getRiskLevel(alert.risk_score);
          
          return (
            <div key={index} className={`alert-card ${riskLevel.class}`}>
              <div className="alert-header">
                <div className="alert-type">
                  <span className="alert-icon">{getAlertIcon(alert.type)}</span>
                  <span className="alert-title">{getAlertTitle(alert.type)}</span>
                </div>
                <div className={`risk-badge ${riskLevel.class}`}>
                  {riskLevel.label} - {alert.risk_score}%
                </div>
              </div>

              <div className="alert-body">
                {alert.type === 'cycle' && (
                  <>
                    <div className="alert-detail">
                      <strong>Patrón del Ciclo:</strong>
                      <div className="accounts-chain">
                        {alert.accounts.map((acc, i) => (
                          <React.Fragment key={i}>
                            <span className="account-badge">{acc}</span>
                            {i < alert.accounts.length - 1 && <span className="arrow">→</span>}
                          </React.Fragment>
                        ))}
                        <span className="arrow cycle-arrow">↻</span>
                        <span className="account-badge highlight">{alert.accounts[0]}</span>
                      </div>
                    </div>

                    {/* ✅ TABLA DE TRANSACCIONES DEL CICLO */}
                    {renderCycleTransactions(alert)}

                    <div className="alert-detail">
                      <strong>Monto total del ciclo:</strong> ${alert.total_amount.toLocaleString()}
                    </div>
                    <div className="alert-detail">
                      <strong>Monto promedio:</strong> ${alert.avg_amount.toLocaleString()}
                    </div>
                    <div className="alert-detail">
                      <strong>Variación de montos:</strong> {alert.amount_variation}%
                      {alert.amount_variation < 10 && <span className="warning-badge">⚠️ Montos casi idénticos</span>}
                    </div>
                    <div className="alert-detail">
                      <strong>Ventana de tiempo:</strong> {alert.time_span_hours.toFixed(1)} horas
                      {alert.time_span_hours < 24 && <span className="warning-badge">⚠️ Transacciones muy rápidas</span>}
                    </div>
                    <div className="alert-info">
                      ℹ️ El dinero circula entre estas cuentas y vuelve al origen. 
                      {alert.amount_variation < 10 && alert.time_span_hours < 24 
                        ? " Los montos similares y el corto tiempo entre transacciones indican un patrón altamente sospechoso de lavado de dinero."
                        : " El patrón circular es sospechoso pero requiere investigación adicional."
                      }
                    </div>
                  </>
                )}

                {alert.type === 'structuring' && (
                  <>
                    <div className="alert-detail">
                      <strong>Cuenta origen:</strong> <span className="account-badge">{alert.account}</span>
                    </div>
                    <div className="alert-detail">
                      <strong>Número de transacciones:</strong> {alert.num_transactions}
                    </div>
                    <div className="alert-detail">
                      <strong>Monto total:</strong> ${alert.total_amount.toLocaleString()}
                    </div>
                    <div className="alert-detail">
                      <strong>Monto promedio:</strong> ${alert.avg_amount.toLocaleString()}
                    </div>
                    <div className="alert-detail">
                      <strong>Variación de montos:</strong> {alert.amount_variation}%
                      {alert.similar_amounts && <span className="warning-badge">⚠️ Montos similares</span>}
                    </div>
                    <div className="alert-detail">
                      <strong>Ventana de tiempo:</strong> {alert.time_window_hours.toFixed(1)} horas
                    </div>
                    <div className="alert-info">
                      ℹ️ Múltiples transacciones {alert.similar_amounts ? "de montos similares " : ""}
                      en corto tiempo para evadir detección. Este patrón (smurfing) es usado comúnmente 
                      para dividir grandes sumas y evitar los límites de reporte bancario.
                    </div>
                  </>
                )}

                {alert.type === 'high_centrality' && (
                  <>
                    <div className="alert-detail">
                      <strong>Cuenta:</strong> <span className="account-badge">{alert.account}</span>
                    </div>
                    <div className="alert-detail">
                      <strong>Centralidad intermediación:</strong> {alert.betweenness}
                    </div>
                    <div className="alert-detail">
                      <strong>Transacciones entrantes:</strong> {alert.in_degree}
                    </div>
                    <div className="alert-detail">
                      <strong>Transacciones salientes:</strong> {alert.out_degree}
                    </div>
                    <div className="alert-detail">
                      <strong>Monto total entrante:</strong> ${alert.total_in_amount.toLocaleString()}
                    </div>
                    <div className="alert-detail">
                      <strong>Monto total saliente:</strong> ${alert.total_out_amount.toLocaleString()}
                    </div>
                    {alert.is_balanced_bridge && (
                      <div className="alert-detail">
                        <span className="warning-badge">⚠️ Puente balanceado: Entrada ≈ Salida</span>
                      </div>
                    )}
                    <div className="alert-info">
                      ℹ️ Esta cuenta actúa como intermediario en muchas transacciones
                      {alert.is_balanced_bridge 
                        ? ", con un balance sospechoso entre entradas y salidas. Posible 'mula financiera' o cuenta puente para ocultar el origen del dinero."
                        : ". Podría ser una cuenta legítima con alta actividad o un intermediario para operaciones ilícitas."
                      }
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AlertsList;