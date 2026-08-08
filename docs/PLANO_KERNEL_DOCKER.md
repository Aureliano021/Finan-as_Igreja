# 📌 Plano Mestre: Kernel Customizado e Docker Nativo no Android (Redmi Note 8 - LineageOS 23.2)

---

## 📱 Especificações Completas do Dispositivo

| Parâmetro | Valor / Identificador |
| :--- | :--- |
| **Dispositivo** | Xiaomi Redmi Note 8 / Note 8T |
| **Codinome do Aparelho** | **`ginkgo`** |
| **Processador (SoC)** | Qualcomm Snapdragon 665 (Kryo-V2 / 8 Núcleos ARM64) |
| **Memória RAM** | 3.6 GB Total |
| **Versão do Android** | **Android 16** |
| **Versão da LineageOS** | **`23.2-20260429-NIGHTLY-ginkgo`** |
| **Kernel Compilado Atual** | `Linux 4.14.357-openela-perf #1 SMP PREEMPT` |
| **Root** | **Magisk (Root ativo)** |
| **IP do Dispositivo** | `192.168.1.83` |
| **SSH Debian (Root)** | `ssh root@192.168.1.83` (Porta 22 / Senha: `010487`) |
| **SSH Termux (Usuário)** | `ssh u0_a153@192.168.1.83 -p 2222` (Porta 2222 ou 8022 / Senha: `010487`) |
| **Script Auto-boot Magisk** | `/data/adb/service.d/autostart_debian.sh` |
| **Caminho do Chroot** | `/data/local/tmp/chrootDebian` |

---

## 🎯 1. Objetivo do Projeto

Transformar o celular **Xiaomi Redmi Note 8 (`ginkgo`)** em um **servidor de hospedagem autônomo** para a aplicação financeira web (`igreja-financas-fe`):
1. Rodar Debian Linux via `chroot` no Android.
2. Executar o **Docker** e **Docker Compose** nativamente sobre o driver de armazenamento **`overlay2`**.
3. Executar o container web (React + Vite + Nginx) na porta 80.
4. Auto-inicialização de todos os serviços ao ligar o celular via script Magisk `autostart_debian.sh`.

---

## 🔬 2. Diagnóstico do Kernel & Auditoria de Flags

### ✅ Flags Habilitadas e Testadas (`=y`):
* `CONFIG_NAMESPACES=y` *(Isolamento de processos)*
* `CONFIG_NET_NS=y` *(Interfaces de rede do Docker)*
* `CONFIG_OVERLAY_FS=y` *(Sistema de arquivos em camadas)*
* `CONFIG_MEMCG=y` *(Controle de memória RAM)*
* `CONFIG_SECCOMP=y` *(Filtros de segurança)*
* `CONFIG_VETH=y` *(Placas de rede virtuais)*
* `CONFIG_CGROUP_DEVICE=y` *(Permite que o Docker gerencie dispositivos em cgroups)*
* `CONFIG_PID_NS=y` *(Permite isolamento de tabela de PIDs)*
* `CONFIG_CGROUP_PIDS=y` *(Limitação de PIDs por container)*
* `CONFIG_OVERLAY_FS_REDIRECT_DIR=y` *(Otimização de overlay2)*
* `CONFIG_OVERLAY_FS_INDEX=y` *(Otimização de overlay2)*

### ⚠️ Flags Adicionais Identificadas para Isolamento Total de IPC:
* `CONFIG_IPC_NS=y` *(Permite que a runtime `runc` crie namespaces IPC sem falhar com `EINVAL`)*
* `CONFIG_SYSVIPC=y` *(Suporte a memória compartilhada System V)*

---

## 🛠️ 3. Estado Atual do Docker

- **Docker Daemon (`dockerd`):** **100% Funcional e Online** com o driver `overlay2` sobre `f2fs`.
- **Cgroups v1:** Montados em `/sys/fs/cgroup/` (`devices`, `pids`, `memory`, `cpu,cpuacct`, `blkio`).
- **Execução do Container:**
  - **Modo Padrão (`docker run`):** `runc` falha ao tentar criar o namespace IPC se `CONFIG_IPC_NS` não estiver no Kernel.
  - **Modo Compatível (Imediato):** Adicionando `--ipc=host` (ou `ipc: host` no `docker-compose.yml`), o container executa imediatamente sem precisar de recompilação do Kernel.

---

## 📋 4. Comandos de Inicialização e Diagnóstico

### Rodar o Docker Daemon manualmente:
```bash
echo '{"storage-driver": "overlay2", "iptables": false}' > /etc/docker/daemon.json
/usr/sbin/dockerd > /tmp/dockerd.log 2>&1 &
```

### Rodar o Container com Compatibilidade IPC:
```bash
docker run --rm --ipc=host hello-world
```

### No `docker-compose.yml`:
```yaml
version: '3.8'
services:
  web:
    build: .
    ports:
      - "80:80"
    ipc: host
```


---

## 📋 5. Sessão Anterior: Compilação do Kernel

### 🟢 O que foi realizado com sucesso:

