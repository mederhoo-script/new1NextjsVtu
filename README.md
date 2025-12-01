# VTU App - Next.js Airtime, Data & Bills Payment Platform

A full-stack Next.js application for purchasing airtime, data bundles, paying electricity bills, subscribing to cable TV, and buying education pins. Built with Supabase for backend services and Inlomax API integration.

## Features

- 🔐 **User Authentication** - Secure signup/login with Supabase Auth
- 💰 **Wallet System** - Fund wallet, transfer to other users
- 📱 **Airtime Purchase** - Buy airtime for MTN, GLO, Airtel, 9Mobile
- 📶 **Data Bundles** - Purchase data plans for all networks
- ⚡ **Electricity Bills** - Pay for all distribution companies (IKEDC, EKEDC, etc.)
- 📺 **Cable TV** - Subscribe to DSTV, GOTV, StarTimes
- 📚 **Education Pins** - Buy WAEC, NECO, NABTEB, JAMB result checker pins
- 📊 **Transaction History** - Track all your purchases

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **VTU API**: Inlomax API

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Inlomax API account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/nextjs-vtu-app.git
cd nextjs-vtu-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
INLOMAX_API_URL=https://www.inlomax.com/api
INLOMAX_API_TOKEN=your_inlomax_api_token
```

5. Set up the database:
   - Go to your Supabase project's SQL Editor
   - Run the SQL commands in `supabase-schema.sql`

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses three main tables:

- **profiles** - User profile information
- **wallets** - User wallet balances
- **transactions** - All transaction records

See `supabase-schema.sql` for the complete schema.

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/callback` - OAuth callback

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/fund` - Fund wallet
- `POST /api/wallet/withdraw` - Withdraw from wallet
- `POST /api/wallet/transfer` - Transfer to another user

### VTU Services
- `POST /api/services/airtime` - Purchase airtime
- `POST /api/services/data` - Purchase data bundle
- `GET /api/services/data-plans` - Get data plans
- `POST /api/services/electricity` - Pay electricity bill
- `POST /api/services/verify-meter` - Verify meter number
- `POST /api/services/cable` - Subscribe to cable TV
- `GET /api/services/cable-plans` - Get cable TV plans
- `POST /api/services/verify-smartcard` - Verify smart card
- `POST /api/services/education` - Buy education pins
- `GET /api/services/education` - Get exam types and prices

### Transactions
- `GET /api/transactions` - Get transaction history

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication endpoints
│   │   ├── wallet/             # Wallet operations
│   │   ├── services/           # VTU services
│   │   └── transactions/       # Transaction history
│   ├── auth/                   # Auth pages (login, register)
│   ├── dashboard/              # Dashboard page
│   ├── wallet/                 # Wallet management page
│   ├── services/               # Service pages
│   │   ├── airtime/
│   │   ├── data/
│   │   ├── electricity/
│   │   ├── cable/
│   │   └── education/
│   └── transactions/           # Transaction history page
├── components/
│   ├── ui/                     # Reusable UI components
│   └── layout/                 # Layout components
├── lib/
│   ├── supabase/               # Supabase client configuration
│   ├── inlomax.ts              # Inlomax API service
│   └── utils.ts                # Utility functions
├── types/                      # TypeScript type definitions
└── middleware.ts               # Auth middleware
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/nextjs-vtu-app)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `INLOMAX_API_URL` | Inlomax API base URL |
| `INLOMAX_API_TOKEN` | Your Inlomax API token |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
