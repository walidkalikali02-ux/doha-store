# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it by emailing security@example.com.

Do not create a public GitHub issue for security vulnerabilities.

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- Initial response: within 48 hours
- Triage: within 7 days
- Fix: depends on severity

## Security Best Practices

### Environment Variables

- Never commit `.env` files to the repository
- Use GitHub Secrets for CI/CD
- Rotate API keys regularly
- Use different keys for development and production

### Dependencies

- Keep dependencies updated
- Monitor for security advisories
- Use Dependabot for automatic updates

### Authentication

- Use Supabase Auth for user authentication
- Implement proper session management
- Use secure HTTP-only cookies
- Enable CSRF protection

### API Keys

- Store API keys in Supabase Edge Functions for sensitive operations
- Never expose secret keys in frontend code
- Use environment variables for configuration

### Input Validation

- Validate all user inputs
- Sanitize data before storage
- Use prepared statements for database queries
- Implement rate limiting
