# DNS Configuration for dev2.bankimonline.com

## Required DNS Records

Add these records to your DNS provider:

### A Records
```
Type: A
Name: dev2
Value: 45.83.42.74
TTL: 300 (5 minutes for testing, increase to 3600 later)
```

```
Type: A
Name: www.dev2
Value: 45.83.42.74
TTL: 300
```

### For Admin Panel (Future)
```
Type: A
Name: admin.dev2
Value: 45.83.42.74
TTL: 300
```

## DNS Providers Instructions

### Cloudflare
1. Log in to Cloudflare Dashboard
2. Select your domain (bankimonline.com)
3. Go to DNS settings
4. Add A record for "dev2" pointing to 45.83.42.74
5. Set Proxy status to "DNS only" initially (orange cloud OFF)

### GoDaddy
1. Log in to GoDaddy Account
2. Go to Domain Management
3. Select bankimonline.com
4. Click "Manage DNS"
5. Add A record: Host="dev2", Points to="45.83.42.74"

### Namecheap
1. Log in to Namecheap
2. Go to Domain List
3. Click "Manage" next to bankimonline.com
4. Go to "Advanced DNS"
5. Add A record: Host="dev2", Value="45.83.42.74"

## Verification

After adding DNS records, verify with:
```bash
# Check DNS propagation
dig dev2.bankimonline.com
nslookup dev2.bankimonline.com

# Test connectivity
curl -I http://dev2.bankimonline.com
```

## Current Status
- ✅ Server configured at 45.83.42.74
- ✅ Nginx configured for dev2.bankimonline.com
- ✅ Application running on port 8003
- ⏳ Waiting for DNS records to be added
- ⏳ SSL certificate pending

