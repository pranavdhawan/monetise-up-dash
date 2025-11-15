# Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Clerk account with publishable and secret keys
- Google Sheets API key

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file:
```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_CLERK_SECRET_KEY=sk_test_your_secret_key_here
VITE_CLIENT_KEY=your_google_sheets_api_key
```

### Run Development Server
```bash
npm run dev
```

Visit `http://localhost:5173`

---

## 👤 User Access

### Regular Users
1. Sign in with Clerk
2. View your assigned dashboard automatically
3. Switch between properties in sidebar
4. Toggle between chart and table views

### Admin Users
1. Navigate to `/admin`
2. Assign Google Sheet IDs to users
3. Users get instant access to their dashboards

---

## 📝 Adding a New User

### Quick Method (Admin Panel)
1. Go to `http://localhost:5173/admin`
2. Enter user email: `user@example.com`
3. Enter Sheet ID: `1NCfCtObcoqoqKiyk_89O1fKJ6IBG_6qKtROhBriFAj8`
4. Click "Assign Sheet ID"
5. Done! User can now sign in and see their dashboard

### Manual Method (Clerk Dashboard)
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Find user → Metadata → Public metadata
3. Add: `{ "sheetId": "their-sheet-id-here" }`
4. Save

---

## 🏗️ Project Structure

```
coyoteugly/
├── src/
│   ├── pages/
│   │   └── home/Home.jsx          # Main dashboard
│   ├── components/
│   │   ├── admin/AdminPanel.jsx   # Admin interface
│   │   ├── chart/Chart.jsx        # Chart visualization
│   │   ├── table/Table.jsx        # Table visualization
│   │   └── sidebar/Sidebar.jsx    # Navigation
│   ├── App.jsx                     # Root component
│   └── main.jsx                    # Entry point
├── migrate-to-clerk.cjs            # Migration script
└── MIGRATION_GUIDE.md              # Full documentation
```

---

## 🔧 Common Tasks

### Change Admin Users
Edit `src/App.jsx`:
```javascript
const adminEmails = [
  'your-admin@email.com',
  'another-admin@email.com'
];
```

### Update Google Sheets API Key
Update `.env`:
```bash
VITE_CLIENT_KEY=new_api_key_here
```

### Add More Sheet Columns
Data automatically adapts! Chart.jsx and Table.jsx read all columns from your Google Sheet.

---

## 📊 Google Sheet Format

Your Google Sheet should have these columns:
- **Date** (required) - Format: DD/MM/YYYY
- **Impressions** - Number
- **Ad Requests** - Number
- **Ad Impressions** - Number
- **Revenue** - Currency or number
- **eCPM** - Currency or number
- **Fill Rate** - Percentage

Additional columns will be automatically included in charts and tables.

---

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Environment Variables
Remember to add all env vars to your hosting platform!

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| White screen | Check console, verify env vars |
| No data showing | Check Clerk metadata has sheetId |
| Admin panel 404 | Navigate to `/admin` directly |
| Charts not loading | Verify Google Sheets API key |
| Slow loading | Check Google Sheets API quota |

---

## 📈 Features

✅ User authentication (Clerk)
✅ Multiple properties per user
✅ Chart and table views
✅ Date range filtering
✅ Mobile responsive
✅ Admin panel
✅ Real-time Google Sheets data
✅ No backend required

---

## 💡 Tips

1. **Testing**: Use your own email in the admin list for testing
2. **Sheet IDs**: Found in Google Sheets URL after `/d/`
3. **Performance**: Google Sheets API has quotas, cache if needed
4. **Security**: Sheet IDs in metadata are okay (they're not sensitive)

---

## 🎯 Next Steps

1. Test the dashboard with your account
2. Add your team members via admin panel
3. Customize colors in SCSS files
4. Deploy to production
5. Share with your users!

---

Need help? Check the full [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

