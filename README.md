<br>
<div align="center">
  <h1>💸 Expense Genie</h1>
  <p>
    <b>Your AI-Powered Financial Assistant - Smart Budget Planning, Expense Tracking & Insights</b>
  </p>
  <br>

  <a href="https://expensegeniedev.vercel.app/" target="_blank">
    <img src="https://img.shields.io/website?label=Live%20Demo&style=for-the-badge&url=https%3A%2F%2Fexpensegenie.vercel.app%2F" alt="Live Demo"/>
  </a>
  <img src="https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react" alt="Made with React"/>
  <img src="https://img.shields.io/badge/AI%20Powered-OpenAI-412991?style=for-the-badge&logo=openai" alt="AI Powered"/>

</div>

---

**Expense Genie** is a next-generation expense tracker that combines beautiful design with powerful AI capabilities. Get real-time insights, automatic price lookups, personalized budget plans, and smart spending recommendations—all in one elegant application.

> 🎯 **Stop tracking. Start planning.** Let AI help you achieve your financial goals.

<br>

<div align="center">
  <a href="https://expensegeniedev.vercel.app/">
  </a>
</div>

---

## 🚀 Live Demo

Experience Expense Genie live in your browser. No installation required!

👉 **[Try the App Live](https://expensegeniedev.vercel.app/)**

---

## ✨ Features

### 🤖 AI-Powered Features

| Feature | Description | Requires OpenAI |
| :--- | :--- | :---: |
| **🔍 Automatic Pricing Search** | Just name your goal (e.g., "iPhone 15 Pro") and AI finds the current market price for you—no manual research needed! | ✅ Yes |
| **💡 Smart Budget Planning** | AI analyzes your spending patterns and creates personalized savings plans with realistic budget cuts and actionable tips. | 🔄 Enhanced |
| **🎯 Intelligent Categorization** | Automatically categorizes expenses with 90%+ accuracy using advanced AI and comprehensive keyword matching. | 🔄 Enhanced |
| **📊 Deep Spending Analysis** | Get personalized insights about your spending habits, identify patterns, and discover optimization opportunities. | 🔄 Enhanced |

> **Note:** Features marked with "Enhanced" work without OpenAI using smart rule-based algorithms, but provide deeper insights with OpenAI API.

### 💰 Budget & Planning

| Feature | Description |
| :--- | :--- |
| **🎯 Goal-Based Planning** | Set savings goals and get step-by-step plans to achieve them with timeline flexibility (1-24 months). |
| **📈 Spending Trends** | Visualize your spending over time with interactive charts showing 3, 6, or 12-month views. |
| **💎 Category Insights** | See which categories consume most of your budget with beautiful doughnut charts and detailed breakdowns. |
| **🔮 Predictions** | AI predicts your next month's spending based on historical patterns and trends. |
| **⚡ Real-Time Tracking** | Monitor your budget usage in real-time with progress bars and instant overspending alerts. |

### 🔐 Security & Authentication

| Feature | Description |
| :--- | :--- |
| **✉️ Email Verification** | Secure 6-digit code verification system with 15-minute expiry for account safety. |
| **🔑 Password Reset** | Forgot your password? Reset it easily via email with secure token-based recovery. |
| **🛡️ JWT Authentication** | Industry-standard JSON Web Tokens ensure your data is always protected. |
| **🔒 Secure Data Storage** | All sensitive information is encrypted and stored securely in MongoDB Atlas. |

### 🎨 User Experience

| Feature | Description |
| :--- | :--- |
| **📱 Responsive Design** | Beautiful, modern UI that works perfectly on desktop, tablet, and mobile devices. |
| **⚡ Real-Time Updates** | Instant feedback with toast notifications and smooth loading states. |
| **🎭 Smooth Animations** | Delightful micro-interactions and transitions powered by TailwindCSS. |
| **🌈 Color-Coded Alerts** | Visual indicators for budget status (green for safe, yellow for warning, red for over). |

---

## 🛠️ Tech Stack & Tools

Built with cutting-edge technologies for performance, security, and scalability.

### Frontend
| Technology | Purpose |
| :--- | :--- |
| **React 19** | Latest version of the powerful UI library with improved performance |
| **React Router** | Client-side routing for seamless navigation |
| **TailwindCSS 4** | Utility-first CSS framework for beautiful, responsive designs |
| **Chart.js + React-Chartjs-2** | Interactive data visualizations and charts |
| **Heroicons** | Beautiful hand-crafted SVG icons |
| **React Hot Toast** | Elegant toast notifications |
| **Vite** | Lightning-fast build tool and dev server |

### Backend
| Technology | Purpose |
| :--- | :--- |
| **Node.js** | JavaScript runtime for server-side logic |
| **MongoDB Atlas** | Cloud-hosted NoSQL database for data storage |
| **Mongoose** | Elegant MongoDB object modeling with schema validation |
| **JWT (jsonwebtoken)** | Secure authentication and authorization |
| **bcryptjs** | Password hashing and security |
| **Nodemailer** | Email service for verification and password reset |
| **CORS** | Cross-origin resource sharing configuration |

### AI & External Services
| Technology | Purpose |
| :--- | :--- |
| **OpenAI GPT-3.5** | Powers smart categorization, pricing search, and budget analysis |
| **Custom AI Algorithms** | Fallback system with rule-based intelligence |

### Deployment & DevOps
| Technology | Purpose |
| :--- | :--- |
| **Vercel** | Serverless deployment platform with automatic CI/CD |
| **Git & GitHub** | Version control and collaborative development |

---

## ⚙️ Getting Started

Want to run this project locally? Follow these simple steps.

### Prerequisites

Make sure you have the following installed:
* **[Node.js](https://nodejs.org/)** (v18.x or higher)
* **[npm](https://www.npmjs.com/)** or **[yarn](https://yarnpkg.com/)**
* **[MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas)** (free tier works great!)
* **[OpenAI API Key](https://platform.openai.com/api-keys)** (optional, for AI features)

### Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/janreidev-web/expensegenie.git
    cd expensegenie
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    ```bash
    cp .env.example .env
    ```
    
    Then edit `.env` with your credentials:
    
    ```env
    # Required
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_strong_random_secret
    
    # Email Configuration
    EMAIL_SERVICE=gmail
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASSWORD=your_gmail_app_password
    EMAIL_FROM=noreply@expensegenie.com
    
    # Frontend URL
    FRONTEND_URL=http://localhost:5173
    
    # Optional - AI Features
    OPENAI_API_KEY=your_openai_api_key
    ```

4.  **Generate a secure JWT secret:**
    ```bash
    node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
    ```

5.  **Set up Gmail App Password** (for email features):
    - Enable 2-factor authentication in your Google account
    - Generate an App Password: https://myaccount.google.com/apppasswords
    - Use the generated password in `EMAIL_PASSWORD`

6.  **Run the development server:**
    ```bash
    npm run dev
    ```

7.  **Open your browser:**
    Navigate to [http://localhost:5173](http://localhost:5173)

### Building for Production

```bash
npm run build
npm run preview
```

---

## 🔑 OpenAI API Key (Optional)

ExpenseGenie works great **without** an OpenAI API key! Here's what you get:

### ✅ Without OpenAI API Key
- ✨ **Smart Budget Planning** - Rule-based algorithm with category-specific strategies
- 🎯 **Expense Categorization** - 90%+ accuracy using comprehensive keyword matching
- 📊 **Spending Analysis** - Pattern detection and trend identification
- 💡 **Actionable Tips** - Pre-defined money-saving strategies per category
- 📈 **All Core Features** - Full app functionality

### 🚀 With OpenAI API Key (Enhanced)
- 🔍 **Automatic Pricing Search** - AI finds current market prices for your goals
- 🤖 **Personalized Insights** - Custom recommendations based on your unique patterns
- 💬 **Natural Language** - Better understanding of expense descriptions
- 🎯 **Deeper Analysis** - More nuanced spending pattern recognition

**To enable OpenAI features:**
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to your `.env` file: `OPENAI_API_KEY=your_api_key_here`
3. Restart your server

---

## 📁 Project Structure

```
expensegenie/
├── api/                        # Backend API routes
│   ├── ai/                    # AI-powered endpoints
│   │   ├── categorize.js      # Smart expense categorization
│   │   └── generate-budget-plan.js  # AI budget planning
│   ├── auth.js                # Consolidated authentication
│   ├── budgets/               # Budget management
│   └── expenses/              # Expense CRUD operations
├── src/                       # Frontend React application
│   ├── components/            # Reusable components
│   │   ├── Body/             # Main app sections
│   │   │   ├── Dashboard/    # Expense dashboard
│   │   │   ├── Trends/       # Spending trends & insights
│   │   │   ├── Budgeting/    # Budget planning & AI assistant
│   │   │   └── Summary/      # Financial summary
│   │   ├── Header.jsx        # Navigation header
│   │   └── Footer.jsx        # Page footer
│   ├── pages/                # Page components
│   │   └── user_creds/       # Authentication pages
│   ├── assets/               # Static assets
│   └── App.jsx               # Main app component
├── models/                    # Database schemas
│   └── User.js               # User model with verification
├── utils/                     # Utility functions
│   ├── emailService.js       # Email sending logic
│   ├── codeGenerator.js      # Verification code generation
│   └── db.js                 # Database connection
└── vercel.json               # Vercel deployment config
```

---

## 🎯 Key Features Showcase

### 💡 AI Budget Planning Assistant

Create personalized savings plans with just a few clicks:

1. **Name Your Goal** - What are you saving for? (e.g., "MacBook Pro M3")
2. **Auto-Search Pricing** - Enable price search and let AI find current market prices
3. **Set Timeline** - Choose 1-24 months
4. **Get Your Plan** - Receive personalized budget cuts with detailed tips

**Example Output:**
```
🔍 Pricing Research: MacBook Pro M3 - ₱120,000
📊 Analysis: Based on 3 months of data, your average spending is ₱35,000...

💡 Key Insights:
• Food accounts for 42% of your monthly spending
• Your spending is already lean - consider a longer timeline

Recommended Budget Cuts:
✂️ Food: -₱2,500 → New budget: ₱12,500
   💡 Meal prep on weekends, bring lunch 4-5x/week
   
✂️ Leisure: -₱1,800 → New budget: ₱4,200
   💡 Focus on free activities: hiking, library resources
```

### 📊 Intelligent Spending Trends

- **3/6/12 Month Views** - Flexible time range analysis
- **Pattern Detection** - AI identifies spending trends
- **Month-over-Month Comparison** - Track improvements
- **Category Breakdown** - Visual doughnut charts
- **Predictive Insights** - Forecast next month's spending

### 🎯 Smart Expense Categorization

Simply add an expense description and AI automatically categorizes it:
- "Jollibee lunch" → Food
- "Test papers" → Education  
- "Netflix subscription" → Bills
- "Grab ride to work" → Transportation

**90%+ accuracy** with fallback to comprehensive keyword matching.

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Fork this repository**

2. **Import to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your forked repository

3. **Configure Environment Variables:**
   Add all environment variables from `.env.example` in Vercel dashboard

4. **Deploy:**
   - Click "Deploy"
   - Your app will be live in minutes!

### Environment Variables for Production

```env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your_production_email
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@yourdomain.com
FRONTEND_URL=https://yourdomain.com
OPENAI_API_KEY=your_openai_key  # Optional
```

---

## 🗺️ Roadmap

### Completed ✅
- [x] AI-powered expense categorization
- [x] Automatic pricing search for budget goals
- [x] Deep spending analysis and insights
- [x] Email verification with 6-digit codes
- [x] Password reset functionality
- [x] Real-time budget tracking
- [x] Interactive spending trends
- [x] Responsive mobile design

### Coming Soon 🚧
- [ ] **Multi-currency support** - Track expenses in different currencies
- [ ] **Receipt scanning** - OCR technology to extract data from receipts
- [ ] **Recurring expenses** - Automatic tracking of subscriptions
- [ ] **Budget sharing** - Collaborate with family members
- [ ] **Export reports** - PDF/CSV export for tax purposes
- [ ] **Bank integration** - Connect bank accounts for auto-import
- [ ] **Mobile app** - React Native iOS/Android apps
- [ ] **Voice commands** - "Add ₱500 expense for lunch"
- [ ] **Financial goals tracking** - Multiple savings goals
- [ ] **Bill reminders** - Smart notifications for upcoming bills

### Future Ideas 💭
- Investment tracking
- Debt payoff calculator
- Credit score monitoring
- AI financial advisor chatbot
- Social spending challenges
- Gamification with rewards

---

## 📝 License

This project is **open source** and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT API that powers our AI features
- **MongoDB** for reliable cloud database hosting
- **Vercel** for seamless deployment and hosting
- **Heroicons** for beautiful icon sets
- **Chart.js** for amazing data visualization

---

## 📧 Contact & Support

**Developer:** John Rey Layderos  
**GitHub:** [@janreidev-web](https://github.com/janreidev-web)

### Found a Bug?
Please [open an issue](https://github.com/janreidev-web/expensegenie/issues) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

### Have Questions?
Feel free to reach out via [GitHub Discussions](https://github.com/janreidev-web/expensegenie/discussions)

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

**Development Guidelines:**
- Write clean, readable code
- Follow existing code style and conventions
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation when adding features

---

## ⭐ Show Your Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📢 Sharing with others

---

<div align="center">
  <br>
  <p><strong>Built with ❤️ by John Rey Layderos</strong></p>
  <p>
    <a href="https://github.com/janreidev-web">GitHub</a> •
    <a href="https://expensegeniedev.vercel.app/">Live Demo</a>
  </p>
  <br>
  <p>
    <sub>💸 Making Financial Management Intelligent and Effortless</sub>
  </p>
</div>