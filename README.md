# SZ YWJ 自动化任务部署指南 🚀

本项目通过结合 **GitHub Actions**、**Cloudflare Workers** 和 **Telegram Bot**，实现了一个完全自动化且支持手动指令触发的短信与呼叫任务调度系统。

本指南专为零基础用户编写，跟着步骤走，即可轻松完成全套部署！

---

## 📋 目录
1. [准备工作](#一-准备工作-)
2. [第一步：配置 Telegram 机器人](#二-第一步配置-telegram-机器人-)
3. [第二步：GitHub 仓库配置](#三-第二步github-仓库配置-)
4. [第三步：修改 Cloudflare 代码适配个人版本](#四-第三步修改-cloudflare-代码适配个人版本-)
5. [第四步：部署 Cloudflare Worker](#五-第四步部署-cloudflare-worker-)
6. [第五步：绑定 Telegram 机器人 Webhook](#六-第五步绑定-telegram-机器人-webhook-)
7. [第六步：设置 Cloudflare Cron 定时触发器](#七-第六步设置-cloudflare-cron-定时触发器-)
8. [测试与验证](#八-测试与验证-)

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
4. **⚠️ 关键步骤：** 在权限列表中，勾选 **`repo`** 和 **`workflow`** 权限。
5. 点击生成，**复制并保存好这串以 `ghp_` 开头的密钥**（离开页面后将无法再次查看）。

---

## 四、 第三步：修改 Cloudflare 代码适配个人版本 ✏️

在部署前，你需要修改 `worker.js` 文件，让其指向你自己的 GitHub 仓库。

1. 打开你仓库中的 `worker.js` 文件。
2. 找到最下方的 `triggerGitHub` 函数中的这段代码：
   ```javascript
   const githubUrl = `https://api.github.com/repos/yumige18/szywj/actions/workflows/${workflow}/dispatches`;
   ```
3. **将 `yumige18/szywj` 修改为你自己的 `GitHub用户名/仓库名`。**
   > 例如：你的 GitHub 用户名是 `zhangsan`，则改为 `zhangsan/szywj`。

4. （可选）如果你想修改默认下发任务的手机号，请修改第 36 行：
   ```javascript
   const DEFAULT_NUMBER = '17879807573'; // 替换为你的默认目标号码
   ```

---

## 五、 第四步：部署 Cloudflare Worker ☁️

### 1. 创建 Worker
1. 登录 [Cloudflare 控制台](https://dash.cloudflare.com/)。
2. 左侧菜单栏点击 **Workers 和 Pages** -> **创建应用程序** -> **创建 Worker**。
3. 设置一个名称（如 `szywj-worker`），点击 **部署**。

### 2. 写入代码
1. 点击 Worker 右上角的 **编辑代码**。
2. 清空默认代码，将你刚刚**修改好的 `worker.js` 代码**全部粘贴进去。
3. 点击右上角的 **保存并部署**。

### 3. 配置环境变量
1. 返回 Worker 管理主页，点击 **设置** -> **变量**。
2. 在 **环境变量** 处点击 **添加**，依次添加以下三个变量并保存：

| 变量名称（Name） | 变量类型 | 变量值（Value） | 
| :--- | :--- | :--- | 
| `GITHUB_TOKEN` | **机密 (Secret)** | 步骤二生成的 `ghp_...` 令牌 | 
| `TG_BOT_TOKEN` | **机密 (Secret)** | 步骤一获取的 Telegram Bot Token | 
| `TG_CHAT_ID` | **文本 (Text)** | 步骤一获取的 Telegram Chat ID | 

---

## 六、 第五步：绑定 Telegram 机器人 Webhook 🔗

为了让机器人在 Telegram 中接收你的 `/sms` 或 `/call` 指令，需要绑定 Webhook。

1. 在 Cloudflare Worker 概述页面，找到你的 **Worker 域名**（例如 `https://szywj-worker.xxxx.workers.dev`）。
2. 在浏览器地址栏输入以下链接并回车（**请替换尖括号及内部内容**）：
   ```text
   https://api.telegram.org/bot<你的TG_BOT_TOKEN>/setWebhook?url=<你的Cloudflare_Worker_URL>
   ```
3. 页面显示 `{"ok":true,"result":true,"description":"Webhook was set"}` 即为绑定成功！

---

## 七、 第六步：设置 Cloudflare Cron 定时触发器 ⏰

为实现脚本的自动化按需运转，需设置定时器（时间已在代码中针对北京时间做了转换适配）。

1. 在 Worker 管理页面，点击 **设置** -> **触发器**。
2. 找到 **Cron 触发器**，依次添加以下 4 个 Cron 表达式（UTC时间）：
   - `0 4,10,16,22 * * *` （每天 0,6,12,18 点发短信）
   - `40 23 * * *` （第1天 07:40 呼叫）
   - `40 5 * * *` （第2天 13:40 呼叫）
   - `40 11 * * *` （第3天 19:40 呼叫）

---

## 八、 测试与验证 ✅

大功告成！现在你可以去 Telegram 找你的机器人进行测试了。

### 💬 手动指令测试
向你的机器人发送以下指令：
* 发送 `/sms 13800138000` -> 机器人会回复并触发短信任务。
* 发送 `/call 13800138000` -> 机器人会回复并触发呼叫任务。

### 👁️ 查看运行日志
你可以随时前往你的 GitHub 仓库，点击顶部的 **Actions** 标签页，实时查看脚本是否被成功唤醒并稳定运行。任务结束后，机器人也会在 Telegram 为你推送最终执行汇报！
