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

wrapper_script = """#!/bin/bash
args=()
for arg in "$@"; do
  args+=("$arg")
  if [ "$arg" = "create" ] || [ "$arg" = "run" ]; then
    args+=("--no-pivot")
  fi
done
exec /usr/sbin/runc "${args[@]}"
"""

print("[*] Gravando novo wrapper do runc em /usr/bin/runc...")
sftp = client.open_sftp()
with sftp.file("/usr/bin/runc", "w") as f:
    f.write(wrapper_script.replace('\r\n', '\n'))
sftp.close()

exec_cmd("chmod +x /usr/bin/runc")
exec_cmd("cat /usr/bin/runc")

print("[*] Testando docker run --rm hello-world com o novo wrapper...")
exec_cmd("docker run --rm hello-world")

print("[*] Testando /root/start_services.sh...")
exec_cmd("/bin/bash /root/start_services.sh")

print("[*] Verificando status dos contêineres...")
exec_cmd("docker ps")

client.close()
