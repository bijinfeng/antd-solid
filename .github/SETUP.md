# GitHub Actions 自动发布设置指南

## 🎯 目标

实现在 main 分支合并 PR 后自动发布 npm 包。

## 📋 前置条件

1. ✅ 项目已配置 changeset
2. ✅ 所有包的 package.json 配置正确
3. ✅ npm 账号有发布权限

## 🔧 设置步骤

### 1. 获取 NPM Token

1. 登录 npm 官网：https://www.npmjs.com/
2. 点击头像 → Access Tokens
3. 点击 "Generate New Token" → "Classic Token"
4. 选择 "Automation" 类型
5. 复制生成的 token（只显示一次！）

### 2. 配置 GitHub Secret

1. 打开 GitHub 仓库页面
2. 进入 Settings → Secrets and variables → Actions
3. 点击 "New repository secret"
4. 添加 secret：
   - Name: `NPM_TOKEN`
   - Secret: 粘贴你的 npm token
5. 点击 "Add secret"

### 3. 验证配置

检查以下文件是否存在：

- ✅ `.github/workflows/release.yml` - 发布工作流
- ✅ `.github/workflows/ci.yml` - CI 工作流
- ✅ `.changeset/config.json` - Changeset 配置

### 4. 测试发布流程

#### 方式一：创建测试 changeset

```bash
# 1. 创建一个测试 changeset
pnpm changeset

# 选择一个包（如 @antd-solidjs/cssinjs）
# 选择 patch 版本
# 输入说明：test release workflow

# 2. 提交并推送
git add .
git commit -m "chore: test release workflow"
git push origin main

# 3. 观察 GitHub Actions
# 访问：https://github.com/YOUR_USERNAME/antd-solid/actions
# 应该看到两个工作流运行：
# - CI (运行测试)
# - Release (创建 Version Packages PR)

# 4. 合并 Version Packages PR
# 合并后会自动发布到 npm
```

#### 方式二：手动触发（调试用）

如果需要调试，可以修改 `release.yml` 添加手动触发：

```yaml
on:
  push:
    branches:
      - main
  workflow_dispatch:  # 添加这行，允许手动触发
```

## 📊 工作流说明

### CI 工作流 (ci.yml)

在每次 push 和 PR 时运行：

```
┌─────────────┐
│   Push/PR   │
└──────┬──────┘
       │
       ├─────► Lint (Biome 检查)
       │
       ├─────► Type Check (TypeScript 检查)
       │
       ├─────► Test (运行测试)
       │
       └─────► Build (构建包)
```

### Release 工作流 (release.yml)

在 main 分支 push 时运行：

```
┌──────────────┐
│ Push to main │
└──────┬───────┘
       │
       ├─────► 检查 changesets
       │
       ├─────► 如果有未发布的 changesets
       │       │
       │       ├─────► 创建/更新 "Version Packages" PR
       │       │       - 更新版本号
       │       │       - 更新 CHANGELOG
       │       │       - 更新 lockfile
       │       │
       │       └─────► 等待 PR 合并
       │
       └─────► PR 合并后
               │
               ├─────► 构建所有包
               │
               ├─────► 发布到 npm
               │
               └─────► 创建 GitHub Release
```

## 🎯 使用流程

### 日常开发

```bash
# 1. 开发功能
git checkout -b feat/new-feature
# ... 编写代码 ...

# 2. 创建 changeset
pnpm changeset

# 3. 提交代码
git add .
git commit -m "feat: add new feature"
git push

# 4. 创建 PR 并合并到 main
```

### 发布新版本

```bash
# 合并 PR 到 main 后，GitHub Actions 会自动：
# 1. 创建 "Version Packages" PR
# 2. 等待你 review 并合并
# 3. 自动发布到 npm
```

## 🔍 故障排查

### 问题 1: Release 工作流失败

**检查项：**
1. NPM_TOKEN 是否正确配置？
   ```bash
   # 在 GitHub Actions 日志中查看是否有认证错误
   ```

2. npm 账号是否有发布权限？
   ```bash
   # 本地测试
   npm whoami
   npm access ls-packages
   ```

3. 包名是否已被占用？
   ```bash
   npm view @antd-solidjs/cssinjs
   ```

### 问题 2: CI 工作流失败

**检查项：**
1. 测试是否通过？
   ```bash
   pnpm test
   ```

2. 类型检查是否通过？
   ```bash
   pnpm typecheck
   ```

3. 构建是否成功？
   ```bash
   pnpm build
   ```

### 问题 3: 没有创建 Version Packages PR

**可能原因：**
1. 没有未发布的 changesets
   ```bash
   # 检查 .changeset 目录
   ls .changeset/
   ```

2. changeset 配置错误
   ```bash
   # 检查 .changeset/config.json
   cat .changeset/config.json
   ```

## 📚 相关命令

```bash
# 查看待发布的变更
pnpm changeset status

# 创建 changeset
pnpm changeset

# 本地预览版本更新
pnpm version

# 手动发布（不推荐）
pnpm release

# 查看 GitHub Actions 日志
gh run list
gh run view <run-id>
```

## ⚙️ 高级配置

### 1. 配置发布到私有 npm registry

修改 `.github/workflows/release.yml`:

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'
    registry-url: 'https://your-registry.com'  # 修改这里
```

### 2. 添加发布通知

在 `release.yml` 末尾添加：

```yaml
- name: Send notification
  if: steps.changesets.outputs.published == 'true'
  run: |
    curl -X POST ${{ secrets.WEBHOOK_URL }} \
      -H 'Content-Type: application/json' \
      -d '{"text":"New packages published!"}'
```

### 3. 配置多个 npm registry

```yaml
- name: Publish to multiple registries
  if: steps.changesets.outputs.published == 'true'
  run: |
    # 发布到 npm
    pnpm publish -r --registry https://registry.npmjs.org

    # 发布到私有 registry
    pnpm publish -r --registry https://your-registry.com
```

## ✅ 检查清单

发布前确认：

- [ ] NPM_TOKEN 已配置
- [ ] 所有测试通过
- [ ] 构建成功
- [ ] CHANGELOG 更新正确
- [ ] 版本号符合语义化版本规范
- [ ] 包名在 npm 上可用
- [ ] README 和文档已更新

## 🎉 完成！

现在你的项目已经配置好自动发布流程了！

每次合并 PR 到 main 分支，只需：
1. 等待 "Version Packages" PR 创建
2. Review 并合并
3. 自动发布到 npm ✨
