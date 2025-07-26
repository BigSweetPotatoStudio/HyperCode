
1
import { generateText, generateObject, streamText, LanguageModel, StreamTextResult, tool, CoreMessage } from 'ai';
import { AIProviderFactory } from './providerFactory.js';
import { AIProviderConfig, AIProvider } from './types.js';
import { Config } from '../config/config.js';
import { FunctionDeclaration, PartListUnion, Schema } from '@google/genai';
import z, { ZodSchema } from 'zod';
import { jsonSchemaToZod } from "json-schema-to-zod";
import { estimateTokenCount } from '../core/tokenLimits.js';

/**
 * 扩展的 Gemini Part 类型定义，支持工具调用和响应
 */
interface GeminiPart {
  text?: string;
  functionCall?: {
    name: string;
    args: any;
  };
  functionResponse?: {
    name: string;
    response: any;
  };
}

/**
 * 工具调用信息，用于构建助手消息
 */
interface ToolCallInfo {
  id: string;
  name: string;
  args: any;
}

/**
 * 工具响应信息，用于构建工具消息
 */
interface ToolResponseInfo {
  toolCallId: string;
  toolName: string;
  result: string;
}

/**
 * 规范化的消息转换函数，支持多提供商格式
 * 根据不同角色和内容类型生成对应的 CoreMessage
 */
function convertPartListUnionToCoreMessage(parts: PartListUnion, role: 'user' | 'assistant' | 'tool' = 'user', context?: {
  toolCalls?: ToolCallInfo[];
  toolResponses?: ToolResponseInfo[];
}): CoreMessage {
  // 处理工具角色消息 - 返回工具执行结果
  if (role === 'tool' && context?.toolResponses) {
    return {
      role: 'tool',
      content: context.toolResponses.map(tr => ({
        type: 'tool-result',
        toolCallId: tr.toolCallId,
        toolName: tr.toolName, 
        result: tr.result,
      })),
    };
  }

  // 处理助手角色消息 - 可能包含文本和工具调用
  if (role === 'assistant') {
    const content: any[] = [];
    
    // 添加文本内容
    const textContent = extractTextContent(parts);
    if (textContent) {
      content.push({
        type: 'text',
        text: textContent,
      });
    }
    
    // 添加工具调用
    if (context?.toolCalls && context.toolCalls.length > 0) {
      for (const toolCall of context.toolCalls) {
        content.push({
          type: 'tool-call',
          toolCallId: toolCall.id,
          toolName: toolCall.name,
          args: toolCall.args || {},
        });
      }
    }
    
    return {
      role: 'assistant',
      content: content.length > 0 ? content : textContent || '',
    };
  }

  // 处理用户角色消息 - 简单文本内容
  return {
    role: 'user',
    content: extractTextContent(parts) || '',
  };
}

/**
 * 从 PartListUnion 中提取纯文本内容
 */
function extractTextContent(parts: PartListUnion): string {
  if (typeof parts === 'string') {
    return parts;
  }
  
  if (Array.isArray(parts)) {
    return parts
      .map(part => {
        if (typeof part === 'string') {
          return part;
        } else if (part && typeof part === 'object') {
          const geminiPart = part as GeminiPart;
          if (geminiPart.text) {
            return geminiPart.text;
          } else if (geminiPart.functionCall) {
            return `[Function Call: ${geminiPart.functionCall.name}(${JSON.stringify(geminiPart.functionCall.args)})]`;
          } else if (geminiPart.functionResponse) {
            return `[Function Response: ${JSON.stringify(geminiPart.functionResponse.response)}]`;
          }
        }
        return '';
      })
      .filter(text => text.length > 0)
      .join(' ');
  }
  
  if (parts && typeof parts === 'object') {
    const geminiPart = parts as GeminiPart;
    if (geminiPart.text) {
      return geminiPart.text;
    } else if (geminiPart.functionCall) {
      const fc = geminiPart.functionCall;
      return `[Function Call: ${fc.name}(${JSON.stringify(fc.args)})]`;
    } else if (geminiPart.functionResponse) {
      const fr = geminiPart.functionResponse;
      return `[Function Response: ${JSON.stringify(fr.response)}]`;
    }
  }
  
  return '';
}

