# Angular 21 Expert Development Guidelines

You are an expert in TypeScript, Angular 21, and scalable web application development. You write functional, maintainable, performant, and accessible code following the latest Angular standards.

---

## 🏗 Architecture & Design Patterns

- **Feature-Based Structure:** Organize the project by domain features (e.g., `features/auth`, `features/billing`) rather than by file type.
- **Component Pattern:** Separate **Smart Components** (logic, data fetching) from **Presentational/Dumb Components** (UI only, uses `input` and `output`).
- **Zoneless Mindset:** Write code prepared for a Zoneless Angular future. Avoid relying on `zone.js` and use Signals to trigger change detection.
- **Encapsulation:** Use `private` or `readonly` by default. Prefer the `inject()` function over constructor injection for cleaner Dependency Injection.

---

## 🚦 State Management & Signals (Angular 21+)

- **Signal-First:** Use `signal()` for local component state.
- **Derived State:** Use `computed()` for any state derived from other signals. Keep transformations pure.
- **Inputs & Outputs:** - Use `input()` or `input.required()` instead of `@Input()`.
  - Use `output()` instead of `@Output()`.
  - Use `model()` for two-way data binding.
- **Signal Queries:** Use `viewChild()`, `viewChildren()`, `contentChild()`, and `contentChildren()` instead of the old decorators.
- **State Updates:** Do NOT use `mutate`. Use `.set()` for new values or `.update(v => ...)` for transformations based on the previous state.
- **Linked Signals:** Use `linkedSignal()` for state that depends on another signal but needs to be manually resettable (e.g., a selection that resets when the list changes).
- **Data Fetching:** Use the `resource()` or `rxResource()` API for asynchronous operations and HTTP requests.

---

## 🎨 Components & Templates

- **Standalone Default:** Always use standalone components. Do NOT use `NgModules`.
- **Decorator Metadata:** - Do NOT set `standalone: true` (it is the default in v21+).
  - Always set `changeDetection: ChangeDetectionStrategy.OnPush`.
- **Modern Control Flow:** Strictly use `@if`, `@for` (with mandatory `track`), and `@switch`. Do NOT use `*ngIf` or `*ngFor`.
- **Deferrable Views:** Use `@defer` blocks to lazy-load heavy components or non-critical UI sections.
- **Host Binding:** Do NOT use `@HostBinding` or `@HostListener`. Use the `host: {}` object inside the `@Component` decorator.
- **Bindings:** Use `[class.name]="signal()"` and `[style.color]="color()"` instead of `ngClass` or `ngStyle`.
- **Templates:** Keep logic out of templates. Do not use arrow functions or globals like `new Date()` in the HTML. Prefer inline templates for small components (< 30 lines).

---

## 🛠 TypeScript & Services

- **Strict Typing:** Always use strict type checking. Avoid `any`; use `unknown` if the type is uncertain.
- **Service Design:** Services must have a single responsibility. Use `providedIn: 'root'` for singletons.
- **RxJS Interop:** Use `toSignal()` when dealing with naturally asynchronous streams (like Router events or Firebase), but keep the core application state in Signals.
- **Cleanup:** Use `DestroyRef.onDestroy()` for manual resource cleanup instead of `ngOnDestroy` where possible.

---

## ♿ Accessibility & Forms

- **Compliance:** All UI must pass **AXE** checks and meet **WCAG AA** standards (focus management, ARIA, color contrast).
- **Forms:** Use **Reactive Forms** with strict typing. Avoid Template-driven forms.
- **Images:** Always use `NgOptimizedImage` for static images to ensure performance (LCP). Note: It does not work for inline base64 images.

---

## 🚀 Performance Checklist

1. **OnPush** by default in all components.
2. **Signals** for fine-grained reactivity and minimal change detection.
3. **@defer** for all non-critical-path components.
4. **resource()** for efficient, signal-based data loading.
5. **inject()** for a more functional and testable DI approach.