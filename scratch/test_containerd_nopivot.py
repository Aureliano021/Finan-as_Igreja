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

containerd_config = """version = 2
[plugins]
  [plugins."io.containerd.grpc.v1.cri"]
    [plugins."io.containerd.grpc.v1.cri".containerd]
      [plugins."io.containerd.grpc.v1.cri".containerd.runtimes]
        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
          [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
            NoPivotRoot = true
  [plugins."io.containerd.runc.v2"]
    [plugins."io.containerd.runc.v2".options]
      NoPivotRoot = true
"""

print("[*] Gravando /etc/containerd/config.toml...")
sftp = client.open_sftp()
os_file = sftp.file("/etc/containerd/config.toml", "w")
os_file.write(containerd_config.replace('\r\n', '\n'))
os_file.close()
sftp.close()

exec_cmd("cat /etc/containerd/config.toml")

print("[*] Matando containerd e dockerd e reiniciando...")
exec_cmd("pkill -9 dockerd || true")
exec_cmd("pkill -9 containerd || true")
exec_cmd("sleep 2")
exec_cmd("containerd > /tmp/containerd.log 2>&1 &")
exec_cmd("sleep 2")
exec_cmd("dockerd > /tmp/dockerd.log 2>&1 &")
exec_cmd("sleep 5")

print("[*] Testando docker run --rm hello-world...")
exec_cmd("docker run --rm hello-world")

print("[*] Testando docker-compose up -d...")
exec_cmd("cd /root/docker && docker-compose up -d")

print("[*] Verificando containers rodando...")
exec_cmd("docker ps")

client.close()
