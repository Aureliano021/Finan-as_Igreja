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

print("[*] Garantindo bind mount e make-rshared no chroot...")
exec_cmd("mountpoint -q /data/local/tmp/chrootDebian || mount -o bind /data/local/tmp/chrootDebian /data/local/tmp/chrootDebian")
exec_cmd("mount --make-rshared /data/local/tmp/chrootDebian")

print("[*] Matando instâncias antigas de dockerd e containerd...")
exec_cmd("pkill -9 dockerd || true")
exec_cmd("pkill -9 containerd || true")

print("[*] Reexecutando /root/start_services.sh no Debian...")
exec_cmd("/system/bin/chroot /data/local/tmp/chrootDebian /bin/bash /root/start_services.sh")

print("[*] Checando containers rodando...")
exec_cmd("/system/bin/chroot /data/local/tmp/chrootDebian /usr/bin/docker ps")

client.close()