- **Compilação Nativa do Kernel Customizado (`Linux 4.14.357-openela-perf #3`):**
  - Compilado nativamente no Debian (usando os 8 núcleos do Snapdragon 665 do seu Redmi Note 8 `ginkgo`).
  - Ativamos as opções essenciais para execução do Docker sem necessidade de `--ipc=host`:
    - `CONFIG_SYSVIPC=y`
    - `CONFIG_SYSVIPC_SYSCTL=y`
    - `CONFIG_IPC_NS=y`
    - `CONFIG_NAMESPACES=y`
    - `CONFIG_OVERLAY_FS=y`

- **Instalação e Flash:**
  - Geramos a imagem `NOVO_KERNEL_DOCKER.img`, patcheada pelo Magisk para **`magisk_patched-30700_MjQU1.img`**.
  - Gravado via **Fastboot** na partição `/dev/block/mmcblk0p72`.
  - O celular inicializou **100% estável** no **LineageOS 23.2** com **Magisk Root**.

- **Confirmação das Flags Ativas no Celular:**
  - Rodando `zcat /proc/config.gz | grep IPC` direto no aparelho, o Kernel confirma:
    ```text
    CONFIG_SYSVIPC=y
    CONFIG_SYSVIPC_SYSCTL=y
    CONFIG_IPC_NS=y
    CONFIG_SYSVIPC_COMPAT=y
    ```

---

## 🟢 6. Compilação #4 — SUCESSO ABSOLUTO (08/08/2026)

> **Status:** Kernel #4 compilado com Clang 14 e `CONFIG_POSIX_MQUEUE=y` + todas as flags obrigatórias de Docker.
> **Resultado:** Docker executando containers nativos (`docker run --rm hello-world`) com sucesso 100%!

### ✅ Flags Confirmadas e Ativas no Kernel #4:
```text
CONFIG_POSIX_MQUEUE=y             CONFIG_NAMESPACES=y          CONFIG_NET_NS=y
CONFIG_PID_NS=y                  CONFIG_IPC_NS=y              CONFIG_UTS_NS=y
CONFIG_CGROUPS=y                 CONFIG_CGROUP_CPUACCT=y      CONFIG_CGROUP_DEVICE=y
CONFIG_CGROUP_FREEZER=y          CONFIG_CGROUP_SCHED=y        CONFIG_CPUSETS=y
CONFIG_MEMCG=y                   CONFIG_KEYS=y                CONFIG_VETH=y
CONFIG_BRIDGE=y                  CONFIG_BRIDGE_NETFILTER=y    CONFIG_IP_NF_FILTER=y
CONFIG_IP_NF_MANGLE=y            CONFIG_IP_NF_TARGET_MASQUERADE=y CONFIG_IP6_NF_FILTER=y
CONFIG_IP6_NF_MANGLE=y           CONFIG_IP6_NF_TARGET_MASQUERADE=y CONFIG_NETFILTER_XT_MATCH_ADDRTYPE=y
CONFIG_NETFILTER_XT_MATCH_CONNTRACK=y CONFIG_NETFILTER_XT_MATCH_IPVS=y CONFIG_NETFILTER_XT_MARK=y
CONFIG_IP_NF_RAW=y               CONFIG_IP_NF_NAT=y           CONFIG_NF_NAT=y
CONFIG_IP6_NF_RAW=y              CONFIG_IP6_NF_NAT=y          CONFIG_NF_NAT_IPV4=y
CONFIG_NF_NAT_NEEDED=y           CONFIG_OVERLAY_FS=y          CONFIG_SECCOMP=y
CONFIG_CGROUP_PIDS=y             CONFIG_SYSVIPC=y             CONFIG_SYSVIPC_SYSCTL=y
CONFIG_USER_NS=y                 CONFIG_BLK_DEV_THROTTLING=y  CONFIG_VXLAN=y
CONFIG_MACVLAN=y                 CONFIG_IP_VS=y
```

### 📋 Bloco completo pra copiar no `.config` do kernel:

```bash
# === OBRIGATÓRIAS (Docker não funciona sem) ===
CONFIG_POSIX_MQUEUE=y
CONFIG_BRIDGE_NETFILTER=y
CONFIG_NETFILTER_XT_MATCH_ADDRTYPE=y
CONFIG_NETFILTER_XT_MATCH_IPVS=y
CONFIG_IP6_NF_NAT=y
CONFIG_IP6_NF_TARGET_MASQUERADE=y

# === OPCIONAIS RECOMENDADAS ===
CONFIG_USER_NS=y
CONFIG_BLK_DEV_THROTTLING=y
CONFIG_CGROUP_NET_PRIO=y
CONFIG_CFS_BANDWIDTH=y
CONFIG_VXLAN=y
CONFIG_MACVLAN=y
CONFIG_IPVLAN=y
```

