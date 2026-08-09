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

print("[*] Verificando montagens e processos no Debian Root...")
exec_cmd("mountpoint /; mountpoint /proc; mountpoint /sys; mountpoint /dev")

print("[*] Aplicando mount --bind / / e mount --make-rshared / dentro do chroot...")
exec_cmd("mount --bind / / 2>/dev/null || true")
exec_cmd("mount --make-rshared / 2>/dev/null || true")

print("[*] Matando dockerd/containerd anteriores para aplicar rshared do zero...")
exec_cmd("pkill -9 dockerd || true; pkill -9 containerd || true; sleep 2")

print("[*] Executando /root/start_services.sh...")
exec_cmd("/bin/bash /root/start_services.sh")

print("[*] Checando logs de containerd e dockerd...")
exec_cmd("cat /tmp/containerd.log | tail -n 20 || true")
exec_cmd("cat /tmp/dockerd.log | tail -n 20 || true")

print("[*] Verificando status dos contêineres...")
exec_cmd("docker ps")

client.close()
