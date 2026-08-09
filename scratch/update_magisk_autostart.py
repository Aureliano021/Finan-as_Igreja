import paramiko
import os

HOST = "192.168.1.83"
PORT = 2222
USER = "u0_a153"
PASS = "010487"

LOCAL_AUTOSTART = os.path.abspath("scratch/autostart_debian.sh")

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

print("[*] Lendo autostart_debian.sh...")
with open(LOCAL_AUTOSTART, "r", encoding="utf-8", newline="\n") as f:
    content = f.read().replace('\r\n', '\n')

sftp = client.open_sftp()
with sftp.file("autostart_debian_new.sh", "w") as f:
    f.write(content)

print("[*] Sobrescrevendo /data/adb/service.d/autostart_debian.sh no celular...")
exec_cmd("cp autostart_debian_new.sh /data/adb/service.d/autostart_debian.sh")
exec_cmd("chmod +x /data/adb/service.d/autostart_debian.sh")

print("[*] Verificando conteúdo salvo em /data/adb/service.d/autostart_debian.sh...")
exec_cmd("cat /data/adb/service.d/autostart_debian.sh")

client.close()
print("[+] Arquivo atualizado com sucesso no Magisk!")
