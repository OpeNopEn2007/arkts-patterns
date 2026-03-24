# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.1.x   | :white_check_mark: |
| < 2.1.0 | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Do NOT** open a public issue
2. Email: security@example.com (replace with actual email)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Time

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Resolution**: Depends on severity

### Disclosure Policy

- Please do not disclose the vulnerability publicly until a fix is released
- We will credit you in the security advisory (if desired)

## Security Best Practices

When using this skill:

1. **Never hardcode secrets** - Use environment variables or secure storage
2. **Validate input** - Always sanitize user input
3. **Use HTTPS** - For all network requests
4. **Keep dependencies updated** - Regularly update DevEco Studio and SDK

## Known Security Considerations

### ArkTS Specific

- **@ohos.net.http**: Always destroy HTTP requests after use
- **Data persistence**: Encrypt sensitive data before storing
- **TaskPool**: Be careful with sensitive data in background tasks

### General

- Review generated code before using in production
- Test thoroughly for edge cases
- Follow HarmonyOS security guidelines

## Security Updates

Security updates will be released as patch versions and announced in:
- GitHub Releases
- Repository Security Advisories