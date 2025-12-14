import networkx as nx
import pandas as pd
from collections import defaultdict
from datetime import datetime, timedelta

class FraudDetector:
    def __init__(self, transactions_df):
        self.df = transactions_df
        self.graph = self.build_graph()
        self.alerts = []
    
    def build_graph(self):
        """Construye el grafo de transacciones"""
        G = nx.DiGraph()
        
        for _, row in self.df.iterrows():
            from_acc = row['from_account']
            to_acc = row['to_account']
            amount = row['amount']
            txn_id = row['transaction_id']
            timestamp = row['timestamp']
            
            G.add_node(from_acc)
            G.add_node(to_acc)
            
            if G.has_edge(from_acc, to_acc):
                G[from_acc][to_acc]['weight'] += amount
                G[from_acc][to_acc]['count'] += 1
                G[from_acc][to_acc]['transactions'].append({
                    'id': txn_id,
                    'amount': amount,
                    'timestamp': timestamp,
                    'from_account': from_acc,  # ✅ Agregado
                    'to_account': to_acc       # ✅ Agregado
                })
            else:
                G.add_edge(from_acc, to_acc, 
                          weight=amount, 
                          count=1,
                          transactions=[{
                              'id': txn_id,
                              'amount': amount,
                              'timestamp': timestamp,
                              'from_account': from_acc,  # ✅ Agregado
                              'to_account': to_acc       # ✅ Agregado
                          }])
        
        return G
    
    def get_cycle_transactions(self, cycle):
        """Obtiene todas las transacciones de un ciclo cerrado"""
        all_txns = []
        
        for i in range(len(cycle)):
            from_acc = cycle[i]
            to_acc = cycle[(i + 1) % len(cycle)]
            
            if self.graph.has_edge(from_acc, to_acc):
                edge_data = self.graph[from_acc][to_acc]
                all_txns.extend(edge_data['transactions'])
            else:
                print(f"⚠️ Arista faltante en ciclo: {from_acc} → {to_acc}")
                return []
        
        return all_txns
    
    def is_cycle_suspicious(self, cycle):
        """Determina si un ciclo es realmente sospechoso"""
        cycle_txns = self.get_cycle_transactions(cycle)
        
        if not cycle_txns:
            return False
        
        amounts = [txn['amount'] for txn in cycle_txns]
        timestamps = [datetime.fromisoformat(txn['timestamp']) for txn in cycle_txns]
        
        if amounts:
            avg_amount = sum(amounts) / len(amounts)
            max_amount = max(amounts)
            min_amount = min(amounts)
            variation = (max_amount - min_amount) / avg_amount if avg_amount > 0 else 0
            
            if variation > 0.20:
                return False
        
        total_amount = sum(amounts)
        if total_amount < 5000:
            return False
        
        if timestamps:
            time_span = (max(timestamps) - min(timestamps)).total_seconds() / 3600
            if time_span > 48:
                return False
        
        return True
    
    def detect_cycles(self):
        """Detecta ciclos con validación robusta"""
        cycles_found = []
        
        try:
            cycles = list(nx.simple_cycles(self.graph))
            
            print(f"\n🔍 NetworkX encontró {len(cycles)} ciclos totales")
            
            for cycle in cycles:
                if len(cycle) < 3:
                    continue
                
                cycle_complete = True
                for i in range(len(cycle)):
                    from_acc = cycle[i]
                    to_acc = cycle[(i + 1) % len(cycle)]
                    
                    if not self.graph.has_edge(from_acc, to_acc):
                        print(f"   ⚠️ Ciclo incompleto: falta {from_acc} → {to_acc}")
                        cycle_complete = False
                        break
                
                if not cycle_complete:
                    continue
                
                if not self.is_cycle_suspicious(cycle):
                    continue
                
                cycle_txns = self.get_cycle_transactions(cycle)
                
                if not cycle_txns:
                    continue
                
                amounts = [txn['amount'] for txn in cycle_txns]
                timestamps = [datetime.fromisoformat(txn['timestamp']) for txn in cycle_txns]
                
                total_amount = sum(amounts)
                avg_amount = sum(amounts) / len(amounts)
                time_span = (max(timestamps) - min(timestamps)).total_seconds() / 3600
                
                risk_score = 0
                risk_score += min(len(cycle) * 15, 40)
                
                max_amount = max(amounts)
                min_amount = min(amounts)
                variation = (max_amount - min_amount) / avg_amount if avg_amount > 0 else 0
                
                if variation < 0.05:
                    risk_score += 30
                elif variation < 0.15:
                    risk_score += 20
                
                if time_span < 1:
                    risk_score += 30
                elif time_span < 12:
                    risk_score += 20
                elif time_span < 24:
                    risk_score += 10
                
                if total_amount > 50000:
                    risk_score += 20
                elif total_amount > 20000:
                    risk_score += 10
                
                risk_score = min(risk_score, 100)
                
                print(f"   ✅ Ciclo sospechoso: {' → '.join(cycle)} → {cycle[0]}")
                print(f"      - Transacciones: {len(cycle_txns)}")
                print(f"      - Monto total: ${total_amount:,.2f}")
                print(f"      - Variación: {variation*100:.1f}%")
                print(f"      - Risk Score: {risk_score}")
                
                cycles_found.append({
                    'type': 'cycle',
                    'accounts': cycle,
                    'total_amount': round(total_amount, 2),
                    'avg_amount': round(avg_amount, 2),
                    'time_span_hours': round(time_span, 2),
                    'num_transactions': len(cycle_txns),
                    'amount_variation': round(variation * 100, 2),
                    'risk_score': risk_score,
                    'transactions': cycle_txns  # ✅ INCLUYE LAS TRANSACCIONES
                })
        
        except Exception as e:
            print(f"❌ Error detectando ciclos: {e}")
            import traceback
            traceback.print_exc()
        
        return cycles_found
    
    def detect_structuring(self, threshold_count=5, threshold_hours=48):
        """Detecta estructuración (smurfing)"""
        structuring_cases = []
        
        account_txns = defaultdict(list)
        
        for _, row in self.df.iterrows():
            account_txns[row['from_account']].append({
                'amount': row['amount'],
                'timestamp': datetime.fromisoformat(row['timestamp']),
                'to': row['to_account'],
                'id': row['transaction_id']
            })
        
        for account, txns in account_txns.items():
            if len(txns) < threshold_count:
                continue
            
            txns_sorted = sorted(txns, key=lambda x: x['timestamp'])
            
            for i in range(len(txns_sorted) - threshold_count + 1):
                window_txns = txns_sorted[i:i + threshold_count]
                
                time_diff = (window_txns[-1]['timestamp'] - window_txns[0]['timestamp']).total_seconds() / 3600
                
                if time_diff > threshold_hours:
                    continue
                
                amounts = [t['amount'] for t in window_txns]
                total_amount = sum(amounts)
                avg_amount = total_amount / len(amounts)
                
                max_amount = max(amounts)
                min_amount = min(amounts)
                variation = (max_amount - min_amount) / avg_amount if avg_amount > 0 else 0
                
                similar_amounts = variation < 0.30
                
                risk_score = 0
                risk_score += min(len(window_txns) * 8, 40)
                
                if time_diff < 6:
                    risk_score += 30
                elif time_diff < 24:
                    risk_score += 20
                elif time_diff < 48:
                    risk_score += 10
                
                if similar_amounts:
                    risk_score += 25
                
                if avg_amount < 3000 and total_amount > 15000:
                    risk_score += 20
                
                risk_score = min(risk_score, 100)
                
                if risk_score >= 50:
                    structuring_cases.append({
                        'type': 'structuring',
                        'account': account,
                        'num_transactions': len(window_txns),
                        'total_amount': round(total_amount, 2),
                        'avg_amount': round(avg_amount, 2),
                        'amount_variation': round(variation * 100, 2),
                        'time_window_hours': round(time_diff, 2),
                        'similar_amounts': similar_amounts,
                        'risk_score': risk_score
                    })
                    break
        
        return structuring_cases
    
    def detect_high_centrality(self, top_n=10):
        """Detecta cuentas con alta centralidad"""
        centrality_cases = []
        
        degree_cent = nx.degree_centrality(self.graph)
        betweenness_cent = nx.betweenness_centrality(self.graph)
        
        sorted_accounts = sorted(betweenness_cent.items(), 
                                key=lambda x: x[1], 
                                reverse=True)[:top_n]
        
        for account, betweenness in sorted_accounts:
            if betweenness < 0.01:
                continue
            
            in_degree = self.graph.in_degree(account)
            out_degree = self.graph.out_degree(account)
            
            total_in = sum(self.graph[pred][account]['weight'] 
                          for pred in self.graph.predecessors(account))
            total_out = sum(self.graph[account][succ]['weight'] 
                           for succ in self.graph.successors(account))
            
            balance_ratio = min(total_in, total_out) / max(total_in, total_out) if max(total_in, total_out) > 0 else 0
            is_balanced_bridge = balance_ratio > 0.8
            
            risk_score = 0
            risk_score += min(int(betweenness * 500), 40)
            
            total_degree = in_degree + out_degree
            if total_degree > 20:
                risk_score += 30
            elif total_degree > 10:
                risk_score += 20
            
            if is_balanced_bridge:
                risk_score += 25
            
            total_volume = total_in + total_out
            if total_volume > 100000:
                risk_score += 20
            elif total_volume > 50000:
                risk_score += 10
            
            risk_score = min(risk_score, 100)
            
            centrality_cases.append({
                'type': 'high_centrality',
                'account': account,
                'betweenness': round(betweenness, 4),
                'in_degree': in_degree,
                'out_degree': out_degree,
                'total_in_amount': round(total_in, 2),
                'total_out_amount': round(total_out, 2),
                'is_balanced_bridge': is_balanced_bridge,
                'risk_score': risk_score
            })
        
        return centrality_cases
    
    def analyze_all(self):
        """Ejecuta todos los análisis"""
        print("\n" + "="*60)
        print("🔍 INICIANDO DETECCIÓN DE FRAUDE")
        print("="*60)
        
        results = {
            'cycles': self.detect_cycles(),
            'structuring': self.detect_structuring(),
            'high_centrality': self.detect_high_centrality()
        }
        
        all_alerts = []
        all_alerts.extend(results['cycles'])
        all_alerts.extend(results['structuring'])
        all_alerts.extend(results['high_centrality'])
        
        all_alerts.sort(key=lambda x: x['risk_score'], reverse=True)
        
        print("\n" + "="*60)
        print("📊 RESUMEN DE DETECCIÓN")
        print("="*60)
        print(f"   - Ciclos detectados:           {len(results['cycles'])}")
        print(f"   - Estructuración detectada:    {len(results['structuring'])}")
        print(f"   - Cuentas de alto riesgo:      {len(results['high_centrality'])}")
        print(f"   - TOTAL ALERTAS:               {len(all_alerts)}")
        print("="*60 + "\n")
        
        return {
            'total_alerts': len(all_alerts),
            'alerts': all_alerts,
            'summary': {
                'cycles_detected': len(results['cycles']),
                'structuring_detected': len(results['structuring']),
                'high_risk_accounts': len(results['high_centrality'])
            },
            'graph_stats': {
                'nodes': self.graph.number_of_nodes(),
                'edges': self.graph.number_of_edges(),
                'density': round(nx.density(self.graph), 4)
            }
        }