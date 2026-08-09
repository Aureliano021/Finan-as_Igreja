import sys
import os
import paramiko

HOST = "192.168.1.83"
PASS = "010487"

LOCAL_AUTOSTART = os.path.abspath("scratch/autostart_debian.sh")
LOCAL_START_SERVICES = os.path.abspath("scratch/start_services.sh")

print(f"[*] Tentando conexão SSH com {HOST}...")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

connected = False
user = ""
port = 2222

# Tentar primeiro a porta 2222 (Termux) e depois porta 22 (Debian)
for p, u in [(2222, "u0_a153"), (22, "root")]:
    try:
        print(f"[*] Conectando em {HOST}:{p} como '{u}'...")
        client.connect(HOST, port=p, username=u, password=PASS, timeout=10)
        connected = True
        user = u
        port = p
        print(f"[+] Conectado com sucesso em {HOST}:{port}!")
        break
    except Exception as e:
        print(f"[-] Falha na porta {p}: {e}")

if not connected:
    print("[!] Não foi possível conectar via SSH em nenhuma das portas.")
    sys.exit(1)

sftp = client.open_sftp()

# Ler conteúdo dos arquivos locais
with open(LOCAL_AUTOSTART, "r", encoding="utf-8", newline="\n") as f:
    autostart_content = f.read()

with open(LOCAL_START_SERVICES, "r", encoding="utf-8", newline="\n") as f:
    start_services_content = f.read()

# Função auxiliar para executar comando shell (com su se for Termux)
def exec_cmd(cmd):
    if port == 2222:
        # No Termux via SSH não interativo, usaremos su -c com aspas simples escapadas
        escaped_cmd = cmd.replace("'", "'\"'\"'")
        full_cmd = f"su -c '{escaped_cmd}'"
    else:
        full_cmd = cmd
    print(f"[$] {full_cmd}")
    stdin, stdout, stderr = client.exec_command(full_cmd)
    out = stdout.read().decode('utf-8', errors='ignore')
    err = stderr.read().decode('utf-8', errors='ignore')
    if out:
        print(f"STDOUT:\n{out}")
    if err:
        print(f"STDERR:\n{err}")
    return out, err

print("[*] Gravando arquivos temporários via SFTP...")
sftp_temp_autostart = "autostart_debian.sh.tmp"
sftp_temp_start = "start_services.sh.tmp"

with sftp.file(sftp_temp_autostart, "w") as f:
    f.write(autostart_content.replace('\r\n', '\n'))

with sftp.file(sftp_temp_start, "w") as f:
    f.write(start_services_content.replace('\r\n', '\n'))

print("[*] Copiando arquivos com privilégios de root para os caminhos finais...")
exec_cmd("cp " + sftp_temp_autostart + " /data/adb/service.d/autostart_debian.sh")
exec_cmd("chmod +x /data/adb/service.d/autostart_debian.sh")

exec_cmd("cp " + sftp_temp_start + " /data/local/tmp/chrootDebian/root/start_services.sh")
exec_cmd("chmod +x /data/local/tmp/chrootDebian/root/start_services.sh")

print("[*] Verificando permissões dos arquivos salvos...")
exec_cmd("ls -l /data/adb/service.d/autostart_debian.sh")
exec_cmd("ls -l /data/local/tmp/chrootDebian/root/start_services.sh")

print("[*] Executando /data/adb/service.d/autostart_debian.sh no celular...")
out, err = exec_cmd("/system/bin/sh /data/adb/service.d/autostart_debian.sh")

print("[*] Lendo log do autostart em /data/local/tmp/autostart.log...")
exec_cmd("cat /data/local/tmp/autostart.log")

print("[*] Verificando montagens e containers Docker ativos no Debian...")
exec_cmd("findmnt /data/local/tmp/chrootDebian || true")
exec_cmd("/system/bin/chroot /data/local/tmp/chrootDebian /usr/bin/docker ps || true")

client.close()
print("[+] Operação de deploy concluída com sucesso!")
