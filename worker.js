export default {
  // ==========================================
  // 1. 监听来自 Telegram 的消息 (手动触发逻辑)
  // ==========================================
  async fetch(request, env, ctx) {
    if (request.method === 'POST') {
      try {
        const update = await request.json();
        if (update.message && update.message.text) {
          const text = update.message.text.trim();
          const chatId = update.message.chat.id;

          if (text.startsWith('/sms ')) {
            const targetNum = text.replace('/sms ', '').trim();
            await triggerGitHub(env, 'sms.yml', '手动短信任务', {
              option_num: "2",
              phone_number: targetNum
            });
            await sendTelegram(env, `✅ 收到指令：已下发短信任务\n🎯 目标号码: ${targetNum}`, chatId);
          }
          else if (text.startsWith('/call ')) {
            const targetNum = text.replace('/call ', '').trim();
            await triggerGitHub(env, 'call.yml', '手动呼叫任务', {
              phone_number: targetNum
            });
            await sendTelegram(env, `✅ 收到指令：已下发呼叫任务\n🎯 目标号码: ${targetNum}`, chatId);
          }
        }
      } catch (e) {
        // 忽略解析错误
      }
    }
    return new Response('OK', { status: 200 });
  },

  // ==========================================
  // 2. 定时任务 (日常运行版)
  // ==========================================
  async scheduled(event, env, ctx) {
    const DEFAULT_NUMBER = '17879807573';
    let workflow = '';
    let taskName = '';
    let inputs = {};

    // 1. 计算当前北京时间和 3 日轮转周期
    const bjtMs = Date.now() + (8 * 60 * 60 * 1000);
    const bjtDate = new Date(bjtMs);
    const currentBjtDay = Math.floor(bjtMs / 86400000);
    const cycleDay = currentBjtDay % 3;

    // 格式化北京时间 (HH:MM)
    const bjtHourStr = bjtDate.getUTCHours().toString().padStart(2, '0');
    const bjtMinuteStr = bjtDate.getUTCMinutes().toString().padStart(2, '0');
    const bjtTimeFull = `${bjtHourStr}:${bjtMinuteStr}`;

    // 2. 获取并清理 Cloudflare 传来的 Cron 字符串
    const cronStr = event.cron ? event.cron.replace(/\s+/g, ' ').trim() : '未知';

    // 3. 只要被唤醒，无条件发送包含北京时间的通知
    await sendTelegram(env, `🔧 [系统唤醒] 收到定时器: [${cronStr}]\n🇨🇳 当前北京时间: ${bjtTimeFull}\n📅 今天周期天数: ${cycleDay}`);

    // 4. 根据 Cron 字符串严格匹配任务
    // 匹配: 每天 0,6,12,18点 (北京时间) 发短信
    if (cronStr === '0 4,10,16,22 * * *') {
      workflow = 'sms.yml';
      taskName = '自动轮播_短信';
      inputs = { option_num: "2", phone_number: DEFAULT_NUMBER };
    } 
    // 匹配: 第一天 07:40 (北京时间) 呼叫
    else if (cronStr === '40 23 * * *') { 
      if (cycleDay === 0) { 
        workflow = 'call.yml';
        taskName = '自动轮播_呼叫(早)';
        inputs = { phone_number: DEFAULT_NUMBER };
      } else {
        await sendTelegram(env, `⏭️ [跳过任务] 07:40 呼叫任务已跳过。\n💡 原因：今天算出的周期是 ${cycleDay}，不符合第一天(周期0)的要求。`);
        return;
      }
    } 
    // 匹配: 第二天 13:40 (北京时间) 呼叫
    else if (cronStr === '40 5 * * *') { 
      if (cycleDay === 1) { 
        workflow = 'call.yml';
        taskName = '自动轮播_呼叫(中)';
        inputs = { phone_number: DEFAULT_NUMBER };
      } else {
        await sendTelegram(env, `⏭️ [跳过任务] 13:40 呼叫任务已跳过。\n💡 原因：今天算出的周期是 ${cycleDay}，不符合第二天(周期1)的要求。`);
        return;
      }
    } 
    // 匹配: 第三天 19:40 (北京时间) 呼叫
    else if (cronStr === '40 11 * * *') { 
      if (cycleDay === 2) { 
        workflow = 'call.yml';
        taskName = '自动轮播_呼叫(晚)';
        inputs = { phone_number: DEFAULT_NUMBER };
      } else {
        await sendTelegram(env, `⏭️ [跳过任务] 19:40 呼叫任务已跳过。\n💡 原因：今天算出的周期是 ${cycleDay}，不符合第三天(周期2)的要求。`);
        return;
      }
    } 
    else {
      // 收到不在上述列表的意外定时器
      return;
    }

    // 5. 触发 GitHub (只有符合周期的任务才会走到这里)
    const success = await triggerGitHub(env, workflow, taskName, inputs);
    if (success) {
      await sendTelegram(env, `✅ 定时任务触发成功！\n🎯 任务: ${taskName}\n📱 目标: ${DEFAULT_NUMBER}`);
    }
  }
};

// ==========================================
// 通用函数 (向 GitHub 发送指令)
// ==========================================
async function triggerGitHub(env, workflow, taskName, inputs) {
  const githubUrl = `https://api.github.com/repos/yumige18/SZ-YWJ-BEYOND/actions/workflows/${workflow}/dispatches`;
  try {
    const response = await fetch(githubUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CF-Worker'
      },
      body: JSON.stringify({ ref: 'main', inputs: inputs })
    });

    if (!response.ok) {
      const err = await response.text();
      await sendTelegram(env, `❌ [${taskName}] GitHub 启动失败\n错误码: ${response.status}\n${err}`);
      return false;
    }
    return true;
  } catch (error) {
    await sendTelegram(env, `⚠️ [${taskName}] 网络请求异常:\n${error.message}`);
    return false;
  }
}

// ==========================================
// 通用函数 (发送 Telegram 消息)
// ==========================================
async function sendTelegram(env, message, customChatId = null) {
  if (!env.TG_BOT_TOKEN) return;
  const targetChatIdsStr = customChatId ? String(customChatId) : (env.TG_CHAT_ID || "");
  if (!targetChatIdsStr) return;
  const chatIds = targetChatIdsStr.split(',').map(id => id.trim()).filter(id => id);
  const tgUrl = `https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`;
  for (const chatId of chatIds) {
    try {
      await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' })
      });
    } catch (e) {}
  }
}
