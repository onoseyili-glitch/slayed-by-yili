# 🎨 Slayed by Yili - Design System

## Color Palette

### Primary Colors
```
Black (#0a0a0a)
├─ Main background
├─ Deep text
└─ Professional foundation

Gold (#d4af37)
├─ Buttons
├─ Borders
├─ Headings
├─ Interactive elements
└─ Accents

Soft Pink (#f4a6c1)
├─ Subtle highlights
├─ Summary boxes
└─ Secondary accents
```

## Typography

### Headings
- All section headings: **Gold** (#d4af37)
- Font: Segoe UI, sans-serif
- Weight: 700 (bold)

### Text
- Body text: Dark Gray (#1a1a1a)
- Links: Gold (#d4af37)
- Form labels: Gold (#d4af37)

## Components

### Buttons
```
Primary Button
├─ Background: Gold (#d4af37)
├─ Text: Black (#0a0a0a)
├─ Hover: Lighter gold (#e8c547)
└─ Shadow: rgba(212, 175, 55, 0.4)

Button Styling
├─ Padding: 12px 30px
├─ Border-radius: 4px
├─ Font-weight: 600
└─ Transition: 0.3s ease
```

### Service Cards
```
Card
├─ Background: Light gradient
├─ Border: 2px solid (transparent → gold on hover)
├─ Heading: Gold (#d4af37)
├─ Shadow: Subtle
└─ Transform: -5px on hover
```

### Form Elements
```
Input Fields
├─ Border: 2px solid gold
├─ Focus: Gold with shadow
├─ Label: Gold
└─ Font-size: 1rem

Textarea
├─ Matches input styling
└─ Border: Gold
```

### Modal
```
Modal
├─ Background: White
├─ Top border: 3px gold
├─ Title: Gold
├─ Close button: Gold
└─ Shadow: 0 8px 32px rgba(0,0,0,0.2)
```

### Policy Cards
```
Card
├─ Background: White
├─ Left border: 4px gold
├─ Heading: Gold
├─ Shadow: Subtle
└─ Hover: Enhanced shadow
```

### Referral Section
```
Section
├─ Background: Gold gradient
├─ Text: Black
└─ Hover emphasis: Yes
```

### Contact Section
```
Section
├─ Background: Dark gradient (#0a0a0a to #1a1a1a)
├─ Text: White/Gold
├─ Links: Gold
├─ Hover: Gold with border
└─ Social buttons: Gold borders
```

## Layout Elements

### Navigation
```
Navbar
├─ Background: Black (#0a0a0a)
├─ Logo: Gold
├─ Links: White → Gold on hover
└─ Position: Sticky top
```

### Hero Section
```
Hero
├─ Background: Dark gradient
├─ Text: White
├─ Button: Gold
└─ Height: 80vh
```

### Section Spacing
```
Padding
├─ Vertical: 80px
├─ Horizontal: 20px
└─ Container max: 1200px
```

### About Section
```
About
├─ Background: Light (#f9f9f9)
├─ Stylist image: 280px circle with gold border
├─ Layout: 2-column (1-column mobile)
└─ Highlights: 3-column grid with gold border-top
```

## Hover & Interactive Effects

### Button Hover
- Transform: translateY(-2px)
- Shadow increase
- Color brighten

### Card Hover
- Transform: translateY(-5px)
- Shadow increase
- Border color change to gold

### Link Hover
- Color: Light gold (#e8c547)
- Underline: Optional

## Responsive Breakpoints

### Mobile
```
< 768px
├─ 1-column layouts
├─ Full-width forms
├─ Adjusted padding
└─ Stack images
```

### Tablet
```
768px - 1024px
├─ 2-column layouts
├─ Adjusted spacing
└─ Optimized touch targets
```

### Desktop
```
> 1024px
├─ Full layouts
├─ Max-width containers
└─ Premium spacing
```

## Accessibility

### Contrast
- Gold on White: ✅ WCAG AA
- White on Black: ✅ WCAG AAA
- Gold on Black: ✅ WCAG AA

### Focus States
- Gold border
- Shadow enhancement
- Clear visibility

### Touch Targets
- Minimum 44px height
- Adequate spacing
- Clear affordances

## Animation & Transitions

### Standard Transition
```
Duration: 0.3s
Timing: ease
Properties: all
```

### Modal
```
Animation: fadeIn + slideUp
Duration: 0.3s
Timing: ease
```

### Hover Effects
```
Button hover
Card hover
Link hover
All smooth transitions
```

## Shadow System

### Subtle Shadow
```
box-shadow: 0 2px 8px rgba(0,0,0,0.08)
```

### Medium Shadow
```
box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2)
```

### Strong Shadow
```
box-shadow: 0 8px 32px rgba(0,0,0,0.2)
```

### Button Hover Shadow
```
box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4)
```

## Border Radius

### Standard
```
4px - Buttons, inputs, cards
8px - Larger cards
50% - Profile image circle
```

## CSS Variables Reference

```css
:root {
    --primary: #0a0a0a;        /* Deep black */
    --secondary: #f5f5f5;      /* Light gray */
    --gold: #d4af37;           /* Luxury gold */
    --pink: #f4a6c1;           /* Soft pink */
    --text: #1a1a1a;           /* Dark text */
    --light: #f9f9f9;          /* Light background */
    --border: #d4af37;         /* Gold borders */
}
```

## Usage Guidelines

### When to Use Gold
✅ Buttons
✅ Headings
✅ Links
✅ Borders
✅ Accents
✅ Icons

### When to Use Black
✅ Main background
✅ Navigation
✅ Text
✅ Deep areas

### When to Use Pink
✅ Subtle highlights
✅ Summary boxes
✅ Secondary accents
✅ Delicate touches

### When to Use Light
✅ Section backgrounds
✅ Card backgrounds
✅ Light areas

## Brand Personality

**Luxury** → Gold accents, clean lines
**Professional** → Black foundation, structured layout
**Welcoming** → Pink touches, smooth transitions
**Trustworthy** → Clear hierarchy, accessible design
**Modern** → Smooth animations, responsive layout

---

## 🎯 Design Philosophy

**Slayed by Yili** embodies luxury through:
- Strategic use of gold for premium feel
- Clean black foundation for sophistication
- Soft pink for warmth and approachability
- Consistent spacing and typography
- Smooth interactions and transitions
- Professional imagery and presentation

Every element contributes to the overall **luxury, professional, elegant** aesthetic.

✨ **Clean. Elegant. Premium.** ✨
