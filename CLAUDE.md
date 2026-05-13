@AGENTS.md

## SSH：云服务器部署

本机通过 Clash Verge (verge-mih) 代理上网，端口 `127.0.0.1:7897`。SSH 连接云服务器时可能受代理影响。

### 服务器列表

```
# ~/.ssh/config 实际配置：
Host openclaw
  HostName 45.77.245.137   # openclaw 主服务器
  User bi4o
  IdentityFile ~/.ssh/id_ed25519

# 另一个服务器（需直连 IP:Port）：
# 216.249.100.66:13654  user: root
```

- `ssh openclaw` → `45.77.245.137` (bi4o) — PolyBot 后端在此服务器
- `ssh root@216.249.100.66 -p 13654` — 另一个服务器，需代理才能访问

### SSH 连接失败排查

**现象：** `ssh openclaw-prod` 连到 `127.0.0.1:7897` 然后 `Connection closed`

**原因：** SSH config 中不存在 `openclaw-prod` 主机别名，SSH 尝试 DNS 解析。由于 Clash 代理接管了全局流量，连接被路由到本地代理端口 7897，代理不认识 SSH 协议导致断开。

**解决：**
1. 先用 `cat ~/.ssh/config` 确认目标主机别名是否存在
2. 用 IP 直连：`ssh bi4o@45.77.245.137`
3. 如果 IP 不可达，检查 Clash Verge 是否开启了全局代理，尝试关闭或设为规则模式

