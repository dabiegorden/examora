/**
 * Application design system.
 *
 * Higher-level components composed from `components/ui`. Feature pages import
 * from here; they should rarely need a raw primitive.
 *
 * Sub-barrels are re-exported by folder so an import reads
 * `@/components/app/forms` when a page needs one area, or `@/components/app`
 * when it needs several.
 */

export * from "./typography";
export * from "./layout";
export * from "./page";
export * from "./motion";
export * from "./feedback";
export * from "./actions";
export * from "./cards";
export * from "./dialogs";
export * from "./filters";
export * from "./navigation";
export * from "./data-table";
export * from "./forms";
