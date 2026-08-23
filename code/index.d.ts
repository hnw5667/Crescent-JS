declare namespace rocket {
  interface Size {
    width: number | string;
    height: number | string;
  }

  interface Point {
    x: number;
    y: number;
  }

  interface CartesianRange {
    x: { min: number; max: number };
    y: { min: number; max: number };
  }

  interface ScalingRatios {
    height_ratio: [number, number];
    width_ratio: [number, number];
  }

  interface TextProperty {
    range: [number, number];
    colour?: string;
    size?: number;
    spacing?: string | number | { internal: string | number; external: string | number };
    font?: string;
    strike?: boolean;
    underline?: boolean;
    highlight?: boolean;
    bold?: boolean;
  }

  interface LayerConfig {
    layer_id: string;
    layer_type?: 'text' | 'image' | 'shape' | 'input';
    layer_enabled?: boolean;
    colour?: string;
    opacity?: string | number;
    rounded_corners?: string | number;
    rotate?: string | number;
    size?: Size;
    position?: Point;
    index?: number;
    text?: string;
    spacing?: string | number;
    font?: string;
    strike?: boolean;
    underline?: boolean;
    highlight?: boolean;
    bold?: boolean;
    properties?: TextProperty[];
    image_location?: string;
    layer_vertices?: number | string;
    input_method?: 'text box' | 'list';
    box_length?: number;
    box_inner_text?: string;
    box_inner_text_properties?: string[];
    box_inner_text_font?: string;
    colour_text?: string;
    written_inner_text_properties?: string[];
    written_inner_text_font?: string;
    colour_text_written?: string;
    select?: string | { min?: number; max?: number };
    list_elements?: string[];
  }

  // Text layers treat `size` as a font size (number) or a box Size.
  interface TextLayerConfig extends Omit<LayerConfig, 'size'> {
    size?: number | Size;
  }

  interface ObjectConfig {
    object_id: string;
    object_enabled?: boolean;
    size?: Size;
    bg_layer?: string;
    page_position?: Point;
    page_index?: number;
    layers_config?: LayerConfig[];
    index_config?: Record<string, number>;
    position_config?: Record<string, Point>;
    modified_at?: number;
  }

  interface PageConfig {
    page_id: string;
    page_enabled?: boolean;
    size?: Size;
    page_bg?: string | BaseLayer;
    page_url?: string;
    page_title?: string;
    page_description?: string;
    page_type?: string;
    objects_config?: ObjectConfig[];
    index_config?: Record<string, number>;
    position_config?: Record<string, Point>;
    scaling_config?: Record<string, ScalingRatios>;
  }

  interface TransitionChange {
    object_id: string;
    layer_id: string;
    property: string;
    value: any;
  }

  interface TransitionConfig {
    transition_id?: string;
    objects?: RocketObject[];
    time?: string | number;
    changes?: TransitionChange[];
  }

  interface TriggerAction {
    type: 'transition' | 'api_call' | 'redirect' | 'set_property';
    transition?: Transition;
    api_call?: { execute(): any };
    page_id?: string;
    url?: string;
    layer_id?: string;
    property?: string;
    value?: any;
  }

  interface TriggerConfig {
    trigger_id?: string;
    layer_id: string;
    event?: 'click' | 'hover' | 'scroll' | 'keypress' | 'focus' | 'submit';
    condition?: (event: Event, layer: BaseLayer) => boolean;
    true_sequence?: (TriggerAction | ((event: Event, layer: BaseLayer) => void))[];
    false_sequence?: (TriggerAction | ((event: Event, layer: BaseLayer) => void))[];
    redirect_page?: string;
    hover_direction?: 'enter' | 'leave';
  }

  interface ResponsiveConfig {
    page?: RocketPage;
    breakpoints?: Array<{ name: string; maxWidth: number }>;
  }

  interface FunctionConfig {
    function_id: string;
    function_enabled?: boolean;
    params?: any[];
    body?: (...args: any[]) => any;
  }

  interface BranchAction {
    type: string;
    target?: BaseLayer;
    property?: string;
    value?: any;
    function?: (...args: any[]) => any;
    args?: any[];
  }

  interface Branch {
    check: any;
    actions: Array<(value?: any) => any | BranchAction>;
  }

  interface ConditionalConfig {
    conditional_id: string;
    conditional_enabled?: boolean;
    if?: Branch;
    else_if?: Branch[];
    else?: { actions: any[] };
  }

  interface LoopConfig {
    loop_id: string;
    loop_enabled?: boolean;
    loop_type?: 'for' | 'while' | 'for_in';
    start?: number;
    end?: number;
    step?: number;
    condition?: any;
    iterable?: any[];
    actions?: any[];
  }

  interface ApiCallConfig {
    api_call_id: string;
    url?: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
    secret?: string;
  }

  interface ApiEndpoint {
    method: string;
    path: string;
    handler(req: any, res: any): void;
  }

  interface ApiMakeConfig {
    api_id: string;
    port?: number;
    host?: string;
    endpoints?: ApiEndpoint[];
    cors?: boolean;
    secret?: string;
  }

  interface CollectConfig {
    collect_id: string;
    sources?: any[];
    transform?: (data: any) => any;
    validate?: (data: any) => boolean;
    secret?: string;
  }

  interface BooleanConfig {
    boolean_id: string;
    value1?: any;
    value2?: any;
    operator?: 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';
  }

  interface TunnelConfig {
    secret?: string;
    tunnel_id?: string;
    port?: number;
    host?: string;
  }

  interface ComponentCacheConfig {
    cache_dir?: string;
    cache_file?: string;
    tracker_dir?: string;
    secret?: string;
    position?: Point;
  }

  // ===== JS-First Component System (v1.0.6) =====
  interface SectionConfig {
    section_id?: string;
    section_name?: string;
    name?: string;
    id?: string;
    type?: 'text' | 'image' | 'shape' | 'input' | 'section';
    section_type?: string;
    text?: string;
    content?: string;
    html?: string;
    image_location?: string;
    list_elements?: string[];
    input_method?: string;
    box_inner_text?: string;
    box_length?: number;
    select?: string | { min?: number; max?: number };
    style?: Record<string, any>;
    colour?: string;
    opacity?: string | number;
    size?: Size | number;
    font?: string;
    bold?: boolean;
    className?: string;
    class_name?: string;
    tag?: string;
    colour_text?: string;
    rounded_corners?: string | number;
    rotate?: string | number;
    [key: string]: any;
  }

  interface JSComponentConfig {
    component_id: string;
    component_name?: string;
    component_enabled?: boolean;
    size?: Size;
    style?: Record<string, any>;
    className?: string;
    class_name?: string;
    sections?: SectionConfig[] | Record<string, SectionConfig>;
    modified_at?: number;
  }

  interface ComponentBundle {
    component_id: string;
    html: string;
    js: any;
    css: string;
    sections: string[];
    bundled_at: number;
  }

  interface PageBundle {
    page_id: string;
    html: string;
    bundles: ComponentBundle[];
    bundled_at: number;
    js: any;
    cache_payload?: any;
  }

  interface BundlerConfig {
    outDir?: string;
    out_dir?: string;
    bundleName?: string;
    bundle_name?: string;
    cacheConfig?: ComponentCacheConfig;
    cache_config?: ComponentCacheConfig;
  }

  interface OAuthProviderConfig {
    client_id: string;
    client_secret: string;
    authorize_url: string;
    token_url: string;
    user_info_url: string;
    scope?: string;
    redirect_uri: string;
  }

  interface PasswordHash {
    hash: string;
    salt: string;
  }

  interface PasswordStrength {
    strength: 'weak' | 'medium' | 'strong';
    score: number;
  }

  interface SessionPayload {
    user_id: string;
    iat: number;
    exp: number;
    jti: string;
  }

  interface ComponentResolution {
    type: 'normal' | 'update' | 'reuse';
    id?: string;
    position?: Point;
    index?: number;
    component?: any;
    html?: string;
  }

  interface PagePayload {
    page_id?: string;
    components: ComponentResolution[];
  }

  interface ConnectOptions {
    headers?: Record<string, string>;
    method?: string;
    body?: any;
    secret?: string;
  }

  class BaseLayer {
    layer_id: string;
    layer_type: string;
    layer_enabled: boolean;
    colour: string;
    opacity: string | number;
    rounded_corners: string | number;
    rotate: string | number;
    size: Size | number | string;
    position: Point;
    index: number;
    _element: HTMLElement | null;

    constructor(config: LayerConfig);
    render(): HTMLElement;
    get_value(): any;
    get_element(): HTMLElement | null;
    set_property(name: string, value: any): void;
  }

  class TextLayer extends BaseLayer {
    text: string;
    spacing: string | number;
    font: string;
    strike: boolean;
    underline: boolean;
    highlight: boolean;
    bold: boolean;
    properties: TextProperty[];

    constructor(config: LayerConfig);
  }

  class ImageLayer extends BaseLayer {
    image_location: string;

    constructor(config: LayerConfig);
  }

  class ShapeLayer extends BaseLayer {
    layer_vertices: number | string;

    constructor(config: LayerConfig);
  }

  class InputLayer extends BaseLayer {
    input_method: 'text box' | 'list';
    box_length: number;
    box_inner_text: string;
    box_inner_text_properties: string[];
    box_inner_text_font: string;
    colour_text: string;
    written_inner_text_properties: string[];
    written_inner_text_font: string;
    colour_text_written: string;
    select: string | { min?: number; max?: number };
    list_elements: string[];

    constructor(config: LayerConfig);
    get_value(): string | string[] | null;
  }

  class RocketObject {
    object_id: string;
    object_enabled: boolean;
    size: Size;
    layers: Map<string, BaseLayer>;
    index: Map<string, number>;
    position: Map<string, Point>;
    bg_layer: string | null;
    page_position: Point;
    page_index: number;
    modified_at: number;
    _element: HTMLElement | null;

    constructor(config: ObjectConfig);
    get_cartesian_range(): CartesianRange;
    add_layer(layer: BaseLayer): this;
    remove_layer(layer_id: string): this;
    get_layer(layer_id: string): BaseLayer | null;
    set_layer_index(layer_id: string, idx: number): this;
    set_layer_position(layer_id: string, x: number, y: number): this;
    set_bg_layer(layer_id: string): this;
    render(): HTMLElement;
    get_value(): Record<string, any>;
    get_element(): HTMLElement | null;
    set_property(name: string, value: any): void;
    set_transition(transition: Transition): this;
  }

  class RocketPage {
    page_id: string;
    page_enabled: boolean;
    size: Size;
    page_bg: string | BaseLayer;
    page_url: string;
    page_title: string;
    page_description: string;
    page_type: string;
    objects: Map<string, RocketObject>;
    index: Map<string, number>;
    position: Map<string, Point>;
    scaling_ratios: Map<string, ScalingRatios>;
    _element: HTMLElement | null;

    constructor(config: PageConfig);
    get_cartesian_range(): CartesianRange;
    add_object(object: RocketObject): this;
    remove_object(object_id: string): this;
    get_object(object_id: string): RocketObject | null;
    set_object_position(object_id: string, x: number, y: number): this;
    set_object_index(object_id: string, idx: number): this;
    set_scaling_ratio(object_id: string, height_ratio: [number, number], width_ratio: [number, number]): this;
    render(): HTMLElement;
    navigate_to(page_id: string): void;
    get_values(): Record<string, any>;
    get_element(): HTMLElement | null;
    set_property(name: string, value: any): void;
    destroy(): void;
  }

  class RocketRenderer {
    pages: Map<string, RocketPage>;

    constructor();
    register_page(page: RocketPage): this;
    basehtml(htmlOrPath: string): this;
    root(selector: string): this;
    mount(container: HTMLElement): this;
    navigate(page_id: string): this;
    render_full_page(page_id: string): string;
    get_current_page(): RocketPage | null;
    get_page(page_id: string): RocketPage | null;
  }

  class Transition {
    objects: RocketObject[];
    time: number;
    changes: TransitionChange[];

    constructor(config: TransitionConfig);
    play(onComplete?: () => void): this;
    reverse(onComplete?: () => void): this;
    stop(): this;
    is_playing(): boolean;
    add_change(object_id: string, layer_id: string, property: string, value: any): this;
    add_object(object: RocketObject): this;
  }

  class Trigger {
    layer_id: string;
    event: 'click' | 'hover' | 'scroll' | 'keypress' | 'focus' | 'submit';
    condition: ((event: Event, layer: BaseLayer) => boolean) | null;
    true_sequence: (TriggerAction | ((event: Event, layer: BaseLayer) => void))[];
    false_sequence: (TriggerAction | ((event: Event, layer: BaseLayer) => void))[];
    redirect_page: string | null;
    hover_direction: 'enter' | 'leave' | null;

    constructor(config: TriggerConfig);
    attach(layer?: BaseLayer): this;
    tryAttach(): this;
    detach(): this;
    on_true(action: TriggerAction | ((event: Event, layer: BaseLayer) => void)): this;
    on_false(action: TriggerAction | ((event: Event, layer: BaseLayer) => void)): this;
    set_condition(conditionFn: (event: Event, layer: BaseLayer) => boolean): this;
    set_redirect(page_id: string): this;
  }

  class Responsive {
    page: RocketPage | null;

    constructor(config: ResponsiveConfig);
    init(page?: RocketPage): this;
    get_breakpoint(): string;
    calculate_ratios(object: RocketObject, viewportWidth: number, viewportHeight: number): ScalingRatios;
    scale_object(object: RocketObject, originalWidth: number, originalHeight: number, newWidth: number, newHeight: number): void;
    destroy(): void;
  }

  class RocketFunction {
    function_id: string;
    function_enabled: boolean;
    params: any[];
    body: (...args: any[]) => any;

    constructor(config: FunctionConfig);
    call(...args: any[]): any;
    set_enabled(bool: boolean): this;
    get_params(): any[];
    set_body(fn: (...args: any[]) => any): this;
  }

  class Conditional {
    conditional_id: string;
    conditional_enabled: boolean;
    if_branch: Branch;
    else_if_branches: Branch[];
    else_branch: { actions: any[] };

    constructor(config: ConditionalConfig);
    evaluate(): 'if' | 'else_if' | 'else' | null;
    set_if(check: any, actions?: any[]): this;
    add_else_if(check: any, actions?: any[]): this;
    set_else(actions?: any[]): this;
  }

  class Loop {
    loop_id: string;
    loop_enabled: boolean;
    loop_type: 'for' | 'while' | 'for_in';
    start: number;
    end: number;
    step: number;
    condition: any;
    iterable: any[];
    actions: any[];

    constructor(config: LoopConfig);
    run(): any[];
    get_results(): any[];
  }

  class ApiCall {
    api_call_id: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    body: any;
    timeout: number;
    secret: string;

    constructor(config: ApiCallConfig);
    call(): Promise<any>;
    get_response(): any;
    get_error(): Error | null;
  }

  class ApiMake {
    api_id: string;
    port: number;
    host: string;
    endpoints: ApiEndpoint[];
    cors: boolean;
    secret: string;

    constructor(config: ApiMakeConfig);
    add_endpoint(method: string, path: string, handler: (req: any, res: any) => void): this;
    use(middleware: (req: any, res: any, next: () => void) => void): this;
    start(): Promise<{ port: number; host: string }>;
    stop(): Promise<void>;
  }

  class Collect {
    collect_id: string;
    sources: any[];
    transform: ((data: any) => any) | null;
    validate: ((data: any) => boolean) | null;
    secret: string;

    constructor(config: CollectConfig);
    collect(): any;
    get_data(): any;
    add_source(source: any): this;
    set_transform(fn: (data: any) => any): this;
    set_validate(fn: (data: any) => boolean): this;
    send(url: string, options?: ConnectOptions): Promise<any>;
  }

  class RocketBoolean {
    boolean_id: string;
    value1: any;
    value2: any;
    operator: 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';

    constructor(config: BooleanConfig);
    evaluate(): boolean;
    and(other: RocketBoolean): RocketBoolean;
    or(other: RocketBoolean): RocketBoolean;
    not(): RocketBoolean;
  }

  class EncryptedTunnel {
    secret: string;
    tunnel_id: string;
    port: number | null;
    host: string | null;
    server: any;
    closed: boolean;

    constructor(config?: TunnelConfig);
    send(data: any, options?: { secret?: string }): string;
    receive(packet: string, options?: { secret?: string }): any;
    handshake(remote?: string, secret?: string): { tunnel_id: string; secret_id: string; status: 'open' | 'closed' };
    sendAsTunnel(data: any, options?: { secret?: string }): string;
    close(): void;
    is_open(): boolean;
  }

  class ComponentCache {
    config: ComponentCacheConfig;
    cache_dir: string;
    cache_file: string;
    cache_path: string;
    tracker_dir: string;
    secret: string | undefined;

    constructor(config?: ComponentCacheConfig);
    is_enabled(): boolean;
    has_tracker(): boolean;
    enable(): this;
    disable(): this;
    serialize_component(object: any): any;
    resolve_component(object: any, pagePosition?: Point, pageIndex?: number): ComponentResolution;
    resolve_js_component(component: any, pagePosition?: Point, pageIndex?: number): ComponentResolution;
    store_component(object: any, component?: any): any;
    store_html(id: string, html: string, js?: any): any;
    get_cached(id: string): any;
    get_cached_html(id: string): string | null;
    load_cache(): any[];
    save_cache(entries: any[]): void;
    build_page_payload(page: RocketPage | any): { components: ComponentResolution[] };
    build_page_payload_with_html(page: RocketPage | any): { components: ComponentResolution[] };
    clear(): this;
  }

  class JSComponent {
    component_id: string;
    component_name: string;
    component_enabled: boolean;
    size: Size | null;
    style: Record<string, any>;
    className: string;
    modified_at: number;
    sections: Map<string, SectionConfig>;
    _element: HTMLElement | null;

    constructor(config: JSComponentConfig);
    add_section(section: SectionConfig): this;
    remove_section(section_id: string): this;
    get_section(section_id: string): SectionConfig | null;
    get_sections(): SectionConfig[];
    get_section_ids(): string[];
    has_section(section_id: string): boolean;
    set_property(name: string, value: any): this;
    set_section_property(section_id: string, prop: string, value: any): this;
    render(): HTMLElement | null;
    get_element(): HTMLElement | null;
    serialize(): any;
    toJSON(): any;
  }

  class HtmlGenerator {
    static generateSectionHTML(section: SectionConfig, componentStyle?: Record<string, any>): string;
    static generateComponentHTML(component: JSComponent | JSComponentConfig | any): string;
    static generatePageHTML(page: any, components?: any[]): string;
    static createElement(component: JSComponent | any): HTMLElement;
    static hydrate(container: HTMLElement, component: JSComponent | any): HTMLElement;
    static styleToCss(section: SectionConfig, componentStyle?: Record<string, any>): string;
    static escapeHtml(str: string): string;
  }

  class Bundler {
    outDir: string;
    bundleName: string;
    cacheConfig: ComponentCacheConfig;
    constructor(config?: BundlerConfig);
    get cache(): ComponentCache;
    generateHTML(component: JSComponent | any): string;
    generatePageHTML(page: any, components?: any[]): string;
    bundleComponent(component: JSComponent | any): ComponentBundle;
    bundlePage(page: any, extraComponents?: any[]): PageBundle;
    writeBundle(bundle: any, outPath?: string): { jsPath: string; htmlPath: string };
    emitHydrationScript(bundle: any, outPath?: string): string;
  }

  class AboutGenerator {
    static generateAboutWebpageText(options?: { version?: string }): string;
    static writeAboutWebpage(outPath?: string, options?: { version?: string }): string;
    static FRONTEND_DIR: string;
  }

  class DatabaseSyntax {
    constructor(query_engine: QueryEngine);
    create(collection: string, schema?: any): this;
    drop(collection: string): this;
    insert(collection: string, document: any): any;
    insert_many(collection: string, documents: any[]): any[];
    find(collection: string, query?: any): any[];
    find_one(collection: string, query?: any): any | null;
    find_by_id(collection: string, id: string): any | null;
    update(collection: string, query: any, updates: any): number;
    update_one(collection: string, query: any, updates: any): number;
    delete(collection: string, query: any): number;
    delete_one(collection: string, query: any): number;
    count(collection: string, query?: any): number;
    sort(collection: string, query: any, field: string, order?: 'asc' | 'desc'): any[];
    limit(collection: string, query: any, num: number): any[];
    list_collections(): string[];
    exists(collection: string): boolean;
  }

  class QueryEngine {
    constructor(file_manager: FileManager);
    find(collection: string, query?: any): any[];
    findOne(collection: string, query?: any): any | null;
    insert(collection: string, document: any): any;
    update(collection: string, query: any, updates: any): number;
    delete(collection: string, query: any): number;
    count(collection: string, query?: any): number;
    sort(collection: string, query?: any, sort_field?: string, order?: 'asc' | 'desc'): any[];
    limit(collection: string, query?: any, limit_num?: number): any[];
  }

  class FileManager {
    base_dir: string;
    secret: string;

    constructor(base_dir?: string, secret?: string);
    read_collection(collection: string): any[];
    write_collection(collection: string, data: any): boolean;
    delete_collection(collection: string): boolean;
    list_collections(): string[];
    collection_exists(collection: string): boolean;
    lock(collection: string): Promise<void>;
    unlock(collection: string): void;
  }

  interface TabelConfig {
    table_name?: string;
    tableName?: string;
    name?: string;
    columns?: string[];
    max_cells?: number;
    maxCells?: number;
    max_rows_per_file?: number;
    maxRowsPerFile?: number;
    copies?: number;
    unique_columns?: string[];
    uniqueColumns?: string[];
    unique?: string[];
    base_dir?: string;
    baseDir?: string;
    hidden?: boolean;
  }

  class Tabel {
    table_name: string;
    columns: string[];
    max_cells: number;
    copies: number;
    unique_columns: string[];
    hidden: boolean;
    base_dir: string;
    constructor(manager: TabelManager, config: TabelConfig);
    insert(row: any): any;
    find(query?: any): any[];
    findOne(query?: any): any | null;
    findById(id: string): any | null;
    update(query: any, updates: any): number;
    delete(query: any): number;
    count(query?: any): number;
    all(): any[];
    info(): any;
    drop(): boolean;
  }

  class TabelManager {
    base_dir: string;
    constructor(baseDir?: string);
    createTable(config: TabelConfig): Tabel;
    create(config: TabelConfig): Tabel;
    getTable(tableName: string): Tabel | null;
    table(config: TabelConfig | string): Tabel;
    tabel(config: TabelConfig | string): Tabel;
    hasTable(tableName: string): boolean;
    exists(tableName: string): boolean;
    listTables(): any[];
    dropTable(tableName: string): boolean;
    show(): number;
    hide(): number;
    handleCLI(args: string[]): any;
  }

  class LiveSearch {
    constructor(query_engine: QueryEngine);
    build_index(collection: string, field: string): this;
    search(collection: string, field: string, term: string): any[];
    fuzzy_search(collection: string, term: string, options?: { threshold?: number; fields?: string[] }): any[];
    watch(collection: string, callback: (event: any) => void): this;
    notify(collection: string, event: string, data: any): this;
  }

  class Signup {
    collection: string;
    require_email_verification: boolean;

    constructor(query_engine: QueryEngine, config?: any);
    register(username: string, email: string, password: string): Promise<any>;
  }

  class Login {
    collection: string;
    max_attempts: number;
    lock_duration: number;

    constructor(query_engine: QueryEngine, config?: any);
    authenticate(username: string, password: string): Promise<any>;
    verify_session(token: string): SessionPayload | null;
    get_user_from_token(token: string): any | null;
    logout(): { success: boolean; clear_cookie: string };
  }

  class OAuth {
    providers: Record<string, any>;

    constructor(query_engine: QueryEngine, config?: any);
    add_provider(name: string, config: OAuthProviderConfig): this;
    get_authorize_url(provider_name: string, state?: string | null): string;
    exchange_code(provider_name: string, code: string): Promise<any>;
    get_user_info(provider_name: string, access_token: string): Promise<any>;
    authenticate(provider_name: string, code: string): Promise<any>;
  }

  class Password {
    iterations: number;
    key_length: number;
    digest: string;
    salt_length: number;

    constructor(config?: any);
    hash(password: string): PasswordHash;
    verify(password: string, hash: string, salt: string): boolean;
    generate_reset_token(): string;
    check_strength(password: string): PasswordStrength;
  }

  class Cookie {
    secret: string;
    cookie_name: string;
    max_age: number;
    http_only: boolean;
    secure: boolean;
    same_site: string;
    domain: string | null;
    path: string;

    constructor(config?: any);
    create_token(user_id: string): string;
    verify_token(token: string): SessionPayload | null;
    parse_cookies(cookie_header: string): Record<string, string>;
    get_session(cookie_header: string): SessionPayload | null;
    set_cookie_header(token: string): string;
    clear_cookie_header(): string;
  }

  interface Auth {
    signup(config?: any): Signup;
    login(config?: any): Login;
    oauth(config?: any): OAuth;
    password: Password;
    cookie: Cookie;
  }

  class Rocket {
    constructor();

    layer(config: TextLayerConfig & { layer_type: 'text' }): TextLayer;
    layer(config: LayerConfig & { layer_type: 'image' }): ImageLayer;
    layer(config: LayerConfig & { layer_type: 'shape' }): ShapeLayer;
    layer(config: LayerConfig & { layer_type: 'input' }): InputLayer;
    layer(config: LayerConfig): TextLayer | ImageLayer | ShapeLayer | InputLayer;
    object(config: ObjectConfig): RocketObject;
    page(config: PageConfig): RocketPage;
    transition(config: TransitionConfig): Transition;
    trigger(config: TriggerConfig): Trigger;
    responsive(config: ResponsiveConfig): Responsive;
    function(config: FunctionConfig): RocketFunction;
    conditional(config: ConditionalConfig): Conditional;
    loop(config: LoopConfig): Loop;
    api_call(config: ApiCallConfig): ApiCall;
    api_make(config: ApiMakeConfig): ApiMake;
    collect(config: CollectConfig): Collect;
    boolean(config: BooleanConfig): RocketBoolean;

    // JS-First (v1.0.6)
    component(config: JSComponentConfig): JSComponent;
    generate_html(component: JSComponent | any): string;
    generate_page_html(page: any, components?: any[]): string;
    bundler(config?: BundlerConfig): Bundler;
    build_bundle(componentOrPage: any, config?: BundlerConfig): ComponentBundle | PageBundle;
    build_page_bundle(page: any, extraComponents?: any[], config?: BundlerConfig): PageBundle;
    hydrate(container: HTMLElement | string, component: JSComponent | string | any): HTMLElement;
    get_component(id: string): JSComponent | undefined;
    get_components(): Record<string, JSComponent>;

    // About Webpage (v1.0.7) — plain English frontend explanation from code
    generate_about_webpage(options?: { version?: string }): string;
    write_about_webpage(outPath?: string, options?: { version?: string }): string;

    print(value: any): any;
    add(a: number, b: number): number;
    subtract(a: number, b: number): number;
    multiply(a: number, b: number): number;
    divide(a: number, b: number): number;
    sqrt(n: number): number;
    sin(n: number): number;
    cos(n: number): number;
    tan(n: number): number;
    get_timestamp(): number;
    redirect(url: string): void;
    connect_and_pull(url: string, options?: ConnectOptions): Promise<any>;

    compress(data: any, secret?: string): string;
    decompress(compressed: string, secret?: string): any;

    tunnel(config?: TunnelConfig): EncryptedTunnel;
    component_cache(config?: ComponentCacheConfig): ComponentCache;
    render_page_payload(page: RocketPage | any, config?: ComponentCacheConfig): PagePayload;
    render_page_payload_with_html(page: RocketPage | any, config?: ComponentCacheConfig): PagePayload;

    // Tabels (v1.0.9) — user-configurable tables with columns, hashing, sharding, copies, hidden folders
    table(config: TabelConfig | string): Tabel;
    tabel(config: TabelConfig | string): Tabel;
    create_table(config: TabelConfig): Tabel;
    create_tabel(config: TabelConfig): Tabel;
    get_table(name: string): Tabel | null;
    get_tabel(name: string): Tabel | null;
    list_tables(): any[];
    list_tabels(): any[];
    drop_table(name: string): boolean;
    drop_tabel(name: string): boolean;

    get db(): DatabaseSyntax;
    get liveSearch(): LiveSearch;
    get tabels(): TabelManager;
    get tables(): TabelManager;
    get tabelManager(): TabelManager;
    get about_generator(): typeof AboutGenerator;
    get auth(): Auth;
    get renderer(): RocketRenderer;
    get html_generator(): typeof HtmlGenerator;
    get bundler_class(): typeof Bundler;

    get_page(id: string): RocketPage | undefined;
    get_object(id: string): RocketObject | undefined;
    get_layer(id: string): BaseLayer | undefined;
    get_function(id: string): RocketFunction | undefined;
    get_transition(id: string): Transition | undefined;
    get_trigger(id: string): Trigger | undefined;
    get_conditional(id: string): Conditional | undefined;
    get_loop(id: string): Loop | undefined;
    get_boolean(id: string): RocketBoolean | undefined;
    get_api(id: string): ApiMake | undefined;

    // Publically-visible registries (used by the renderer, triggers and
    // consumers for lookup / bookkeeping). Mix of id -> instance maps.
    _pages: Record<string, RocketPage>;
    _objects: Record<string, RocketObject>;
    _layers: Record<string, BaseLayer>;
    _functions: Record<string, RocketFunction>;
    _transitions: Record<string, Transition>;
    _triggers: Record<string, Trigger>;
    _conditionals: Record<string, Conditional>;
    _loops: Record<string, Loop>;
    _booleans: Record<string, RocketBoolean>;
    _collects: Record<string, Collect>;
    _apis: Record<string, ApiMake>;
    _responsive?: Responsive | null;
    _renderer?: RocketRenderer;
    _components?: Record<string, JSComponent>;
    _bundler?: Bundler | null;
    _tabelManager?: TabelManager;
    _fileManager?: FileManager;
    _queryEngine?: QueryEngine;
    _db?: DatabaseSyntax;
    _liveSearch?: LiveSearch;
  }

  // ===== Singleton API (the default export is a Rocket instance) =====
  function layer(config: TextLayerConfig & { layer_type: 'text' }): TextLayer;
  function layer(config: LayerConfig & { layer_type: 'image' }): ImageLayer;
  function layer(config: LayerConfig & { layer_type: 'shape' }): ShapeLayer;
  function layer(config: LayerConfig & { layer_type: 'input' }): InputLayer;
  function layer(config: LayerConfig): TextLayer | ImageLayer | ShapeLayer | InputLayer;
  function object(config: ObjectConfig): RocketObject;
  function page(config: PageConfig): RocketPage;
  function transition(config: TransitionConfig): Transition;
  function trigger(config: TriggerConfig): Trigger;
  function responsive(config: ResponsiveConfig): Responsive;
  function _function(config: FunctionConfig): RocketFunction;
  function conditional(config: ConditionalConfig): Conditional;
  function loop(config: LoopConfig): Loop;
  function api_call(config: ApiCallConfig): ApiCall;
  function api_make(config: ApiMakeConfig): ApiMake;
  function collect(config: CollectConfig): Collect;
  function boolean(config: BooleanConfig): RocketBoolean;

  // JS-First (v1.0.6)
  function component(config: JSComponentConfig): JSComponent;
  function generate_html(component: JSComponent | any): string;
  function generate_page_html(page: any, components?: any[]): string;
  function bundler(config?: BundlerConfig): Bundler;
  function build_bundle(componentOrPage: any, config?: BundlerConfig): ComponentBundle | PageBundle;
  function build_page_bundle(page: any, extraComponents?: any[], config?: BundlerConfig): PageBundle;
  function hydrate(container: HTMLElement | string, component: JSComponent | string | any): HTMLElement;
  function get_component(id: string): JSComponent | undefined;
  function get_components(): Record<string, JSComponent>;

  // About Webpage (v1.0.7)
  function generate_about_webpage(options?: { version?: string }): string;
  function write_about_webpage(outPath?: string, options?: { version?: string }): string;

  function print(value: any): any;
  function add(a: number, b: number): number;
  function subtract(a: number, b: number): number;
  function multiply(a: number, b: number): number;
  function divide(a: number, b: number): number;
  function sqrt(n: number): number;
  function sin(n: number): number;
  function cos(n: number): number;
  function tan(n: number): number;
  function get_timestamp(): number;
  function redirect(url: string): void;
  function connect_and_pull(url: string, options?: ConnectOptions): Promise<any>;

  function compress(data: any, secret?: string): string;
  function decompress(compressed: string, secret?: string): any;

  function tunnel(config?: TunnelConfig): EncryptedTunnel;
  function component_cache(config?: ComponentCacheConfig): ComponentCache;
  function render_page_payload(page: RocketPage | any, config?: ComponentCacheConfig): PagePayload;
  function render_page_payload_with_html(page: RocketPage | any, config?: ComponentCacheConfig): PagePayload;

  const db: DatabaseSyntax;
  const liveSearch: LiveSearch;
  const auth: Auth;
  const renderer: RocketRenderer;
  const html_generator: typeof HtmlGenerator;
  const bundler_class: typeof Bundler;
  const about_generator: typeof AboutGenerator;

  function get_page(id: string): RocketPage | undefined;
  function get_object(id: string): RocketObject | undefined;
  function get_layer(id: string): BaseLayer | undefined;
  function get_function(id: string): RocketFunction | undefined;
  function get_transition(id: string): Transition | undefined;
  function get_trigger(id: string): Trigger | undefined;
  function get_conditional(id: string): Conditional | undefined;
  function get_loop(id: string): Loop | undefined;
  function get_boolean(id: string): RocketBoolean | undefined;
  function get_api(id: string): ApiMake | undefined;
  function get_component(id: string): JSComponent | undefined;

  // Tabels (v1.0.9)
  function table(config: TabelConfig | string): Tabel;
  function tabel(config: TabelConfig | string): Tabel;
  function create_table(config: TabelConfig): Tabel;
  function create_tabel(config: TabelConfig): Tabel;
  function get_table(name: string): Tabel | null;
  function get_tabel(name: string): Tabel | null;
  function list_tables(): any[];
  function list_tabels(): any[];
  function drop_table(name: string): boolean;
  function drop_tabel(name: string): boolean;

  const tabels: TabelManager;
  const tables: TabelManager;
  const tabelManager: TabelManager;

  const _pages: Record<string, RocketPage>;
  const _objects: Record<string, RocketObject>;
  const _layers: Record<string, BaseLayer>;
  const _functions: Record<string, RocketFunction>;
  const _transitions: Record<string, Transition>;
  const _triggers: Record<string, Trigger>;
  const _conditionals: Record<string, Conditional>;
  const _loops: Record<string, Loop>;
  const _booleans: Record<string, RocketBoolean>;
  const _collects: Record<string, Collect>;
  const _apis: Record<string, ApiMake>;
  const _responsive: Responsive | null;
  const _renderer: RocketRenderer;
  const _components: Record<string, JSComponent>;
  const _bundler: Bundler | null;

  // Explicit export clause so the reserved word `function` can be exported
  // as a member (via the internal `_function` alias).
  export {
    _function as function,
    layer, object, page, transition, trigger, responsive, conditional, loop,
    api_call, api_make, collect, boolean, print, add, subtract, multiply,
    divide, sqrt, sin, cos, tan, get_timestamp, redirect, connect_and_pull,
    compress, decompress, tunnel, component_cache, render_page_payload, render_page_payload_with_html,
    component, generate_html, generate_page_html, bundler, build_bundle, build_page_bundle, hydrate, get_component, get_components,
    generate_about_webpage, write_about_webpage,
    table, tabel, create_table, create_tabel, get_table, get_tabel, list_tables, list_tabels, drop_table, drop_tabel,
    db, liveSearch, auth, renderer, html_generator, bundler_class, about_generator, tabels, tables, tabelManager,
    get_page, get_object, get_layer, get_function, get_transition, get_trigger,
    get_conditional, get_loop, get_boolean, get_api,
    _pages, _objects, _layers, _functions, _transitions, _triggers,
    _conditionals, _loops, _booleans, _collects, _apis, _responsive, _renderer, _components, _bundler,
    Size, Point, CartesianRange, ScalingRatios, TextProperty, LayerConfig,
    ObjectConfig, PageConfig, TransitionChange, TransitionConfig, TriggerAction,
    TriggerConfig, ResponsiveConfig, FunctionConfig, BranchAction, Branch,
    ConditionalConfig, LoopConfig, ApiCallConfig, ApiEndpoint, ApiMakeConfig,
    CollectConfig, BooleanConfig, TunnelConfig, ComponentCacheConfig,
    SectionConfig, JSComponentConfig, ComponentBundle, PageBundle, BundlerConfig, TabelConfig,
    OAuthProviderConfig, PasswordHash, PasswordStrength, SessionPayload,
    ComponentResolution, PagePayload, ConnectOptions, Auth,
    BaseLayer, TextLayer, ImageLayer, ShapeLayer, InputLayer, RocketObject,
    RocketPage, RocketRenderer, Transition, Trigger, Responsive, RocketFunction,
    Conditional, Loop, ApiCall, ApiMake, Collect, RocketBoolean, EncryptedTunnel,
    ComponentCache, JSComponent, HtmlGenerator, Bundler, AboutGenerator, Tabel, TabelManager, DatabaseSyntax, QueryEngine, FileManager, LiveSearch,
    Signup, Login, OAuth, Password, Cookie, Rocket
  };
}

export = rocket;