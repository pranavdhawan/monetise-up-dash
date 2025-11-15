# Modern Analytics Dashboard

A sleek, professional, and elegant analytics dashboard built with **React**, **Vite**, and **shadcn/ui** components. This dashboard provides comprehensive data visualization and management capabilities for Google Sheets data.

## 🎨 Features

### 1. **Professional UI with shadcn/ui**
- Beautiful, modern design with Tailwind CSS
- Dark mode ready (configurable)
- Fully responsive for mobile, tablet, and desktop
- Smooth animations and transitions

### 2. **Interactive Sidebar**
- Left sidebar showing all available sheets
- Quick sheet selection
- Mobile-friendly hamburger menu
- Smooth navigation between sheets

### 3. **Advanced Revenue Chart**
- **Stacked Bar Chart** showing Display and Video revenue separately but cumulative
- Interactive tooltips with detailed metrics
- Summary cards showing:
  - Total Display Revenue
  - Total Video Revenue
  - Total Revenue
  - Total Impressions
  - Average eCPM
- Responsive design that adapts to screen size

### 4. **Powerful Date Filtering**
Located on the right sidebar (desktop) with:
- **Quick Select Buttons:**
  - Last 7 days
  - Last 30 days
  - Last 3 months
  - Year to date
  - Last 2 years
- **Custom Date Range Picker:**
  - Beautiful calendar interface
  - Select any date range
  - Visual feedback showing selected range
  - Shows number of days in range

### 5. **Advanced Data Table**
- **Export to CSV:** Download filtered/sorted data
- **Column Sorting:** Click headers to sort ascending/descending
- **Search Functionality:** Search across all columns in real-time
- **Column Customization:** Show/hide columns as needed
- **Data Formatting:** Automatic currency, percentage, and number formatting
- **Row Count:** Shows filtered vs total rows
- Fully responsive with horizontal scrolling on mobile

### 6. **View Toggle**
- Switch between Chart View and Table View
- Seamless transitions
- State persistence during view changes

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Clerk account for authentication
- Google Sheets API key

### Installation

1. **Clone the repository** (if not already done)
```bash
cd /Users/pranavdhawan/Projects/coyoteugly
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_CLIENT_KEY=your_google_sheets_api_key
```

4. **Configure user metadata in Clerk**

In your Clerk dashboard, add the following to user's public metadata:
```json
{
  "sheetId": "your_google_sheet_id"
}
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/
│   │   ├── DashboardSidebar.jsx    # Left sidebar with sheet list
│   │   ├── DateFilter.jsx          # Right sidebar date filter
│   │   ├── RevenueChart.jsx        # Stacked bar chart component
│   │   └── DataTable.jsx           # Advanced data table
│   └── ui/                         # shadcn/ui components
│       ├── button.jsx
│       ├── card.jsx
│       ├── table.jsx
│       ├── calendar.jsx
│       └── ... (other ui components)
├── pages/
│   └── dashboard/
│       └── Dashboard.jsx           # Main dashboard page
├── lib/
│   └── utils.js                    # Utility functions
├── App.jsx                         # App entry with Clerk auth
├── main.jsx                        # React entry point
└── index.css                       # Global styles with Tailwind

```

## 🎯 Key Technologies

- **React 18** - Modern React with hooks
- **Vite** - Lightning-fast build tool
- **shadcn/ui** - Beautiful, accessible component library
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Powerful charting library
- **Clerk** - Authentication and user management
- **date-fns** - Modern date utility library
- **Lucide React** - Beautiful icon set

## 🔧 Configuration

### Tailwind Configuration
The project uses a custom Tailwind configuration with:
- Custom color palette
- Dark mode support
- Custom animations
- Responsive breakpoints

### Component Customization
All shadcn/ui components can be customized in `components.json`

## 📊 Data Format

The dashboard expects Google Sheets data in the following format:

| Date | Display | Video | Impressions | eCPM | Fill Rate | ... |
|------|---------|-------|-------------|------|-----------|-----|
| 26/10/2025 | $2.76 | $3.49 | 30,620 | 0.204 | 95% | ... |

- **Date**: Format DD/MM/YYYY
- **Display**: Revenue from display ads (with or without $)
- **Video**: Revenue from video ads (with or without $)
- **Impressions**: Number of impressions
- **eCPM**: Effective cost per mille
- **Fill Rate**: Ad fill rate as percentage

## 🎨 Customization

### Change Color Theme
Edit `src/index.css` to modify the color scheme:
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96.1%;
  /* ... more colors */
}
```

### Add New Quick Date Ranges
Edit `src/components/dashboard/DateFilter.jsx`:
```javascript
const presets = [
  // Add your custom preset
  {
    label: "Last 90 days",
    value: "last90",
    getRange: () => ({
      from: subDays(new Date(), 90),
      to: new Date()
    })
  }
]
```

### Customize Chart Colors
Edit `src/components/dashboard/RevenueChart.jsx`:
```javascript
<Bar dataKey="Display" fill="#10b981" />  // Change green color
<Bar dataKey="Video" fill="#3b82f6" />    // Change blue color
```

## 📱 Responsive Design

The dashboard is fully responsive with breakpoints:
- **Mobile** (< 768px): Collapsible sidebar, stacked date filters
- **Tablet** (768px - 1024px): Split view with toggle
- **Desktop** (> 1024px): Full three-column layout

## 🔒 Authentication

The dashboard uses Clerk for authentication:
- Secure sign-in/sign-up
- User metadata for sheet ID management
- Protected routes
- Session management

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deploy to Vercel/Netlify
The project is ready for deployment to any static hosting service. Just connect your repository and deploy!

## 📈 Performance

- **Fast Initial Load**: Code splitting and lazy loading
- **Optimized Rendering**: React memoization for expensive calculations
- **Smooth Animations**: Hardware-accelerated CSS transitions
- **Efficient Data Handling**: Filtered and sorted data computed with useMemo

## 🐛 Troubleshooting

### "No data available"
- Check your Google Sheets API key
- Verify the sheet ID in Clerk user metadata
- Ensure the sheet name exists in your spreadsheet

### Date filter not working
- Verify your date format is DD/MM/YYYY
- Check that dates are in the "Date" column

### Export CSV not working
- Check browser permissions for downloads
- Verify data is loaded before exporting

## 📝 License

This project is private and proprietary.

## 🤝 Support

For issues or questions, please contact your development team.

---

Built with ❤️ using React, Vite, and shadcn/ui

