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

print("[*] Verificando arquivos /usr/bin/runc e /usr/bin/runc.orig...")
exec_cmd("ls -l /usr/bin/runc*")
exec_cmd("cat /usr/bin/runc")

print("[*] Testando docker run --rm hello-world...")
exec_cmd("docker run --rm hello-world")

print("[*] Testando runc.orig --help...")
exec_cmd("/usr/bin/runc.orig --help | head -n 30")

client.close()
