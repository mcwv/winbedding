# Neo-Bed

A beautiful neumorphic design experiment for job boards. This project showcases a modern, soft UI design system using Next.js 15 and Tailwind CSS v4.

## What is Neumorphism?

Neumorphism (or "soft UI") is a design trend that creates a soft, extruded plastic look using subtle shadows and highlights. Elements appear to be gently pressed into or raised from the background, creating a tactile, 3D effect.

## Features

- **Neumorphic Design System**: Soft, embossed UI components with subtle shadows
- **Breathing Animations**: Gentle pulsing effects that bring the UI to life
- **Interactive Components**:
  - Hero section with search functionality
  - Job cards with hover effects
  - Split-panel job browser
  - Responsive navigation
- **Modern Stack**: Built with Next.js 15, React 19, and Tailwind CSS v4
- **TypeScript**: Fully typed for better developer experience
- **Sample Data**: Includes 10 sample job listings to showcase the design

## Tech Stack

- **Framework**: Next.js 16.0.8 with App Router
- **React**: 19.0.0
- **Styling**: Tailwind CSS v4 (CSS-based configuration)
- **Icons**: Lucide React
- **TypeScript**: Latest version
- **Development**: Turbopack for fast refresh

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd neo-bed
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
neo-bed/
├── app/
│   ├── components/
│   │   └── neomorph/
│   │       ├── hero-grid-neomorph.tsx      # Hero section with search
│   │       ├── neomorph-job-card.tsx       # Job card component
│   │       ├── neomorph-nav.tsx            # Navigation bar
│   │       └── neomorph-job-browser.tsx    # Job browser with detail view
│   ├── globals.css                          # Tailwind CSS v4 styles
│   ├── layout.tsx                           # Root layout
│   └── page.tsx                             # Homepage with sample data
├── public/                                   # Static assets
├── next.config.ts                           # Next.js configuration
├── tsconfig.json                            # TypeScript configuration
├── postcss.config.js                        # PostCSS configuration for Tailwind
└── package.json                             # Dependencies
```

## Key Design Concepts

### Neumorphic Shadow System

The design uses a consistent shadow system defined in each component:

```typescript
const neomorphShadow = {
  raised: `12px 12px 24px rgba(209, 217, 230, 0.9), -12px -12px 24px rgba(255, 255, 255, 0.9)`,
  pressed: `inset 6px 6px 12px rgba(209, 217, 230, 0.85), inset -6px -6px 12px rgba(255, 255, 255, 0.85)`,
  pressedDeep: `inset 10px 10px 20px rgba(209, 217, 230, 0.95), inset -10px -10px 20px rgba(255, 255, 255, 0.95)`,
  flat: `6px 6px 12px rgba(209, 217, 230, 0.7), -6px -6px 12px rgba(255, 255, 255, 0.7)`,
}
```

- **Raised**: For elements that appear to float above the surface
- **Pressed**: For elements that appear pressed into the surface
- **Pressed Deep**: For input fields and interactive elements
- **Flat**: For subtle elevation like badges

### Color Palette

- Background: `#F0F0F3` (light neutral gray)
- Accent: `#22c55e` (green)
- Text: Dark gray tones
- Shadows: Semi-transparent light and dark tones

## Components

### HeroGridNeomorph
The main hero section featuring:
- Large headline with search bar
- Active job count display
- Breathing animation effect
- Trending search chips

### NeomorphJobCard
Individual job card displaying:
- Job title and company
- Location and posted date
- Salary information
- Hover scale effect

### NeomorphJobBrowser
Two-panel job browser:
- Left panel: Scrollable job list
- Right panel: Detailed job view
- Interactive selection with pressed state

### NeomorphNav
Sticky navigation bar with:
- Logo and brand name
- Navigation items with active states
- CTA button

## Customization

### Changing Colors

Edit the colors in each component's `style` props:
- Accent color: Replace `#22c55e` with your color
- Background: Replace `#F0F0F3` with your color
- Shadows: Adjust RGB values in `neomorphShadow` object

### Adding Real Data

Replace the sample data in `app/page.tsx` with your own job listings. The data structure:

```typescript
{
  id: number
  title: string
  company: string
  location: string
  salary: string
  type: string
  postedDate: string
  description?: string
}
```

## Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Known Considerations

**Accessibility**: Neumorphic design can have lower contrast ratios. Consider:
- Adding ARIA labels
- Ensuring sufficient color contrast for text
- Providing keyboard navigation

**Performance**: The design uses CSS box-shadows extensively. On older devices, this may impact performance.

**Browser Support**: Works best in modern browsers (Chrome, Firefox, Safari, Edge). Older browsers may not render shadows correctly.

## Future Enhancements

- [ ] Add dark mode variant
- [ ] Integrate with real job API
- [ ] Add job search and filtering
- [ ] Implement pagination
- [ ] Add animations on scroll
- [ ] Mobile menu for navigation
- [ ] Job application modal

## License

This project is open source and available for personal and commercial use.

## Credits

Extracted from the SSMC (Sam's Social Media Club) job board project as a standalone neumorphic design experiment.

---

Built with ❤️ using Next.js and Tailwind CSS
