# 🌙 Crescent.js (Rocket.js) Documentation

> **⚠️ This is Phase 1 of 3** in the Rocket.js roadmap. The current release includes the JavaScript Framework and Deployment Platform. See [Roadmap](#roadmap) for upcoming phases.

## Overview

Crescent.js is a full-stack JavaScript platform with **six built-in modules** across two phases:

### Phase 1a — JavaScript Framework

| Module | Purpose | Access |
|--------|---------|--------|
| **Database** | Store and query data without an external DB | `Crescent.Database` |
| **Auth** | User registration, login, sessions | `Crescent.Auth` |
| **Backend** | Functions, conditionals, loops, logic | `Crescent.Backend` |
| **Frontend** | Component-based UI with cartesian layers | `Crescent.Frontend` |

### Phase 1b — Deployment Platform

| Module | Purpose | Access |
|--------|---------|--------|
| **SSH** | Remote server connections & key management | `require('crescent-js/src/phase2/ssh/...')` |
| **Orchestrator** | Server management, routing, packages | `require('crescent-js/src/phase2/orchestrator/...')` |
| **SubServer** | Instances, load balancing, queues | `require('crescent-js/src/phase2/subserver/...')` |
| **Database (VoidDB)** | Full database suite — VoidDB, CacheDB, BackupDB, etc. | `require('crescent-js/src/phase2/database/...')` |
| **Scaling** | Auto-scaling, health monitoring, metrics | `require('crescent-js/src/phase2/scaling/...')` |
| **Hosting** | Domains, SSL, deployment | `require('crescent-js/src/phase2/hosting/...')` |
| **Cloud** | Cloud providers, instances, storage | `require('crescent-js/src/phase2/cloud/...')` |
| **Crash** | Crash handling, recovery, logging | `require('crescent-js/src/phase2/crash/...')` |
| **Admin** | Admin panel, user management, audit logs | `require('crescent-js/src/phase2/admin/...')` |
| **DB Libraries** | Adapters, connection pools | `require('crescent-js/src/phase2/db_libraries/...')` |
| **WebUI** | Dashboard, API routes, WebSocket | `require('crescent-js/src/phase2/webui/...')` |

## Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** (current) | Framework + Deployment Platform | ✅ Complete |
| **Phase 2** | Crescent.Launch — Stripe billing, cloud API keys, free tier management, deployment config | 🔜 Next |
| **Phase 3** | Full cloud orchestration, multi-region scaling, production hardening | 📋 Planned |

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
- [Frontend Module](./frontend.md) — Page, Object, Layers, Transition, Trigger, Responsive, Renderer

### Phase 1b — Deployment Platform
- [SSH Module](./ssh.md) — Connection, KeyLibrary, ServerInfo
- [Orchestrator Module](./orchestrator.md) — Server, RequestRouter, ResponseHandler, Cloudflare, PackageManager
- [SubServer Module](./subserver.md) — Instance, Manager, Queue, LoadBalancer, SubPackage
- [Database Module (Phase 2)](./database_phase2.md) — VoidDB, QueryDB, FileDB, CacheDB, SyncDB, BackupDB, ReplicateDB, MigrateDB
- [Scaling Module](./scaling.md) — AutoScale, ManualScale, Metrics, HealthMonitor, Threshold, ResourceManager, Scheduler
- [Hosting Module](./hosting.md) — Domain, SSL, Deploy
- [Cloud Module](./cloud.md) — Provider, InstanceManager, Storage
- [Crash Module](./crash.md) — CrashHandler, Recovery, CrashLog
- [Admin Module](./admin.md) — AdminPanel, UserManagement, AuditLog
- [DB Libraries Module](./db_libraries.md) — Adapter, VoidAdapter, ConnectionPool
- [WebUI Module](./webui.md) — Dashboard, APIRoutes, WebSocket

## Quick Example

```javascript
const Crescent = require('crescent-js');

// Database
const { FileManager, QueryEngine } = Crescent.Database;
const fm = new FileManager({ base_path: './data' });
fm.create_collection('users');

// Auth
const { Password, Signup, Login } = Crescent.Auth;

// Backend
const { RocketFunction, Conditional } = Crescent.Backend;
const fn = new RocketFunction('greet', { body: (n) => `Hello, ${n}!` });

// Frontend — cartesian coordinate system
const { Page, TextLayer } = Crescent.Frontend;
const page = new Page({ page_id: 'home', size: { width: 1920, height: 1080 } });

// Deployment — auto-scaling
const AutoScale = require('crescent-js/src/phase2/scaling/auto_scale');
const scaler = new AutoScale({ cooldown: 60000 });
scaler.add_rule('cpu', { metric: 'cpu', threshold_up: 80, threshold_down: 20 });
```

## Testing

```bash
npm test            # Run all tests (Phase 1 + Phase 2)
npm run test:phase1 # Phase 1 framework tests (65 tests)
npm run test:phase2 # Phase 2 deployment tests (11 modules)
```

All **76 tests** pass across both phases.