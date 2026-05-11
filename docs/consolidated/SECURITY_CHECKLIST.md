# Security Checklist

Before deploying to production, verify these security measures are in place:

## ✅ Required

- [ ] **Encryption key configured** in Webflow Cloud environment variables
  - Variable name: `ENCRYPTION_KEY`
  - Type: Secret (encrypted)
  - Length: 32+ characters
  - Generate: `openssl rand -base64 32`

- [ ] **D1 database binding** configured in Webflow Cloud
  - Binding name: `DB`
  - Type: SQLite (D1)
  - Initialized: Run "Initialize Database" in admin panel

- [ ] **Service account credentials** have minimal permissions
  - Only BigQuery Data Viewer
  - Only BigQuery Job User
  - No admin or write permissions

## ✅ Recommended

- [ ] **IP whitelisting** for admin endpoints (if supported)
- [ ] **Authentication** added to admin panel
- [ ] **Rate limiting** on query execution
- [ ] **Audit logging** for credential access
- [ ] **Monitoring** for failed queries or auth attempts

## ✅ Data Protection

- [x] **Credentials encrypted at rest** (AES-256-GCM)
- [x] **Credentials never sent to client**
- [x] **GET endpoints exclude sensitive data**
- [ ] **Query results cached** (reduces API calls)
- [ ] **Cache expiration** configured (default: 1 hour)

## ✅ Code Security

- [x] **No credentials in code**
- [x] **Environment variables for secrets**
- [x] **TypeScript for type safety**
- [x] **Input validation** on all endpoints
- [ ] **Error messages sanitized** (no stack traces to client)

## ⚠️ Known Limitations

- **No authentication**: Admin panel is publicly accessible
  - Mitigation: Deploy on private network or add auth
  
- **No rate limiting**: Queries can be spammed
  - Mitigation: Add Cloudflare rate limiting rules
  
- **No audit trail**: No logging of who accessed what
  - Mitigation: Add logging middleware

## 📋 Pre-Deployment Checklist

1. Generate encryption key: `openssl rand -base64 32`
2. Add `ENCRYPTION_KEY` to Webflow Cloud environment variables
3. Create D1 database binding named `DB`
4. Deploy to Webflow Cloud
5. Visit `/admin` and click "Initialize Database"
6. Add first hotel configuration
7. Test query execution
8. Verify credentials are encrypted in DB viewer
9. Test client dashboard with real data
10. Monitor for errors in logs

## 🔄 Maintenance

- **Key rotation**: Every 6-12 months
- **Permission review**: Quarterly
- **Dependency updates**: Monthly
- **Security audit**: Annually

## 🆘 Incident Response

If credentials are compromised:
1. Rotate encryption key immediately
2. Regenerate all service account keys in Google Cloud
3. Update credentials in admin panel
4. Review access logs
5. Notify security team

## 📚 References

- [ENCRYPTION_SETUP.md](./ENCRYPTION_SETUP.md) - Detailed encryption guide
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Full deployment instructions
- [WEBFLOW_COMPLETE_GUIDE.md](./WEBFLOW_COMPLETE_GUIDE.md) - Webflow integration
