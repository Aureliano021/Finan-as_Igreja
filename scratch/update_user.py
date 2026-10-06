import psycopg2

HOST = "192.168.1.83"
PORT = 5432
USER = "postgres"
PASSWORD = "ELschGoEhEXVv_EuJLbK4zIe"
DBNAME = "bi_learning"

conn = psycopg2.connect(host=HOST, port=PORT, user=USER, password=PASSWORD, dbname=DBNAME)
cur = conn.cursor()

cur.execute("""
    UPDATE users 
    SET is_admin = TRUE, status = 'aceito'
    WHERE id = 7 OR email = 'aurelianopeixoto2017@gmail.com';
""")
conn.commit()

cur.execute("""
    SELECT id, nome, email, status, is_admin 
    FROM users 
    WHERE id = 7 OR email = 'aurelianopeixoto2017@gmail.com';
""")
res = cur.fetchone()
print(f"USUARIO_ATUALIZADO: id={res[0]}, nome={res[1]}, email={res[2]}, status={res[3]}, is_admin={res[4]}")

conn.close()
