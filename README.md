## 🛒 Orbita — Decentralized Supermarket on Stellar

Orbita is a modern decentralized e-commerce platform where users can buy and sell real-world products using **XLM on the Stellar network**, connected through their **Freighter wallet**. The backend (products, vendors, and orders) is not built yet — the data services in `lib/` currently return empty results and are marked with `TODO`s where the backend will connect.


## 🚀 Features

- Clean, responsive design built with **Next.js**, **TypeScript**, and **Tailwind CSS**
- **Freighter wallet integration** via `@stellar/freighter-api`
- **Stellar** support for real-time **XLM payments** on **Stellar Testnet** via `@stellar/stellar-sdk`
- Categories: **Groceries**, **Electronics**, **Fashion (clothes & shoes)**
- Seller dashboard for inventory and sales tracking
- Seamless Sign Up / Sign In and order management
- Success messages after payment transactions
- No middlemen, no delays — direct wallet-to-wallet payments


## 📌 Technologies Used

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **Stellar**
- **@stellar/freighter-api**
- **@stellar/stellar-sdk**
- **XLM on Stellar Testnet**

## 📦 Getting Started

### 1️⃣ Clone the Repository
```
bash
git clone https://github.com/your-username/orbita.git
cd orbita
```
2️⃣ Install Dependencies
```
bash
npm install
```
3️⃣ Configure Stellar Payments

Create a `.env.local` file with the Stellar account that should receive payments:
```
NEXT_PUBLIC_MERCHANT_ADDRESS=G...your_stellar_public_key
```
The merchant account and each buyer's account must be funded on Testnet. Install the [Freighter](https://www.freighter.app/) browser extension, switch it to **Testnet**, and fund accounts with [Friendbot](https://laboratory.stellar.org/#account-creator?network=test).

4️⃣ Run the Development Server
```
bash
Copy
Edit
npm run dev
```
Visit http://localhost:3000



