# Contributing

Thank you for your interest in contributing to Crescent.js! This guide will help you get started.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/rocket.js.git
   cd rocket.js
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/my-feature
   ```

---

## Development Setup

```bash
# Run the project
node src/rocket.js

# Run tests
npm test
```

---

## Code Style

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Use **camelCase** for variable and function names
- Use **PascalCase** for class names
- Add **JSDoc comments** for public methods
- Keep lines under **100 characters**

---

## Making Changes

### Bug Fixes

1. Check if the bug is already reported in [Issues](../../issues)
2. If not, open a new issue describing the bug
3. Fork and create a branch (`fix/bug-name`)
4. Write a fix with a clear commit message
5. Submit a pull request referencing the issue

### New Features

1. Open an issue proposing the feature first
2. Discuss the approach with maintainers
3. Fork and create a branch (`feature/feature-name`)
4. Implement the feature with tests
5. Update documentation
6. Submit a pull request

---

## Pull Request Guidelines

- **One feature/fix per PR** — Keep PRs focused
- **Clear description** — Explain what and why
- **Update docs** — If you change behavior, update the docs
- **Follow existing patterns** — Match the codebase style
- **Test your changes** — Ensure nothing is broken

---

## Reporting Issues

When reporting bugs, please include:

- **Crescent.js version** you're using
- **Node.js version** (`node -v`)
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Error messages** or stack traces

---

## License

By contributing to Crescent.js, you agree that your contributions will be licensed under the project's [MIT License with AI Training Restrictions](../LICENSE).