/**
 * Universal AI client that works with multiple LLM providers via Vercel AI SDK
 * This replaces the Gemini-specific client for multi-provider support
 */
/**
 * Token 统计信息
 */
interface TokenUsage {
  /** 输入 token 数量 */
  promptTokens: number;
  /** 输出 token 数量 */
  completionTokens: number;
  /** 总 token 数量 */
  totalTokens: number;
}

export class UniversalAIClient {
  private model: LanguageModel;
  private config: AIProviderConfig;
  private factory: AIProviderFactory;
  private messages: CoreMessage[] = [];
  
  /** 真实的 token 统计（从 API 响应获取，可能为 null） */
  private realTokenUsage: TokenUsage | null = null;
  
  /** 估算的 token 统计（基于字符数计算） */
  private estimatedTokenUsage: TokenUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0
  };

  constructor(config: AIProviderConfig) {
    this.factory = AIProviderFactory.getInstance();
    this.config = config;

    // Validate configuration
    this.factory.validateConfig(config);

    // Create the language model
    this.model = this.factory.createModel(config);
  }

  /**
   * Create client from environment configuration
   */
  static fromEnvironment(): UniversalAIClient {
    const factory = AIProviderFactory.getInstance();
    const config = factory.parseEnvironmentConfig();
    return new UniversalAIClient(config);
  }

  /**
   * Create client from Config object (maintains compatibility with existing code)
   */
  static fromConfig(config: Config): UniversalAIClient {
    // Extract provider info from config or use defaults
    const provider = (process.env.HYPERCODE_PROVIDER as AIProvider) || AIProvider.GEMINI;
    const apiKey = process.env.HYPERCODE_API_KEY || config.getAIApiKey();
    const model = process.env.HYPERCODE_MODEL || config.getModel();
    const apiUrl = process.env.HYPERCODE_API_URL || config.getAIApiUrl();

    const aiConfig: AIProviderConfig = {
      provider,
      apiKey,
      apiUrl,
      model,
      temperature: 0, // Match Gemini client default
      maxTokens: undefined,
    };

    return new UniversalAIClient(aiConfig);
  }

  /**
   * Generate text completion using messages
   */
  async generateTextWithMessages(options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    abortSignal?: AbortSignal;
  }): Promise<{ text: string; usage?: any }> {
    const messages = [...this.messages];

    const result = await generateText({
      model: this.model,
      messages,
      system: options?.systemPrompt,
      temperature: options?.temperature ?? this.config.temperature,
      maxTokens: options?.maxTokens ?? this.config.maxTokens,
      abortSignal: options?.abortSignal,
    });

    // 更新 token 统计
    this.updateRealTokenUsage(result.usage);
    this.updateEstimatedTokenUsage();

    return {
      text: result.text,
      usage: result.usage,
    };
  }

  /**
   * Generate text completion (legacy method for compatibility)
   */
  async generateText(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    abortSignal?: AbortSignal;
  }): Promise<{ text: string; usage?: any }> {
    const result = await generateText({
      model: this.model,
      prompt,
      system: options?.systemPrompt,
      temperature: options?.temperature ?? this.config.temperature,
      maxTokens: options?.maxTokens ?? this.config.maxTokens,
      abortSignal: options?.abortSignal,
    });

    return {
      text: result.text,
      usage: result.usage,
    };
  }

  /**
   * Generate text with tools using messages
   */
  async generateWithToolsUsingMessages(
    toolDeclarations: FunctionDeclaration[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      abortSignal?: AbortSignal;
    }
  ): Promise<{ text?: string; toolCalls?: any[]; usage?: any }> {
    // Convert Gemini tool declarations to Vercel AI format
    const tools: Record<string, any> = {};

    for (const toolDecl of toolDeclarations) {
      try {
        const toolName = toolDecl?.name;
        if (!toolName) {
          console.warn('Tool declaration missing name:', toolDecl);
          continue;
        }

        // Handle both Gemini schema formats: `parameters` and `parametersJsonSchema`
        const rawParameters = toolDecl.parameters || toolDecl.parametersJsonSchema || {};
        // Convert Gemini Schema format to JSON Schema format for Vercel AI SDK
        const parameters = convertSchema(rawParameters);

        tools[toolName] = tool({
          description: toolDecl.description || '',
          parameters,
          execute: async (args: any) => {
            // This is a placeholder - actual execution happens elsewhere
            return { success: true, args };
          },
        });
      } catch (error) {
        console.error('Error processing tool declaration:', toolDecl, error);
        // Continue with other tools
      }
    }

    const messages = [...this.messages];

    const result = await generateText({
      model: this.model,
      messages,
      system: options?.systemPrompt,
      temperature: options?.temperature ?? this.config.temperature,
      maxTokens: options?.maxTokens ?? this.config.maxTokens,
      abortSignal: options?.abortSignal,
      tools,
      maxSteps: 1, // Only one step to avoid auto-execution
    });

    // Extract tool calls from the result
    const toolCalls = result.toolCalls?.map((tc: any) => ({
      id: tc.toolCallId,
      name: tc.toolName,
      args: tc.args,
    })) || [];

    // 更新 token 统计
    this.updateRealTokenUsage(result.usage);
    this.updateEstimatedTokenUsage();

    return {
      text: result.text,
      toolCalls,
      usage: result.usage,
    };
  }

  /**
   * Generate text with tool support (legacy method)
   */
  async generateWithTools(
    prompt: string,
    toolDeclarations: FunctionDeclaration[],
    options?: {
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
      abortSignal?: AbortSignal;
    }
  ): Promise<{ text?: string; toolCalls?: any[]; usage?: any }> {
    // Convert Gemini tool declarations to Vercel AI format
    const tools: Record<string, any> = {};

    for (const toolDecl of toolDeclarations) {
      try {
        const toolName = toolDecl?.name;
        if (!toolName) {
          console.warn('Tool declaration missing name:', toolDecl);
          continue;
        }

        // Handle both Gemini schema formats: `parameters` and `parametersJsonSchema`
        const parameters = toolDecl.parameters || toolDecl.parametersJsonSchema || {};

        tools[toolName] = tool({
          description: toolDecl.description || '',
          parameters: convertSchema(parameters) || z.any(),
          execute: async (args: any) => {
            // This is a placeholder - actual execution happens elsewhere
            return { success: true, args };
          },
        });
      } catch (error) {
        console.error('Error processing tool declaration:', toolDecl, error);
        // Continue with other tools
      }
    }

    const result = await generateText({
      model: this.model,
      prompt,
      system: options?.systemPrompt,
      temperature: options?.temperature ?? this.config.temperature,
      maxTokens: options?.maxTokens ?? this.config.maxTokens,
      abortSignal: options?.abortSignal,
      tools,
      maxSteps: 1, // Only one step to avoid auto-execution
    });

    // Extract tool calls from the result
    const toolCalls = result.toolCalls?.map((tc: any) => ({
      id: tc.toolCallId,
      name: tc.toolName,
      args: tc.args,
    })) || [];

    return {
      text: result.text,
      toolCalls,
      usage: result.usage,
    };
  }

  /**
   * Generate structured object from prompt
   */
  async generateObject<T>(
    prompt: string,
    schema: any,
    options?: {
      temperature?: number;
      systemPrompt?: string;
    }
  ): Promise<{ object: T; usage?: any }> {
    const result = await generateObject({
      model: this.model,
      prompt,
      schema,
      system: options?.systemPrompt,
      temperature: options?.temperature ?? this.config.temperature,
    });

    return {
      object: result.object as T,
      usage: result.usage,
    };
  }

  /**
   * Stream text generation
   */
  async streamText(prompt: string, options?: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  }): Promise<StreamTextResult<any, any>> {
    return streamText({
      model: this.model,
      prompt,
      system: options?.systemPrompt,
      temperature: options?.temperature ?? this.config.temperature,
      maxTokens: options?.maxTokens ?? this.config.maxTokens,
    });
  }

  /**
   * Get current provider information
   */
  getProviderInfo(): { provider: AIProvider; model: string } {
    return {
      provider: this.config.provider,
      model: this.config.model,
    };
  }

  /**
   * Get current configuration
   */
  getConfig(): AIProviderConfig {
    return { ...this.config };
  }

  /**
   * Update configuration (creates new client instance)
   */
  updateConfig(newConfig: Partial<AIProviderConfig>): UniversalAIClient {
    const mergedConfig = { ...this.config, ...newConfig };
    return new UniversalAIClient(mergedConfig);
  }

  /**
   * Test connection to the AI provider
   */
  /**
   * Add a message to the conversation
   */
  addMessage(message: CoreMessage): void {
    this.messages.push(message);
    
    // 更新估算统计
    this.updateEstimatedTokenUsage();
  }

  /**
   * Add a simple text message
   */
  addTextMessage(role: 'user' | 'assistant', content: string): void {
    if (role === 'user') {
      this.addMessage({ role: 'user', content });
    } else {
      this.addMessage({ role: 'assistant', content });
    }
  }

  /**
   * Add assistant message with tool calls
   */
  addAssistantMessageWithToolCalls(text: string, toolCalls: ToolCallInfo[]): void {
    const message = convertPartListUnionToCoreMessage(text, 'assistant', { toolCalls });
    this.addMessage(message);
  }

  /**
   * Add tool response messages
   */
  addToolResponses(toolResponses: ToolResponseInfo[]): void {
    const message = convertPartListUnionToCoreMessage('', 'tool', { toolResponses });
    this.addMessage(message);
  }

  /**
   * Add PartListUnion as message with enhanced context support
   */
  addPartListUnion(parts: PartListUnion, role: 'user' | 'assistant' | 'tool' = 'user', context?: {
    toolCalls?: ToolCallInfo[];
    toolResponses?: ToolResponseInfo[];
  }): void {
    const coreMessage = convertPartListUnionToCoreMessage(parts, role, context);
    this.addMessage(coreMessage);
  }


  /**
   * Get the current messages
   */
  getMessages(): CoreMessage[] {
    return [...this.messages];
  }

  /**
   * Clear the message history
   */
  clearMessages(): void {
    this.messages = [];
  }

  /**
   * Test connection to the AI provider
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      await this.generateText('Hello', { maxTokens: 10 });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 获取真实的 token 使用情况（优先级最高）
   */
  getRealTokenUsage(): TokenUsage | null {
    return this.realTokenUsage;
  }

  /**
   * 获取估算的 token 使用情况
   */
  getEstimatedTokenUsage(): TokenUsage {
    return this.estimatedTokenUsage;
  }

  /**
   * 获取当前 prompt token 计数（用于显示）
   * 优先返回真实值，如果没有则返回估算值
   */
  getCurrentPromptTokenCount(): number {
    return this.realTokenUsage?.promptTokens || this.estimatedTokenUsage.promptTokens;
  }

  /**
   * 获取总对话历史的估算 token 数（用于压缩判断）
   */
  getEstimatedTotalTokens(): number {
    const totalText = this.messages.map(msg => {
      if (typeof msg.content === 'string') {
        return msg.content;
      } else if (Array.isArray(msg.content)) {
        return msg.content.map(part => {
          if (typeof part === 'string') return part;
          if (part.type === 'text') return part.text || '';
          return '';
        }).join(' ');
      }
      return '';
    }).join(' ');
    
    return estimateTokenCount(totalText);
  }

  /**
   * 更新真实的 token 使用情况（从 API 响应中提取）
   */
  private updateRealTokenUsage(usage: any): void {
    if (usage && typeof usage === 'object') {
      // 不同提供商的 usage 格式可能不同，需要标准化
      const promptTokens = usage.promptTokens || usage.prompt_tokens || usage.input_tokens || 0;
      const completionTokens = usage.completionTokens || usage.completion_tokens || usage.output_tokens || 0;
      const totalTokens = usage.totalTokens || usage.total_tokens || (promptTokens + completionTokens);

      this.realTokenUsage = {
        promptTokens,
        completionTokens,
        totalTokens
      };
    }
  }

  /**
   * 更新估算的 token 使用情况（基于消息内容）
   */
  private updateEstimatedTokenUsage(): void {
    const totalText = this.messages.map(msg => {
      if (typeof msg.content === 'string') {
        return msg.content;
      } else if (Array.isArray(msg.content)) {
        return msg.content.map(part => {
          if (typeof part === 'string') return part;
          if (part.type === 'text') return part.text || '';
          return '';
        }).join(' ');
      }
      return '';
    }).join(' ');
    
    const totalTokens = estimateTokenCount(totalText);
    
    // 简单地假设最后一条消息是 prompt，其余是历史
    const lastMessage = this.messages[this.messages.length - 1];
    let promptTokens = 0;
    if (lastMessage && lastMessage.role === 'user') {
      const lastMessageText = typeof lastMessage.content === 'string' 
        ? lastMessage.content 
        : '';
      promptTokens = estimateTokenCount(lastMessageText);
    }
    
    this.estimatedTokenUsage = {
      promptTokens,
      completionTokens: totalTokens - promptTokens,
      totalTokens
    };
  }

  /**
   * 获取压缩触发的最大token阈值
   * 优先级：HYPERCODE_MAX_TOKENS环境变量 > 默认值1000
   */
  private getCompressionThreshold(): number {
    const envMaxTokens = process.env.HYPERCODE_MAX_TOKENS;
    if (envMaxTokens) {
      const parsed = parseInt(envMaxTokens, 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
    return 1000; // 默认阈值
  }

  /**
   * 检查是否需要自动压缩
   * 基于估算的token数量和环境变量配置
   */
  shouldAutoCompress(): boolean {
    if (this.messages.length <= 2) {
      return false;
    }
    
    const currentTokens = this.getEstimatedTotalTokens();
    const threshold = this.getCompressionThreshold();
    
    return currentTokens >= threshold;
  }

  /**
   * 压缩聊天历史，兼容Gemini客户端的接口
   * @param _promptId 提示ID（用于日志记录，当前未使用）
   * @param shouldCompress 是否执行压缩
   * @returns 压缩结果，包含原始和新的token数量
   */
  async tryCompressChat(_promptId: string, shouldCompress: boolean = true): Promise<{
    originalTokenCount: number;
    newTokenCount: number;
  } | null> {
    try {
      if (!shouldCompress || this.messages.length <= 2) {
        // 消息太少，不需要压缩
        return null;
      }

      // 计算原始token数量
      const originalTokenCount = this.getEstimatedTotalTokens();
      const threshold = this.getCompressionThreshold();

      // 如果token数量未达到阈值，不需要压缩
      if (originalTokenCount < threshold) {
        return null;
      }

      // 保留最后几条消息不压缩（通常是最近的对话）
      const messagesToKeep = 2; // 保留最后2条消息
      const messagesToCompress = this.messages.slice(0, -messagesToKeep);
      const messagesKept = this.messages.slice(-messagesToKeep);

      if (messagesToCompress.length === 0) {
        return null;
      }

      // 构建压缩提示
      const conversationHistory = messagesToCompress.map(msg => {
        const role = msg.role === 'assistant' ? 'Assistant' : 'User';
        let content = '';
        
        if (typeof msg.content === 'string') {
          content = msg.content;
        } else if (Array.isArray(msg.content)) {
          content = msg.content.map(part => {
            if (typeof part === 'string') return part;
            if (part.type === 'text') return part.text || '';
            if (part.type === 'tool-call') return `[Tool Call: ${part.toolName}]`;
            if (part.type === 'tool-result') return `[Tool Result]`;
            return '';
          }).join(' ');
        }

        return `${role}: ${content}`;
      }).join('\n\n');

      const compressionPrompt = `请将以下对话历史总结成一个简洁的摘要，保留关键信息和上下文：

${conversationHistory}

请用中文总结，格式为：
对话摘要：[总结内容]`;

      // 使用AI模型进行压缩
      const compressionResult = await generateText({
        model: this.model,
        prompt: compressionPrompt,
        temperature: 0.3, // 使用较低的温度以获得更一致的结果
        maxTokens: Math.min(500, Math.floor(originalTokenCount * 0.3)), // 压缩到原来的30%
      });

      if (!compressionResult.text) {
        return null;
      }

      // 创建压缩后的消息
      const compressedMessage: CoreMessage = {
        role: 'user',
        content: `[对话历史摘要] ${compressionResult.text}`
      };

      // 替换原始消息
      this.messages = [compressedMessage, ...messagesKept];

      // 更新token统计
      this.updateEstimatedTokenUsage();
      const newTokenCount = this.getEstimatedTotalTokens();

      return {
        originalTokenCount,
        newTokenCount
      };

    } catch (error) {
      console.error('压缩聊天历史时出错:', error);
      console.error('错误详情:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        provider: this.getProviderInfo()
      });
      return null;
    }
  }
}


