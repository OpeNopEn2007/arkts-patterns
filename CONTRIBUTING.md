# Contributing to ArkTS Patterns

Thank you for your interest in contributing to ArkTS Patterns! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Issues

1. Check if the issue already exists in [GitHub Issues](https://github.com/OpeNopEn2007/arkts-patterns/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce (if applicable)
   - Expected vs actual behavior
   - Environment details (HarmonyOS API version, DevEco Studio version)

### Submitting Changes

1. **Fork the repository**
   ```bash
   gh repo fork OpeNopEn2007/arkts-patterns
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Update documentation if needed
   - Add examples for new patterns

4. **Test your changes**
   - Ensure the SKILL.md follows the correct format
   - Verify YAML frontmatter is valid
   - Test the skill with Claude Code

5. **Commit your changes**
   ```bash
   git commit -m "feat: add new pattern for X"
   ```

   Use conventional commit format:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation changes
   - `refactor:` for code refactoring

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   gh pr create --title "feat: add new pattern for X" --body "Description of changes"
   ```

## Skill Quality Standards

When adding or modifying skills, ensure:

- [ ] SKILL.md has valid YAML frontmatter (name, description)
- [ ] Description clearly states when to activate
- [ ] Instructions are specific and actionable
- [ ] Examples demonstrate real-world usage
- [ ] No hardcoded secrets or sensitive data

## Pattern Guidelines

For new ArkTS patterns:

1. **Verify against official docs** - Check [HarmonyOS documentation](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-dev-guide-V5)
2. **Test with latest API** - Ensure compatibility with API 12+
3. **Include error handling** - Show robust patterns
4. **Add benchmark test** - Create eval in `evals.json`

## Directory Structure

```
arkts-patterns/
├── SKILL.md              # Main skill file (DO NOT rename)
├── README.md             # GitHub documentation
├── benchmark.md          # Quality metrics
├── knowledge-base/       # Reference documentation
│   ├── architecture/     # Ability, Stage model
│   ├── language/         # Decorators, concurrency
│   └── patterns/         # Implementation patterns
└── .claude-plugin/
    └── marketplace.json  # Marketplace config
```

## Questions?

- Open a [GitHub Discussion](https://github.com/OpeNopEn2007/arkts-patterns/discussions)
- Join our community

Thank you for contributing! 🎉