---
title: Claude Code 进阶使用指南
cover: ''
date: 2026-07-31
description: ''
categories: []
tags: []
draft: false
---

## 常用命令与操作

### 基础命令

| 命令 | 说明 |
| claude | 启动 Claude Code 交互模式 |
| claude "你的问题" | 直接提问，快速获取回答 |
| claude -p "提示词" | 以管道模式运行，适合脚本调用 |
| /help | 查看所有可用命令 |
| /clear | 清除当前对话上下文 |
| /compact | 压缩对话历史，释放上下文空间 |
| /model | 切换模型 |
| /cost | 查看当前会话的 token 消耗 |
| /quit 或 Ctrl+C | 退出 Claude Code |
 
 
### 文件操作命令

| 命令 | 说明 |
| /read <文件路径> | 读取指定文件 |
| /edit <文件路径> | 编辑指定文件 |
| /write <文件路径> | 写入文件 |
| /grep <关键词> | 在代码中搜索关键词 |
| /glob <模式> | 按模式匹配文件 |
 
 
### 实用快捷操作

- **Tab 键**：自动补全文件路径和命令
- **Ctrl+C**：中断当前操作
- **直接粘贴**：可以直接粘贴代码片段让 Claude 分析
- **@文件名**：在对话中引用特定文件



 
## CLAUDE.md 配置详解

### 什么是 CLAUDE.md

CLAUDE.md 是 Claude Code 的项目级配置文件，类似于 .cursorrules 或 .github/copilot-instructions.md。它告诉 Claude Code 如何理解和使用你的项目。

### 配置层级

CLAUDE.md 支持多个层级，优先级从高到低：

1. **项目级**：<项目根目录>/.claude/CLAUDE.md — 对整个项目生效
2. **用户级**：\~/.claude/CLAUDE.md — 对所有项目生效
3. **命令行指定**：通过 --append-system-prompt 参数传入

### CLAUDE.md 示例内容

```plain
# 项目说明
这是一个 Android Camera HAL 项目，基于 MTK 平台。


# 代码规范
- 使用 C++17 标准
- 命名遵循 Google C++ Style Guide
- 注释使用中文


# 重要目录
- vendor/mediatek/proprietary/hardware/mtkcam/ — Camera HAL 主目录
- vendor/mediatek/proprietary/hardware/mtkcam/pipeline/ — Pipeline 模型
- vendor/mediatek/proprietary/hardware/mtkcam/utils/ — 工具类


# 注意事项
- 修改 HAL 层代码需要同步更新对应的单元测试
- ISP 参数调优需联系 MTK FAE 确认
```

### 使用 @ 引用外部文件

在 CLAUDE.md 中可以使用 @ 语法引用其他文件：

```plain
@/path/to/skill/SKILL.md
```

这样可以在不修改 CLAUDE.md 的情况下，动态加载额外的指令。



 
## Memory（记忆系统）

### 什么是 Memory

Memory 是 Claude Code 的持久化记忆机制，可以将重要的上下文信息保存下来，在后续会话中自动加载，避免重复说明。

### Memory 文件位置

- **目录**：\~/.claude/projects/<项目哈希>/memory/
- **索引文件**：MEMORY.md — 每次启动时自动加载

### Memory 的分类

| 类型 | 说明 | 示例 |
| user | 用户信息（角色、偏好） | "用户是 Camera HAL 开发工程师" |
| feedback | 工作反馈和改进建议 | "分析 log 时优先检查 mtkcam 关键字" |
| project | 项目约束和目标 | "当前项目基于 MTK Kompanie 平台" |
| reference | 外部资源引用 | "MTK Camera 调试文档链接" |
 
 
### Memory 文件格式

```plain
---
name: my-memory-slug
description: 一句话描述，用于判断是否相关
metadata:
  type: user | feedback | project | reference
---


具体的记忆内容。
可以包含 [[other-memory-name]] 来关联其他记忆。
```

### 常用 Memory 操作

- **保存记忆**：直接让 Claude "记住这个信息"，会自动创建记忆文件
- **查看记忆**：检查 \~/.claude/projects/ 下的 MEMORY.md
- **更新记忆**：直接编辑对应的 .md 文件
- **删除记忆**：删除对应的 .md 文件，并更新 MEMORY.md 索引



 
## MCP Server 配置

### 什么是 MCP

MCP（Model Context Protocol）是 Claude Code 的扩展协议，允许连接外部工具和数据源，扩展 Claude Code 的能力。

### 配置方式

在 \~/.claude/settings.json 中配置 MCP Server：

