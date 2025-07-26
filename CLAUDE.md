# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 🚀 TODO: HyperCode - 多 LLM 提供商代码工具

### 项目目标
使用 Vercel AI SDK 将当前的 Gemini CLI 改造成 **HyperCode** - 一个支持多种 LLM API 提供商的通用代码工具，大幅简化开发复杂度并提高工具的通用性和品牌识别度。

### 架构方案优势
- ✅ **使用 Vercel AI SDK 4.2**: 统一接口，原生支持 15+ 提供商
- ✅ **开发效率提升 70%**: 从 6-8 周缩短到 4-5 周
- ✅ **功能开箱即用**: 工具调用、流式响应、错误处理等
- ✅ **社区维护**: 自动跟踪 API 变化，持续更新支持

### 实施计划 (总计 5-6 周)


#### 阶段 1: Vercel AI SDK 集成 (1周) - 优先级：高
- [ ] 安装和配置 Vercel AI SDK
  - [ ] 添加 `@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google` 等依赖
  - [ ] 配置 TypeScript 类型支持
- [ ] 实现统一环境变量配置系统
  - [ ] 设计 4 个核心环境变量: `HYPER_AI_PROVIDER`, `HYPER_API_URL`, `HYPER_API_KEY`, `HYPER_AI_MODEL`
  - [ ] 实现 `EnvironmentConfigLoader` 类
  - [ ] 配置优先级机制 (CLI参数 > 环境变量 > 配置文件 > 默认值)
- [ ] 创建 `AISdkAdapter` 适配器类
  - [ ] 封装 AI SDK 的 `generateText()` 和 `streamText()` 
  - [ ] 实现多提供商配置管理 (`MultiProviderConfig`)
  - [ ] 模型别名解析系统
- [ ] 重构 `ContentGenerator` 接口
  - [ ] 使用 AI SDK 替换现有 Gemini API 调用
  - [ ] 集成环境变量配置系统
  - [ ] 保持向后兼容性
- [ ] 实现基础提供商支持
  - [ ] Google (Gemini) - 保持现有功能
  - [ ] 验证配置和连接测试

#### 阶段 2: 核心提供商扩展 (1周) - 优先级：高  
- [ ] 添加 OpenAI 支持
  - [ ] GPT-4o, GPT-4o-mini, GPT-3.5-turbo
  - [ ] 支持 `HYPER_AI_PROVIDER=openai` 和向后兼容 `OPENAI_API_KEY`
- [ ] 添加 Anthropic (Claude) 支持
  - [ ] Claude-3.5-sonnet, Claude-3-haiku
  - [ ] 支持 `HYPER_AI_PROVIDER=claude` 和向后兼容 `CLAUDE_API_KEY`
- [ ] 扩展环境变量系统
  - [ ] 添加扩展变量: `HYPER_AI_TEMPERATURE`, `HYPER_AI_MAX_TOKENS`, `HYPER_AI_TIMEOUT`
  - [ ] 提供商特定环境变量回退机制
  - [ ] 环境变量验证和错误处理
- [ ] 配置管理系统扩展
  - [ ] 多提供商配置文件结构
  - [ ] 环境变量自动检测和配置
  - [ ] 向后兼容现有 Gemini 配置
- [ ] 工具调用适配
  - [ ] 现有工具系统与 AI SDK tools 格式转换
  - [ ] 跨提供商工具调用测试

#### 阶段 3: CLI 增强和用户体验 (1周) - 优先级：高
- [ ] CLI 命令行扩展
  - [ ] `--provider` 参数: `gemini --provider openai "任务"`
  - [ ] `--model` 参数: `gemini --model gpt-4o "任务"`
  - [ ] 模型别名支持: `gemini --model fast "任务"`
- [ ] 提供商管理命令
  - [ ] `gemini provider list` - 列出配置的提供商
  - [ ] `gemini provider test <provider>` - 测试连接
  - [ ] `gemini provider set-default <provider>` - 设置默认
