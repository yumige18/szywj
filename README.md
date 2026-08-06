将聊天转换为 PDF
将聊天转换为 PDF
在 Acrobat 中打开此聊天内容
与 Gemini 对话
https://github.com/yumige18/szywj

为这个项目写一个使用教程，从github到cloudflare，要详细，比如要指挥小白修改代码里的某些东西，比如仓库名字来适配他们自己的版本，从fork到部署，包括tg机器人，反正尽可能详细

szywj 项目零基础部署教程：从 GitHub 到 Cloudflare 与 Telegram 机器人
本教程将引导你完成项目的完整部署，包含：Telegram 机器人创建、GitHub 仓库 Fork 与密钥设置、Cloudflare Worker 代码修改与部署、Telegram 命令绑定及 Cron 定时任务配置。  
YML
+ 2

一、 准备工作
在开始之前，请确保你已注册并登录以下账号：

GitHub 账号：用于托管脚本与运行 GitHub Actions 自动化工作流。  
YML
+ 1

Cloudflare 账号：用于部署 Worker 托管中控服务与定时调度。  
JS

Telegram 账号：用于通过机器人发送控制指令和接收执行汇报。  
YML
+ 2

二、 步骤一：配置 Telegram 机器人
我们需要创建一个 Telegram 机器人，并获取 Bot Token 和你的 Chat ID。  
YML
+ 1

1. 获取 Telegram Bot Token
在 Telegram 中搜索 @BotFather 并打开对话。

发送指令 /newbot。

根据提示依次输入：

机器人名称（如：MySmsBot）。

机器人用户名（必须以 bot 结尾，如：mysms_control_bot）。

创建成功后，BotFather 会返回一串 API Token（格式类似于 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ）。请保存好此 Token。  
YML
+ 1

2. 获取你的 Chat ID
在 Telegram 中搜索 @userinfobot 并点击 Start。

机器人会自动回复你的个人信息，其中包含你的 Id（一串数字，如：12345678）。请保存好此 Chat ID。  
YML
+ 1

三、 步骤二：GitHub 仓库配置
1. Fork 目标仓库
打开项目仓库页面：yumige18/szywj。

点击页面右上角的 Fork 按钮，将项目复制到你自己的 GitHub 账号下。

2. 配置 GitHub Repository Secrets
进入你 Fork 后的新仓库页面。

点击上方的 Settings（设置）标签页。

在左侧菜单栏依次选择 Secrets and variables -> Actions。  
YML
+ 1

点击 New repository secret 按钮，分别添加以下两个密钥：

密钥名称（Name）	密钥值（Value）	作用
TG_BOT_TOKEN	步骤一获取的 API Token	
用于 GitHub Actions 向 TG 发送消息  
YML
+ 1

TG_CHAT_ID	步骤一获取的 Chat ID	
指定接收消息的 TG 会话 ID  
YML
+ 1

3. 创建 GitHub Personal Access Token (PAT)
Cloudflare Worker 需要通过 API 触发 GitHub Actions 工作流，因此需要生成一个具有权限的 Token。  
JS

点击 GitHub 右上角头像 -> Settings。

滑到最底部，点击左侧的 Developer settings。

依次选择 Personal access tokens -> Tokens (classic)。

点击 Generate new token -> Generate new token (classic)。

填写 Note（如：CF Worker Trigger）。

Expiration 设置为 No expiration（永不过期）或按需设置。

勾选权限：必须勾选 workflow（更新 GitHub Action 工作流权限）。

点击底部 Generate token，页面会生成一串 ghp_ 开头的密钥。复制并保存好，该密钥只显示一次。

四、 步骤三：修改 Cloudflare Worker 代码适配个人版本
在部署 Cloudflare Worker 之前，需要根据你自己的 GitHub 账号信息修改源码。  
JS

关键代码修改说明
你需要修改 worker.js 中的以下内容：  
JS

修改 GitHub 仓库路径：
在 triggerGitHub 函数中，找到如下代码：  
JS

JavaScript
const githubUrl = `https://api.github.com/repos/yumige18/szywj/actions/workflows/${workflow}/dispatches`;
将 yumige18/szywj 修改为你自己的 GitHub用户名/仓库名。  
JS

