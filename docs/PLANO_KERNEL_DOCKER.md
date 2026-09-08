# 📌 Plano Mestre: Servidor Docker Nativo no Android (Redmi Note 8 - LineageOS 23.2 & Debian 12)

---

## 📱 Especificações Completas do Dispositivo & Ambiente

| Parâmetro | Valor / Identificador |
| :--- | :--- |
| **Dispositivo** | Xiaomi Redmi Note 8 / Note 8T |
| **Codinome do Aparelho** | **`ginkgo`** |
| **Processador (SoC)** | Qualcomm Snapdragon 665 (Kryo 260 / 8 Núcleos ARM64) |
| **Memória RAM** | 4 GB LPDDR4x (~3.6 GB Total Disponível) |
| **Armazenamento** | 64 GB eMMC 5.1 |
| **Versão do Android** | **Android 16** |
| **Versão da LineageOS** | **`23.2-20260429-NIGHTLY-ginkgo`** |
| **Kernel Compilado** | `Linux 4.14.357-openela-perf #4 SMP PREEMPT` (Clang 14 + Docker Flags) |
| **Root** | **Magisk (Root ativo)** |
| **IP Local do Dispositivo** | `192.168.1.83` |
| **SSH Debian (Root)** | `ssh root@192.168.1.83` (Porta 22 / Senha: `preda2016` ou `010487`) |
| **SSH Termux (Usuário)** | `ssh u0_a154@192.168.1.83 -p 8022` (Porta 8022 / Senha: `preda2016`) |
| **Caminho do Chroot** | `/data/local/tmp/chrootDebian` (Debian 12 Bookworm ARM64) |
| **Diretório Docker Compose** | `/root/docker/` |
| **Script Auto-boot Magisk** | `/data/adb/service.d/autostart_debian.sh` |
| **Script Inicializador Debian** | `/root/start_services.sh` |
| **Comando de Deploy Global** | `update-repos` (`/usr/local/bin/update-repos`) |

---

## 🎯 1. Objetivo do Projeto

Transformar o celular **Xiaomi Redmi Note 8 (`ginkgo`)** em um **servidor de produção autônomo, seguro e de baixo consumo de energia** para a aplicação de gestão financeira da igreja:
1. Executar **Debian 12 Bookworm (ARM64)** completo via `chroot` no Android.
2. Executar o **Docker Engine** e **Docker Compose** nativamente com drivers otimizados e cgroups v1.
3. Orquestrar **4 contêineres integrados**: Banco de Dados (PostgreSQL 16), API (FastAPI), Aplicação Web (React + Vite + Nginx) e Conexão Segura Externa (Cloudflare Zero Trust Tunnel).
4. Publicar a aplicação na internet de forma segura via **Cloudflare Tunnel** (sem abrir portas no roteador e com SSL ponta a ponta).
5. Garantir **auto-recuperação (Auto-boot)** ao ligar/reiniciar o celular via script do Magisk.
6. Prover **CI/CD Simplificado** no próprio terminal via comando único `update-repos`.

---

## 🔬 2. Diagnóstico do Kernel & Flags Docker Ativas

O Kernel foi recompilado com Clang 14 (versão `#4`), ativando nativamente todos os recursos necessários para isolamento de contêineres:

### ✅ Flags Confirmadas e Ativas no Kernel:
```text
CONFIG_NAMESPACES=y          CONFIG_NET_NS=y               CONFIG_PID_NS=y
CONFIG_IPC_NS=y              CONFIG_UTS_NS=y               CONFIG_USER_NS=y
CONFIG_CGROUPS=y             CONFIG_CGROUP_CPUACCT=y       CONFIG_CGROUP_DEVICE=y
CONFIG_CGROUP_FREEZER=y      CONFIG_CGROUP_SCHED=y         CONFIG_CPUSETS=y
CONFIG_CGROUP_PIDS=y         CONFIG_MEMCG=y                CONFIG_KEYS=y
CONFIG_VETH=y                CONFIG_BRIDGE=y               CONFIG_BRIDGE_NETFILTER=y
CONFIG_IP_NF_FILTER=y        CONFIG_IP_NF_MANGLE=y         CONFIG_IP_NF_TARGET_MASQUERADE=y
CONFIG_IP6_NF_FILTER=y       CONFIG_IP6_NF_MANGLE=y        CONFIG_NETFILTER_XT_MATCH_CONNTRACK=y
CONFIG_NETFILTER_XT_MARK=y   CONFIG_IP_NF_RAW=y            CONFIG_IP_NF_NAT=y
CONFIG_NF_NAT=y              CONFIG_IP6_NF_RAW=y           CONFIG_NF_NAT_IPV4=y
CONFIG_NF_NAT_NEEDED=y       CONFIG_OVERLAY_FS=y           CONFIG_SECCOMP=y
CONFIG_SECCOMP_FILTER=y      CONFIG_SYSVIPC=y              CONFIG_SYSVIPC_SYSCTL=y
CONFIG_POSIX_MQUEUE=y        CONFIG_POSIX_MQUEUE_SYSCTL=y  CONFIG_BLK_DEV_THROTTLING=y
```