- [ ] 配置向导
  - [ ] 交互式初始配置设置
  - [ ] API Key 配置指导
  - [ ] 提供商可用性检测

#### 阶段 4: 扩展提供商和高级功能 (1周) - 优先级：中
- [ ] 添加更多提供商 (基于 AI SDK 支持)
  - [ ] DeepSeek (推理模型)
  - [ ] Ollama (本地模型)
  - [ ] Together AI, Fireworks 等
- [ ] 智能功能
  - [ ] 自动故障转移 (主提供商失败时)
  - [ ] 基于任务类型的智能模型选择
  - [ ] 成本优化建议
- [ ] 模型别名系统完善
  - [ ] 预定义别名: `fast`, `smart`, `creative`, `cheap`
  - [ ] 用户自定义别名配置
  - [ ] 动态别名 (基于可用性和性能)

#### 阶段 5: 测试、优化和文档 (0.5-1周) - 优先级：高
- [ ] 测试覆盖完善
  - [ ] 各提供商的集成测试
  - [ ] 错误处理和边界情况测试
  - [ ] 性能和稳定性测试
- [ ] 文档和示例
  - [ ] 多提供商配置指南
  - [ ] 最佳实践和使用场景
  - [ ] 故障排除指南
- [ ] 性能优化
  - [ ] 连接复用和缓存
  - [ ] 响应时间优化
  - [ ] 内存使用优化

#### 阶段 6: 品牌重塑和迁移准备 (0.5-1周) - 优先级：低
- [ ] 包名和标识符重命名
  - [ ] 包名重命名: `@google/gemini-cli` → `@dadigua/hypercode-cli`
  - [ ] CLI 命令重命名: `gemini` → `hypercode`
  - [ ] 二进制文件重命名: `gemini.js` → `hypercode.js`
  - [ ] 配置目录重命名: `.gemini` → `.hypercode`
  - [ ] 环境变量迁移: `GEMINI_*` → `HYPER_*`
- [ ] 向后兼容和迁移机制
  - [ ] 自动检测旧配置 (`.gemini/`) 并提示迁移到 `.hypercode/`
  - [ ] 配置自动转换工具: `gemini-to-hypercode`
  - [ ] `gemini` 命令别名支持 (渐进式弃用)
  - [ ] 环境变量向后兼容 (`GEMINI_API_KEY` 仍可用一段时间)
- [ ] 基础文档更新
  - [ ] README.md 重写 (HyperCode 品牌)
  - [ ] 帮助文本和提示信息更新
  - [ ] 版本号升级到 2.0.0 (重大变更标识)


### 技术实现要点

#### 核心依赖
```json
{
  "dependencies": {
    "@ai-sdk/openai": "^1.0.0",
    "@ai-sdk/anthropic": "^1.0.0", 
    "@ai-sdk/google": "^1.0.0",
    "@ai-sdk/ollama": "^1.0.0",
    "ai": "^4.2.0"
  }
}
```

#### 环境变量配置
```bash
# === 核心 HyperCode 环境变量 ===
export HYPERCODE_PROVIDER=openai          # Provider name
export HYPERCODE_API_KEY=sk-...            # API key
export HYPERCODE_MODEL=gpt-4o              # Model name
export HYPERCODE_API_URL=https://...       # Optional custom API URL

# === 扩展配置变量 ===
export HYPER_AI_TEMPERATURE=0.7              # 温度参数
export HYPER_AI_MAX_TOKENS=4096              # 最大 token 数
export HYPER_AI_TIMEOUT=30000                # 超时时间

# === 向后兼容的提供商特定变量 ===
export OPENAI_API_KEY=sk-xxx                 # OpenAI 专用
export CLAUDE_API_KEY=sk-ant-xxx             # Claude 专用
export GEMINI_API_KEY=AIza-xxx               # Gemini 专用 (向后兼容)
export OLLAMA_HOST=http://localhost:11434    # Ollama 专用
```

