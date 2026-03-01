# ✅ GitHub Actions 自动发布配置完成

## 📦 已创建的文件

### 1. GitHub Actions 工作流

- **`.github/workflows/release.yml`** - 自动发布工作流
  - 检测 changesets 并创建 Version Packages PR
  - PR 合并后自动发布到 npm
  - 支持 npm provenance

- **`.github/workflows/ci.yml`** - CI 工作流
  - Lint 检查 (Biome)
  - 类型检查 (TypeScript)
  - 运行测试 (Vitest)
  - 构建包

### 2. 文档

- **`.github/SETUP.md`** - 详细设置指南
  - NPM Token 配置步骤
  - 工作流说明
  - 故障排查指南

- **`.github/QUICK_START.md`** - 快速参考
  - 一分钟发布流程
  - 常用命令
  - 版本类型说明

- **`docs/RELEASE.md`** - 完整发布流程文档
  - 详细的工作流程说明
  - 最佳实践
  - 常见问题解答

- **`.github/pull_request_template.md`** - PR 模板
  - 提醒添加 changeset
  - 标准化 PR 格式

## 🚀 下一步操作

### 1. 配置 NPM Token (必需)

```bash
# 1. 访问 https://www.npmjs.com/settings/YOUR_USERNAME/tokens
# 2. 创建 "Automation" 类型的 token
# 3. 在 GitHub 仓库设置中添加 secret:
#    Settings → Secrets and variables → Actions → New repository secret
#    Name: NPM_TOKEN
#    Value: 你的 npm token
```

### 2. 推送配置到远程

```bash
git push origin main
```

### 3. 测试发布流程

```bash
# 创建一个测试 changeset
pnpm changeset

# 选择一个包，选择 patch 版本
# 输入说明：test automated release

# 提交并推送
git add .
git commit -m "chore: test automated release"
git push origin main

# 访问 GitHub Actions 查看工作流运行
# https://github.com/bijinfeng/antd-solid/actions
```

## 📊 工作流程图

```
开发者提交代码
    ↓
推送到 main 分支
    ↓
触发 CI 工作流 (测试、构建)
    ↓
触发 Release 工作流
    ↓
检测到 changesets
    ↓
创建 "Version Packages" PR
    ├─ 更新版本号
    ├─ 更新 CHANGELOG
    └─ 更新 lockfile
    ↓
Review 并合并 PR
    ↓
自动发布到 npm
    ├─ 构建所有包
    ├─ 发布到 npm registry
    └─ 创建 GitHub Release
    ↓
✅ 发布完成！
```

## 🎯 使用示例

### 场景 1: 发布新功能

```bash
# 1. 开发功能
git checkout -b feat/new-transformer
# ... 编写代码 ...

# 2. 创建 changeset
pnpm changeset
# 选择: @antd-solidjs/cssinjs
# 类型: minor
# 说明: Add new CSS transformer

# 3. 提交并推送
git add .
git commit -m "feat(cssinjs): add new transformer"
git push origin feat/new-transformer

# 4. 创建 PR 并合并到 main

# 5. 等待 "Version Packages" PR 创建

# 6. Review 并合并

# 7. 🎉 自动发布！
```

### 场景 2: 修复 Bug

```bash
# 1. 修复 bug
git checkout -b fix/style-issue
# ... 修复代码 ...

# 2. 创建 changeset
pnpm changeset
# 选择: @antd-solidjs/cssinjs
# 类型: patch
# 说明: Fix style rendering issue

# 3. 提交并推送
git add .
git commit -m "fix(cssinjs): fix style rendering"
git push origin fix/style-issue

# 4. 创建 PR 并合并

# 5. 自动发布 patch 版本
```

## ⚙️ 配置说明

### Release 工作流关键配置

```yaml
# .github/workflows/release.yml

# 权限配置
permissions:
  contents: write      # 创建 release
  pull-requests: write # 创建 PR
  id-token: write      # npm provenance

# Changesets Action
uses: changesets/action@v1
with:
  publish: pnpm release  # 发布命令
  version: pnpm version  # 版本更新命令
  commit: 'chore: version packages'
  title: 'chore: version packages'
```

### CI 工作流关键配置

```yaml
# .github/workflows/ci.yml

# 触发条件
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# 并行运行多个 job
jobs:
  lint:    # Biome 检查
  typecheck: # TypeScript 检查
  test:    # 运行测试
  build:   # 构建包
```

## 📋 检查清单

发布前确认：

- [ ] ✅ NPM_TOKEN 已配置
- [ ] ✅ GitHub Actions 工作流文件已创建
- [ ] ✅ 所有包的 package.json 配置正确
- [ ] ✅ 测试全部通过
- [ ] ✅ 构建成功
- [ ] ✅ 文档已更新

## 🔗 相关链接

- [Changesets 文档](https://github.com/changesets/changesets)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [npm 发布指南](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)

## 💡 提示

1. **首次发布**需要手动配置 NPM_TOKEN
2. **每个需要发布的 PR** 都应该包含 changeset
3. **Version Packages PR** 会自动创建，不需要手动创建
4. **发布后的版本无法删除**，只能废弃
5. 可以在 GitHub Actions 页面查看详细日志

## 🎉 完成！

现在你的项目已经配置好自动发布流程了！

下次提交代码时：
1. 运行 `pnpm changeset` 创建变更记录
2. 推送到 main 分支
3. 等待自动发布 ✨

---

**需要帮助？** 查看 [详细文档](.github/SETUP.md) 或 [快速参考](.github/QUICK_START.md)
