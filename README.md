# 🌙 Crescent.js (Rocket.js) Documentation

> **⚠️ This is Phase 1 of 2** in the crescent.js roadmap. the Database and the auth will be integrated with phrase 2

## Overview

Crescent.js is a full-stack JavaScript platform with **six built-in modules** across two phases:

### Phase 1a — JavaScript Framework

| Module | Purpose | Access |
|--------|---------|--------|
| **Database** | Store and query data without an external DB | `Crescent.Database` |
| **Auth** | User registration, login, sessions | `Crescent.Auth` |
| **Backend** | Functions, conditionals, loops, logic | `Crescent.Backend` |
| **Frontend** | Component-based UI with cartesian layers | `Crescent.Frontend` |


## Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** (current) | Framework + Deployment Platform | ✅ Complete |
| **Phase 2** | Crescent.Launch — Stripe billing, cloud API keys, free tier management, deployment config | 🔜 Next |

## Install

```bash
npm install crescent-js
```

## Import

```javascript
const Crescent = require('crescent-js');

// Or access individual modules
const { Database, Auth, Backend, Frontend } = Crescent;
```

## Documentation Files

### Phase 1a — JavaScript Framework
- [Database Module](./database.md) — FileManager, QueryEngine, DatabaseSyntax, LiveSearch
- [Auth Module](./auth.md) — Password, Cookie, DBSchema, Signup, Login, OAuth
- [Backend Module](./backend.md) — RocketFunction, Conditional, Loop, RocketBoolean, Collect, APICall, APIMake
- [Frontend Module](./frontend.md) — Page, Object, Layers, Transition, Trigger, Responsive, Renderer.
