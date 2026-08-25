#!/bin/bash
export PATH=/usr/local/bin:/usr/local/sbin:/usr/bin:/usr/sbin:/sbin:/bin:$PATH
export TMPDIR=/tmp

# Garantir propaga├º├úo rslave na raiz dentro do chroot para permitir pivot_root do runc
mount --bind / / 2>/dev/null
mount --make-rslave / 2>/dev/null

echo "[DEBIAN] Iniciando SSH..."
service ssh start 2>/dev/null || /usr/sbin/sshd

echo "[DEBIAN] Montando cgroups v1..."
mkdir -p /sys/fs/cgroup
if ! mountpoint -q /sys/fs/cgroup; then
  mount -t tmpfs cgroup_root /sys/fs/cgroup 2>/dev/null
fi

for cg in devices cpu cpuacct blkio memory pids freezer; do
  mkdir -p /sys/fs/cgroup/$cg
  if ! mountpoint -q /sys/fs/cgroup/$cg; then
    mount -t cgroup -o $cg cgroup /sys/fs/cgroup/$cg 2>/dev/null
  fi
done

echo "[DEBIAN] Configurando wrapper do runc (--no-pivot)..."
if [ -f /usr/bin/runc ] && ! grep -q -- "--no-pivot" /usr/bin/runc 2>/dev/null; then
  if [ ! -f /usr/bin/runc.orig ]; then
    mv /usr/bin/runc /usr/bin/runc.orig
  fi
  cat << 'RUNCEOF' > /usr/bin/runc
#!/bin/bash
args=()
for arg in "$@"; do
  args+=("$arg")
  if [ "$arg" = "create" ] || [ "$arg" = "run" ]; then
    args+=("--no-pivot")
  fi
done
exec /usr/sbin/runc "${args[@]}"
RUNCEOF
  chmod +x /usr/bin/runc
fi

mkdir -p /etc/docker
echo '{"storage-driver": "vfs", "iptables": false}' > /etc/docker/daemon.json

echo "[DEBIAN] Reiniciando Docker daemon..."
pkill -9 dockerd 2>/dev/null
pkill -9 containerd 2>/dev/null
sleep 1
containerd > /tmp/containerd.log 2>&1 &
sleep 2
dockerd > /tmp/dockerd.log 2>&1 &
sleep 5

if [ -f /root/docker/docker-compose.yml ]; then
  echo "[DEBIAN] Subindo servicos via docker-compose..."
  cd /root/docker && docker-compose up -d
fi

echo "[DEBIAN] Servicos iniciados com sucesso!"
