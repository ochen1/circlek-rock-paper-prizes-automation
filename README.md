# PrizePilot 🚀

**PrizePilot** is a sleek, powerful dashboard for automating and managing your Circle K Rock Paper Prizes accounts. Stop manually checking for prizes and let PrizePilot handle the grind. With a beautiful and intuitive interface, you can effortlessly track the status of all your accounts, view your winnings, and manage your farm with ease.

 <!-- Screenshot -->

## ✨ Features

-   **🤖 Fully Automated Gameplay**: PrizePilot automatically plays the game for each account once the cooldown period is over, ensuring you never miss a prize.
-   **📊 Comprehensive Dashboard**: Get a bird's-eye view of your entire operation with real-time stats:
    -   Total accounts, prizes won, and games played.
    -   Accounts currently on cooldown, in an error state, or with a freshly claimed prize.
-   **📇 Detailed Account Cards**: Each account is displayed on its own card with rich details:
    -   Current status (`Prize Claimed`, `Cooldown`, `Error`, `Checking`).
    -   Live cooldown countdown timer.
    -   Daily progress stats (games played, won, win rate).
    -   A list of all prizes currently in the wallet, with creation and expiration dates.
    -   A direct link to the official prize wallet.
-   **⚙️ Effortless Account Management**:
    -   **Add**: Seamlessly add new accounts via the UI.
    -   **Edit**: Update phone numbers, session tokens, or notes in a modal.
    -   **Delete**: Remove accounts with a single click (and a confirmation).
-   **📝 Notes**: Add custom notes to each account to keep things organized.
-   **🔍 Search & Filter**: Instantly find accounts by phone number or filter by status to quickly assess your farm.
-   **🔄 Manual Refresh**: Option to manually refresh all accounts or a single account on-demand.
-   **💅 Modern Tech Stack**: Built with Next.js, TypeScript, and Tailwind CSS for a fast, reliable, and beautiful experience.
-   **🔒 Secure & Private**: Everything runs locally on your machine. Your configuration and session tokens never leave your computer.

## 🚀 Getting Started

Follow these steps to get PrizePilot up and running.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later recommended)
-   [pnpm](https://pnpm.io/installation) package manager

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url> prizepilot
cd prizepilot
pnpm install
```

### 2. Configuration

PrizePilot uses a `config.json` file in the root of the project to manage your accounts.

1.  Create a file named `config.json` in the project's root directory.
2.  Add your account(s) to this file using the following format. You can find your session token by inspecting network requests on the official game website.

    ```json
    [
        {
            "phone": "123-456-7890",
            "token": "ef58e850c4379eb0",
            "note": "Main account"
        },
        {
            "phone": "098-765-4321",
            "token": "dbfba631ff5723ee",
            "note": "Test account"
        }
    ]
    ```

### 3. Running the Application

Start the development server:

```bash
pnpm dev
```

Open your browser and navigate to [http://localhost:3000](http://localhost:3000). Your dashboard will load, automatically fetch the status for all accounts in your `config.json`, and begin managing your prize farm!

## 🔧 How It Works

-   **State Management**: The application reads from `config.json` as the source of truth for accounts. It maintains a `state.json` file to keep track of the last known status, prizes, and cooldowns for each account.
-   **API Interaction**: The Next.js backend provides API routes that securely interact with the Circle K game servers on your behalf. All game logic (starting a game, claiming a prize, checking the wallet) is handled server-side.
-   **Frontend**: The React-based frontend polls the backend periodically to get the latest state and displays it in a user-friendly dashboard. All account management actions (add, edit, delete) are performed through the UI and handled by the backend API.

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements, feel free to open an issue or submit a pull request.

---

*Disclaimer: This project is for educational purposes only. The developers are not responsible for any actions taken using this software. Please use it responsibly and in accordance with the terms of service of the Circle K promotional game.*
