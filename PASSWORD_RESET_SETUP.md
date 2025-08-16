# 🔐 Password Reset Setup Guide

## Overview
Your ToolThinker platform now has a complete forgot password functionality that sends secure reset links via email.

## 🚀 Quick Setup

### 1. Environment Variables
Create a `.env` file in your `backend` directory with these email settings:

```bash
# Email Configuration (Required for forgot password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Frontend URL (Required for reset links)
FRONTEND_URL=http://localhost:5173
```

### 2. Gmail Setup (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password as `SMTP_PASS`

### 3. Alternative Email Providers

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
```

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

## 🧪 Testing the Setup

### 1. Start Your Servers
```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

### 2. Test the Flow
1. Go to your login page
2. Enter an email address
3. Click "Forgot password?"
4. Check the email inbox
5. Click the reset link
6. Set a new password

## 🔧 Troubleshooting

### Email Not Sending?
1. **Check environment variables** are set correctly
2. **Verify SMTP credentials** are valid
3. **Check server logs** for error messages
4. **Test SMTP connection** manually

### Reset Link Not Working?
1. **Check FRONTEND_URL** matches your frontend URL
2. **Verify token expiration** (1 hour)
3. **Check database** for reset tokens

### Common Errors

#### "Password reset service is not configured"
- Missing SMTP environment variables
- Solution: Set all required email variables

#### "Failed to send reset email"
- Invalid SMTP credentials
- Solution: Check email/password are correct

#### "Invalid or expired token"
- Token expired (1 hour limit)
- Solution: Request a new reset link

## 🛡️ Security Features

- **Secure tokens**: 32-byte random hex strings
- **Time-limited**: Links expire in 1 hour
- **Single-use**: Tokens are cleared after use
- **Privacy**: Doesn't reveal if email exists
- **HTTPS**: Reset links use secure URLs

## 📧 Email Template

The reset email includes:
- Professional ToolThinker branding
- Clear call-to-action button
- Fallback text link
- Security warnings
- Support contact information

## 🔄 Manual Testing

### Test with curl:
```bash
# Request password reset
curl -X POST http://localhost:3001/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Reset password with token
curl -X POST http://localhost:3001/auth/reset-password/YOUR_TOKEN \
  -H "Content-Type: application/json" \
  -d '{"password":"newpassword123"}'
```

## 🚨 Production Checklist

- [ ] Use production SMTP service (SendGrid, AWS SES, etc.)
- [ ] Set up proper DNS records (SPF, DKIM, DMARC)
- [ ] Configure email monitoring
- [ ] Test with real email addresses
- [ ] Set up email delivery tracking
- [ ] Configure rate limiting
- [ ] Set up error monitoring

## 📞 Support

If you need help:
1. Check the server logs for detailed error messages
2. Verify all environment variables are set
3. Test SMTP connection manually
4. Contact support with specific error messages

---

**Your forgot password functionality is now ready to use! 🎉** 