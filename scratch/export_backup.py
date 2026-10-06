import psycopg2
import datetime
import os

HOST = "192.168.1.83"
PORT = 5432
USER = "postgres"
PASSWORD = "ELschGoEhEXVv_EuJLbK4zIe"
DBNAME = "bi_learning"

now_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
downloads_path = os.path.expanduser(r"C:\Users\aurel\Downloads")
output_file = os.path.join(downloads_path, f"backup_bi_learning_{now_str}.sql")

print(f"Iniciando backup de {DBNAME}@{HOST}...")

conn = psycopg2.connect(host=HOST, port=PORT, user=USER, password=PASSWORD, dbname=DBNAME)
cur = conn.cursor()

# Obter todas as tabelas públicas
cur.execute("""
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
""")
tables = [row[0] for row in cur.fetchall()]

with open(output_file, "w", encoding="utf-8") as f:
    f.write(f"-- ============================================================\n")
    f.write(f"-- BACKUP BANCO DE DADOS: {DBNAME}\n")
    f.write(f"-- DATA: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n")
    f.write(f"-- SERVIDOR: {HOST}:{PORT}\n")
    f.write(f"-- ============================================================\n\n")
    f.write("SET statement_timeout = 0;\n")
    f.write("SET lock_timeout = 0;\n")
    f.write("SET client_encoding = 'UTF8';\n")
    f.write("SET standard_conforming_strings = on;\n")
    f.write("SET check_function_bodies = false;\n\n")

    for table in tables:
        print(f"Processando tabela: {table}")
        f.write(f"\n-- ------------------------------------------------------------\n")
        f.write(f"-- Dados da tabela: {table}\n")
        f.write(f"-- ------------------------------------------------------------\n")

        # Obter colunas
        cur.execute(f"""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = %s
            ORDER BY ordinal_position;
        """, (table,))
        cols_info = cur.fetchall()
        cols = [c[0] for c in cols_info]
        cols_str = ", ".join([f'"{c}"' for c in cols])

        # Obter linhas
        cur.execute(f'SELECT * FROM "{table}";')
        rows = cur.fetchall()

        if rows:
            for row in rows:
                values = []
                for val in row:
                    if val is None:
                        values.append("NULL")
                    elif isinstance(val, (int, float)):
                        values.append(str(val))
                    elif isinstance(val, bool):
                        values.append("TRUE" if val else "FALSE")
                    elif isinstance(val, (datetime.date, datetime.datetime)):
                        values.append(f"'{val.isoformat()}'")
                    else:
                        val_escaped = str(val).replace("'", "''")
                        values.append(f"'{val_escaped}'")
                f.write(f'INSERT INTO "{table}" ({cols_str}) VALUES ({", ".join(values)});\n')
            print(f"  -> {len(rows)} registros exportados.")
        else:
            f.write(f"-- Tabela {table} sem registros.\n")
            print(f"  -> 0 registros.")

    # Sequências
    cur.execute("""
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public';
    """)
    sequences = [row[0] for row in cur.fetchall()]
    if sequences:
        f.write("\n-- ------------------------------------------------------------\n")
        f.write("-- Sincronizacao de Sequencias (AUTO INCREMENT)\n")
        f.write("-- ------------------------------------------------------------\n")
        for seq in sequences:
            try:
                cur.execute(f"SELECT last_value, is_called FROM \"{seq}\";")
                last_val, is_called = cur.fetchone()
                f.write(f"SELECT setval('\"{seq}\"', {last_val}, {'true' if is_called else 'false'});\n")
            except Exception as e:
                pass

cur.close()
conn.close()

size_bytes = os.path.getsize(output_file)
print(f"\n[SUCESSO] Backup salvo com sucesso em:")
print(f"  {output_file} ({size_bytes} bytes)")
