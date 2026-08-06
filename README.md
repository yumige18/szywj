# SZYWJ 自动化任务部署指南 🚀

本项目通过结合 **GitHub Actions**、**Cloudflare Workers** 和 **Telegram Bot**，实现了一个完全自动化且支持手动指令触发的短信与呼叫任务调度系统。

本指南专为零基础用户编写，跟着步骤走，即可轻松完成全套部署！

---

## 📋 目录
1. [准备工作](#一-准备工作)
2. [第一步：配置 Telegram 机器人](#二-第一步配置-telegram-机器人)
3. [第二步：GitHub 仓库配置](#三-第二步github-仓库配置)
4. [第三步：修改 Cloudflare 代码适配个人版本](#四-第三步修改-cloudflare-代码适配个人版本)
5. [第四步：部署 Cloudflare Worker](#五-第四步部署-cloudflare-worker)
6. [第五步：绑定 Telegram 机器人](#六-第五步绑定-telegram-机器人-webhook)
7. [第六步：设置定时触发器 (Cron)](#七-第六步设置-cloudflare-cron-定时触发器)
8. [使用与测试](#八-测试与验证)

---

## 一、 准备工作 🛠️

在开始之前，请确保你已注册并登录以下账号：
- [x] **GitHub 账号**：用于托管脚本与运行自动化工作流。
- [x] **Cloudflare 账号**：用于部署 Worker，托管中控服务与定时调度。
- [x] **Telegram 账号**：用于通过机器人发送控制指令和接收执行汇报。

---

## 二、 第一步：配置 Telegram 机器人 🤖

我们需要创建一个 Telegram 机器人，并获取 **Bot Token** 和你的 **Chat ID**。

### 1. 获取 Bot Token
1. 在 Telegram 中搜索 `@BotFather` 并打开对话。
2. 发送指令 `/newbot`。
3. 根据提示依次输入**机器人名称**和**机器人用户名**（必须以 `bot` 结尾）。
4. 创建成功后，复制并保存返回的 **API Token**（格式类似 `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ`）。

### 2. 获取 Chat ID
1. 在 Telegram 中搜索 `@userinfobot` 并点击 `Start`。
2. 机器人会自动回复你的个人信息，复制并保存其中的 `Id`（一串纯数字）。

---

## 三、 第二步：GitHub 仓库配置 🐙

### 1. Fork 目标仓库
1. 点击页面右上角的 **Fork** 按钮，将本项目复制到你自己的 GitHub 账号下。

### 2. 配置 Repository Secrets
1. 进入你 Fork 后的新仓库页面，点击上方的 **Settings**（设置）。
2. 在左侧菜单栏依次选择 **Secrets and variables** -> **Actions**。
3. 点击 **New repository secret**，添加以下两个密钥：

| 密钥名称（Name） | 密钥值（Value） | 作用 |
| :--- | :--- | :--- |
| `TG_BOT_TOKEN` | 填入刚才获取的 API Token | 用于 GitHub Actions 向 TG 发送消息 |
| `TG_CHAT_ID` | 填入刚才获取的 Chat ID | 指定接收消息的 TG 账号或群组 |

### 3. 创建 Personal Access Token (PAT)
Cloudflare Worker 需要此令牌来跨端触发你的 GitHub Actions。
1. 点击 GitHub 右上角头像 -> **Settings** -> 左侧最底部 **Developer settings**。
2. 依次选择 **Personal access tokens** -> **Tokens (classic)** -> **Generate new token (classic)**。
3. 填写 **Note**（如：`CF Worker Trigger`），**Expiration** 建议设置为 `No expiration`（永不过期）。
4. **⚠️ 关键步骤：** 在权限列表中，勾选 **`workflow`** 权限。
5. 点击生成，**复制并保存好这串以 `ghp_` 开头的密钥**（离开页面后将无法再次查看）。

---

## 四、 第三步：修改 Cloudflare 代码适配个人版本 ✏️

在部署前，你需要修改 `worker.js` 文件，让其指向你自己的 GitHub 仓库。

1. 打开你仓库中的 `worker.js` 文件。
2. 找到最下方的 `triggerGitHub` 函数中的这段代码：
   ```javascript
   const githubUrl = `[https://api.github.com/repos/yumige18/szywj/actions/workflows/$](https://api.github.com/repos/yumige18/szywj/actions/workflows/$){workflow}/dispatches`;
