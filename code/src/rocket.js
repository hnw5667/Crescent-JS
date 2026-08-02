/**
 * Crescent.js - Full-stack JavaScript Framework
 * A framework with integrated database, server deployment, authentication, and scaling
 */

// Phase 1 - Frontend
const BaseLayer = require('./phase1/frontend/base_layer');
const ImageLayer = require('./phase1/frontend/image_layer');
const ShapeLayer = require('./phase1/frontend/shape_layer');
const TextLayer = require('./phase1/frontend/text_layer');
const InputLayer = require('./phase1/frontend/input_layer');
const RocketObject = require('./phase1/frontend/object');
const RocketPage = require('./phase1/frontend/page');
const Transition = require('./phase1/frontend/transition');
const Trigger = require('./phase1/frontend/trigger');
const Renderer = require('./phase1/frontend/renderer');
const Responsive = require('./phase1/frontend/responsive');

// Phase 1 - Backend
const RocketFunction = require('./phase1/backend/functions');
const Conditional = require('./phase1/backend/conditionals');
const Loop = require('./phase1/backend/loops');
const ApiCall = require('./phase1/backend/api_call');
const ApiMake = require('./phase1/backend/api_make');
const Collect = require('./phase1/backend/collect');
const RocketBoolean = require('./phase1/backend/boolean');

// Phase 1 - Database
const DatabaseSyntax = require('./phase1/database/syntax');
const QueryEngine = require('./phase1/database/query_engine');
const FileManager = require('./phase1/database/file_manager');
const LiveSearch = require('./phase1/database/live_search');

// Phase 1 - Auth
const Signup = require('./phase1/auth/signup');
const Login = require('./phase1/auth/login');
const OAuth = require('./phase1/auth/oauth');
const Password = require('./phase1/auth/password');
const Cookie = require('./phase1/auth/cookie');

class Rocket {
  constructor() {
    this._pages = {};
    this._objects = {};
    this._layers = {};
    this._functions = {};
    this._transitions = {};
    this._triggers = {};
    this._conditionals = {};
    this._loops = {};
    this._booleans = {};
    this._collects = {};
    this._apis = {};
    this._responsive = null;
    this._renderer = new Renderer();

    // Database
    this._fileManager = new FileManager();
    this._queryEngine = new QueryEngine(this._fileManager);
    this._db = new DatabaseSyntax(this._queryEngine);
    this._liveSearch = new LiveSearch(this._queryEngine);

    // Auth
    this._password = new Password();
    this._cookie = new Cookie();
  }

  // ===== FRONTEND =====
  layer(config) {
    let layerInstance;
    switch (config.layer_type) {
      case 'image': layerInstance = new ImageLayer(config); break;
      case 'shape': layerInstance = new ShapeLayer(config); break;
      case 'text': layerInstance = new TextLayer(config); break;
      case 'input': layerInstance = new InputLayer(config); break;
      default: throw new Error(`Unknown layer_type: ${config.layer_type}`);
    }
    this._layers[config.layer_id] = layerInstance;
    return layerInstance;
  }

  object(config) {
    const obj = new RocketObject(config);
    this._objects[config.object_id] = obj;
    return obj;
  }

  page(config) {
    const page = new RocketPage(config, this._renderer);
    this._pages[config.page_id] = page;
    this._renderer.register_page(page);
    return page;
  }

  transition(config) {
    const transition = new Transition(config);
    this._transitions[config.transition_id] = transition;
    return transition;
  }

  trigger(config) {
    const trigger = new Trigger(config);
    this._triggers[config.trigger_id] = trigger;
    return trigger;
  }

  responsive(config) {
    this._responsive = new Responsive(config);
    return this._responsive;
  }

  // ===== BACKEND =====
  function(config) {
    const fn = new RocketFunction(config);
    this._functions[config.function_id] = fn;
    return fn;
  }

  conditional(config) {
    const cond = new Conditional(config);
    this._conditionals[config.conditional_id] = cond;
    return cond;
  }

  loop(config) {
    const lp = new Loop(config);
    this._loops[config.loop_id] = lp;
    return lp;
  }

  api_call(config) {
    return new ApiCall(config);
  }

  api_make(config) {
    const api = new ApiMake(config);
    this._apis[config.api_id] = api;
    return api;
  }

  collect(config) {
    const col = new Collect(config);
    this._collects[config.collect_id] = col;
    return col;
  }

  boolean(config) {
    const bl = new RocketBoolean(config);
    this._booleans[config.boolean_id] = bl;
    return bl;
  }

  // ===== GLOBAL FUNCTIONS =====
  print(value) { console.log(value); return value; }
  add(a, b) { return a + b; }
  subtract(a, b) { return a - b; }
  multiply(a, b) { return a * b; }
  divide(a, b) {
    if (b === 0) throw new Error("Division by zero");
    return a / b;
  }
  sqrt(n) { return Math.sqrt(n); }
  sin(n) { return Math.sin(n); }
  cos(n) { return Math.cos(n); }
  tan(n) { return Math.tan(n); }
  get_timestamp() { return Date.now(); }
  redirect(url) { if (typeof window !== 'undefined') window.location = url; }
  connect_and_pull(url, options = {}) {
    return fetch(url, options).then(r => r.json());
  }

  // ===== DATABASE =====
  get db() { return this._db; }
  get liveSearch() { return this._liveSearch; }

  // ===== AUTH =====
  get auth() {
    const self = this;
    return {
      signup: (config = {}) => new Signup(self._queryEngine, config),
      login: (config = {}) => new Login(self._queryEngine, config),
      oauth: (config = {}) => new OAuth(self._queryEngine, config),
      password: self._password,
      cookie: self._cookie
    };
  }

  // ===== GETTERS =====
  get_page(id) { return this._pages[id]; }
  get_object(id) { return this._objects[id]; }
  get_layer(id) { return this._layers[id]; }
  get_function(id) { return this._functions[id]; }
  get_transition(id) { return this._transitions[id]; }
  get_trigger(id) { return this._triggers[id]; }
  get_conditional(id) { return this._conditionals[id]; }
  get_loop(id) { return this._loops[id]; }
  get_boolean(id) { return this._booleans[id]; }
  get_api(id) { return this._apis[id]; }
  get renderer() { return this._renderer; }
}

// Singleton instance
const rocket = new Rocket();

// Export both the class and the singleton
module.exports = rocket;
module.exports.Rocket = Rocket;