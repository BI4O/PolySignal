@AGENTS.md

## SSH：云服务器部署

本机通过 Clash Verge (verge-mih) 代理上网，端口 `127.0.0.1:7897`。SSH 连接云服务器时可能受代理影响。

### 服务器

```
# ~/.ssh/config
Host rwa.ltd
  HostName 45.77.245.137
  User bi4o
  IdentityFile ~/.ssh/id_ed25519
```

- `ssh rwa.ltd` → `45.77.245.137` (bi4o) — 主服务器，后端和本项目均在此部署

### 部署流程

```bash
# 1. 复制环境变量文件（.env.docker 被 gitignore，每次新增变量后需同步）
scp .env.docker rwa.ltd:/opt/agents/PolySignal/.env.docker

# 2. SSH 到服务器
ssh rwa.ltd

# 3. 在服务器上执行
cd /opt/agents/PolySignal
git pull
docker compose up --build -d
```

### SSH 连接失败排查

**现象：** SSH 连到 `127.0.0.1:7897` 然后 `Connection closed`

**原因：** 如果用的主机别名在 `~/.ssh/config` 中不存在，SSH 尝试 DNS 解析。Clash 代理接管了全局流量后，连接被路由到本地代理端口 7897，代理不认识 SSH 协议导致断开。

**解决：**
1. 先用 `cat ~/.ssh/config` 确认目标主机别名是否存在
2. 用 IP 直连：`ssh bi4o@45.77.245.137`
3. 如果 IP 不可达，检查 Clash Verge 是否开启了全局代理，尝试关闭或设为规则模式

