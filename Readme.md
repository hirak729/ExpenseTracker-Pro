# ExpenseTracker Pro

ExpenseTracker Pro is a beautiful, production-ready personal finance management app built with React, TypeScript, Vite, and Tailwind CSS. Effortlessly track your income, expenses, budgets, and investments with powerful analytics and export features.

## Features

- **Dashboard:** View your income, expenses, and balance at a glance.
- **Transactions:** Add, edit, delete, and filter income and expense transactions.
- **Budgets:** Set and monitor budgets for each expense category with visual progress bars and alerts.
- **Analytics:** Interactive charts and breakdowns for spending, income, and top categories.
- **Investments:** Track investment purchases and returns, with ROI and monthly summaries.
- **Export:** Download your transactions or summary reports as CSV files.
- **Dark Mode:** Toggle between light and dark themes.
- **Persistent Data:** All data is stored locally in your browser.
- **Responsive Design:** Fully responsive and mobile-friendly UI.
- **Modern UI:** Built with Tailwind CSS and Lucide icons for a polished look.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/expense-tracker-pro.git
   cd expense-tracker-pro
   ```

2. **Install dependencies:**
   ```sh
   npm install
   # or
   yarn install
   ```

3. **Start the development server:**
   ```sh
   npm run dev
   # or
   yarn dev
   ```

4. **Open in your browser:**
   Visit [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

### Build for Production

```sh
npm run build
# or
yarn build
```

The production-ready files will be in the `dist` folder.

### Linting

```sh
npm run lint
# or
yarn lint
```

## Project Structure

```
.
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React context providers (Expense, Theme)
│   ├── pages/           # Page components (Home, Analytics, Investments)
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions (CSV export, etc.)
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/
├── index.html
├── tailwind.config.js
├── vite.config.ts
├── package.json
└── ...
```

## Technologies Used

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/)
- [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- [date-fns](https://date-fns.org/)
- [react-hot-toast](https://react-hot-toast.com/)
- [React Router](https://reactrouter.com/)

## Customization

- **Categories:** Edit `src/types/expense.ts` to customize income and expense categories.
- **Styling:** Tailwind CSS classes can be easily modified for your branding.
- **Data Storage:** Uses `localStorage` by default. Integrate with a backend for cloud sync.

## License

MIT

---

> Designed with ❤️ using React, TypeScript, and Tailwind CSS.