#### 配置文件示例
```typescript
// .hypercode/ai-config.json (新配置文件位置)
{
  "defaultProvider": "gemini",
  "providers": {
    "gemini": { "model": "gemini-2.5-pro" },
    "gpt4": { "provider": "openai", "model": "gpt-4o" },
    "claude": { "provider": "anthropic", "model": "claude-3.5-sonnet" }
  },
  "aliases": {
    "fast": "gemini:gemini-2.5-flash",
    "smart": "gpt4:gpt-4o", 
    "creative": "claude:claude-3.5-sonnet"
  }
}
```

#### 使用示例
```bash
# === HyperCode 新命令方式 ===
export HYPER_AI_PROVIDER=openai
export HYPER_API_KEY=sk-xxx  
export HYPER_AI_MODEL=gpt-4o
hypercode "分析这段代码"

# === 命令行参数方式 ===
hypercode --provider openai --model gpt-4o "用 GPT-4 分析代码"
hypercode --provider claude --model claude-3.5-sonnet "用 Claude 重构"

# === 模型别名方式 ===
hypercode --model fast "快速回答问题"
hypercode --model smart "深度分析问题"
hypercode --model creative "创意性任务"

# === 自定义端点 ===
export HYPER_AI_PROVIDER=custom
export HYPER_API_URL=https://my-proxy.com/v1
export HYPER_API_KEY=my-key
hypercode "使用自定义端点"

# === 提供商管理 ===
hypercode provider list
hypercode provider test openai
hypercode provider set-default claude

# === 向后兼容 (临时支持) ===
gemini "仍然可以使用旧命令" # 将显示迁移提示
```

### 实施优势
- **开发效率**: 使用成熟的 AI SDK，避免重复造轮子
- **功能完整**: AI SDK 提供完整的工具调用、流式响应等功能
- **维护性**: 社区维护，自动跟踪 API 变化
- **扩展性**: 新提供商支持只需几行配置代码
- **稳定性**: 经过大量项目验证的成熟方案

### 预期收益
- **通用性**: 支持 15+ LLM 提供商，用户自由选择
- **可靠性**: 内置错误处理和重试机制
- **成本效益**: 根据任务选择最适合的模型和提供商  
- **开发体验**: 统一接口，一致的使用体验
- **社区价值**: 基于标准化方案，更容易被社区接受

---

## 基本命令

### 构建和开发
```bash
# 运行完整质量检查（提交变更前推荐执行）
npm run preflight

# 独立开发命令
npm run build         # 构建主项目
npm run build:all     # 构建主项目 + 沙箱
npm run test          # 运行测试套件
npm run lint          # 代码检查
npm run format        # 代码格式化
npm run typecheck     # 类型检查
npm run clean         # 删除生成的文件

# 替代构建目标（Makefile）
make build           # 等同于 npm run build
make preflight       # 等同于 npm run preflight
make start           # 启动 CLI
make debug           # 在调试模式下启动 CLI
```

### 测试
```bash
# 单元测试
npm run test                              # 所有单元测试
npm run test --workspaces                 # 运行所有包中的测试

# 集成测试
npm run test:integration:all              # 所有集成测试
npm run test:integration:sandbox:none     # 无沙箱的集成测试
npm run test:integration:sandbox:docker   # 使用 Docker 沙箱的集成测试
npm run test:integration:sandbox:podman   # 使用 Podman 沙箱的集成测试

# 单个测试文件（从包目录执行）
npx vitest run path/to/test.test.ts      # 运行特定测试文件
```

### 运行 CLI
```bash
# 开发
npm run start        # 从构建包启动
npm run debug       # 使用调试模式启动

# 测试已发布的包
npx https://github.com/google-gemini/gemini-cli
```

## 架构概览

这是一个使用 npm workspaces 构建的**包含两个主要包的 monorepo**：

