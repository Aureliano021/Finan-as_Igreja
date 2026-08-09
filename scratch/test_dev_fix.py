import paramiko

HOST = "192.168.1.83"
PORT = 2222
USER = "u0_a153"
PASS = "010487"

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

print("[*] Verificando permissões de /dev/null no host e no chroot...")
exec_cmd("ls -l /dev/null")
exec_cmd("ls -l /data/local/tmp/chrootDebian/dev/null")

print("[*] Ajustando permissões de dispositivos em /dev...")
exec_cmd("chmod 666 /dev/null /dev/zero /dev/random /dev/urandom /dev/tty /dev/full /dev/ptmx 2>/dev/null || true")

print("[*] Lendo /tmp/dockerd.log e /tmp/containerd.log no chroot...")
exec_cmd("cat /data/local/tmp/chrootDebian/tmp/dockerd.log || true")
exec_cmd("cat /data/local/tmp/chrootDebian/tmp/containerd.log || true")

print("[*] Tentando iniciar containerd e dockerd manualmente para capturar logs...")
exec_cmd("pkill -9 dockerd || true")
exec_cmd("pkill -9 containerd || true")
exec_cmd("/system/bin/chroot /data/local/tmp/chrootDebian /bin/bash -c 'containerd > /tmp/containerd.log 2>&1 &' &")
exec_cmd("sleep 2")
exec_cmd("/system/bin/chroot /data/local/tmp/chrootDebian /bin/bash -c 'dockerd > /tmp/dockerd.log 2>&1 &' &")
exec_cmd("sleep 3")
exec_cmd("cat /data/local/tmp/chrootDebian/tmp/dockerd.log || true")

client.close()
