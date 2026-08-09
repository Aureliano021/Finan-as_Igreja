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
---

## 🟢 6. Kernel Compilado & Flags Ativas

> **Status:** **100% Concluído e Aprovado.**
> O kernel foi compilado com todas as flags do Docker (namespaces, cgroups, overlay2, sysvipc e mqueue).

### Checklist de flags ativas no Kernel:
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
CONFIG_SYSVIPC_SYSCTL=y   CONFIG_POSIX_MQUEUE=y    CONFIG_POSIX_MQUEUE_SYSCTL=y
```

---

## 🏛️ 7. Arquitetura Final do Servidor no Celular (Redmi Note 8)

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Xiaomi Redmi Note 8 (ginkgo)                          │
│                Kernel Linux 4.14 Customizado (Magisk Root)                  │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        Debian Linux (chroot)                          │  │
│  │                                                                       │  │
│  │   Docker Daemon (vfs storage, iptables: false)                        │  │
│  │   docker-compose.yml em /root/docker/                                 │  │
│  │                                                                       │  │
│  │   ┌───────────────────┐ ┌───────────────────┐ ┌────────────────────┐   │  │
│  │   │  igreja_frontend  │ │  igreja_backend   │ │  igreja_postgres   │   │  │
│  │   │   (Nginx + React) │ │     (FastAPI)     │ │   (PostgreSQL 16)  │   │  │
│  │   │     Porta 80      │ │    Porta 8000     │ │     Porta 5432     │   │  │
│  │   └─────────┬─────────┘ └─────────┬─────────┘ └─────────┬──────────┘   │  │
│  └─────────────┼─────────────────────┼─────────────────────┼──────────────┘  │
│                │ (network_mode: host)│                     │                 │
└────────────────┼─────────────────────┼─────────────────────┼─────────────────┘
                 ▼                     ▼                     ▼
          http://IP:80           http://IP:8000/docs   127.0.0.1:5432
          Web App React          Swagger API           7 Tabelas (bi_learning)
```

---

## 🛠️ 8. Automação de Boot via Magisk (`autostart_debian.sh`)

O celular reinicia e sobe **todos os serviços sozinho** via script no Magisk:

- **Script Host Magisk:** `/data/adb/service.d/autostart_debian.sh`
- **Script Interno Debian:** `/root/start_services.sh`
- **Log de Boot:** `/data/local/tmp/autostart.log`

### O que o script de boot faz em sequência:
1. Aguarda 10 segundos para a rede e a interface Wi-Fi estabilizarem.
2. Aplica `mount -o bind` e `mount --make-rshared` na raiz do chroot no Android host.
3. Monta os sistemas de arquivos virtuais (`/proc`, `/sys`, `/dev`, `/dev/pts`, `/dev/shm`).
4. Inicia o servidor **SSH** na porta 22.
5. Aplica `mount --make-rslave /` dentro do Debian e monta a hierarquia de **Cgroups v1** em `/sys/fs/cgroup/`.
6. Configura o wrapper transparente do `/usr/bin/runc` com `--no-pivot` para viabilizar a criação de contêineres em chroot.
7. Reinicia o **`containerd`** e **`dockerd`** (driver `vfs`).
8. Executa `docker-compose up -d` na pasta `/root/docker/`, subindo os 3 contêineres (`igreja_postgres`, `igreja_frontend`, `igreja_backend`).

---

## 🧪 9. Soluções e Aprendizados de Engenharia

| Desafio | Causa | Solução de Alto Nível |
|:---|:---|:---|
| **`remount /, flags: 0x84000`** | `f2fs` do Android e chroot com raiz privada impedem isolamento de mount namespace | Aplicado `mount -o bind $CHROOT $CHROOT` + `mount --make-rshared $CHROOT` no host Android e `mount --make-rslave /` no Debian chroot |
| **`pivot_root .: invalid argument`** | Kernel Linux proíbe `pivot_root` se a raiz for `MS_SHARED` ou estiver em chroot | Criado wrapper transparente em `/usr/bin/runc` que injeta a flag `--no-pivot` em `runc create/run`, forçando uso de `chroot`/`MS_MOVE` |
| **`dumpsys/chroot: not found` no boot Magisk** | O Magisk inicia scripts em `/data/adb/service.d/` com um `$PATH` mínimo do Android | Adicionado `export PATH=/system/bin:/system/xbin:/sbin:/vendor/bin:$PATH` no início do `autostart_debian.sh` |
| **`iptables: false` / Port Mapping** | Android bloqueia manipulação de tabelas NAT do iptables pelo Docker | Utilizado `network_mode: host` para conectar os contêineres direto na pilha de rede do Android |
| **`mqueue: no such device`** | Kernel Android padrão sem suporte a POSIX Message Queues | Recompilado kernel com `CONFIG_POSIX_MQUEUE=y` |
| **CORS Preflight (`OPTIONS 400/405`)** | Navegador envia requisição `OPTIONS` prévia e a origem não batia com o IP da Wi-Fi | Adicionado `CORSMiddleware` no FastAPI antes das rotas com `allow_origins=["*"]` e `allow_methods=["*"]` |
| **Nginx Proxy Reverso** | Centralizar chamadas da Web App sem expor porta 8000 diretamente | Rota `/api/` no `nginx.conf` apontando internamente para `http://127.0.0.1:8000/` |
| **Restauração de Backup PG17 no PG16** | Backup gerado com `pg_dump -Fc` (PG17) dava incompatibilidade de versão no `pg_restore` 15 | Executado `pg_restore` via contêiner temporário `postgres:17-alpine` apontando para `127.0.0.1:5432` |
