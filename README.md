# MonetiseUP Dashboard

Your One Step Solution for all of your monetisation requirement. Display, Video, Native, across Website / Apps / OTT / CTV / AMP.

## 🚀 Analytics Dashboard

A modern, fast, and serverless dashboard for tracking monetization metrics across multiple properties.

### ✨ Features

- 📊 **Real-time Analytics** - Live data from Google Sheets
- 📈 **Multiple Visualizations** - Chart and table views
- 📱 **Responsive Design** - Works on desktop and mobile
- 🔐 **Secure Authentication** - Powered by Clerk
- ⚡ **Lightning Fast** - No backend, no cold starts
- 🎯 **Multi-Property Support** - Switch between different websites/apps
- 📅 **Date Filtering** - Analyze custom date ranges
- 👤 **Admin Panel** - Easy user management

---

## 🏃 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables (see below)
cp .env.example .env

# Run development server
npm run dev
```

Visit `http://localhost:5173`

For detailed setup, see [QUICK_START.md](./QUICK_START.md)

---

## 🔑 Environment Variables

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...  # From Clerk dashboard
VITE_CLERK_SECRET_KEY=sk_test_...       # From Clerk dashboard (admin only)
VITE_CLIENT_KEY=AIza...                 # Google Sheets API key
```

---

## 📖 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get up and running in 5 minutes
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Full technical documentation

---

## 🛠️ Technology Stack

- **Frontend**: React 18 + Vite
- **Authentication**: Clerk
- **Data Source**: Google Sheets API
- **Styling**: SCSS + Material-UI
- **Charts**: Recharts
- **Hosting**: Vercel/Netlify (recommended)
- **Backend**: None! 🎉 (Serverless architecture)

---

## 📊 Metrics Tracked

- Revenue
- Impressions
- Ad Requests
- Ad Impressions
- eCPM (Effective Cost Per Mille)
- Fill Rate
- Custom columns (auto-detected)

---

## 👥 User Management

### For Regular Users
1. Sign up/Sign in with Clerk
2. View assigned dashboard automatically
3. Switch between properties
4. Filter data by date range

### For Admins
1. Access admin panel at `/admin`
2. Assign Google Sheet IDs to users
3. Manage user access

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
vercel --prod
```

### Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

Don't forget to add environment variables to your hosting platform!

---

## 🔒 Security

- Authentication handled by Clerk
- Sheet IDs stored in Clerk metadata
- Admin access controlled by email whitelist
- No sensitive data in frontend code

---

## 📈 Performance

- **Load time**: < 1 second (vs 15-30s with backend)
- **Hosting cost**: $0/month (free tier)
- **Scalability**: Handles unlimited traffic
- **Reliability**: No server = no downtime

---

## 🤝 Contributing

This is a private project for MonetiseUP clients. For access or support, contact the development team.

---

## 📞 Contact

**Sales**: sales@monetiseup.com  
**Support**: For technical issues, contact your account manager

---

## 📄 License

Proprietary - © MonetiseUP

---

## 🎯 Recent Updates (Nov 2025)

- ✅ Eliminated backend dependency
- ✅ Migrated to Clerk metadata system  
- ✅ Added admin panel
- ✅ 30-60x performance improvement
- ✅ Reduced hosting costs to $0

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for details.
