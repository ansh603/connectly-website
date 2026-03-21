# DostNow Frontend 🤝

> User-facing social companion booking platform.

---

## 🚀 Setup

```bash
npm install
npm run dev
```

Opens at: **http://localhost:3000/AC/react/dostnow/**

---

## 📁 Structure

```
src/
├── pages/
│   ├── auth/        # Login, Register
│   ├── public/      # Home, Explore, Events, HowItWorks
│   └── dashboard/   # Bookings, Chat, Wallet, Profile
├── components/
│   ├── layout/      # Navbar, Footer
│   ├── shared/      # ProfileCard
│   └── ui/          # Button, Card, Modal, Input...
├── context/         # AppContext (global state)
├── routes/          # Route definitions
├── hooks/           # useApp
├── utils/           # helpers
└── styles/          # CSS files
```

## 🗺️ Routes

| Path           | Page        | Access    |
|----------------|-------------|-----------|
| /              | Home        | Public    |
| /explore       | Explore     | Public    |
| /events        | Events      | Public    |
| /how-it-works  | Guide       | Public    |
| /login         | Login       | Guest     |
| /register      | Register    | Guest     |
| /bookings      | Bookings    | Protected |
| /chat          | Chat        | Protected |
| /wallet        | Wallet      | Protected |
| /profile       | Profile     | Protected |