### 核心架构（双包系统）
```
packages/
├── cli/          # 前端：用户界面、输入/输出、主题
│   └── src/
│       ├── ui/           # React 组件（使用 Ink）
│       ├── config/       # CLI 配置
│       └── services/     # CLI 服务层
└── core/         # 后端：API 通信、工具执行
    └── src/
        ├── core/         # Gemini API 客户端、对话管理
        ├── tools/        # 内置工具（文件系统、shell、web 等）
        ├── config/       # 核心配置
        └── services/     # 后端服务
```

### 关键架构原则
- **关注点分离**：CLI 包处理 UI/UX，Core 包处理 API 和工具执行
- **基于工具的架构**：可扩展的工具系统，Gemini 模型请求特定工具
- **安全优先**：破坏性操作需要用户确认
- **沙箱支持**：为安全提供隔离执行环境

### 请求流程
1. 用户输入 → CLI 包
2. CLI → Core 包 
3. Core → Gemini API（带工具定义）
4. Gemini API → 工具执行请求
5. Core → 工具执行（破坏性操作需用户确认）
6. 工具结果 → Gemini API → Core → CLI → 用户

## 技术栈

### 前端（CLI 包）
- **React + Ink**：使用 React 范式的终端 UI 框架
- **TypeScript**：类型安全开发
- **Vitest**：测试框架
- **ESLint + Prettier**：代码质量工具

### 后端（Core 包）
- **Google Gemini API**：用于 AI 通信的 `@google/genai` SDK
- **MCP 支持**：通过 `@modelcontextprotocol/sdk` 实现模型上下文协议
- **工具系统**：用于扩展性的模块化工具架构
- **Node.js**：带 ES 模块的服务器运行时

### 构建系统
- **npm workspaces**：Monorepo 管理
- **esbuild**：生产环境快速打包
- **TypeScript**：跨包编译和类型检查

## 开发指南

### 代码风格（来自 GEMINI.md）
- **优先使用普通对象而非类**：使用 TypeScript 接口而非基于类的继承
- **ES 模块封装**：使用 import/export 定义私有/公共 API 边界，而非类成员
- **避免 `any` 类型**：优先使用 `unknown` 配合类型收窄
- **函数式编程**：利用数组操作符（`.map()`、`.filter()`、`.reduce()`）进行不可变操作
- **React 函数组件**：使用 hooks，避免类组件，遵循 React 编译器优化模式

### 测试（Vitest）
- **共置测试**：测试文件（`*.test.ts`）与源文件放在一起
- **全面模拟**：模拟外部依赖（文件系统、API 等）
- **React 组件测试**：使用 `ink-testing-library` 进行终端 UI 测试
- **集成测试**：在 `/integration-tests/` 中单独的集成测试套件

### 工具开发
工具位于 `packages/core/src/tools/` 中，必须：
- 实现适当的模式验证
- 处理破坏性操作的用户确认
- 支持沙箱执行
- 遵循安全最佳实践

### 关键测试模式
```typescript
// 使用选择性模拟来模拟 ES 模块
vi.mock('module-name', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, mockFunction: vi.fn() };
});

// 使用 Ink 进行 React 组件测试
const { lastFrame } = render(<Component />);
expect(lastFrame()).toContain('expected output');
```

## 包依赖

### CLI 包依赖
- `@google/gemini-cli-core`：本地核心包依赖
- `ink`：基于 React 的终端 UI
- `yargs`：命令行参数解析
- `dotenv`：环境变量管理

### Core 包依赖
- `@google/genai`：Google Gemini API 客户端
- `@modelcontextprotocol/sdk`：MCP 协议支持
- `simple-git`：Git 操作
- `glob`、`micromatch`：文件模式匹配
- `ws`：MCP 的 WebSocket 支持

## 安全考虑

- **用户确认**：文件修改和 shell 命令需要确认
- **沙箱**：Docker/Podman 支持隔离执行
- **API 密钥管理**：安全处理 Gemini API 凭据
- **输入验证**：使用模式和 TypeScript 进行全面验证