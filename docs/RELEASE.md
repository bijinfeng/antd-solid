# Changeset + GitHub Actions 自动发布流程

本项目使用 [Changesets](https://github.com/changesets/changesets) 结合 GitHub Actions 实现自动化的 npm 包发布流程。

## 📋 工作流程

### 1. 开发阶段

当你完成一个功能或修复后，需要创建一个 changeset：

```bash
# 创建 changeset
pnpm changeset

# 或者使用简写
pnpm changeset add
```

这会启动一个交互式命令行工具，询问：
- 哪些包需要发布？
- 版本类型（major/minor/patch）？
- 变更说明？

示例：
```bash
? Which packages would you like to include?
  ◉ @antd-solidjs/cssinjs
  ◯ @antd-solidjs/icons
  ◯ @antd-solidjs/util

? What kind of change is this for @antd-solidjs/cssinjs?
  ◯ major (breaking change)
  ◉ minor (new feature)
  ◯ patch (bug fix)

? Please enter a summary for this change
  Add linters and transformers support
```

这会在 `.changeset/` 目录下创建一个 markdown 文件，记录本次变更。

### 2. 提交代码

```bash
git add .
git commit -m "feat(cssinjs): add new features"
git push origin main
```

### 3. 自动化流程

#### 当代码推送到 main 分支时：

1. **CI 工作流** (`.github/workflows/ci.yml`) 会自动运行：
   - ✅ Lint 检查
   - ✅ 类型检查
   - ✅ 运行测试
   - ✅ 构建包

2. **Release 工作流** (`.github/workflows/release.yml`) 会：
   - 检查是否有未发布的 changesets
   - 如果有，创建或更新一个 "Version Packages" PR
   - 这个 PR 会包含：
     - 更新的 package.json 版本号
     - 更新的 CHANGELOG.md
     - 更新的 pnpm-lock.yaml

#### 当 "Version Packages" PR 被合并时：

1. Release 工作流会自动：
   - 构建所有包
   - 发布到 npm
   - 创建 GitHub Release
   - 打上 git tag

## 🔧 配置说明

### 1. GitHub Secrets

需要在 GitHub 仓库设置中添加以下 secrets：

**NPM_TOKEN** (必需)
- 访问 https://www.npmjs.com/settings/YOUR_USERNAME/tokens
- 创建一个 "Automation" 类型的 token
- 在 GitHub 仓库 Settings → Secrets and variables → Actions → New repository secret
- 名称：`NPM_TOKEN`
- 值：你的 npm token

### 2. Changeset 配置

`.changeset/config.json`:
```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.2/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

关键配置说明：
- `access: "public"` - 发布为公开包
- `baseBranch: "main"` - 基础分支
- `commit: false` - 不自动提交（由 GitHub Actions 处理）

### 3. Package.json Scripts

```json
{
  "scripts": {
    "version": "changeset version && pnpm i --no-frozen-lockfile && git add .",
    "release": "pnpm build && changeset publish"
  }
}
```

## 📝 版本规范

遵循 [Semantic Versioning](https://semver.org/)：

- **Major (1.0.0 → 2.0.0)**: 破坏性变更
  ```bash
  pnpm changeset
  # 选择 major
  ```

- **Minor (1.0.0 → 1.1.0)**: 新功能，向后兼容
  ```bash
  pnpm changeset
  # 选择 minor
  ```

- **Patch (1.0.0 → 1.0.1)**: Bug 修复
  ```bash
  pnpm changeset
  # 选择 patch
  ```

## 🎯 最佳实践

### 1. 每个 PR 都应该包含 changeset

如果你的 PR 包含需要发布的变更，应该包含一个 changeset 文件：

```bash
# 在 PR 分支上
pnpm changeset
git add .changeset/
git commit -m "chore: add changeset"
git push
```

### 2. Changeset 消息规范

写清楚的变更说明，这些会出现在 CHANGELOG 中：

✅ 好的示例：
```
Add linters system with 5 built-in linters for CSS validation
```

❌ 不好的示例：
```
update code
```

### 3. 多包发布

如果你的变更影响多个包，在创建 changeset 时选择所有相关的包：

```bash
pnpm changeset
# 选择多个包
# 为每个包指定版本类型
```

### 4. 预发布版本

如果需要发布 beta 或 alpha 版本：

```bash
# 进入预发布模式
pnpm changeset pre enter beta

# 创建 changeset
pnpm changeset

# 发布
pnpm version
pnpm release

# 退出预发布模式
pnpm changeset pre exit
```

## 🔍 常见问题

### Q: 如何跳过某个包的发布？

A: 在 `.changeset/config.json` 的 `ignore` 数组中添加包名：
```json
{
  "ignore": ["@antd-solidjs/docs"]
}
```

### Q: 如何手动发布？

A: 如果需要手动发布（不推荐）：
```bash
# 1. 更新版本
pnpm version

# 2. 构建
pnpm build

# 3. 发布
pnpm release
```

### Q: 发布失败了怎么办？

A: 检查以下几点：
1. NPM_TOKEN 是否正确配置
2. npm 账号是否有发布权限
3. 包名是否已被占用
4. 查看 GitHub Actions 日志

### Q: 如何回滚发布？

A: npm 不支持删除已发布的版本，但可以废弃：
```bash
npm deprecate @antd-solidjs/cssinjs@1.0.0 "This version has critical bugs"
```

## 📚 相关资源

- [Changesets 文档](https://github.com/changesets/changesets)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [npm 发布指南](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)

## 🎉 示例工作流

完整的发布流程示例：

```bash
# 1. 创建功能分支
git checkout -b feat/new-feature

# 2. 开发功能
# ... 编写代码 ...

# 3. 创建 changeset
pnpm changeset
# 选择包：@antd-solidjs/cssinjs
# 选择类型：minor
# 输入说明：Add new transformer for CSS optimization

# 4. 提交代码
git add .
git commit -m "feat(cssinjs): add CSS optimization transformer"
git push origin feat/new-feature

# 5. 创建 PR 并合并到 main

# 6. GitHub Actions 自动创建 "Version Packages" PR

# 7. Review 并合并 "Version Packages" PR

# 8. 🎉 自动发布到 npm！
```

## ⚠️ 注意事项

1. **首次发布前**，确保所有包的 `package.json` 中的 `version` 字段正确
2. **NPM_TOKEN** 必须有发布权限
3. **包名** 必须在 npm 上可用（未被占用）
4. **构建** 必须成功，否则发布会失败
5. **测试** 应该全部通过
6. 发布后的版本**无法删除**，只能废弃

## 🚀 快速开始

1. 配置 NPM_TOKEN secret
2. 开发功能
3. 运行 `pnpm changeset`
4. 提交并推送到 main
5. 等待自动发布 ✨
