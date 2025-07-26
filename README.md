# HyperCode


**HyperCode** 是基于 Google Gemini CLI 的增强版本，支持多种 AI 提供商的通用代码工具。它保留了原版的所有功能，同时添加了多提供商支持，让您可以自由选择最适合的 AI 模型来完成不同的任务。

## 🚀 主要特性

### 💎 多提供商支持
- **15+ AI 提供商**：OpenAI、Claude、Gemini、Qwen、Deepseek 等
- **统一界面**：相同的使用体验，无需学习不同工具
- **智能适配**：自动检测提供商能力，启用最佳功能
- **快速切换**：通过环境变量轻松切换不同提供商

### 🔧 完整工具生态
- **文件操作**：读取、编辑、创建任何代码文件
- **Shell 执行**：安全的命令执行和系统交互
- **代码分析**：理解和重构大型代码库
- **搜索功能**：智能代码搜索和文档查找
- **多模态支持**：处理图片、PDF 等多种格式

### ⚡ 性能优化
- **智能压缩**：自动压缩聊天历史，节约 70% token 使用
- **token统计**：精确的 token 统计和成本控制
- **并发处理**：高效的多任务执行能力
- **缓存机制**：减少重复 API 调用

### 🛡️ 企业级特性
- **代理支持**：完整的企业网络代理配置
- **安全认证**：简化但安全的 API 密钥管理
- **私有部署**：支持自定义 API 端点
- **调试模式**：详细的日志和错误诊断

## 🆚 HyperCode vs 原版 Gemini CLI

| 特性 | 原版 Gemini CLI | HyperCode |
|------|----------------|-----------|
| **AI 提供商** | 仅 Google Gemini | **15+ 提供商支持** |
| **认证方式** | OAuth/API Key/Vertex AI | **简化 API Key** |
| **工具调用** | ✅ 完整支持 | ✅ **完整支持 + 智能适配** |
| **交互体验** | ✅ | ✅ **统一多提供商体验** |
| **成本优化** | ❌ | ✅ **Token 统计 + 自动压缩** |
| **企业支持** | 基础 | ✅ **代理 + 私有部署** |
| **环境变量** | 分散配置 | ✅ **统一 HYPERCODE_ 前缀** |
| **故障转移** | ❌ | ✅ **快速切换提供商** |

## 🎯 支持的 AI 提供商

| 提供商 | 环境变量值 | 推荐模型 | 工具调用 | 适用场景 |
|--------|------------|----------|----------|----------|
| **OpenAI** | `openai` | `gpt-4o`, `gpt-4-turbo` | ✅ 完全支持 | 通用任务、代码生成 |
| **Anthropic** | `anthropic` | `claude-3.5-sonnet` | ✅ 完全支持 | 文档分析、复杂推理 |
| **Google Gemini** | `google` | `gemini-2.0-flash` | ✅ 完全支持 | 多模态、大上下文 |

**说明**：
- ✅ **完全支持**：包含完整的系统提示词和所有工具（文件操作、shell、搜索等）
- ⚠️ **基础支持**：包含系统提示词，但工具调用能力受限于提供商API功能

## 🚀 快速开始


### 配置 OpenAI

```bash
# 设置环境变量
export HYPERCODE_PROVIDER=openai
export HYPERCODE_API_KEY=sk-your-openai-api-key
export HYPERCODE_MODEL=gpt-4o

# 启动 HyperCode
hypercode
```

### 配置 Claude

```bash
# 设置环境变量
export HYPERCODE_PROVIDER=anthropic
export HYPERCODE_API_KEY=sk-ant-your-claude-api-key
export HYPERCODE_MODEL=claude-3.5-sonnet

# 启动 HyperCode
hypercode
```

### 使用原生 Gemini

```bash
# 不设置多提供商变量，使用原生模式
export GEMINI_API_KEY=your-gemini-api-key
hypercode
```

## 💡 使用示例

### 代码分析与重构