### ✅ Flags que JÁ ESTÃO OK (não mexer):
```
CONFIG_NAMESPACES=y       CONFIG_NET_NS=y          CONFIG_PID_NS=y
CONFIG_IPC_NS=y           CONFIG_UTS_NS=y          CONFIG_CGROUPS=y
CONFIG_CGROUP_CPUACCT=y   CONFIG_CGROUP_DEVICE=y   CONFIG_CGROUP_FREEZER=y
CONFIG_CGROUP_SCHED=y     CONFIG_CPUSETS=y          CONFIG_MEMCG=y
CONFIG_KEYS=y             CONFIG_VETH=y             CONFIG_BRIDGE=y
CONFIG_IP_NF_FILTER=y     CONFIG_IP_NF_MANGLE=y    CONFIG_IP_NF_TARGET_MASQUERADE=y
CONFIG_IP6_NF_FILTER=y    CONFIG_IP6_NF_MANGLE=y   CONFIG_NETFILTER_XT_MATCH_CONNTRACK=y
CONFIG_NETFILTER_XT_MARK=y CONFIG_IP_NF_RAW=y      CONFIG_IP_NF_NAT=y
CONFIG_NF_NAT=y           CONFIG_IP6_NF_RAW=y      CONFIG_NF_NAT_IPV4=y
CONFIG_NF_NAT_NEEDED=y    CONFIG_OVERLAY_FS=y       CONFIG_SECCOMP=y
CONFIG_SECCOMP_FILTER=y   CONFIG_CGROUP_PIDS=y      CONFIG_SYSVIPC=y
CONFIG_SYSVIPC_SYSCTL=y   CONFIG_EXT4_FS=y
```


---

## 🧪 7. Debug Realizado (08/08/2026) — Erros & Soluções

### Sequência de erros encontrados e resolvidos:

| # | Erro | Causa | Solução |
|:--|:-----|:------|:--------|
| 1 | `remount /, flags: 0x84000: invalid argument` | Driver `overlay2` sobre `f2fs` no chroot | Trocar para `"storage-driver": "vfs"` |
| 2 | `open /proc/self/mountinfo: no such file or directory` | `/proc` não montado no chroot | `mount -t proc proc /proc` |
| 3 | `failed to start containerd: timeout` | containerd não iniciou (sem `/proc`) | Montar `/proc`, `/sys`, `/dev` antes de iniciar |
| 4 | `Devices cgroup isn't mounted` | Cgroups v1 não montados no chroot | Montar cada controlador em `/sys/fs/cgroup/` |
| 5 | `cpuset.cpus: Permission denied` | SELinux do Android protege cpuset | Desmontar cpuset (`umount /sys/fs/cgroup/cpuset`) |
| 6 | `/dev/shm is not mounted` | Shared memory não disponível | `mount -t tmpfs tmpfs /dev/shm` |
| 7 | `mounting "mqueue": no such device` | **`CONFIG_POSIX_MQUEUE` não compilado no kernel** | ⏳ **Pendente: recompilar kernel** |

---

## 🛠️ 8. Script Correto de Inicialização do Chroot + Docker

> ⚠️ Este script deve ser executado **de fora do chroot** (Termux/ADB com root).
> Futuramente será integrado ao `autostart_debian.sh` do Magisk.

### Passo 1: Montar filesystems e entrar no chroot
```bash
# Executar como root (su) no Android/Termux
CHROOT=/data/local/tmp/chrootDebian

# Montar filesystems virtuais ("abrir as janelas" do chroot)
mount -t proc proc $CHROOT/proc 2>/dev/null
mount -t sysfs sysfs $CHROOT/sys 2>/dev/null
mount -o bind /dev $CHROOT/dev 2>/dev/null
mount -t devpts devpts $CHROOT/dev/pts 2>/dev/null
mkdir -p $CHROOT/dev/shm
mount -t tmpfs tmpfs $CHROOT/dev/shm 2>/dev/null

# Entrar no chroot
chroot $CHROOT /bin/bash
```

### Passo 2: Dentro do chroot — configurar cgroups e Docker
```bash
# Setar PATH
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Montar cgroups v1 (sem cpuset — bloqueado pelo SELinux)
mkdir -p /sys/fs/cgroup
mount -t tmpfs cgroup_root /sys/fs/cgroup 2>/dev/null
for cg in devices cpu cpuacct blkio memory pids freezer; do
  mkdir -p /sys/fs/cgroup/$cg
  mount -t cgroup -o $cg cgroup /sys/fs/cgroup/$cg 2>/dev/null
done

# Configurar Docker com driver VFS
echo '{"storage-driver": "vfs", "iptables": false}' > /etc/docker/daemon.json

# Iniciar containerd + dockerd
containerd > /tmp/containerd.log 2>&1 &
sleep 3
dockerd > /tmp/dockerd.log 2>&1 &
sleep 5

# Testar (com --ipc=host até recompilar kernel com MQUEUE)
docker run --rm --ipc=host hello-world
```

---

## 📂 9. Arquivos de Backup no PC
- **[magisk_patched-30700_MjQU1.img](file:///C:/Users/aurel/Downloads/magisk_patched-30700_MjQU1.img)** (`64.0 MB`) — Imagem atualmente rodando no celular.
- **[NOVO_KERNEL_DOCKER.img](file:///C:/Users/aurel/Downloads/NOVO_KERNEL_DOCKER.img)** (`64.0 MB`) — Imagem base do Kernel nova.
