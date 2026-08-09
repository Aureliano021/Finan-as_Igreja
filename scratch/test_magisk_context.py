import paramiko

HOST = "192.168.1.83"
PASS = "010487"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

print("[*] Testando conexão SSH na porta 22 (Debian Root)...")
try:
    client.connect(HOST, port=22, username="root", password=PASS, timeout=5)
    print("[+] Conectado na porta 22 (Debian Root) com SUCESSO!")
    
    stdin, stdout, stderr = client.exec_command("getenforce || true; id; mountpoint /proc; mountpoint /sys; docker ps")
    print("STDOUT:\n" + stdout.read().decode('utf-8'))
    print("STDERR:\n" + stderr.read().decode('utf-8'))
    client.close()
except Exception as e:
    print(f"[-] Falha na porta 22: {e}")
    print("[*] Conectando via Termux (2222) para checar SELinux...")
    client.connect(HOST, port=2222, username="u0_a153", password=PASS, timeout=5)
    stdin, stdout, stderr = client.exec_command("su -c 'getenforce; setenforce 0; getenforce'")
    print("STDOUT:\n" + stdout.read().decode('utf-8'))
    print("STDERR:\n" + stderr.read().decode('utf-8'))
    client.close()