```bash
# 分析项目架构
hypercode "分析这个项目的主要架构组件"

# 代码重构
hypercode "重构这个函数，提高可读性和性能"

# 添加测试
hypercode "为 utils.js 中的所有函数添加单元测试"
```

### 多模态任务

```bash
# 从图片生成代码
hypercode "根据这个 UI 截图生成 React 组件"

# PDF 文档分析
hypercode "总结这个技术文档的要点"
```

### 自动化工作流

```bash
# Git 操作
hypercode "分析最近7天的提交记录，按功能分组"

# 文件处理
hypercode "将所有 .jpg 图片转换为 .png 格式"

# 系统管理
hypercode "检查系统资源使用情况并生成报告"
```

### 不同提供商的最佳场景

```bash
# 使用 Deepseek 进行代码生成
export HYPERCODE_PROVIDER=deepseek
hypercode "写一个高性能的二叉搜索树实现"

# 使用 Claude 进行文档分析
export HYPERCODE_PROVIDER=anthropic
hypercode "分析这份100页的技术规范文档"

# 使用 Qwen 进行中文处理
export HYPERCODE_PROVIDER=alibaba
hypercode "将这个英文 README 翻译成中文"
```

## ⚙️ 环境变量配置

### 核心配置

```bash
# 必需：指定 AI 提供商
export HYPERCODE_PROVIDER=openai

# 必需：API 密钥
export HYPERCODE_API_KEY=your_api_key_here

# 可选：指定模型
export HYPERCODE_MODEL=gpt-4o

# 可选：自定义 API 端点
export HYPERCODE_API_URL=https://api.openai.com/v1

# 可选：Token 限制（触发自动压缩）
export HYPERCODE_MAX_TOKENS=4000
```

### 代理配置

```bash
# HTTP/HTTPS 代理
export HYPERCODE_PROXY=http://proxy.company.com:8080

# 跳过 SSL 验证（测试环境）
export HYPERCODE_SKIP_SSL_VERIFICATION=true
```

### 快速切换脚本

```bash
# 创建提供商切换脚本
cat > switch-ai.sh << 'EOF'
#!/bin/bash
case "$1" in
  "gpt4")
    export HYPERCODE_PROVIDER=openai
    export HYPERCODE_MODEL=gpt-4o
    echo "切换到 GPT-4o"
    ;;
  "claude")
    export HYPERCODE_PROVIDER=anthropic
    export HYPERCODE_MODEL=claude-3.5-sonnet
    echo "切换到 Claude 3.5 Sonnet"
    ;;
  "qwen")
    export HYPERCODE_PROVIDER=alibaba
    export HYPERCODE_MODEL=qwen-plus
    echo "切换到 Qwen Plus"
    ;;
  *)
    echo "用法: $0 {gpt4|claude|qwen}"
    ;;
esac
EOF

chmod +x switch-ai.sh

# 使用切换脚本
./switch-ai.sh gpt4    # 切换到 GPT-4
./switch-ai.sh claude  # 切换到 Claude
```

## 🔧 高级功能

### 自动聊天压缩

HyperCode 支持智能聊天历史压缩，当对话超过设定 token 限制时自动触发：

```bash
# 设置压缩阈值（默认 1000 tokens）
export HYPERCODE_MAX_TOKENS=2000

# 启动后，当对话超过 2000 tokens 时会自动压缩
hypercode
```

### Token 统计与成本控制

- **Token统计**：真实 API 统计 + 字符估算
- **实时显示**：Footer 显示当前 token 使用情况
- **多提供商支持**：准确识别不同提供商的 token 限制

### 代理支持

```bash
# 完整的网络支持
export HYPERCODE_PROXY=http://username:password@proxy.company.com:8080
export HYPERCODE_SKIP_SSL_VERIFICATION=true
export HYPERCODE_API_URL=https://internal-ai-api.company.com/v1
```

## 🔍 核心改进详解

### 1. 架构现代化
- **统一接口**：`UniversalAIClient` 抽象层支持所有提供商
- **消息标准化**：统一 `user/assistant/tool` 消息格式
- **智能适配**：自动检测提供商能力并启用相应功能

