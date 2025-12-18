# PapayeGroup Website (Next.js 14)

A modern, animated, interactive fast-food restaurant website featuring smooth transitions, scroll-based animations, parallax effects, and dynamic content management.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion + GSAP + Lottie
- **UI Components**: Radix UI + Lucide Icons
- **Images**: Next.js Image Optimization + Unsplash

## Features

- **Animated Hero Section** - GSAP parallax effects, floating food elements
- **Dynamic Menu** - Category filtering, animated cards, item modals with real food images
- **Google Maps Integration** - Interactive branch locations with directions
- **Contact Form** - API-powered form with email service support
- **Lottie Animations** - Loading spinners, success animations, decorative elements
- **Responsive Design** - Mobile-first approach with smooth animations

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## Project Structure

```
├── docs/                    # Documentation
├── public/
│   ├── images/             # Static images
│   └── lottie/             # Lottie animation JSON files
├── src/
│   ├── app/
│   │   ├── api/contact/    # Contact form API route
│   │   ├── about/          # About page
│   │   ├── branches/       # Branches page with Google Maps
│   │   ├── contact/        # Contact page
│   │   ├── gallery/        # Gallery page
│   │   └── menu/           # Menu page with filtering
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   ├── sections/       # Page section components
│   │   └── layout/         # Header, Footer, etc.
│   ├── data/               # JSON content (menu, branches, gallery)
│   └── lib/                # Utilities and animation presets
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
# SMTP Configuration (for contact form emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
CONTACT_EMAIL=info@papaye.com.gh
```

## Content Management

Edit JSON files in `/src/data/` to update:
- **menu.json** - Menu items, categories, prices
- **branches.json** - Branch locations, hours, map URLs
- **gallery.json** - Gallery images and tags
- **testimonials.json** - Customer testimonials

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Red) | `#E50000` | CTAs, highlights |
| Secondary (Yellow) | `#FFD200` | Accents, badges |
| Dark | `#1A1A1A` | Text, backgrounds |
| White | `#FFFFFF` | Backgrounds |

## Deployment

Deploy easily to Vercel or Netlify:

```bash
# Build and export
npm run build
```

## License

Private - Papaye Group