示例：如果你的 GitHub 用户名是 zhangsan，仓库名是 szywj，则修改为：

JavaScript
const githubUrl = `https://api.github.com/repos/zhangsan/szywj/actions/workflows/${workflow}/dispatches`;
修改默认目标手机号码（可选）：
在 scheduled 导出函数中，找到如下代码：  
JS

JavaScript
const DEFAULT_NUMBER = '17879807573';
将其中的号码修改为你需要默认触发的主目标号码。  
JS

五、 步骤四：部署 Cloudflare Worker
1. 创建 Worker
登录 Cloudflare 控制台。

在左侧菜单栏点击 Workers 和 Pages -> 概述。

点击 创建应用程序（Create Application） -> 创建 Worker。

设置一个 Worker 名称（如 szywj-worker），点击 部署。

2. 写入修改后的代码
点击刚创建的 Worker 页面右上角的 编辑代码（Edit code）。

将左侧默认的代码全部清空。

粘贴已根据步骤三修改好的完整 Worker 脚本代码。  
JS

点击右上角的 保存并部署（Save and deploy）。

3. 配置 Cloudflare Worker 环境变量
返回该 Worker 的管理主页。

点击 设置（Settings）标签页 -> 选择 变量（Variables）。

在 环境变量（Environment Variables）处点击 添加（Add），依次添加以下三个变量，添加后点击保存并部署：  
JS

变量名称（Name）	变量类型	变量值（Value）	说明
GITHUB_TOKEN	机密 (Secret)	步骤二生成的 ghp_... 令牌	
用于调用 GitHub API  
JS

TG_BOT_TOKEN	机密 (Secret)	步骤一获取的 Telegram Bot Token	
用于 Worker 发送 Telegram 通知  
JS

TG_CHAT_ID	文本 (Text)	步骤一获取的 Telegram Chat ID	
接收通知的个人/群组 ID  
JS

六、 步骤五：绑定 Telegram 机器人 Webhook
为了能够通过 Telegram 机器人直接发送 /sms 手机号 或 /call 手机号 指令触发任务，需要将 Worker 的 URL 绑定到机器人。  
JS