```plain
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "@my-org/my-mcp-server"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

### 常用 MCP Server 示例

| MCP Server | 用途 | 安装方式 |
| filesystem | 文件系统操作 | 内置 |
| shimo-mcp-doc | 石墨文档集成 | 公司内部配置 |
| github | GitHub 操作 | `npx -y @modelcontextprotocol/server-github` |
| postgres | 数据库查询 | `npx -y @modelcontextprotocol/server-postgres` |
 
 
### MCP Server 管理命令

- /mcp — 查看当前已连接的 MCP Server 状态
- 在 settings.json 中添加/删除 MCP Server 配置后需重启 Claude Code



 
## Hooks（钩子机制）

### 什么是 Hooks

Hooks 允许你在 Claude Code 执行特定操作前后自动运行自定义脚本，实现自动化工作流。

### 配置位置

在 \~/.claude/settings.json 或项目 .claude/settings.json 中配置：

```plain
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'File modified' >> /tmp/claude-changes.log"
          }
        ]
      }
    ]
  }
}
```

### 可用的 Hook 事件

| 事件 | 触发时机 | 用途 |
| PreToolUse | 工具调用前 | 权限检查、参数校验 |
| PostToolUse | 工具调用后 | 日志记录、自动格式化 |
| Notification | 发送通知时 | 自定义通知方式 |
| Stop | Claude 停止响应时 | 自动化收尾工作 |
 
 


 
## 权限管理

### 权限层级

Claude Code 的权限管理分为三级：

1. **全局配置**：\~/.claude/settings.json — 对所有项目生效
2. **项目配置**：<项目>/.claude/settings.json — 仅对当前项目生效
3. **会话配置**：运行时动态授权

### 常见权限配置

```plain
{
  "permissions": {
    "allow": [
      "Bash(git log*)",
      "Bash(git diff*)",
      "Bash(git show*)",
      "Bash(ls *)",
      "Bash(cat *)",
      "Bash(find *)",
      "Bash(grep *)",
      "Read",
      "Glob",
      "Grep"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(sudo *)"
    ]
  }
}
```

### 权限模式

- **默认模式**：每次执行都需要用户确认
- **自动接受**：claude --dangerously-skip-permissions（不推荐）
- **Yolo 模式**：在设置中配置信任的操作自动执行



 
## 常见问题排查（FAQ）

### 连接问题

**Q: 连接 Claude Code 时报认证错误？**

A: 检查以下几点：

1. API Key 是否正确配置（ANTHROPIC_AUTH_TOKEN）
2. Base URL 是否正确（ANTHROPIC_BASE_URL）
3. 网络是否能访问到服务端点
4. Linux 下是否执行了 source \~/.bashrc

**Q: 个人调试云连接不稳定？**

A:

1. 检查 SSH 连接是否稳定
2. 确认云服务器资源是否充足
3. 尝试重启 Claude Code 进程

### 性能问题

**Q: Claude Code 响应很慢？**

A:

1. 使用 /compact 压缩上下文
2. 检查当前模型是否过大（尝试切换到更快的模型）
3. 减少不必要的文件读取
4. 使用 CLAUDE.md 预加载常用上下文，减少重复说明

**Q: Token 消耗太快？**

A:

1. 使用 /cost 查看消耗详情
2. 善用 /compact 管理上下文窗口
3. 避免让 Claude 读取过大的文件（优先用 Grep 定位关键部分）
4. 使用 Skill 进行定向分析，而非让 Claude 自由遍历

### Skill 相关

**Q: Skill 加载后不生效？**

A:

1. 确认 SKILL.md 文件路径正确
2. 确认 CLAUDE.md 中正确引用了 Skill（使用 @ 语法）
3. 重启 Claude Code
4. 使用对话验证：直接询问 Claude 当前可用的 Skill

**Q: 如何自定义 Skill？**

A: 创建 SKILL.md 文件，格式如下：

```plain
---
name: my-custom-skill
description: 自定义技能描述
triggers:
  - 关键词1
  - 关键词2
---


# 技能说明


具体的分析步骤和指令...
```



 
## 最佳实践

### 1. 高效使用 Skill 进行日志分析

- **先选对 Skill**：根据问题类型选择对应的 Skill（如 camera-log-analyzer、camera-thermal-analysis）
- **提供关键信息**：在提问时说明设备型号、问题现象、复现步骤
- **分步分析**：复杂问题先做 pre-analysis，再深入分析

### 2. 上下文管理

- **善用 CLAUDE.md**：把项目约定、目录结构提前写在 CLAUDE.md 中
- **使用 Memory**：让 Claude 记住你的偏好和常用操作
- **及时压缩**：长对话中使用 /compact 释放空间

### 3. 代码修改安全

- **先审后改**：让 Claude 先分析再修改，避免误改
- **增量修改**：使用 Edit 而非 Write，减少出错风险
- **版本控制**：重要修改前先 git commit，方便回滚

### 4. 团队协作

- **共享 CLAUDE.md**：将项目级 CLAUDE.md 加入版本控制
- **统一 Skill 配置**：团队共享 Skill 文件，保持分析标准一致
- **规范 Mode 配置**：统一团队使用的 Mode，确保输出质量



 
## 快速参考卡片

### 日常使用流程

```plain
1. 启动 Claude Code
   └─ claude


2. 选择合适的 Mode
   └─ /model 切换模型


3. 使用 Skill 分析问题
   └─ /camera-log-analyzer 或 /camera-thermal-analysis


4. 管理上下文
   └─ /compact 压缩 / /clear 清除


5. 退出
   └─ /quit 或 Ctrl+C
```

### Mode 选择建议

| 场景 | 推荐 Mode | 说明 |
| 日常对话 | 默认 Sonnet | 平衡速度与质量 |
| 复杂代码分析 | Opus | 更强的推理能力 |
| 快速查询 | Haiku | 速度最快，成本低 |
| 日志深度分析 | 自定义 Mode | 结合 Skill 使用 |