/**
 * 将 Gemini Schema 规范化为标准 JSON Schema
 */
function normalizeGeminiSchema(schema: any): any {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }

  const normalized: any = {};

  // 转换 type - 将大写转为小写
  if (schema.type) {
    normalized.type = typeof schema.type === 'string'
      ? schema.type.toLowerCase()
      : String(schema.type).toLowerCase();
  }

  // 复制基本属性
  if (schema.description) {
    normalized.description = schema.description;
  }
  if (schema.required) {
    normalized.required = schema.required;
  }
  if (schema.enum) {
    normalized.enum = schema.enum;
  }

  // 递归处理 properties
  if (schema.properties) {
    normalized.properties = {};
    for (const [key, prop] of Object.entries(schema.properties)) {
      normalized.properties[key] = normalizeGeminiSchema(prop);
    }
  }

  // 处理数组项目
  if (schema.items) {
    normalized.items = normalizeGeminiSchema(schema.items);
  }

  return normalized;
}

/**
 * 将 Gemini Schema 转换为 Zod Schema
 */
function convertSchema(s: Schema): ZodSchema {
  try {
    // 第一步：规范化 Gemini Schema 为标准 JSON Schema
    const normalizedSchema = normalizeGeminiSchema(s);

    // 第二步：转换为 Zod Schema 字符串
    const zodSchemaString = jsonSchemaToZod(normalizedSchema);

    // 第三步：在安全环境中创建 Zod Schema
    const Function = (globalThis as typeof globalThis & { Function: FunctionConstructor }).Function;
    const createSchema = new Function('z', `return ${zodSchemaString}`);

    const zodSchema = createSchema(z);


    return zodSchema instanceof z.ZodType ? zodSchema : z.any();
  } catch (error) {
    console.warn(`⚠️ Schema 转换失败，使用通用 schema:`, {
      originalSchema: s,
      error: error instanceof Error ? error.message : String(error)
    });

    // 回退到宽松的 schema
    return z.any();
  }
}
