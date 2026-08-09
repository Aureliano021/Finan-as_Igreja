import paramiko
import os

HOST = "192.168.1.83"
PASS = "010487"

LOCAL_AUTOSTART = os.path.abspath("scratch/autostart_debian.sh")
LOCAL_START_SERVICES = os.path.abspath("scratch/start_services.sh")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

print("[*] Conectando no Termux (porta 2222)...")
client.connect(HOST, port=2222, username="u0_a153", password=PASS, timeout=10)

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

print("[*] Lendo scripts locais...")
with open(LOCAL_AUTOSTART, "r", encoding="utf-8", newline="\n") as f:
    autostart_content = f.read().replace('\r\n', '\n')

with open(LOCAL_START_SERVICES, "r", encoding="utf-8", newline="\n") as f:
    start_services_content = f.read().replace('\r\n', '\n')

sftp = client.open_sftp()
with sftp.file("autostart_debian.sh.tmp", "w") as f:
    f.write(autostart_content)

with sftp.file("start_services.sh.tmp", "w") as f:
    f.write(start_services_content)

print("[*] Copiando autostart_debian.sh para /data/adb/service.d/...")
exec_cmd("cp autostart_debian.sh.tmp /data/adb/service.d/autostart_debian.sh")
exec_cmd("chmod +x /data/adb/service.d/autostart_debian.sh")

print("[*] Copiando start_services.sh para /data/local/tmp/chrootDebian/root/...")
exec_cmd("cp start_services.sh.tmp /data/local/tmp/chrootDebian/root/start_services.sh")
exec_cmd("chmod +x /data/local/tmp/chrootDebian/root/start_services.sh")

print("[*] Atualizando wrapper global do runc (/usr/bin/runc) no Debian...")
runc_wrapper_script = """#!/bin/bash
exec /usr/bin/runc.orig --no-pivot "$@"
"""

with sftp.file("runc_wrapper.tmp", "w") as f:
    f.write(runc_wrapper_script.replace('\r\n', '\n'))

exec_cmd("chroot /data/local/tmp/chrootDebian /bin/bash -c '[ ! -f /usr/bin/runc.orig ] && mv /usr/bin/runc /usr/bin/runc.orig || true'")
exec_cmd("cp runc_wrapper.tmp /data/local/tmp/chrootDebian/usr/bin/runc")
exec_cmd("chmod +x /data/local/tmp/chrootDebian/usr/bin/runc")

print("[*] Verificando conteúdo do wrapper do runc...")
exec_cmd("cat /data/local/tmp/chrootDebian/usr/bin/runc")

print("[*] Testando execução do start_services.sh no Debian...")
exec_cmd("/system/bin/chroot /data/local/tmp/chrootDebian /bin/bash /root/start_services.sh")

print("[*] Verificando status dos contêineres Docker...")
exec_cmd("/system/bin/chroot /data/local/tmp/chrootDebian /usr/bin/docker ps")

client.close()
print("[+] Ajuste concluído!")
