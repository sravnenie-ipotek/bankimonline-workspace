# SAFER OPTION: Revoke and Rotate the Jira Token

Instead of rewriting git history (which is destructive), you can simply **revoke the exposed token** and create a new one. This is the recommended approach!

## Steps:

### 1. Revoke the Exposed Token
1. Go to: https://id.atlassian.com/manage-profile/security/api-tokens
2. Find the token that was exposed
3. Click "Revoke" to disable it immediately
4. The exposed token becomes useless - no security risk!

### 2. Create a New Token
1. Click "Create API token"
2. Give it a name like "BankimOnline QA"
3. Copy the new token

### 3. Update Your Local .env.jira
```bash
# Edit the .env.jira file with the new token
JIRA_EMAIL=aizek941977@gmail.com
JIRA_API_TOKEN=your-new-token-here
JIRA_PROJECT_KEY=TVKC
```

### 4. Allow the Old (Revoked) Token in GitHub
Since the old token is now revoked and harmless:
1. Go to: https://github.com/sravnenie-ipotek/bankimonline-workspace/security/secret-scanning/unblock-secret/31adTrTc12ocFfZnMoUDBsQ6zw5
2. Click "Allow secret" - it's safe because the token is revoked
3. Your push will now work

## Why This is Better:
- ✅ No git history rewriting
- ✅ No risk of breaking the repository
- ✅ Immediate security (token is revoked)
- ✅ Can push your changes right away
- ✅ No need for collaborators to re-clone

## This is the Industry Standard Practice!
When a token is accidentally exposed:
1. **Revoke it immediately** (makes it harmless)
2. **Create a new one**
3. **Update your code to use environment variables** (which we already did!)

The exposed token in git history doesn't matter once it's revoked - it's just a dead string of characters.