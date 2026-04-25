# 🌙 Crescent.js Documentation — Phase 1

## Overview

Crescent.js is a full-stack JavaScript framework with four built-in modules:

| Module | Purpose | Access |
|--------|---------|--------|
| **Database** | Store and query data without an external DB | `Crescent.Database` |
| **Auth** | User registration, login, sessions | `Crescent.Auth` |
| **Backend** | Functions, conditionals, loops, logic | `Crescent.Backend` |
| **Frontend** | Component-based UI with layers | `Crescent.Frontend` |

## Install

```bash
npm install crescent-js
```

## Import

```javascript
const Crescent = require('crescent-js');

// Or destructure individual modules
const { Database, Auth, Backend, Frontend } = require('crescent-js');
```

## Documentation Files

- [Database Module](./database.md) — FileManager, QueryEngine, DatabaseSyntax, LiveSearch
- [Auth Module](./auth.md) — Password, Cookie, DBSchema, Signup, Login, OAuth
- [Backend Module](./backend.md) — RocketFunction, Conditional, Loop, RocketBoolean, Collect, APICall, APIMake
- [Frontend Module](./frontend.md) — Page, Object, Layers, Transition, Trigger, Responsive, Renderer

## Quick Example

```javascript
const Crescent = require('crescent-js');

// Database
const { FileManager, QueryEngine } = Crescent.Database;
const fm = new FileManager({ base_path: './data' });
fm.create_collection('users');

// Auth
const { Password, Signup, Login } = Crescent.Auth;
const hash = await Password.hash('mypassword');

// Backend
const { RocketFunction, Conditional } = Crescent.Backend;
const fn = new RocketFunction('greet', { body: (n) => `Hello, ${n}!` });

// Frontend
const { Page, TextLayer } = Crescent.Frontend;
const page = new Page({ title: 'My App' });