---

## 🏛️ 3. Arquitetura do Sistema e Topologia de Rede

O servidor adota uma arquitetura em camadas isoladas onde o tráfego externo passa pelo túnel da Cloudflare e é roteado internamente pela rede bridge `igreja_net`:

```text
                                  ┌────────────────────────┐
                                  │    Internet / Usuário  │
                                  └───────────┬────────────┘
                                              │ (HTTPS - Porta 443)
                                              ▼
                                 ┌──────────────────────────┐
                                 │ Cloudflare Edge / WAF    │
                                 └────────────┬─────────────┘
                                              │ (Túnel Criptografado)
┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
│ Xiaomi Redmi Note 8 (ginkgo - Android 16 / LineageOS 23.2 / Magisk Root)                  │
│                                              ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Debian 12 Bookworm (ARM64 Chroot em /data/local/tmp/chrootDebian)                   │  │
│  │                                                                                     │  │
│  │   Docker Engine (Daemon: vfs, iptables: false)                                      │  │
│  │   Rede Bridge Interna: igreja_net                                                   │  │
│  │                                                                                     │  │
│  │   ┌────────────────────────┐                    ┌───────────────────────────────┐   │  │
│  │   │     igreja_tunnel      │                    │        igreja_frontend        │   │  │
│  │   │  (cloudflare/cloudflared)──────────────────▶│        (React + Nginx)        │   │  │
│  │   │    Conexão Zero Trust  │  http://frontend:80│      Porta 80 (igreja_net)    │   │  │
│  │   └────────────────────────┘                    └───────────────┬───────────────┘   │  │
│  │                                                                 │ (proxy /api/)     │  │
│  │                                                                 ▼                   │  │
│  │   ┌────────────────────────┐                    ┌───────────────────────────────┐   │  │
│  │   │    igreja_postgres     │◀───────────────────│        igreja_backend         │   │  │
│  │   │    (PostgreSQL 16)     │  postgres:5432     │           (FastAPI)           │   │  │
│  │   │  Volume: postgres_data │                    │    Porta 8000 (igreja_net)    │   │  │
│  │   └────────────────────────┘                    └───────────────────────────────┘   │  │
│  └─────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ 4. Componentes Chave da Engenharia Chroot/Docker

### 4.1. Propagação de Montagem (`Mount Propagation`)
Para que o Docker consiga extrair camadas de imagens (`ApplyLayer`) e criar contêineres sem travar no erro `device or resource busy`:
1. **No Host Android:**
   ```bash
   mount -o bind /data/local/tmp/chrootDebian /data/local/tmp/chrootDebian
   mount --make-rshared /data/local/tmp/chrootDebian
   ```
2. **Dentro do Debian Chroot:**
   ```bash
   mount --bind / /
   mount --make-rslave /
   ```

### 4.2. Wrapper Inteligente do `runc` (`/usr/local/bin/runc`)
O runtime padrão do Docker (`runc`) tenta invocar a chamada de sistema `pivot_root` (que falha dentro de um ambiente chroot) e tenta montar `/dev/mqueue` (POSIX Message Queue):
- **Localização:** `/usr/local/bin/runc` (com link simbólico em `/usr/bin/runc`).
- **Funções do Wrapper:**
  1. Intercepta comandos `create`, `run`, `exec`, `restore` e injeta a flag `--no-pivot` antes do binário real `/usr/sbin/runc`.
  2. Inspeciona dinamicamente o arquivo `$bundle/config.json` e remove qualquer tentativa de montagem do tipo `mqueue` ou destino `/dev/mqueue`.

```bash
#!/usr/bin/env bash
# Wrapper runc para Android Chroot
ARGS=()
IS_CREATE_OR_RUN=0
BUNDLE_PATH=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    create|run)
      IS_CREATE_OR_RUN=1
      ARGS+=("$1" "--no-pivot")
      shift
      ;;
    -b|--bundle)
      BUNDLE_PATH="$2"
      ARGS+=("$1" "$2")
      shift 2
      ;;
    *)
      ARGS+=("$1")
      shift
      ;;
  esac
done

if [ $IS_CREATE_OR_RUN -eq 1 ] && [ -n "$BUNDLE_PATH" ] && [ -f "$BUNDLE_PATH/config.json" ]; then
  python3 -c "
import json, sys
try:
    with open('$BUNDLE_PATH/config.json', 'r') as f:
        data = json.load(f)
    if 'mounts' in data:
        data['mounts'] = [m for m in data['mounts'] if m.get('type') != 'mqueue' and m.get('destination') != '/dev/mqueue']
    with open('$BUNDLE_PATH/config.json', 'w') as f:
        json.dump(data, f, indent=2)
except Exception as e:
    pass
" 2>/dev/null
fi

