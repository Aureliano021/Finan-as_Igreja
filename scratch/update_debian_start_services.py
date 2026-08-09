import paramiko
import os

HOST = "192.168.1.83"
PORT = 2222
USER = "u0_a153"
PASS = "010487"

LOCAL_START_SERVICES = os.path.abspath("scratch/start_services.sh")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(HOST, port=PORT, username=USER, password=PASS, timeout=10)

def exec_cmd(cmd):
    escaped_cmd = cmd.replace("'", "'\"'\"'")
    full_cmd = f"su -c '{escaped_cmd}'"
    print(f"[$] {full_cmd}")
    stdin, stdout, stderr = client.exec_command(full_cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out:
        print(f"STDOUT:\n{out}")
    if err:
        print(f"STDERR:\n{err}")
    return out, err

print("[*] Lendo scratch/start_services.sh...")
with open(LOCAL_START_SERVICES, "r", encoding="utf-8", newline="\n") as f:
    content = f.read().replace('\r\n', '\n')

sftp = client.open_sftp()
with sftp.file("start_services_new.sh", "w") as f:
    f.write(content)

print("[*] Criando backup do arquivo atual em start_services.sh.bak...")
exec_cmd("cp /data/local/tmp/chrootDebian/root/start_services.sh /data/local/tmp/chrootDebian/root/start_services.sh.bak || true")

print("[*] Sobrescrevendo /data/local/tmp/chrootDebian/root/start_services.sh no celular...")
exec_cmd("cp start_services_new.sh /data/local/tmp/chrootDebian/root/start_services.sh")
exec_cmd("chmod +x /data/local/tmp/chrootDebian/root/start_services.sh")

print("[*] Verificando backups salvos...")
exec_cmd("ls -l /data/local/tmp/chrootDebian/root/start_services.sh*")

print("[*] Verificando conteúdo do novo arquivo salvo...")
exec_cmd("cat /data/local/tmp/chrootDebian/root/start_services.sh")

client.close()
print("[+] Backup criado em start_services.sh.bak e novo arquivo atualizado com sucesso no Debian!")