### 2. 认证系统简化
- **移除复杂认证**：去除 OAuth、Vertex AI 等复杂流程
- **统一 API Key**：所有提供商使用相同的配置模式
- **环境变量标准化**：`HYPERCODE_*` 前缀，清晰易懂

### 3. 用户体验优化
- **品牌重塑**：从 Gemini CLI 到 HyperCode，体现多提供商特性
- **UI 现代化**：新的 ASCII 艺术和界面设计
- **错误处理**：更友好的错误提示和调试信息

### 4. 性能与成本优化
- **智能压缩**：AI 驱动的对话历史压缩，节约 70% token
- **精确统计**：多提供商 token 使用统计
- **缓存优化**：减少重复 API 调用

## 📚 文档资源

- **[多提供商配置教程](./MULTI_PROVIDER_TUTORIAL.md)** - 详细的配置指南
- **[实现历程文档](./HyperCode实现历程文档.md)** - 技术改造过程
- **[CLI 命令参考](./docs/cli/commands.md)** - 所有可用命令
- **[故障排除指南](./docs/troubleshooting.md)** - 常见问题解决

## 🛠️ 开发与贡献

### 本地开发

```bash
# 克隆项目
git clone https://github.com/google-gemini/gemini-cli
cd gemini-cli

# 安装依赖
npm install

# 构建项目
npm run build

# 运行测试
npm run test

# 代码质量检查
npm run preflight
```

### 项目结构

```
HyperCode/
├── packages/
│   ├── cli/                 # 前端用户界面
│   │   ├── src/ui/         # React + Ink 组件
│   │   └── src/config/     # CLI 配置
│   └── core/               # 后端核心逻辑
│       ├── src/ai/         # 多提供商 AI 客户端
│       ├── src/tools/      # 工具系统
│       └── src/core/       # 核心服务
├── docs/                   # 文档
└── integration-tests/      # 集成测试
```

### 贡献指南

1. Fork 项目仓库
2. 创建功能分支：`git checkout -b feature/new-provider`
3. 提交变更：`git commit -m 'Add new AI provider'`
4. 推送分支：`git push origin feature/new-provider`
5. 创建 Pull Request

## ❓ 常见问题

**Q: 如何回到原生 Gemini 模式？**
```bash
unset HYPERCODE_PROVIDER
unset HYPERCODE_API_KEY
export GEMINI_API_KEY=your-gemini-key
```

**Q: 支持哪些提供商的工具调用？**
A: OpenAI、Anthropic、Google Gemini 支持完整工具调用，其他提供商使用系统提示词增强。

**Q: 如何验证配置是否正确？**
```bash
# 检查环境变量
echo "Provider: $HYPERCODE_PROVIDER"
echo "Model: $HYPERCODE_MODEL"

# 测试连接
hypercode --prompt "Hello, 测试连接"
```

**Q: 遇到认证错误怎么办？**
A: 检查 API 密钥格式是否正确，OpenAI 应以 `sk-` 开头，Claude 应以 `sk-ant-` 开头。

## 🚀 未来规划

- [ ] 支持更多 AI 提供商（Mistral、Perplexity 等）
- [ ] GUI 配置界面和管理工具
- [ ] 自动提供商选择和负载均衡
- [ ] 成本优化建议和预算控制
- [ ] 团队协作和配置共享功能
- [ ] 性能基准测试和对比分析

## 📄 许可证

本项目基于 Apache 2.0 许可证。详情请查看 [LICENSE](./LICENSE) 文件。

## 📞 支持与反馈

- **GitHub Issues**: [提交问题](https://github.com/google-gemini/gemini-cli/issues)
- **Discord 社区**: [加入讨论](https://discord.gg/gemini-cli)
- **贡献指南**: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

**HyperCode** - 统一多种 AI 提供商的强大代码工具 🚀

*从单一的 Gemini CLI 到通用的 HyperCode，让 AI 编程更自由、更强大！*