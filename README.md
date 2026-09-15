# Task Vault

> A production-grade Node.js backend API built with Express, MongoDB, and TypeScript.

![Node.js](https://img.shields.io/badge/Node.js-ES2025-black?logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript)
![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)
![License](https://img.shields.io/badge/License-ISC-blue)

---

## 📋 Overview

**Task Vault** is a robust and scalable backend API service designed for reliability and performance. It provides a solid foundation for building RESTful APIs with modern tooling, structured architecture, and production-ready features like graceful shutdown, structured logging, and environment validation.

---

## ✨ Features

- **🚀 Production-Ready Architecture** — Built with graceful shutdown, connection draining, and lifecycle management
- **📝 Structured Logging** — Powered by [Pino](https://getpino.io) with automatic redaction of sensitive data (passwords, tokens, secrets)
- **🔒 Environment Validation** — Strict runtime validation using [Zod](https://zod.dev) for all environment variables
- **🗄️ MongoDB Integration** — Advanced Mongoose configuration with connection pooling, retry logic, and replica set verification
- **⚡ Modern TypeScript** — ES2025 with strict type-checking, path aliases, and isolated modules
- **🛡️ Graceful Shutdown** — Handles SIGTERM, SIGINT, SIGQUIT, SIGHUP with connection cleanup and log flushing
- **🔧 Modular Structure** — Clean separation of concerns with config, middleware, shared, and utils modules

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | ES2025 | Runtime environment |
| **TypeScript** | 7.0 | Type-safe development |
| **Express** | 5.2 | Web framework |
| **MongoDB + Mongoose** | 9.9 | Database & ODM |
| **Pino** | 10.3 | Structured logging |
| **Zod** | 4.5 | Schema & environment validation |
| **pnpm** | Workspace | Package management |

---

## 📁 Project Structure

```
task-vault/
├── backend/
│   ├── src/
│   │   ├── app.ts                  # Express application entry point
│   │   ├── config/
│   │   │   ├── db.ts               # MongoDB connection management
│   │   │   ├── env.ts              # Environment variable parsing
│   │   │   └── env/
│   │   │       ├── schema.ts       # Zod validation schema
│   │   │       └── primitives.ts   # Env primitive utilities
│   │   ├── middlewares/
│   │   │   └── error.middleware.ts # Global error handling middleware
│   │   ├── shared/
│   │   │   ├── identity.ts         # Service name & identity
│   │   │   ├── lifecycle.ts        # Shutdown lifecycle management
│   │   │   └── http/
│   │   │       └── envelope.ts     # HTTP response envelope
│   │   ├── utils/
│   │   │   ├── logger.ts           # Pino logger configuration
│   │   │   └── http.server.ts      # HTTP server lifecycle utilities
│   │   └── modules/                # Feature modules (extendable)
│   ├── server.ts                   # Server bootstrap & shutdown logic
│   ├── tsconfig.json               # TypeScript configuration
│   ├── package.json                # Dependencies & scripts
│   └── .env                        # Environment variables
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ (ES2025 support required)
- **pnpm** 9+
- **MongoDB** (local or Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd task-vault/backend
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   Copy `.env.example` and update values:
   ```bash
   cp .env.example .env
   ```

   | Variable | Description | Default |
   |---|---|---|
   | `NODE_ENV` | Environment mode | `development` |
   | `PORT` | Server port | `5000` |
   | `MONGODB_URI` | MongoDB connection string | Required |
   | `LOG_LEVEL` | Pino log level | `debug` (dev) / `info` (prod) |

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

5. **Build for production:**
   ```bash
   pnpm build
   ```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server with hot-reload (tsx watch) |
| `pnpm build` | Compile TypeScript to `dist/` |

---

## 🏗️ Architecture

### Configuration Layer
- **`config/env`** — Validates and exposes environment variables using Zod schemas
- **`config/db`** — Manages MongoDB connections with pooling, retry logic, and topology validation

### Application Layer
- **`app.ts`** — Initializes the Express application with middleware
- **`middlewares/error.middleware.ts`** — Global error handling middleware

### Shared Layer
- **`shared/identity.ts`** — Service identity constants
- **`shared/lifecycle.ts`** — Shutdown state management
- **`shared/http/envelope.ts`** — Standardized HTTP response formatting

### Utilities Layer
- **`utils/logger.ts`** — Pino logger with environment-aware transport and sensitive data redaction
- **`utils/http.server.ts`** — Server lifecycle management (listen, close, idle connection draining)

### Server Bootstrap
- **`server.ts`** — Orchestrates startup, graceful shutdown, signal handling, and connection lifecycle

---

## 🔒 Graceful Shutdown

The server implements a robust shutdown mechanism:

1. **Signal Detection** — Listens for `SIGTERM`, `SIGINT`, `SIGQUIT`, `SIGHUP`
2. **Drain Delay** — Optional delay before closing the listener (production: 5s)
3. **Connection Cleanup** — Closes HTTP server and MongoDB connections
4. **Log Flushing** — Ensures all logs are flushed before process exit
5. **Force Timeout** — Falls back to forced exit if graceful shutdown exceeds the timeout

---

## 📊 Logging

- **Development**: Pretty-printed colored logs via `pino-pretty`
- **Production**: Compact JSON logs via Pino
- **Redaction**: Automatically redacts authorization headers, cookies, passwords, tokens, and secrets
- **Transport**: Configurable log levels per environment

---

## 🧪 Environment Validation

All environment variables are validated at startup using Zod:
- `NODE_ENV` — Must be `development` or `production`
- `PORT` — Integer between 1–65535
- `MONGODB_URI` — Non-empty string starting with `mongodb`

Invalid configurations cause the process to exit with a clear error message.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

## 📧 Contact

**Author**: [mrahman7148]

**Repository**: [Task Vault](https://github.com/mrahman7148/task-vault)

---

<p align="center">
  <strong>Task Vault</strong> — Built for reliability, designed for scale.
</p>
