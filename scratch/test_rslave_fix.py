import paramiko

HOST = "192.168.1.83"
PORT = 2222
USER = "u0_a153"
PASS = "010487"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(AutoAddPolicy := paramiko.AutoAddPolicy())
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

print("[*] Restaurando binário original do runc no Debian se existir backup...")
exec_cmd("chroot /data/local/tmp/chrootDebian /bin/bash -c '[ -f /usr/bin/runc.orig ] && mv /usr/bin/runc.orig /usr/bin/runc || true'")

print("[*] Aplicando bind mount e make-rslave no chroot (Android host)...")
exec_cmd("mountpoint -q /data/local/tmp/chrootDebian || mount -o bind /data/local/tmp/chrootDebian /data/local/tmp/chrootDebian")
exec_cmd("mount --make-rslave /data/local/tmp/chrootDebian")

print("[*] Aplicando bind mount e make-rslave dentro do Debian...")
exec_cmd("chroot /data/local/tmp/chrootDebian /bin/bash -c 'mount --bind / / 2>/dev/null; mount --make-rslave / 2>/dev/null'")

print("[*] Reiniciando containerd e dockerd...")
exec_cmd("pkill -9 dockerd || true; pkill -9 containerd || true; sleep 2")
exec_cmd("/system/bin/chroot /data/local/tmp/chrootDebian /bin/bash -c 'containerd > /tmp/containerd.log 2>&1 &' &")
exec_cmd("sleep 2")
exec_cmd("/system/bin/chroot /data/local/tmp/chrootDebian /bin/bash -c 'dockerd > /tmp/dockerd.log 2>&1 &' &")
exec_cmd("sleep 5")

print("[*] Testando docker run --rm hello-world...")
exec_cmd("/system/bin/chroot /data/local/tmp/chrootDebian /usr/bin/docker run --rm hello-world")

print("[*] Testando docker-compose up -d em /root/docker...")
exec_cmd("/system/bin/chroot /data/local/tmp/chrootDebian /bin/bash -c 'cd /root/docker && docker-compose up -d'")

print("[*] Verificando containers em execução...")
exec_cmd("/system/bin/chroot /data/local/tmp/chrootDebian /usr/bin/docker ps")

client.close()
