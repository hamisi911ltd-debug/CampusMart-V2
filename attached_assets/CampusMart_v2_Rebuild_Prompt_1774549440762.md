# CampusMart — Full Rebuild Prompt
**Version 2.0 | Kenya's #1 Student Marketplace**

---

## 1. PROJECT IDENTITY

**Product name:** CampusMart  
**Tagline:** Kenya's #1 Student Marketplace — Buy. Sell. Find a Room.  
**Website:** campusmart.co.ke  
**Platform:** Mobile-first (React Native for iOS + Android) + Web (Next.js)  
**Audience:** University and college students across Kenya — UoN, KU, JKUAT, Strathmore, USIU, Daystar, MKU, Kabarak, and all other campuses.  
**Core purpose:** A peer-to-peer marketplace where students can buy and sell textbooks, electronics, fashion, food, and services — and find affordable housing near their campus.

---

## 2. BRAND IDENTITY

### Colour palette
| Role | Name | Hex |
|------|------|-----|
| Primary | Campus Navy | `#0A2342` |
| Secondary | Campus Green | `#1A7A4A` |
| Accent | Campus Red | `#D0282E` |
| Background | Off-white | `#F4F6FA` |
| Surface / Card | Pure white | `#FFFFFF` |
| Text primary | Deep navy | `#0A2342` |
| Text secondary | Slate | `#6B7A99` |
| Border | Light grey | `#E2E8F0` |
| Success | Green | `#1A7A4A` |
| Error | Red | `#D0282E` |

### Typography
- **Display / Logo:** Outfit 600 — used for "CampusMart" wordmark and screen titles
- **Body / UI:** Outfit 400/500 — used for all body text, labels, buttons
- **Monospace / Prices:** Space Grotesk 500 — used for KES amounts and codes
- **Never use:** Arial, Roboto, Inter, or system-ui fonts

### Brand voice
Confident, youthful, Kenyan. Speak like a smart campus friend — direct, warm, and no-nonsense. Use KES (never $). Reference real Kenyan campuses. Use familiar Kenyan phrases where natural.

---

## 3. APP STRUCTURE — FULL SCREEN MAP

### 3.1 Authentication Flow

#### Landing screen
When a new or logged-out user opens the app, show a **full-screen landing page** that slides up a **modal bottom sheet** for Sign In / Sign Up. The landing page behind the modal should show a blurred preview of the marketplace to create desire.

**Sign Up page fields (in order):**
1. Email address
2. Phone number (Kenyan format: 07XX XXX XXX or +254...)
3. Username (unique, auto-suggest based on name)
4. Password
5. Confirm password
6. Alternative: Passkey / Fingerprint / Face ID buttons

**Sign In page fields:**
1. Email or phone number
2. Password
3. Alternative: Fingerprint / Face ID / Passkey

**NB (important UX rule):** Once the landing page loads, the Sign In / Sign Up modal MUST pop up automatically. The user cannot browse the app without being signed in or signed up first.

**After auth:** Animate the modal away, reveal the full app with a smooth slide-up transition.

---

### 3.2 Bottom Navigation Bar

Five tabs — always visible at the bottom of every screen:

| Tab | Icon | Screen |
|-----|------|--------|
| Home | House icon | Home / Discovery feed |
| Market | Shopping bag | General marketplace |
| Food | Fork + knife or food emoji style | Campus food |
| Nrooms | Roof/house icon | Student housing |
| Profile | Person icon | Account & settings |

Active tab: filled navy background on icon, bold navy label.  
Inactive tab: muted grey icon and label.

---

### 3.3 HOME SCREEN

**Top bar:**
- Left: "CampusMart" logo wordmark (navy, "Mart" in green)
- Right: Cart icon with red badge showing item count + Bell icon for notifications

**Search bar (below top bar, inside navy header):**
- Full-width pill search input with search icon
- Placeholder: "Search textbooks, electronics, food..."
- On tap: expands to a full-screen search with recent searches and trending items

