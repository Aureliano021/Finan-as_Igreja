import paramiko

HOST = "192.168.1.83"
PORT = 22
USER = "root"
PASS = "010487"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=10)

def exec_cmd(cmd):
    print(f"[$] {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out:
        print(f"STDOUT:\n{out}")
    if err:
        print(f"STDERR:\n{err}")
    return out, err

print("[*] Executando /root/start_services.sh no SSH Root Debian (porta 22)...")
exec_cmd("/bin/bash /root/start_services.sh")

print("[*] Checando contêineres rodando no Docker...")
exec_cmd("docker ps")

client.close()
