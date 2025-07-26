# HyperCode 安全迁移日志

本文档记录了从 Gemini-only 系统到多提供商系统的安全迁移过程。

## 迁移策略

### 核心原则
1. **零破坏性变更** - 现有功能完全保持不变
2. **渐进式替换** - 一次替换一个组件，充分测试
3. **向后兼容** - 保留所有现有接口和行为
4. **提供商感知** - 智能处理不同提供商的能力差异

### 迁移架构

```
旧系统: Tool -> config.getGeminiClient() -> GeminiClient.generateContent()
新系统: Tool -> config.getSmartAIClient() -> AIClientAdapter -> [Universal|Gemini]Client
```

## 已完成的安全替换

### 1. Config 类增强 ✅

**文件**: `packages/core/src/config/config.ts`

**新增方法**:
- `getSmartAIClient()` - 智能客户端选择器
- `getUniversalAIClient()` - 通用 AI 客户端
- `getAIClientAdapter()` - 兼容性适配器
- AI 配置相关的 getter 方法

**影响**: 无破坏性变更，完全向后兼容

### 2. Web Search 工具迁移 ✅

**文件**: `packages/core/src/tools/web-search.ts`

**变更详情**:
- 替换: `config.getGeminiClient()` → `config.getSmartAIClient()`
- 新增: 提供商兼容性检查
- 行为: Google Search 功能仅在 Google/Gemini 提供商下可用

**向后兼容性**: ✅ 完全兼容
- 使用 Gemini/Google 提供商时：行为完全相同
- 使用其他提供商时：友好的错误提示而非崩溃

**测试状态**: ✅ 通过
- TypeScript 编译通过
- 项目构建成功
- 功能测试验证

## 迁移效果验证

### 环境变量支持测试
```bash
# 测试 1: Gemini 提供商（向后兼容）
export HYPER_AI_PROVIDER=gemini
export HYPER_AI_API_KEY=AIza...
export HYPER_AI_MODEL=gemini-2.5-flash
✅ 系统正确识别并配置

# 测试 2: OpenAI 提供商（新功能）
export HYPER_AI_PROVIDER=openai  
export HYPER_AI_API_KEY=sk-...
export HYPER_AI_MODEL=gpt-4o
✅ 系统支持但 web-search 会提示切换到 Google 提供商

# 测试 3: 原有 Gemini 配置（完全兼容）
export GEMINI_API_KEY=AIza...
✅ 系统回退到 Gemini 提供商，保持原有行为
```

### 构建和类型检查
```bash
npm run typecheck  # ✅ 通过
npm run build      # ✅ 成功
```

## 接下来的迁移计划

### 优先级 1: 简单替换 (低风险)
- [ ] `tools/shell.ts` - 基础工具，使用简单
- [ ] `tools/write-file.ts` - 文件操作工具

### 优先级 2: 复杂替换 (中风险)  
- [ ] `tools/edit.ts` - 需要处理 `ensureCorrectEdit` 依赖
- [ ] `utils/editCorrector.ts` - 深层依赖，需要接口适配

### 优先级 3: 核心系统 (高风险)
- [ ] CLI 层面的流式处理
- [ ] 聊天历史管理
- [ ] 错误处理和重试逻辑

## 回滚计划

如果发现问题，回滚步骤：

1. **立即回滚**: 恢复 `web-search.ts` 中的原始 `getGeminiClient()` 调用
2. **配置清理**: 移除 `config.ts` 中的新增方法（保留导入）
3. **验证**: 运行现有测试套件确保功能正常

## 经验教训

### 成功因素
1. **小步快跑**: 选择最简单的工具作为第一个迁移目标
2. **提供商感知**: 添加检查确保功能在正确的提供商下运行
3. **充分测试**: 每次更改后立即进行编译、构建和功能测试

### 注意事项
1. **避免深层修改**: 不要同时修改多个依赖层级
2. **保留类型安全**: 使用适当的类型转换而非 `any`
3. **用户体验**: 提供清晰的错误信息而不是静默失败

## 状态总结

**✅ 第一阶段完成**: 多提供商基础架构 + 第一个安全替换
**🔄 当前阶段**: 继续替换更多工具，采用相同的安全策略
**🎯 最终目标**: 完全的多提供商支持，保持 100% 向后兼容性

---

*最后更新: 2025-01-25*
*迁移进度: 1/19 工具已迁移*