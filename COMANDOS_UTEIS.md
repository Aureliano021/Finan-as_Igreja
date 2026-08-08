# 📌 Guia de Comandos Úteis (Termux, Debian ARM & Aplicação)

Este guia contém os principais comandos para gerenciar o ambiente Termux, o sistema Debian chroot e a aplicação web.

---

## 1. 📱 Termux (Nativo do Android)

### Iniciar e Gerenciar o Servidor SSH
* **Iniciar SSH na porta padrão (8022):**
  ```bash
  sshd
  ```
* **Iniciar SSH em uma porta personalizada (ex: 2222):**
  ```bash
  sshd -p 2222
  ```
* **Encerrar/Reiniciar o serviço SSH:**
  ```bash
  pkill sshd
  ```
* **Alterar a senha do usuário do Termux:**
  ```bash
  passwd
  ```
* **Descobrir o nome do usuário do Termux:**
  ```bash
  whoami
  ```

---

## 2. 🐧 Entrar no Debian a partir do Termux

* **Entrar no Debian como Usuário Comum (`droidmaster`):**
  ```bash
  su -c "chroot /data/local/tmp/chrootDebian /bin/su - droidmaster"
  ```
* **Entrar no Debian como Usuário Root (`root`):**
  ```bash
  su
  chroot /data/local/tmp/chrootDebian /bin/bash
  export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH
  ```
* **Iniciar todos os serviços automáticos do Debian (SSH porta 22, Samba, FileBrowser):**
  ```bash
  su -c "sh /data/local/tmp/start_debian.sh"
  ```

---

## 3. 💻 Conectar via SSH a partir do PC (PowerShell / Terminal)

* **Conectar no Termux (Porta 8022):**
  ```powershell
  ssh u0_a153@192.168.1.83 -p 8022 ou 2222 ambos (termux debian) senha 010487
  ```
* **Conectar no Debian Direto como Root (Porta 22):**
  ```powershell
  ssh -t root@192.168.1.83
  ```
* **Enviar projeto compactado do Windows para o dispositivo (Ultra-rápido):**
  ```powershell
  # 1. Compactar sem node_modules
  tar --exclude="node_modules" --exclude=".git" -czf projeto.tar.gz -C c:\Users\aurel\.gemini\antigravity\scratch\igreja-financas-fe .

  # 2. Enviar via SCP para a pasta home
  scp -P 8022 projeto.tar.gz u0_a153@192.168.1.83:~/
  ```

---

## 4. 🚀 Executar a Aplicação Web (React + Vite) ****defasado

correção; isso foi uma solução ao docker que não funcioava... estou tentando corrgir mas até o momento ainda não está funcioando. o gerenciamento de arquivos está por meio do git pull, algo assim.

Dentro do Debian (pasta do projeto):

```bash
# 1. Entrar na pasta do projeto
cd /root/igreja-financas-fe

# 2. Instalar dependências (com React 19)
npm install --legacy-peer-deps

# 3. Iniciar servidor de desenvolvimento (exposto na Wi-Fi)
npm run dev
```

> **Acesso pela rede local:** `http://192.168.1.83:5173`

---

## 5. 🖥️ Área de Trabalho Gráfica (VNC)

* **Iniciar Servidor VNC (XFCE4) acessível pela Wi-Fi:**
  ```bash
  vncserver :1 -geometry 1280x720 -depth 24 -localhost no
  ```
* **Conectar no VNC Viewer:** `192.168.1.83:5901` *(Senha: `123456`)*
* **Encerrar o servidor VNC:**
  ```bash
  vncserver -kill :1
  ```

---

## 6. 📊 Monitor de Sistema

* **No Termux (requer Root/tsu para o btop):**
  ```bash
  tsu btop
  # ou se já estiver como root (su):
  btop
  ```
* **No Debian (usando htop):**
  ```bash
  htop
  ```
* **No Termux sem Root (versão leve):**
  ```bash
  htop
  ```

---

## 7. 🐳 Docker & Docker Compose no Android

* **Iniciar o Docker Daemon (`dockerd`):**
  ```bash
  dockerd &
  ```
* **Subir a aplicação em container via Docker Compose (porta 80):**
  ```bash
  docker compose up -d --build
  ```
* **Verificar containers em execução:**
  ```bash
  docker ps
  ```
* **Verificar logs do container:**
  ```bash
  docker logs igreja_financas_app
  ```
* **Parar os containers:**
  ```bash
  docker compose down
  ```

---

## 8. 📝 Instalar e Executar o VS Code (ARM64)

### Opção A: VS Code no Navegador (`code-server`) - Recomendado!
Permite usar o VS Code completo direto pelo navegador web sem precisar de VNC:
```bash
# 1. Instalar o code-server no Debian
curl -fsSL https://code-server.dev/install.sh | sh

# 2. Iniciar o servidor de código exposto na Wi-Fi (porta 8080)
code-server --bind-addr 0.0.0.0:8080 --auth none
```
> **Acesso pelo navegador:** `http://192.168.1.83:8080`

### Opção B: VS Code Oficial Desktop (para VNC)
```bash
# 1. Baixar o pacote oficial ARM64
wget -O code_arm64.deb "https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-arm64"

# 2. Instalar o pacote
apt update
apt install -y ./code_arm64.deb

# 3. Executar (como Root):
code --no-sandbox --user-data-dir=/root/.config/Code

# 3. Executar (como droidmaster):
code --no-sandbox
```