**Hero banner (swipeable carousel):**
- 3 swipeable promotional banners
- Banner 1: "New semester deals 📚 — Textbooks from KES 100"
- Banner 2: "Find your next room 🏠 — Near your campus"
- Banner 3: "Hungry? Order campus food 🍔 — Delivered to your hostel"
- Auto-swipes every 4 seconds with dot indicators

**Category chips (horizontally scrollable):**
Books | Electronics | Fashion | Food | Nrooms | Services | Stationery | Furniture

**Featured listings section:**
- Title: "Featured" with "See all →" link (in green)
- 2-column product grid
- Each product card contains:
  - Product photo (placeholder emoji or image)
  - Optional badge: "HOT" (red) or "NEW" (green) or "% OFF" (amber)
  - Heart/wishlist button (top right of image)
  - Product name (max 2 lines)
  - Price in KES (bold green)
  - Strikethrough original price if discounted (grey)
  - Campus location (small grey text with pin icon)

**Trending near you section:**
- Same 2-column grid layout
- Personalised to user's registered campus

---

### 3.4 MARKET SCREEN

**Top bar:** "Marketplace" title + Cart icon

**Search bar:** same style as home

**Filter chips (horizontally scrollable):**
All | Books | Electronics | Clothes | Furniture | Appliances | Services | Other

**Sort dropdown:** Newest | Price: Low to high | Price: High to low | Most liked

**Product grid:** 2-column, infinite scroll / pagination  
Each card same format as home screen cards.

**Floating "+" button (bottom right):**
- Tapping opens the "Post a listing" flow

---

### 3.5 FOOD SCREEN

**Top bar:** "Campus Food" + Cart icon

**Search bar:** "Search food near campus..."

**Category chips:** All | Meals | Snacks | Drinks | Combos | Healthy

**Restaurant/vendor cards:**
- Vendor photo or banner
- Vendor name and campus location
- Delivery time estimate (e.g. "15–25 min")
- Rating (stars)
- Min order amount

**Food item grid:**
- Same 2-column product card layout
- Price in KES
- "Add to cart" button on each card

---

### 3.6 NROOMS SCREEN

**Top bar:** "Nrooms — Student Housing" + notification bell

**Search bar:** "Find a room near your campus..."

**Filter chips:** All | Bedsitter | Single Room | 1 Bedroom | 2 Bedroom | Hostel

**Map toggle (top right):** Switch between list view and map view (Google Maps embedded showing pins for each listing)

**Room listing cards (full-width, stacked):**
- Room photo (full width, 140px height)
- Room title (e.g. "Self-contain Bedsitter")
- Location with distance to nearest campus (e.g. "📍 200m from UoN Main Campus")
- Monthly rent in KES (bold green)
- Availability badge: "Available" (green) or "Taken" (red)
- Amenities chips: WiFi | Water | Security | Furnished
- "Enquire" button → opens WhatsApp or in-app chat with landlord

---

### 3.7 CART SCREEN

(Accessed from cart icon in top bar)

**Top bar:** Back arrow + "My Cart" + item count

**Cart items list:**
- Each item shows:
  - Thumbnail image (60×60px, rounded)
  - Product name
  - Price in KES
  - Quantity controls: [−] [1] [+]
  - Delete/remove button (red trash icon)

**Cart summary section (sticky at bottom):**
- "X items" count on left
- "KES 0.00" total on right  
- Green "Checkout →" button (full width)

**Empty cart state:**
- Illustration / icon
- "Your cart is empty"
- "Start shopping →" button

---

### 3.8 ACCOUNT / PROFILE SCREEN

**Profile header (navy background):**
- User avatar (circular, 52px) — shows initials if no photo
- Username (bold white)
- @handle + "Student" badge (muted white)
- Settings gear icon (top right)
- Notification bell icon (top right)

**My Orders row:**
- Full-width card with order icon, "My Orders" label, and chevron → navigates to order history

**Quick access grid (3 columns):**
| Icon | Label |
|------|-------|
| Clock | History |
| Heart | Wishlist |
| Ticket | Coupons |
| Card | Payment |
| Gift | Bonus |
| Headset | Help Desk |
| Lightbulb | Suggestion |
| Gear | Settings |
| Upload | Sell / Post |

