# 项目配置

## 用户要求

### 学习计划验收机制
- 每个里程碑都有明确的验收标准
- 用户要求检查里程碑时，需要编写测试程序来验证
- 简单的验收项可以不写程序验证
- 验收通过后，更新学习计划文档，标记里程碑为 **已达成**

### 验收流程
1. 用户说 "检查 MX"（X 为里程碑编号）
2. 我编写/运行验收测试代码
3. 检查所有验收项是否通过
4. 更新学习计划，将里程碑状态从 ⬜ 未开始 改为 ✅ 已达成

### 用户背景
- 刚学完 TypeScript 基础语法和 Node.js 基础
- 全职学习，预计 1-2 周
- 学习 anthropic-sdk-typescript 项目
- 使用阿里云百炼 **Coding Plan** 进行实践

### Coding Plan 关键信息
- **兼容 Anthropic API 协议**，可直接使用 anthropic-sdk
- **Base URL**: `https://coding.dashscope.aliyuncs.com/apps/anthropic`
- **认证方式**: Coding Plan 专属 API Key
- **使用限制**: 仅限编程工具中使用，禁止自动化脚本或批量调用

### 学习目标
1. 理解 SDK 的设计模式和架构
2. 能够配置 SDK 使用 Coding Plan
3. 实现一个简单的 CLI 工具或示例项目