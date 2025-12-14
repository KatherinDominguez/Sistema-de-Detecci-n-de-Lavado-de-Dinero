import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_transactions(n_accounts=10, n_transactions=30):
    """Genera transacciones normales y fraudulentas REALISTAS"""
    
    # Crear cuentas
    accounts = [f"ACC{i:04d}" for i in range(n_accounts)]
    
    transactions = []
    transaction_id = 1
    base_date = datetime.now() - timedelta(days=30)
    
    # ==========================================
    # TRANSACCIONES NORMALES (75%)
    # ==========================================
    print("Generando transacciones normales...")
    for _ in range(int(n_transactions * 0.75)):
        from_acc = random.choice(accounts)
        to_acc = random.choice([acc for acc in accounts if acc != from_acc])
        amount = round(random.uniform(100, 8000), 2)
        date = base_date + timedelta(
            days=random.randint(0, 30),
            hours=random.randint(0, 23),
            minutes=random.randint(0, 59)
        )
        
        transactions.append({
            'transaction_id': f"TXN{transaction_id:06d}",
            'from_account': from_acc,
            'to_account': to_acc,
            'amount': amount,
            'timestamp': date.isoformat(),
            'is_fraud': False
        })
        transaction_id += 1
    
    # ==========================================
    # PATRÓN 1: CICLOS SOSPECHOSOS (10%)
    # ==========================================
    print("Generando ciclos sospechosos...")
    num_cycles = max(1, int((n_transactions * 0.10) / 3))
    
    for cycle_idx in range(num_cycles):
        # Elegir 3 cuentas ÚNICAS para el ciclo
        cycle_accounts = random.sample(accounts, 3)
        
        # Monto base similar (±3% de variación)
        base_amount = random.uniform(10000, 25000)
        
        # Fecha/hora inicial
        cycle_start = base_date + timedelta(
            days=random.randint(0, 25),
            hours=random.randint(8, 20)
        )
        
        # ✅ CREAR EL CICLO COMPLETO: A → B → C → A
        cycle_transactions = [
            (cycle_accounts[0], cycle_accounts[1]),  # A → B
            (cycle_accounts[1], cycle_accounts[2]),  # B → C
            (cycle_accounts[2], cycle_accounts[0]),  # C → A (cierra el ciclo)
        ]
        
        for i, (from_acc, to_acc) in enumerate(cycle_transactions):
            # Montos MUY similares (±3%)
            amount = round(base_amount * random.uniform(0.97, 1.03), 2)
            
            # Transacciones en minutos/horas
            minutes_offset = random.randint(15, 120) * i
            date = cycle_start + timedelta(minutes=minutes_offset)
            
            transactions.append({
                'transaction_id': f"TXN{transaction_id:06d}",
                'from_account': from_acc,
                'to_account': to_acc,
                'amount': amount,
                'timestamp': date.isoformat(),
                'is_fraud': True,
                'fraud_type': 'cycle',
                'cycle_group': f"CYCLE_{cycle_idx}"
            })
            transaction_id += 1
        
        print(f"  Ciclo {cycle_idx + 1}: {cycle_accounts[0]} → {cycle_accounts[1]} → {cycle_accounts[2]} → {cycle_accounts[0]}")
    
    # ==========================================
    # PATRÓN 2: ESTRUCTURACIÓN / SMURFING (10%)
    # ==========================================
    print("Generando casos de estructuración (smurfing)...")
    num_structuring_groups = max(1, int(n_transactions * 0.10) // 8)
    
    for group_id in range(num_structuring_groups):
        suspicious_account = random.choice(accounts)
        num_transfers = random.randint(6, 12)
        
        struct_start = base_date + timedelta(
            days=random.randint(0, 25),
            hours=random.randint(8, 20)
        )
        
        base_small_amount = random.uniform(1800, 2500)
        
        for j in range(num_transfers):
            to_acc = random.choice([acc for acc in accounts if acc != suspicious_account])
            
            # Montos similares (±10%)
            amount = round(base_small_amount * random.uniform(0.90, 1.10), 2)
            
            minutes_offset = random.randint(10, 90) * j
            date = struct_start + timedelta(minutes=minutes_offset)
            
            transactions.append({
                'transaction_id': f"TXN{transaction_id:06d}",
                'from_account': suspicious_account,
                'to_account': to_acc,
                'amount': amount,
                'timestamp': date.isoformat(),
                'is_fraud': True,
                'fraud_type': 'structuring',
                'struct_group': f"STRUCT_{group_id}"
            })
            transaction_id += 1
    
    # ==========================================
    # PATRÓN 3: CUENTAS PUENTE (5%)
    # ==========================================
    print("Generando cuentas puente (alta centralidad)...")
    num_bridges = min(3, n_accounts // 3)
    bridge_accounts = random.sample(accounts, num_bridges)
    
    remaining = int(n_transactions * 0.05)
    
    for bridge_acc in bridge_accounts:
        num_txns = remaining // num_bridges
        
        for _ in range(num_txns):
            if random.random() < 0.5:
                from_acc = random.choice([acc for acc in accounts if acc != bridge_acc])
                to_acc = bridge_acc
            else:
                from_acc = bridge_acc
                to_acc = random.choice([acc for acc in accounts if acc != bridge_acc])
            
            amount = round(random.uniform(5000, 15000), 2)
            date = base_date + timedelta(
                days=random.randint(0, 28),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            transactions.append({
                'transaction_id': f"TXN{transaction_id:06d}",
                'from_account': from_acc,
                'to_account': to_acc,
                'amount': amount,
                'timestamp': date.isoformat(),
                'is_fraud': True,
                'fraud_type': 'bridge_account'
            })
            transaction_id += 1
    
    # ==========================================
    # CREAR DATAFRAME Y GUARDAR
    # ==========================================
    df = pd.DataFrame(transactions)
    df = df.sort_values('timestamp').reset_index(drop=True)
    df.to_csv('transactions.csv', index=False)
    
    print("\n" + "="*60)
    print(f"✅ Generadas {len(df)} transacciones en 'transactions.csv'")
    print("="*60)
    print(f"   - Normales:             {len(df[~df['is_fraud']])} ({len(df[~df['is_fraud']])/len(df)*100:.1f}%)")
    print(f"   - Fraudulentas:         {len(df[df['is_fraud']])} ({len(df[df['is_fraud']])/len(df)*100:.1f}%)")
    print(f"      • Ciclos:            {len(df[df.get('fraud_type', '') == 'cycle'])}")
    print(f"      • Estructuración:    {len(df[df.get('fraud_type', '') == 'structuring'])}")
    print(f"      • Cuentas puente:    {len(df[df.get('fraud_type', '') == 'bridge_account'])}")
    print("="*60)
    
    return df

if __name__ == "__main__":
    generate_transactions(n_accounts=10, n_transactions=30)