**My Products section:**
- Shows listings the user has posted
- Empty state: "No products listed yet — tap Sell to get started"

---

### 3.9 SETTINGS SCREEN

**Top bar:** Back arrow + "Settings"

**Profile section:**
- Photo — tap to upload/change from camera or gallery
- Name — tap to edit
- Shipping / Delivery address — tap to add/edit

**General section:**
- Dark mode toggle (switch)
- Notifications toggle (switch)
- Privacy & Security → sub-screen
- Payment methods → M-Pesa number, saved cards

**Account section:**
- Language (English / Swahili)
- About CampusMart
- Rate the app
- Sign out (red text)

---

### 3.10 ORDER HISTORY & TRACKING SCREEN

**Order list:** Chronological list of all past orders  
Each order card shows:
- Order ID (e.g. ORD-001234)
- Product thumbnail + name
- KES amount paid
- Date
- Status badge: Pending | Awaiting Payment | Confirmed | Shipped | Delivered | Cancelled

**Order detail screen (tap any order):**
- Full order breakdown
- Seller info and contact button
- Live status tracker (step-by-step progress bar):
  Order placed → Payment confirmed → Seller notified → Picked up → Delivered
- "Confirm delivery" button (appears when status = Shipped)
- "Report issue" button

---

### 3.11 PRODUCT DETAIL SCREEN

(Opens when user taps any product card)

**Top bar:** Back arrow + "..." more options

**Image gallery:** Full-width swipeable images (or single image)

**Product info:**
- Title (large, bold)
- Price (large, bold green) + strikethrough original if discounted
- Campus location with map pin
- Condition badge: New | Like New | Good | Fair

**Seller info card:**
- Seller avatar + username
- Rating stars + number of sales
- "View profile" link
- "Message seller" button

**Description:** Full product description

**Bottom action bar (sticky):**
- Heart/wishlist icon (left)
- "Add to cart" button (right, full width, navy)

---

### 3.12 POST A LISTING SCREEN

(Accessed via "+" FAB or "Sell" menu item)

**Step 1 — Photos:**
- Large photo upload area (up to 5 photos)
- "Take photo" or "Choose from gallery" options

**Step 2 — Details:**
- Title (required)
- Category (dropdown: Books / Electronics / Fashion / Food / Services / Other)
- Condition (New / Like New / Good / Fair)
- Description (text area)
- Price (KES) — number input
- Original price (optional — for showing discount)
- Campus (dropdown of all major Kenyan campuses)

**Step 3 — Review & Publish:**
- Preview how the listing will look
- "Publish listing" button (green)

---

## 4. BACKEND ARCHITECTURE

### 4.1 Tech stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Mobile app | React Native (Expo) | Cross-platform iOS + Android |
| Web app | Next.js 14 (App Router) | SSR for SEO on product pages |
| API server | Node.js + Express.js | Fast, widely supported |
| Database (primary) | PostgreSQL 16 | Relational data: users, orders, products |
| Cache / sessions | Redis 7 | Carts, JWT refresh tokens, OTPs, rate limiting |
| Search engine | Elasticsearch | Product search with campus + category filters |
| File storage | Cloudflare R2 | Product images, profile photos (cheaper than S3) |
| CDN | Cloudflare | Fast image delivery across Kenya |
| Background jobs | BullMQ + Redis | Async: notifications, payouts, emails |
| ORM | Prisma | Type-safe PostgreSQL queries |
| Auth | JWT + WebAuthn | Tokens + biometric/passkey login |
| Hosting | Railway or Render | Affordable, simple CI/CD for Node.js |
| Payments | Safaricom Daraja API | M-Pesa STK Push + B2C payouts |
| SMS | Africa's Talking | OTP codes, order alerts |
| Email | Resend | Receipts, confirmations |
| Push notifications | Firebase FCM + APNs | Android + iOS push |
| Maps | Google Maps API | Nrooms distance-to-campus feature |

