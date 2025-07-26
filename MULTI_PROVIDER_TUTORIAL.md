# HyperCode 多提供商模式教程

## 📖 概述

HyperCode 是基于 Google Gemini CLI 的增强版本，支持多个 AI 提供商，包括 OpenAI、Claude、Gemini、Qwen、Deepseek 等。本教程将详细介绍如何配置和使用多提供商功能。

## 🎯 支持的 AI 提供商

| 提供商 | 环境变量值 | 支持的模型示例 | 工具调用支持 |
|--------|------------|----------------|-------------|
| OpenAI | `openai` | gpt-4, gpt-3.5-turbo, gpt-4-turbo | ✅ 完全支持 |
| Anthropic Claude | `anthropic` | claude-3-opus, claude-3-sonnet, claude-3-haiku | ✅ 完全支持 |
| Google Gemini | `google` | gemini-pro, gemini-pro-vision | ✅ 完全支持 |
| Alibaba Qwen | `alibaba` | qwen-turbo, qwen-plus | ⚠️ 基础支持 |
| Deepseek | `deepseek` | deepseek-chat, deepseek-coder | ⚠️ 基础支持 |
| Cohere | `cohere` | command, command-light | ⚠️ 基础支持 |

**工具调用功能说明：**
- ✅ **完全支持**：包含完整的系统提示词和所有 Gemini CLI 工具（文件操作、shell、搜索等）
- ⚠️ **基础支持**：包含系统提示词，但工具调用能力受限于提供商API功能

## ⚙️ 环境变量配置

HyperCode 使用 `HYPERCODE_*` 前缀的环境变量来配置多提供商模式：

### 核心环境变量

```bash
# 必需：指定 AI 提供商
export HYPERCODE_PROVIDER=openai

# 必需：API 密钥
export HYPERCODE_API_KEY=your_api_key_here

# 可选：指定模型（如果不设置会使用默认模型）
export HYPERCODE_MODEL=gpt-4

# 可选：自定义 API 端点（用于私有部署或代理）
export HYPERCODE_API_URL=https://api.openai.com/v1
```

### 代理支持（可选）

```bash
# HTTP/HTTPS 代理
export HYPERCODE_PROXY=http://proxy.company.com:8080

# 或使用标准代理环境变量
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 克隆项目
git clone <repository_url>
cd gemini-cli

# 安装依赖
npm install

# 构建项目
npm run build
```

### 2. 配置 OpenAI

```bash
# 设置 OpenAI 提供商
export HYPERCODE_PROVIDER=openai
export HYPERCODE_API_KEY=sk-your-openai-api-key
export HYPERCODE_MODEL=gpt-4

# 测试非交互式模式
node packages/cli/dist/index.js --prompt "Hello, how are you?"

# 启动交互式聊天
node packages/cli/dist/index.js
```

### 3. 配置 Claude

```bash
# 设置 Anthropic Claude 提供商
export HYPERCODE_PROVIDER=anthropic
export HYPERCODE_API_KEY=sk-ant-your-claude-api-key
export HYPERCODE_MODEL=claude-3-sonnet-20240229

# 测试
node packages/cli/dist/index.js --prompt "Hello Claude!"
```

### 4. 配置 Qwen

```bash
# 设置阿里云 Qwen 提供商
export HYPERCODE_PROVIDER=alibaba
export HYPERCODE_API_KEY=your-qwen-api-key
export HYPERCODE_MODEL=qwen-turbo

# 测试
node packages/cli/dist/index.js --prompt "你好，请介绍一下自己"
```

## 📋 详细配置步骤

### 步骤 1：获取 API 密钥