exec /usr/sbin/runc "${ARGS[@]}"
```

### 4.3. Hierarquia Cgroups v1
No boot do Debian, os controladores são montados dinamicamente:
```bash
mount -t tmpfs -o mode=755,size=10m cgroup /sys/fs/cgroup
for cg in devices cpu,cpuacct memory pids freezer blkio; do
    mkdir -p /sys/fs/cgroup/$cg
    mount -t cgroup -o $cg cgroup /sys/fs/cgroup/$cg 2>/dev/null || true
done
```

---

## 📦 5. Orquestração Docker Compose (`/root/docker/docker-compose.yml`)

O ecossistema roda de forma unificada com reinicialização automática (`restart: unless-stopped`):

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: igreja_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
      POSTGRES_DB: ${POSTGRES_DB:-bi_learning}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - igreja_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: igreja_backend
    restart: unless-stopped
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@postgres:5432/${POSTGRES_DB:-bi_learning}
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - igreja_net

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: igreja_frontend
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - igreja_net

  tunnel:
    image: cloudflare/cloudflared:latest
    container_name: igreja_tunnel
    restart: unless-stopped
    command: tunnel --no-autoupdate run --token ${TUNNEL_TOKEN}
    depends_on:
      - frontend
    networks:
      - igreja_net

volumes:
  postgres_data:
    driver: local

networks:
  igreja_net:
    driver: bridge
```

---

## 🔄 6. Automação de CI/CD: Script `update-repos`

Para atualizar a aplicação sem intervenção manual e sem comandos complexos, foi criado o utilitário global **`update-repos`**:

### Como Executar:
```bash
# Conecte no Debian como root e digite:
update-repos
```

### O que o script realiza automaticamente:
1. Navega até `/root/docker/frontend` e executa `git pull origin master`.
2. Navega até `/root/docker/backend` e executa `git pull origin master`.
3. Reconstrói as imagens modificadas (`docker-compose build`).
4. Reinicia os serviços com zero downtime perceptível (`docker-compose up -d`).
5. Limpa camadas e imagens órfãs (`docker image prune -f`).
6. Valida o status dos 4 contêineres e exibe o resumo visual no terminal.

---

## 🚀 7. Ciclo de Boot Magisk (`autostart_debian.sh`)

O boot é disparado automaticamente pelo Magisk em `/data/adb/service.d/autostart_debian.sh`:

1. **Aguardar estabilização:** `sleep 10` para Wi-Fi e subsistemas estarem ativos.
2. **Propagação Host:** `mount --make-rshared /data/local/tmp/chrootDebian`.
3. **Montar VFS:** `/dev`, `/dev/pts`, `/dev/shm`, `/proc`, `/sys`.
4. **Entrar no Chroot:** Executa `/root/start_services.sh`.
5. **Start dos Daemons:**
   - Inicia o daemon SSH (`/usr/sbin/sshd`).
   - Inicia o `containerd`.
   - Inicia o `dockerd`.
   - Executa `docker-compose up -d` em `/root/docker/`.

---

## 🧪 8. Tabela de Desafios Técnicos e Soluções Definitivas

| Erro / Sintoma | Causa Raiz | Solução Implementada |
| :--- | :--- | :--- |
| **`Error cleaning up after pivot: device or resource busy` (ApplyLayer)** | Durante a extração do tarball da imagem, o Docker monta temporariamente o layer e o kernel rejeita desmontar se os pontos de montagem forem `MS_SHARED`. | Host Android roda `mount --make-rshared $CHROOT` e Debian interno roda `mount --bind / / && mount --make-rslave /` antes de subir o `dockerd`. |
| **`pivot_root .: invalid argument`** | A chamada de sistema `pivot_root` não é suportada diretamente pelo Linux se o processo já estiver dentro de um `chroot`. | Wrapper em `/usr/local/bin/runc` que injeta `--no-pivot` em `runc create` e `runc run`. |
| **`mqueue: no such device`** | Base images e `runc` tentam montar a fila POSIX (`/dev/mqueue`), mas a interface IPC pode não estar exposta no chroot. | Wrapper do `runc` remove o objeto `mqueue` do arquivo `$bundle/config.json` via script Python em tempo de execução. |
| **Exposição de portas e NAT (`iptables: false`)** | O Android gerencia sua própria tabela de rede e bloqueia o Docker de criar regras `iptables` NAT. | Uso do **Cloudflare Tunnel (`cloudflared`)** dentro da rede interna Docker `igreja_net`, dispensando regras NAT do host e dispensando abertura de portas no roteador. |
| **Problemas de Locale / Terminal no Chroot** | Faltavam locales compilados e variáveis de ambiente persistentes no Debian minimal. | Gerados locales `en_US.UTF-8` e `pt_BR.UTF-8`, e configurados `/etc/environment`, `/etc/profile` e `/root/.bashrc` com `LANG=en_US.UTF-8` e `TERM=xterm-256color`. |
| **Bloqueio de DPKG / Debconf** | Chamadas de instalação do APT ficavam presas aguardando prompts interativos em segundo plano. | Configurado `DEBIAN_FRONTEND=noninteractive` nas chamadas administrativas. |