---

### 4.2 Database schema (key tables)

#### users
```
id            UUID PK
email         VARCHAR UNIQUE
phone         VARCHAR UNIQUE          -- Kenyan format, used for M-Pesa
username      VARCHAR UNIQUE
password_hash TEXT                    -- bcrypt cost 12
avatar_url    TEXT                    -- Cloudflare R2 URL
campus        VARCHAR                 -- UoN, KU, JKUAT, etc.
role          ENUM(student, admin)
created_at    TIMESTAMP
```

#### products
```
id              UUID PK
seller_id       UUID FK → users.id
title           VARCHAR
description     TEXT
price           INTEGER               -- KES in cents (219 = KES 2.19)
original_price  INTEGER               -- for strikethrough display
category        ENUM(books, electronics, fashion, food, services, other)
condition       ENUM(new, like_new, good, fair)
campus          VARCHAR
images          TEXT[]                -- array of R2/CDN URLs
stock           INTEGER
status          ENUM(active, sold, paused)
created_at      TIMESTAMP
```

#### orders
```
id                UUID PK
buyer_id          UUID FK → users.id
seller_id         UUID FK → users.id
product_id        UUID FK → products.id
quantity          INTEGER
amount_kes        INTEGER
status            ENUM(pending, awaiting_payment, confirmed, shipped, delivered, cancelled)
delivery_address  TEXT
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

#### payments
```
id              UUID PK
order_id        UUID FK → orders.id
mpesa_receipt   VARCHAR               -- e.g. QGH7XXXXX from Safaricom
phone           VARCHAR
amount          INTEGER
status          ENUM(pending, success, failed)
paid_at         TIMESTAMP
```

#### wishlists
```
user_id     UUID FK → users.id
product_id  UUID FK → products.id
added_at    TIMESTAMP
PRIMARY KEY (user_id, product_id)
```

#### nrooms
```
id           UUID PK
landlord_id  UUID FK → users.id
title        VARCHAR
description  TEXT
rent_kes     INTEGER
type         ENUM(bedsitter, single_room, one_bedroom, two_bedroom, hostel)
campus_near  VARCHAR
lat          FLOAT
lng          FLOAT
images       TEXT[]
amenities    TEXT[]                  -- ["WiFi", "Water", "Furnished"]
available    BOOLEAN
created_at   TIMESTAMP
```

---

### 4.3 API endpoints

#### Auth
```
POST /api/auth/register             -- Create account
POST /api/auth/login                -- Sign in → JWT + refresh token
POST /api/auth/refresh              -- Exchange refresh token for new JWT
POST /api/auth/logout               -- Invalidate refresh token
POST /api/auth/otp/send             -- Send SMS OTP (Africa's Talking)
POST /api/auth/otp/verify           -- Verify OTP
POST /api/auth/passkey/register     -- Register WebAuthn credential
POST /api/auth/passkey/authenticate -- Authenticate with biometric
```

#### Products
```
GET    /api/products                 -- List/search (filter: category, campus, price, q)
GET    /api/products/:id             -- Single product detail
POST   /api/products                 -- Create listing (auth required)
PUT    /api/products/:id             -- Update listing (seller only)
DELETE /api/products/:id             -- Delete listing (seller only)
POST   /api/products/:id/images      -- Upload photos (multipart → R2)
```

#### Cart & Orders
```
GET    /api/cart                     -- Get user's cart (from Redis)
POST   /api/cart/add                 -- Add item
PUT    /api/cart/:item_id            -- Update quantity
DELETE /api/cart/:item_id            -- Remove item
DELETE /api/cart                     -- Clear cart

POST   /api/orders/checkout          -- Create order + trigger M-Pesa STK Push
GET    /api/orders                   -- Order history
GET    /api/orders/:id               -- Single order + tracking status
POST   /api/orders/:id/confirm-delivery -- Buyer confirms → triggers seller payout
POST   /api/orders/:id/cancel        -- Cancel order
```

#### Payments
```
POST /api/payments/mpesa/callback    -- Safaricom webhook (idempotent, verified)
GET  /api/payments/:order_id/status  -- Poll payment status
```

#### User & Wishlist
```
GET  /api/users/me                   -- Own profile
PUT  /api/users/me                   -- Update name, photo, address, campus
GET  /api/users/me/wishlist          -- Saved items
POST /api/users/me/wishlist/:id      -- Toggle save/unsave
GET  /api/users/me/listings          -- Own posted products
```

#### Nrooms
```
GET    /api/nrooms                   -- List rooms (filter: campus, price, type)
GET    /api/nrooms/:id               -- Single room detail
POST   /api/nrooms                   -- Post a room
PUT    /api/nrooms/:id               -- Update room
DELETE /api/nrooms/:id               -- Remove room
POST   /api/nrooms/:id/enquire       -- Send enquiry to landlord
```

---

### 4.4 M-Pesa payment flow (critical — get this right)

```
1. User taps "Checkout" in cart
2. Backend creates order record (status: "pending")
3. Backend calls Safaricom Daraja STK Push API:
   - Endpoint: POST https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest
   - PhoneNumber: buyer's phone (254 format)
   - Amount: order total in KES
   - AccountReference: order ID
   - TransactionDesc: "CampusMart Order ORD-XXXXX"
4. Order status → "awaiting_payment"
5. M-Pesa sends payment prompt to buyer's phone
6. Buyer enters M-Pesa PIN
7. Safaricom sends callback to: POST /api/payments/mpesa/callback
8. Backend verifies:
   - ResultCode === 0 (success)
   - Amount matches order
   - Phone matches buyer
   - Receipt not already processed (idempotent check)
9. On success:
   - Payment record saved (status: "success", mpesa_receipt saved)
   - Order status → "confirmed"
   - Product stock decremented
   - Redis cart cleared
   - Push notification to buyer: "Order confirmed! 📦"
   - SMS to seller: "New order for [product]. KES [amount] held in escrow."
10. When buyer confirms delivery:
    - Order status → "delivered"
    - Backend calls Daraja B2C API to pay seller
    - Platform fee (e.g. 5%) deducted before transfer
    - Seller receives SMS: "KES [amount] sent to your M-Pesa."
```

---

### 4.5 Security requirements

- All passwords hashed with bcrypt (cost factor 12)
- JWT access tokens expire in 15 minutes
- Refresh tokens expire in 30 days, stored in Redis (can be revoked)
- Rate limiting: max 5 failed logins per IP per 15 minutes
- OTP rate limit: max 10 OTP requests per phone per hour
- All inputs validated with Zod schemas
- PostgreSQL queries use parameterised statements only (no raw string interpolation)
- M-Pesa callback verified by checking Safaricom IP whitelist + transaction reference
- HTTPS enforced on all routes
- CORS restricted to campusmart.co.ke
- All API keys and secrets stored in environment variables (never in code)
- File upload validation: max 5MB, image types only (jpg/png/webp)

---

## 5. UX & DESIGN REQUIREMENTS

### 5.1 Design principles
- **Mobile-first:** Every screen designed for 375px–428px width first
- **Speed:** App must feel instant. Use skeleton loaders, not spinners
- **Kenyan context:** KES currency, Kenyan campus names, Swahili-friendly
- **Trust:** Show seller ratings, campus verification badges, secure payment indicators
- **Delight:** Smooth transitions, micro-animations on cart add, satisfying checkout confirmation

### 5.2 Interaction patterns
- Pull-to-refresh on all list screens
- Infinite scroll on product grids (not pagination)
- Swipe to dismiss modals and bottom sheets
- Haptic feedback on button taps (React Native)
- Skeleton loading states on all data-fetched screens
- Toast notifications for actions (added to cart, saved to wishlist, etc.)
- Bottom sheet modals (not full-screen navigations) for quick actions

### 5.3 Dark mode
Full dark mode support. Toggle in Settings → General → Dark Mode.  
Dark mode colours:
- Background: `#0D1117`
- Surface: `#161B22`
- Text primary: `#F0F6FC`
- Text secondary: `#8B949E`
- Navy elements: `#1C2B3A`
- Green accents: `#3FB571`

### 5.4 Accessibility
- Minimum touch target size: 44×44px
- All images have alt text
- Colour contrast ratio minimum 4.5:1 for body text
- Screen reader support for all interactive elements
- Loading states announced to screen readers

---

## 6. FEATURE CHECKLIST

### MVP (build first)
- [ ] Sign up / Sign in with phone OTP verification
- [ ] Browse home feed with category filters
- [ ] Product listings with photos, price, campus
- [ ] Add to cart and cart management
- [ ] M-Pesa STK Push checkout
- [ ] Order history and tracking
- [ ] User profile and settings
- [ ] Post a listing (sell items)
- [ ] Nrooms housing listings
- [ ] Push notifications (order updates)

### Phase 2 (build after MVP)
- [ ] In-app messaging between buyer and seller
- [ ] Product reviews and seller ratings
- [ ] Wishlist / saved items
- [ ] Coupons and discount codes
- [ ] Bonus/rewards points system
- [ ] Biometric login (fingerprint / Face ID)
- [ ] Map view for Nrooms
- [ ] Food ordering with vendor profiles
- [ ] Search with Elasticsearch (campus + category filters)
- [ ] Admin dashboard for moderation

### Phase 3 (scale)
- [ ] Seller verification badges (campus email required)
- [ ] Escrow payment system (hold funds until delivery confirmed)
- [ ] B2C seller payouts via M-Pesa
- [ ] Multi-campus delivery network
- [ ] Advertised/boosted listings (monetisation)
- [ ] Analytics dashboard for sellers
- [ ] Swahili language support

---

## 7. ENVIRONMENT VARIABLES NEEDED

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/campusmart

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d

# M-Pesa (Safaricom Daraja)
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=your-paybill-or-till
MPESA_PASSKEY=your-lipa-na-mpesa-passkey
MPESA_CALLBACK_URL=https://api.campusmart.co.ke/api/payments/mpesa/callback
MPESA_ENV=production                  # or sandbox for testing

# Africa's Talking (SMS)
AT_API_KEY=your-africas-talking-key
AT_USERNAME=campusmart

# Cloudflare R2 (file storage)
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY=your-r2-access-key
R2_SECRET_KEY=your-r2-secret-key
R2_BUCKET=campusmart-media

# Firebase (push notifications)
FIREBASE_SERVER_KEY=your-firebase-server-key
FIREBASE_PROJECT_ID=campusmart

# Google Maps
GOOGLE_MAPS_API_KEY=your-maps-key

# Email (Resend)
RESEND_API_KEY=your-resend-key
FROM_EMAIL=noreply@campusmart.co.ke

# App
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://campusmart.co.ke
PLATFORM_FEE_PERCENT=5
```

---

## 8. FOLDER STRUCTURE

### Backend (Node.js + Express)
```
campusmart-api/
├── src/
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── products.routes.ts
│   │   ├── cart.routes.ts
│   │   ├── orders.routes.ts
│   │   ├── payments.routes.ts
│   │   ├── users.routes.ts
│   │   └── nrooms.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── products.controller.ts
│   │   ├── orders.controller.ts
│   │   ├── payments.controller.ts
│   │   └── ...
│   ├── services/
│   │   ├── mpesa.service.ts          ← Daraja API logic
│   │   ├── sms.service.ts            ← Africa's Talking
│   │   ├── notifications.service.ts  ← FCM push
│   │   ├── storage.service.ts        ← Cloudflare R2
│   │   └── search.service.ts         ← Elasticsearch
│   ├── middleware/
│   │   ├── auth.middleware.ts        ← JWT verification
│   │   ├── rateLimit.middleware.ts
│   │   ├── validate.middleware.ts    ← Zod schema validation
│   │   └── upload.middleware.ts      ← Multer file uploads
│   ├── prisma/
│   │   └── schema.prisma             ← All DB models
│   ├── jobs/
│   │   ├── notifications.job.ts      ← BullMQ workers
│   │   └── payouts.job.ts
│   └── utils/
│       ├── jwt.utils.ts
│       ├── redis.utils.ts
│       └── errors.utils.ts
├── .env
├── package.json
└── tsconfig.json
```

### Mobile (React Native + Expo)
```
campusmart-app/
├── app/
│   ├── (auth)/
│   │   ├── landing.tsx              ← Landing + auth modal
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/
│   │   ├── index.tsx                ← Home
│   │   ├── market.tsx               ← Marketplace
│   │   ├── food.tsx                 ← Food
│   │   ├── nrooms.tsx               ← Housing
│   │   └── profile.tsx              ← Account
│   ├── product/[id].tsx             ← Product detail
│   ├── cart.tsx                     ← Cart screen
│   ├── checkout.tsx                 ← Checkout + M-Pesa
│   ├── orders/
│   │   ├── index.tsx                ← Order history
│   │   └── [id].tsx                 ← Order tracking
│   ├── settings.tsx
│   └── post-listing.tsx             ← Sell an item
├── components/
│   ├── ProductCard.tsx
│   ├── RoomCard.tsx
│   ├── CartItem.tsx
│   ├── CategoryChip.tsx
│   ├── SearchBar.tsx
│   ├── BottomNav.tsx
│   └── AuthModal.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useProducts.ts
├── services/
│   ├── api.ts                       ← Axios base client
│   └── storage.ts                   ← AsyncStorage helpers
├── constants/
│   ├── colors.ts                    ← Brand colours
│   └── campuses.ts                  ← List of all Kenyan campuses
└── app.json
```

---

## 9. KENYAN CAMPUS LIST (use this everywhere campus dropdowns appear)

University of Nairobi (UoN) | Kenyatta University (KU) | JKUAT | Strathmore University | USIU-Africa | Daystar University | Mount Kenya University (MKU) | Kabarak University | Moi University | Egerton University | Maseno University | Technical University of Kenya (TUK) | KCA University | Africa Nazarene University | Zetech University | Multimedia University | Co-operative University | Laikipia University | Dedan Kimathi University | Murang'a University | South Eastern Kenya University | Pwani University | Masinde Muliro University | Jaramogi Oginga Odinga University | Rongo University | Kirinyaga University | Machakos University | Karatina University

---

## 10. FINAL NOTES FOR DEVELOPERS

1. **Start with auth** — the entire app gates on sign in. Get the auth flow + JWT + OTP working first before building any other feature.

2. **M-Pesa is the heart** — test with the Daraja sandbox extensively before going live. The callback verification is critical. Never mark an order as paid unless you have a valid Safaricom receipt number.

3. **Carts live in Redis, not PostgreSQL** — carts are temporary and change frequently. Use Redis with a TTL of 7 days. Only create a PostgreSQL order record when the user hits checkout.

4. **Images go to Cloudflare R2** — never store base64 images in the database. Upload to R2, store the CDN URL in the database. Compress images before upload (max 800px wide, 80% quality JPEG).

5. **Price is stored in cents** — store KES 219 as integer 21900 to avoid floating point issues. Display as KES 219 in the UI.

6. **Campus is a string, not a foreign key** — keep it simple. Store campus as a plain VARCHAR like "UoN" or "JKUAT". Do not over-engineer a separate campuses table in MVP.

7. **Seller payout is delayed** — funds are held by the platform until the buyer confirms delivery. Only then is the B2C payout triggered. This protects buyers from fraud.

8. **Build mobile-first** — design and test on a 375px screen first. Use React Native's Dimensions API for responsive sizing. Never hardcode pixel values.

9. **Use Expo for the mobile app** — it saves weeks of native configuration. Use Expo Go for development and EAS Build for production builds.

10. **Deploy order:** Database → Backend API → Mobile app → Web app. Never deploy a frontend before the backend is ready.

---

*This prompt was written for CampusMart v2.0 — Kenya's #1 Student Marketplace.*  
*Build something sweet and meaningful for Kenyan students. 🇰🇪*