#### OpenAI
1. 访问 [OpenAI API Keys](https://platform.openai.com/api-keys)
2. 创建新的 API 密钥
3. 复制密钥（格式：`sk-...`）

#### Anthropic Claude
1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 生成 API 密钥
3. 复制密钥（格式：`sk-ant-...`）

#### Google Gemini
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建 API 密钥
3. 复制密钥

#### 阿里云 Qwen
1. 访问 [阿里云 DashScope](https://dashscope.console.aliyun.com/)
2. 创建 API 密钥
3. 复制密钥

#### Deepseek
1. 访问 [Deepseek Platform](https://platform.deepseek.com/)
2. 生成 API 密钥
3. 复制密钥

### 步骤 2：设置环境变量

#### 方法 1：命令行临时设置

```bash
# 直接在命令行设置
export HYPERCODE_PROVIDER=openai
export HYPERCODE_API_KEY=your_api_key
export HYPERCODE_MODEL=gpt-4
```

#### 方法 2：创建 .env 文件

```bash
# 在项目根目录创建 .env 文件
cat > .env << EOF
HYPERCODE_PROVIDER=openai
HYPERCODE_API_KEY=your_api_key
HYPERCODE_MODEL=gpt-4
HYPERCODE_API_URL=https://api.openai.com/v1
EOF

# 加载环境变量
source .env
```

#### 方法 3：系统级配置

```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
echo 'export HYPERCODE_PROVIDER=openai' >> ~/.bashrc
echo 'export HYPERCODE_API_KEY=your_api_key' >> ~/.bashrc
echo 'export HYPERCODE_MODEL=gpt-4' >> ~/.bashrc

# 重新加载配置
source ~/.bashrc
```

### 步骤 3：验证配置

```bash
# 检查环境变量
echo "Provider: $HYPERCODE_PROVIDER"
echo "Model: $HYPERCODE_MODEL"
echo "API Key: ${HYPERCODE_API_KEY:0:10}..." # 只显示前10个字符

# 测试连接
node packages/cli/dist/index.js --prompt "测试连接"
```

## 🔄 不同提供商切换

### 快速切换脚本

创建切换脚本来快速在不同提供商间切换：

```bash
# 创建 switch-provider.sh
cat > switch-provider.sh << 'EOF'
#!/bin/bash

case "$1" in
  "openai")
    export HYPERCODE_PROVIDER=openai
    export HYPERCODE_API_KEY=$OPENAI_API_KEY
    export HYPERCODE_MODEL=gpt-4
    echo "切换到 OpenAI GPT-4"
    ;;
  "claude")
    export HYPERCODE_PROVIDER=anthropic
    export HYPERCODE_API_KEY=$CLAUDE_API_KEY
    export HYPERCODE_MODEL=claude-3-sonnet-20240229
    echo "切换到 Claude 3 Sonnet"
    ;;
  "qwen")
    export HYPERCODE_PROVIDER=alibaba
    export HYPERCODE_API_KEY=$QWEN_API_KEY
    export HYPERCODE_MODEL=qwen-turbo
    echo "切换到 Qwen Turbo"
    ;;
  "gemini")
    unset HYPERCODE_PROVIDER
    unset HYPERCODE_API_KEY
    unset HYPERCODE_MODEL
    echo "切换到原生 Gemini 模式"
    ;;
  *)
    echo "用法: $0 {openai|claude|qwen|gemini}"
    exit 1
    ;;
esac

# 显示当前配置
echo "当前配置："
echo "  Provider: ${HYPERCODE_PROVIDER:-gemini}"
echo "  Model: ${HYPERCODE_MODEL:-默认}"
EOF

chmod +x switch-provider.sh
```

使用切换脚本：

```bash
# 切换到不同提供商
./switch-provider.sh openai
./switch-provider.sh claude
./switch-provider.sh qwen
./switch-provider.sh gemini  # 回到原生 Gemini 模式
```

## 💡 使用场景示例

### 场景 1：代码生成（使用 Deepseek Coder）

```bash
export HYPERCODE_PROVIDER=deepseek
export HYPERCODE_API_KEY=your-deepseek-key
export HYPERCODE_MODEL=deepseek-coder

node packages/cli/dist/index.js --prompt "写一个 Python 快速排序算法"
```

### 场景 2：文档翻译（使用 Claude）

```bash
export HYPERCODE_PROVIDER=anthropic
export HYPERCODE_API_KEY=your-claude-key
export HYPERCODE_MODEL=claude-3-sonnet-20240229

node packages/cli/dist/index.js --prompt "请将以下英文文档翻译成中文：..."
```

### 场景 3：中文对话（使用 Qwen）

```bash
export HYPERCODE_PROVIDER=alibaba
export HYPERCODE_API_KEY=your-qwen-key
export HYPERCODE_MODEL=qwen-plus

node packages/cli/dist/index.js --prompt "请详细解释一下机器学习的基本概念"
```

## 🔧 高级配置

### 企业代理配置

```bash
# 公司网络代理
export HYPERCODE_PROXY=http://username:password@proxy.company.com:8080

# 或使用 SOCKS 代理
export HYPERCODE_PROXY=socks5://proxy.company.com:1080
```

### 自定义 API 端点

```bash
# 使用私有部署的 OpenAI 兼容接口
export HYPERCODE_PROVIDER=openai
export HYPERCODE_API_URL=https://your-private-openai-api.com/v1
export HYPERCODE_API_KEY=your-private-key
```

### 多配置管理

创建配置文件来管理多个环境：

```bash
# 创建配置目录
mkdir -p ~/.hypercode/profiles

# 开发环境配置
cat > ~/.hypercode/profiles/dev.env << EOF
HYPERCODE_PROVIDER=openai
HYPERCODE_API_KEY=your-dev-openai-key
HYPERCODE_MODEL=gpt-3.5-turbo
EOF

# 生产环境配置
cat > ~/.hypercode/profiles/prod.env << EOF
HYPERCODE_PROVIDER=anthropic
HYPERCODE_API_KEY=your-prod-claude-key
HYPERCODE_MODEL=claude-3-opus-20240229
EOF

# 加载特定配置
load_profile() {
  if [ -f ~/.hypercode/profiles/$1.env ]; then
    source ~/.hypercode/profiles/$1.env
    echo "已加载配置: $1"
  else
    echo "配置文件不存在: $1"
  fi
}

# 使用
load_profile dev   # 加载开发环境
load_profile prod  # 加载生产环境
```

## 🐛 故障排除

### 常见问题

#### 1. 认证失败

```
Error: Invalid Authentication
```

**解决方案：**
- 检查 API 密钥是否正确
- 确认密钥格式符合提供商要求
- 验证密钥是否有足够的权限

```bash
# 检查当前配置
echo "Provider: $HYPERCODE_PROVIDER"
echo "API Key: ${HYPERCODE_API_KEY:0:20}..."

# 验证密钥格式
case "$HYPERCODE_PROVIDER" in
  "openai") echo "OpenAI 密钥应以 'sk-' 开头" ;;
  "anthropic") echo "Claude 密钥应以 'sk-ant-' 开头" ;;
esac
```

#### 2. 网络连接问题

```
Error: connect ECONNREFUSED
```

**解决方案：**
- 检查网络连接
- 配置代理设置
- 验证 API 端点是否可达

```bash
# 测试网络连接
curl -I https://api.openai.com/v1/models

# 使用代理测试
curl -I --proxy $HYPERCODE_PROXY https://api.openai.com/v1/models
```

#### 3. 模型不支持

```
Error: The model 'xxx' does not exist
```

**解决方案：**
- 检查模型名称是否正确
- 确认提供商支持该模型
- 查看提供商文档获取可用模型列表

```bash
# 使用默认模型
unset HYPERCODE_MODEL

# 查看支持的模型（OpenAI 示例）
curl -H "Authorization: Bearer $HYPERCODE_API_KEY" \
     https://api.openai.com/v1/models
```

### 调试模式

启用详细日志来诊断问题：

```bash
# 设置调试环境变量
export DEBUG=hypercode:*
export HYPERCODE_DEBUG=true

# 运行并查看详细日志
node packages/cli/dist/index.js --prompt "测试" 2>&1 | tee debug.log
```

## 📚 最佳实践

### 1. 安全管理 API 密钥

```bash
# 使用环境管理工具
# .envrc (direnv)
export HYPERCODE_API_KEY=$(cat ~/.secrets/openai_key)

# 或使用密钥管理服务
export HYPERCODE_API_KEY=$(aws secretsmanager get-secret-value \
  --secret-id openai-api-key --query SecretString --output text)
```

### 2. 根据任务选择最佳提供商

- **代码生成**: Deepseek Coder, OpenAI GPT-4
- **文档处理**: Claude 3 Opus, GPT-4
- **中文对话**: Qwen, GLM
- **多语言**: GPT-4, Claude 3
- **成本敏感**: GPT-3.5, Claude 3 Haiku

### 3. 批量处理脚本

```bash
#!/bin/bash
# batch-process.sh

providers=("openai" "anthropic" "alibaba")
models=("gpt-4" "claude-3-sonnet-20240229" "qwen-turbo")

for i in "${!providers[@]}"; do
  export HYPERCODE_PROVIDER="${providers[$i]}"
  export HYPERCODE_MODEL="${models[$i]}"
  
  echo "使用 ${providers[$i]} - ${models[$i]} 处理..."
  node packages/cli/dist/index.js --prompt "$1"
  echo "---"
done
```

## 🚀 功能特性对比

### HyperCode vs 原版 Gemini CLI

| 功能 | 原版 Gemini CLI | HyperCode 多提供商模式 |
|------|----------------|----------------------|
| AI 提供商 | 仅 Google Gemini | 6+ 提供商支持 |
| 交互式聊天 | ✅ | ✅ |
| 非交互式CLI | ✅ | ✅ |
| 文件操作工具 | ✅ | ✅ |
| Shell 命令执行 | ✅ | ✅ |
| Web 搜索 | ✅ | ✅ |
| 内存管理 | ✅ | ✅ |
| 系统提示词 | ✅ | ✅ |
| Function Calling | ✅ | ✅ (支持的提供商) |
| 成本优化 | ❌ | ✅ (不同提供商价格) |
| 故障转移 | ❌ | ✅ (可快速切换) |
| 企业代理 | ✅ | ✅ |
| 私有部署 | ❌ | ✅ (兼容 API) |

### 2024年底更新 - 完整功能恢复 ✨

**重大改进：** HyperCode 现在完全恢复了原版 Gemini CLI 的所有功能！

- 🔧 **工具调用完全支持**：所有文件操作、shell、搜索等工具
- 🧠 **智能系统提示词**：包含完整的上下文和环境信息  
- 🔄 **自动适配**：支持 Function Calling 的提供商自动启用高级功能
- 📊 **渐进式降级**：不支持的提供商仍能获得系统提示词增强
- 🛠️ **Schema 兼容性**：自动转换 Gemini Schema 格式到 JSON Schema，确保工具定义兼容性

#### 技术架构改进

**工具声明转换系统**：
- 自动检测 Gemini Type 枚举值并转换为 JSON Schema 字符串格式
- 支持 `parameters` 和 `parametersJsonSchema` 两种 Gemini 工具格式
- 递归转换复杂的嵌套 Schema 结构（objects、arrays、properties）
- 完整的错误处理和调试信息，确保单个工具错误不影响其他工具

**多提供商适配层**：
- 智能提供商检测：自动识别支持 Function Calling 的 AI 提供商
- 工具调用映射：将 Vercel AI SDK 的工具调用格式转换为 Gemini CLI 兼容格式
- 统一错误处理：提供一致的错误报告和用户反馈机制

**规范化消息格式系统**：
- 支持标准的 `user`、`assistant`、`tool` 三种角色的消息格式
- 助手消息支持数组格式，包含文本内容和工具调用信息
- 工具消息采用 `tool-result` 格式，正确映射工具调用ID和结果
- 自动处理 Gemini PartListUnion 到标准 CoreMessage 的转换
- 为不同 AI 提供商提供统一的对话历史管理

## 🔮 未来规划

- [ ] 支持更多 AI 提供商
- [ ] GUI 配置界面
- [ ] 性能基准测试
- [ ] 自动提供商选择
- [ ] 负载均衡和故障转移
- [ ] 成本优化建议

## ❓ 常见问答

**Q: 如何回到原生 Gemini 模式？**
A: 取消设置多提供商环境变量：
```bash
unset HYPERCODE_PROVIDER
unset HYPERCODE_API_KEY
unset HYPERCODE_MODEL
```

**Q: 可以同时使用多个提供商吗？**
A: 当前版本一次只能使用一个提供商，但可以通过脚本快速切换。

**Q: 交互式模式和非交互式模式有什么区别？**
A: 
- 交互式：`node packages/cli/dist/index.js` - 持续对话
- 非交互式：`node packages/cli/dist/index.js --prompt "消息"` - 单次问答

**Q: 多提供商模式是否支持所有 Gemini CLI 功能？**
A: 是的！多提供商模式现在支持：
- ✅ 系统提示词和上下文信息
- ✅ 文件操作工具（读取、编辑、写入）
- ✅ Shell 命令执行
- ✅ 目录浏览和搜索
- ✅ Web 搜索和抓取
- ✅ 内存管理
- ✅ 所有原生 Gemini CLI 工具

对于支持 Function Calling 的提供商（OpenAI、Claude、Gemini），会自动使用工具调用。
对于不支持的提供商，会回退到带系统提示词的文本生成。

**Q: 如何验证工具调用是否正常工作？**
A: 可以尝试以下命令测试工具功能：
```bash
# 文件操作
node packages/cli/dist/index.js --prompt "请列出当前目录的文件"

# 代码编辑
node packages/cli/dist/index.js --prompt "创建一个 hello.py 文件，包含 print('Hello World')"

# Shell 执行
node packages/cli/dist/index.js --prompt "运行 ls -la 命令"
```

**Q: 如何贡献新的提供商支持？**
A: 查看 `packages/core/src/ai/` 目录，参考现有提供商实现，提交 PR。

## 📞 支持与反馈

如有问题或建议，请：
1. 查看故障排除部分
2. 搜索已知问题
3. 提交 Issue 或 PR
4. 联系开发团队

---

*Happy Coding with HyperCode! 🚀*