获取你的 Cloudflare Worker 域名 URL：
在 Worker 的概述页面，找到 域名 区域（类似于 [https://szywj-worker.xxxx.workers.dev](https://szywj-worker.xxxx.workers.dev)）。  
JS

打开你的浏览器，在地址栏输入以下链接并按下回车（请替换其中的括号部分）：

Plaintext
https://api.telegram.org/bot<你的TG_BOT_TOKEN>/setWebhook?url=<你的Cloudflare_Worker_URL>
示例：
[https://api.telegram.org/bot123456789:ABCdef/setWebhook?url=https://szywj-worker.user.workers.dev](https://api.telegram.org/bot123456789:ABCdef/setWebhook?url=https://szywj-worker.user.workers.dev)

若浏览器返回 {"ok":true,"result":true,"description":"Webhook was set"}，则表示 Telegram 命令响应绑定成功。  
JS

七、 步骤六：设置 Cloudflare Cron 定时触发器
根据 Worker 代码中的逻辑，脚本支持 Cron 表达式进行定时自动巡航触发。  
JS

对应时间规则说明
Worker 中预设的匹配时间规则（均为 UTC 时间，转换后对应北京时间）：  
JS

Cron 表达式 (UTC)	对应北京时间	执行任务	说明
0 4,10,16,22 * * *	每天 00:00, 06:00, 12:00, 18:00	自动轮播_短信	
自动触发 sms.yml

  
JS

40 23 * * *	北京时间 07:40	自动轮播_呼叫(早)	
周期第1天(周期0)触发 call.yml

  
JS

40 5 * * *	北京时间 13:40	自动轮播_呼叫(中)	
周期第2天(周期1)触发 call.yml

  
JS

40 11 * * *	北京时间 19:40	自动轮播_呼叫(晚)	
周期第3天(周期2)触发 call.yml

  
JS

添加 Cron Trigger 步骤
进入 Cloudflare Worker 管理界面。

点击 设置（Settings） -> 触发器（Triggers）。

滚动到 Cron 触发器（Cron Triggers）部分，点击 添加 Cron 触发器（Add Cron Trigger）。

依次将上方表格中的 4 条 Cron 表达式输入并保存：  
JS

0 4,10,16,22 * * *

  
JS

40 23 * * *

  
JS

40 5 * * *

  
JS

40 11 * * *

  
JS

八、 测试与验证
完成上述配置后，可以通过以下方式验证系统是否正常工作：

Telegram 机器人手动指令测试：
在 Telegram 中打开你的 Bot 对话框，发送指令：  
JS

/sms 17879807573：检查机器人是否回复 ✅ 收到指令：已下发短信任务。  
JS

/call 17879807573：检查机器人是否回复 ✅ 收到指令：已下发呼叫任务。  
JS

GitHub Actions 执行状态查看：
进入你的 GitHub 仓库 -> 点击 Actions 标签页，查看是否有新触发的 运行短信脚本 或 运行呼叫脚本 工作流在正常运行。执行完毕后，Telegram 会接收到来自 GitHub Actions 的结果汇报。  
YML
+ 4

这是我的github readme文件，帮我写成readme的格式

这是一份为你量身定制的 GitHub README.md 文件模板。你可以直接将以下内容复制并粘贴到你项目中的 README.md 文件里。

Markdown
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
将 yumige18/szywj 修改为你自己的 GitHub用户名/仓库名。

例如：你的 GitHub 用户名是 zhangsan，则改为 zhangsan/szywj。

（可选）如果你想修改默认下发任务的手机号，请修改第 36 行：

JavaScript
const DEFAULT_NUMBER = '17879807573'; // 替换为你的默认目标号码
五、 第四步：部署 Cloudflare Worker ☁️
1. 创建 Worker
登录 Cloudflare 控制台。

左侧菜单栏点击 Workers 和 Pages -> 创建应用程序 -> 创建 Worker。

设置一个名称（如 szywj-worker），点击 部署。

2. 写入代码
点击 Worker 右上角的 编辑代码。

清空默认代码，将你刚刚修改好的 worker.js 代码全部粘贴进去。

点击右上角的 保存并部署。

3. 配置环境变量
返回 Worker 管理主页，点击 设置 -> 变量。

在 环境变量 处点击 添加，依次添加以下三个变量并保存：

变量名称（Name）	变量类型	变量值（Value）
GITHUB_TOKEN	机密 (Secret)	步骤二生成的 ghp_... 令牌
TG_BOT_TOKEN	机密 (Secret)	步骤一获取的 Telegram Bot Token
TG_CHAT_ID	文本 (Text)	步骤一获取的 Telegram Chat ID
六、 第五步：绑定 Telegram 机器人 Webhook 🔗
为了让机器人在 Telegram 中接收你的 /sms 或 /call 指令，需要绑定 Webhook。

在 Cloudflare Worker 概述页面，找到你的 Worker 域名（例如 https://szywj-worker.xxxx.workers.dev）。

在浏览器地址栏输入以下链接并回车（请替换尖括号及内部内容）：

Plaintext
[https://api.telegram.org/bot](https://api.telegram.org/bot)<你的TG_BOT_TOKEN>/setWebhook?url=<你的Cloudflare_Worker_URL>
页面显示 {"ok":true,"result":true,"description":"Webhook was set"} 即为绑定成功！

七、 第六步：设置 Cloudflare Cron 定时触发器 ⏰
为实现脚本的自动化按需运转，需设置定时器（时间已在代码中针对北京时间做了转换适配）。

在 Worker 管理页面，点击 设置 -> 触发器。

找到 Cron 触发器，依次添加以下 4 个 Cron 表达式（UTC时间）：

0 4,10,16,22 * * * （每天 0,6,12,18 点发短信）

40 23 * * * （第1天 07:40 呼叫）

40 5 * * * （第2天 13:40 呼叫）

40 11 * * * （第3天 19:40 呼叫）

八、 测试与验证 ✅
大功告成！现在你可以去 Telegram 找你的机器人进行测试了。

💬 手动指令测试
向你的机器人发送以下指令：

发送 /sms 13800138000 -> 机器人会回复并触发短信任务。

发送 /call 13800138000 -> 机器人会回复并触发呼叫任务。

👁️ 查看运行日志
你可以随时前往你的 GitHub 仓库，点击顶部的 Actions 标签页，实时查看脚本是否被成功唤醒并稳定运行。任务结束后，机器人也会在 Telegram 为你推送最终执行汇报！


### 提示：
* 这个格式完全符合标准的 GitHub Markdown 语法。
* 你可以通过 GitHub 自带的 `Preview` (预览) 功能查看它的渲染效果。
* 若不需要表情符号，可以直接删掉即可。
把以上这些全部转换为markdown格式

Markdown
# SZYWJ 自动化任务部署指南 🚀

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
4. **⚠️ 关键步骤：** 在权限列表中，勾选 **`workflow`** 权限。
5. 点击生成，**复制并保存好这串以 `ghp_` 开头的密钥**（离开页面后将无法再次查看）。

---

## 四、 第三步：修改 Cloudflare 代码适配个人版本 ✏️

在部署前，你需要修改 `worker.js` 文件，让其指向你自己的 GitHub 仓库。

1. 打开你仓库中的 `worker.js` 文件。
2. 找到最下方的 `triggerGitHub` 函数中的这段代码：
   ```javascript
   const githubUrl = `[https://api.github.com/repos/yumige18/szywj/actions/workflows/$](https://api.github.com/repos/yumige18/szywj/actions/workflows/$){workflow}/dispatches`;
将 yumige18/szywj 修改为你自己的 GitHub用户名/仓库名。

例如：你的 GitHub 用户名是 zhangsan，则改为 zhangsan/szywj。

（可选）如果你想修改默认下发任务的手机号，请修改第 36 行：

JavaScript
const DEFAULT_NUMBER = '17879807573'; // 替换为你的默认目标号码
五、 第四步：部署 Cloudflare Worker ☁️
1. 创建 Worker
登录 Cloudflare 控制台。

左侧菜单栏点击 Workers 和 Pages -> 创建应用程序 -> 创建 Worker。

设置一个名称（如 szywj-worker），点击 部署。

2. 写入代码
点击 Worker 右上角的 编辑代码。

清空默认代码，将你刚刚修改好的 worker.js 代码全部粘贴进去。

点击右上角的 保存并部署。

3. 配置环境变量
返回 Worker 管理主页，点击 设置 -> 变量。

在 环境变量 处点击 添加，依次添加以下三个变量并保存：

变量名称（Name）	变量类型	变量值（Value）
GITHUB_TOKEN	机密 (Secret)	步骤二生成的 ghp_... 令牌
TG_BOT_TOKEN	机密 (Secret)	步骤一获取的 Telegram Bot Token
TG_CHAT_ID	文本 (Text)	步骤一获取的 Telegram Chat ID
六、 第五步：绑定 Telegram 机器人 Webhook 🔗
为了让机器人在 Telegram 中接收你的 /sms 或 /call 指令，需要绑定 Webhook。

在 Cloudflare Worker 概述页面，找到你的 Worker 域名（例如 https://szywj-worker.xxxx.workers.dev）。

在浏览器地址栏输入以下链接并回车（请替换尖括号及内部内容）：

Plaintext
[https://api.telegram.org/bot](https://api.telegram.org/bot)<你的TG_BOT_TOKEN>/setWebhook?url=<你的Cloudflare_Worker_URL>
页面显示 {"ok":true,"result":true,"description":"Webhook was set"} 即为绑定成功！

七、 第六步：设置 Cloudflare Cron 定时触发器 ⏰
为实现脚本的自动化按需运转，需设置定时器（时间已在代码中针对北京时间做了转换适配）。

在 Worker 管理页面，点击 设置 -> 触发器。

找到 Cron 触发器，依次添加以下 4 个 Cron 表达式（UTC时间）：

0 4,10,16,22 * * * （每天 0,6,12,18 点发短信）

40 23 * * * （第1天 07:40 呼叫）

40 5 * * * （第2天 13:40 呼叫）

40 11 * * * （第3天 19:40 呼叫）

八、 测试与验证 ✅
大功告成！现在你可以去 Telegram 找你的机器人进行测试了。

💬 手动指令测试
向你的机器人发送以下指令：

发送 /sms 13800138000 -> 机器人会回复并触发短信任务。

发送 /call 13800138000 -> 机器人会回复并触发呼叫任务。

👁️ 查看运行日志
你可以随时前往你的 GitHub 仓库，点击顶部的 Actions 标签页，实时查看脚本是否被成功唤醒并稳定运行。任务结束后，机器人也会在 Telegram 为你推送最终执行汇报！

还是断开了，你输出为txt文件

将 yumige18/szywj 修改为你自己的 GitHub用户名/仓库名。

例如：你的 GitHub 用户名是 zhangsan，则改为 zhangsan/szywj。

（可选）如果你想修改默认下发任务的手机号，请修改第 36 行：

JavaScript
const DEFAULT_NUMBER = '17879807573'; // 替换为你的默认目标号码
五、 第四步：部署 Cloudflare Worker ☁️
1. 创建 Worker
登录 Cloudflare 控制台。

左侧菜单栏点击 Workers 和 Pages -> 创建应用程序 -> 创建 Worker。

设置一个名称（如 szywj-worker），点击 部署。

2. 写入代码
点击 Worker 右上角的 编辑代码。

清空默认代码，将你刚刚修改好的 worker.js 代码全部粘贴进去。

点击右上角的 保存并部署。

3. 配置环境变量
返回 Worker 管理主页，点击 设置 -> 变量。

在 环境变量 处点击 添加，依次添加以下三个变量并保存：

变量名称（Name）	变量类型	变量值（Value）
GITHUB_TOKEN	机密 (Secret)	步骤二生成的 ghp_... 令牌
TG_BOT_TOKEN	机密 (Secret)	步骤一获取的 Telegram Bot Token
TG_CHAT_ID	文本 (Text)	步骤一获取的 Telegram Chat ID
六、 第五步：绑定 Telegram 机器人 Webhook 🔗
为了让机器人在 Telegram 中接收你的 /sms 或 /call 指令，需要绑定 Webhook。

在 Cloudflare Worker 概述页面，找到你的 Worker 域名（例如 https://szywj-worker.xxxx.workers.dev）。

在浏览器地址栏输入以下链接并回车（请替换尖括号及内部内容）：

Plaintext
[https://api.telegram.org/bot](https://api.telegram.org/bot)<你的TG_BOT_TOKEN>/setWebhook?url=<你的Cloudflare_Worker_URL>
页面显示 {"ok":true,"result":true,"description":"Webhook was set"} 即为绑定成功！

七、 第六步：设置 Cloudflare Cron 定时触发器 ⏰
为实现脚本的自动化按需运转，需设置定时器（时间已在代码中针对北京时间做了转换适配）。

在 Worker 管理页面，点击 设置 -> 触发器。

找到 Cron 触发器，依次添加以下 4 个 Cron 表达式（UTC时间）：

0 4,10,16,22 * * * （每天 0,6,12,18 点发短信）

40 23 * * * （第1天 07:40 呼叫）

40 5 * * * （第2天 13:40 呼叫）

40 11 * * * （第3天 19:40 呼叫）

八、 测试与验证 ✅
大功告成！现在你可以去 Telegram 找你的机器人进行测试了。

💬 手动指令测试
向你的机器人发送以下指令：

发送 /sms 13800138000 -> 机器人会回复并触发短信任务。

发送 /call 13800138000 -> 机器人会回复并触发呼叫任务。

👁️ 查看运行日志
你可以随时前往你的 GitHub 仓库，点击顶部的 Actions 标签页，实时查看脚本是否被成功唤醒并稳定运行。任务结束后，机器人也会在 Telegram 为你推送最终执行汇报！
""")

import os
print(f"File created: {os.path.abspath('README.md')}")


```text?code_stdout&code_event_index=1
File created: /home/bard/README.md

Your TXT file is ready

MD 图标
README
 MD 
打开
I have generated the tutorial and saved it as a .md (Markdown) file, which is essentially a text file formatted for GitHub. You can easily open it in any text editor or paste its contents directly into your project's README.md.

你这部分都不是markdown

Refining the Output



Gemini 是一款 AI 工具，其回答未必正确无误。

# SZYWJ 自动化任务部署指南 🚀

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
4. **⚠️ 关键步骤：** 在权限列表中，勾选 **`workflow`** 权限。
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
README.md
README.md
目前显示的是“README.md”。
