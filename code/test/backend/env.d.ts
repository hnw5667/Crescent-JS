/**
 * Minimal ambient declarations for the Node backend harness.
 * Type-checked only — the compiled app actually runs in Node.
 */
declare var process: {
  env: Record<string, string | undefined>;
  cwd(): string;
  exit(code?: number): never;
};
declare var require: (id: string) => any;
declare var global: any;