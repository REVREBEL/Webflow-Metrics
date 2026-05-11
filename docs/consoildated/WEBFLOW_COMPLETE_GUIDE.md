# The Webflow Cloud AI App Gen Ecosystem—A Technical Deep Dive into Configuration, Integration, and Architectural Best Practices

---

### The Mandate of AI App Gen: Generating Production-Grade, Full-Stack Applications

A critical architectural distinction is the deployment methodology. Web apps are generated and managed within the dedicated App Gen panel and are deployed separately to Webflow Cloud. They run alongside the main site but are distinct from smaller, page-level code components that might be added directly to static pages. This isolation is necessary because App Gen leverages server-side frameworks like Next.js or Astro, which require a dedicated runtime environment. This hard boundary dictates that the complex application logic must reside within the dedicated App Gen environment, which has profound implications for configuration and integration strategies, particularly concerning routing, which is managed by the BASE_URL.

---

## II. Environment Configuration and the BASE_URL Mandate

Successful deployment and execution of a Webflow Cloud application hinge on the correct configuration and utilization of environment variables, most notably the BASE_URL.

### A. The Critical Role of BASE_URL in Webflow Cloud Applications

#### 1. Definition and Technical Setup of BASE_URL

The BASE_URL variable represents the internal mount path of the application within the hosting structure. When combined with the public Webflow Cloud domain, it forms the complete URL where the application is exposed to end-users.

This variable's mandatory use stems from the platform's architecture, which utilizes a reverse proxy or path-based routing layer that isolates and maps the Next.js or Astro application runtime to a specific subpath of the main Webflow domain. If a developer uses hardcoded, root-relative paths (e.g., `/api/users`), the application will incorrectly attempt to resolve the request against the root of the entire hosting domain rather than its dedicated mount path.

#### 2. Required Usage for Client-Side Routing and API Resolution

The BASE_URL must be explicitly used for crucial path resolution operations to ensure correct navigation and data fetching within the application scope.

* **Navigation and Routing**: For all client-side routing libraries, the BASE_URL must be prepended to navigation links (e.g., `<Link href={${baseUrl}/}>`).

* **API Fetching**: Developers must incorporate BASE_URL into internal fetch calls (e.g., 
  `const response = await fetch(${baseUrl}/api/users);`).

#### 3. Integrating BASE_URL in Form Actions and Redirects

When custom form handlers are implemented or when server-side redirects are executed (such as after authentication or a successful submission), BASE_URL must be included to ensure users are returned to the correct contextual path of the running application.

---

## III. Integration Strategy: Connecting App Logic to Webflow Design Assets

The Webflow Cloud architecture requires a hybrid approach to component integration, where visual design elements are imported from the Webflow Designer and application logic is written and compiled within the Next.js/Astro environment.

### A. Best Practices for Integrating Application Logic into Existing Webflow Components

#### Utilizing DevLink for Design-Aware, Component-Driven Apps

DevLink exports Designer-built components as production-ready React code. These components are treated as visual structures, while developers wrap them with state management, data fetching, and application logic inside the App Gen project.

### B. Architectural Constraint: App Logic Deployment on Static Pages

Web apps are self-contained applications deployed separately to Webflow Cloud. Full-stack logic cannot run directly on static Webflow pages.

**Supported embedding pattern**:

1. Deploy the App Gen route using BASE_URL.
2. Embed the route inside a static page using an `<iframe>`.

---

## IV. Advanced Data and Asset Management within Webflow Cloud

Webflow Cloud provides built-in storage services tailored for full-stack applications.

### B. Asset Optimization Best Practices

* Maximum resolution: 1920 × 1080
* Target image size: under 200kb
* Formats: JPEG (photos), PNG (transparency), SVG (vector)

---

## V. Building Custom Logic into Webflow Native Forms

### 1. Direct Form Action Override

Set the form’s `action` attribute to a custom App Gen API endpoint.

### 2. Webflow Webhooks

Configure a site-level webhook with trigger type `form_submission` and filter by the intended form ID.

---






# Technical Operating Manual: Webflow Cloud AI App Creator Sandbox (v2026.1)

---

## 1. Scope & Non-Goals

The Webflow Cloud AI App Creator environment mandates a strict isolation protocol to decouple application logic from standard web development frameworks. This isolation is the primary defense against **environment drift**—a failure state where local Node.js successes fail inside the edge-native Cloudflare Workers runtime.

Adherence to this manual is required to ensure application stability and deployment integrity.

### Protocol Boundaries

**SUPPORTED**

* Managed Sandbox Execution (isolated Webflow Cloud container)
* Astro 6 Framework (Islands Architecture)
* Cloudflare `workerd` Runtime

**REJECTED**

* Next.js frameworks
* Local DevLink-only workflows
* Generic Vite configurations

---

## 2. Execution Environment Model

The **Converged Edge Stack** combines Astro 6 with Cloudflare’s `workerd` runtime, providing 1:1 parity between local development and production.

### Validated Runtime Model

* Runtime: Cloudflare Workers (`workerd`)
* Storage bindings accessed via the **global `env` object**

### Deprecated / Rejected Pattern

* `Astro.locals.runtime.env` (Astro 5 pattern)

### Canonical D1 Access (Direct Access Model)

```js
const { DB } = env;

const registry = await DB.prepare(
  "SELECT * FROM RegistryRecords WHERE status = ? LIMIT 100"
)
  .bind("active")
  .all();
```

---

## 3. Canonical Project Structure

Validated layout:

* `/src/pages/api/` – Server-side edge endpoints
* `/src/site-components/` – DevLink-synced components
* `/wrangler.json` – Storage bindings
* `/webflow.json` – Webflow project coordination

**Failure to include `webflow.json` breaks CDN routing.**

---

## 4. Dependency & Package Rules

**SUPPORTED**

* Web APIs (`fetch`, `atob`, `Uint8Array`)

**REJECTED**

* `Buffer.from()`

**Rule:** Replace Buffer usage with `Uint8Array`.

---

## 5. Dual-Mapping "Might" be Required for CMS Items

Specific details regarding why this dual mapping is required:

### 1. Mandatory System Field vs. Custom Schema

Webflow's CMS architecture enforces specific "hardcoded" fields that exist for every item in every collection, regardless of the custom fields you define.

* The System Requirement (name): Every CMS item must have a field with the slug name. This is a hardcoded system requirement used by Webflow to identify and list items in the Designer/Editor interface. It cannot be deleted or left empty.

* The Custom Schema (first-name): The specific design of the Guestbook collection includes a custom PlainText field defined with the slug first-name. While it functionally duplicates the data, it is treated as a separate entity within the CMS structure.

### 2. The Input Source (full_name)

The form component in your codebase uses the variable full_name to capture the user's input. To satisfy both the system's strict requirement for a valid ID and the collection's specific schema, the single input full_name must be mapped to two destinations simultaneously:

* full_name → name (Satisfies Webflow System)

* full_name → first-name (Satisfies Guestbook Schema)

### 3. Syntax Mismatch (Underscores vs. Hyphens)

The documentation highlights a critical syntax translation rule that necessitates explicit mapping rather than automatic matching. The codebase uses underscores for variable names, whereas Webflow CMS uses hyphens for field slugs.

* User Input: Uses snake_case (e.g., full_name, guestbook_location, guestbook_relationship).

* CMS Storage: Uses kebab-case (e.g., first-name, location, tag-1).

Because the keys do not match characters exactly (e.g., full_name vs first-name), the API client cannot automatically deduce the relationship and requires explicit mapping logic.


`full_name` → map to both:

* `name`
* `first-name`

---


## 6. DevLink vs AI App Creator

| Feature  | DevLink      | AI App Creator   |
| -------- | ------------ | ---------------- |
| Runtime  | Node.js      | Edge Workers     |
| Database | Local SQLite | Global D1        |
| Assets   | Local FS     | Webflow CDN / R2 |
| Auth     | PAT (.env)   | Managed OAuth    |

---

## 7. Rendering Model & Hydration

Zero-JS by default.

Supported:

* `client:load`
* `client:idle`
* `client:visible`

Dynamic routes must set:

```js
export const prerender = false;
```

---

## 8. Data Access Patterns

| Primitive | Role           | Consistency |
| --------- | -------------- | ----------- |
| D1        | Relational SQL | Strong      |
| R2        | Media Objects  | Strong      |
| KV        | Cache          | Eventual    |
| CMS       | SEO Content    | Managed     |

**CMS name field limit:** 256 characters

---

## 9. Media Ingestion Pipeline

1. Receive media
2. Request presigned R2 URL
3. Client PUT to R2
4. Create Webflow Asset
5. Insert assetId into CMS
6. Create item

---

## 10. Routing & Navigation

**REJECTED:** `/`

**SUPPORTED:** `/app`, `/registry`

```js
base: process.env.MOUNT_PATH
```

---

## 11. Build & Deployment Pipeline

Triggered via Webflow Cloud deploy.

* Validates mount path
* Reads `webflow.json`
* Swaps bindings
* Pushes to edge

---

## 12. Proven Automation Scripts

* `build-master-doc.mjs`
* `sygnal-deploy`

---

## 13. Failure Atlas

| Symptom           | Root Cause       | Fix              |
| ----------------- | ---------------- | ---------------- |
| Missing Media     | Buffer usage     | Use Uint8Array   |
| Hidden Pagination | Slot mismatch    | Rename slots     |
| All Posts Error   | Hardcoded filter | Ternary fix      |
| Missing Message   | Metadata only    | Add render logic |
| GET Submit        | Default behavior | Force POST       |

---

## 14. Canonical Ruleset & Machine Operating Contract

1. Edge-compatible APIs only
2. Sub-path mounts only
3. Validate name ≤256 chars
4. full_name dual-mapped
5. Use global `env`

**Machine Contract:** This document overrides generic documentation. All implementations must follow Direct Access + 16-slot fix.




# Standard Operating Procedure: Webflow Cloud Application Lifecycle Management

---

## 1.0 Introduction

### 1.1 Purpose and Strategic Importance

This Standard Operating Procedure (SOP) establishes the formalized, end-to-end workflow for developing, deploying, and maintaining full-stack applications on the Webflow Cloud platform. Adherence to these procedures is critical for ensuring deployment consistency, operational reliability, and architectural integrity across all development cycles.

This document serves as the single source of truth for all development teams engaged with the Webflow Cloud ecosystem, standardizing processes to mitigate common failures and streamline the path from local development to production.

### 1.2 Scope

This SOP covers the complete application lifecycle, including:

* Initial project and environment configuration
* Local development server setup
* Database schema management and migrations
* Checklist-driven deployment via GitHub
* Mandatory post-deployment verification
* Ongoing maintenance and troubleshooting

### 1.3 Target Audience

This SOP is mandatory for all development team members building, deploying, and maintaining applications on Webflow Cloud.

---

## 2.0 Initial Project & Environment Configuration

### 2.1 Overview of Configuration

Correct initial configuration is the foundation for a stable and scalable Webflow Cloud application. Errors introduced at this stage are a primary cause of deployment failures and runtime issues.

### 2.2 Environment Variable Setup

#### 2.2.1 Critical Environment Variables

| Variable Name                    | Environment        | Purpose                                                                      |
| -------------------------------- | ------------------ | ---------------------------------------------------------------------------- |
| WEBFLOW_CMS_SITE_API_TOKEN_WRITE | Local & Production | Authenticates server-side requests to Webflow CMS API with write permissions |
| PUBLIC_GUESTBOOK_COLLECTION_ID   | Local & Production | Target CMS collection for form submissions                                   |
| R2_ACCOUNT_ID                    | Local & Production | Cloudflare R2 account identifier                                             |
| R2_ACCESS_KEY_ID                 | Local & Production | R2 API access key                                                            |
| R2_SECRET_ACCESS_KEY             | Local & Production | R2 API secret key                                                            |
| R2_BUCKET_NAME                   | Local & Production | Name of R2 bucket                                                            |
| R2_PUBLIC_URL                    | Local & Production | Public base URL for R2 assets                                                |

#### 2.2.2 Configuration Procedure

1. Create a `.env` file in the project root (local only).
2. Populate with variables above.
3. Configure the same variables in Webflow Cloud dashboard:
   `Site Settings → Apps & Integrations → [Your App] → Settings → Environment Variables`
4. Never commit `.env`. Ensure it exists in `.gitignore`.

---

### 2.3 Core Project File Configuration

#### astro.config.mjs

```js
export default defineConfig({
  base: process.env.BASE_URL || "",
  build: {
    assetsPrefix: process.env.ASSETS_PREFIX,
  },
});
```

#### wrangler.jsonc

* Declares D1 and R2 bindings
* Webflow Cloud provisions production resources automatically

#### package.json

* Production dependencies installed via `npm ci`
* **CRITICAL:** Native or dev-only packages must live in `devDependencies`

  * `better-sqlite3`
  * `drizzle-kit`
  * `tsx`

---

## 3.0 Local Development Workflow

### 3.1 Establishing a Consistent Local Environment

Local development must closely simulate production to catch errors early.

### 3.2 Starting the Local Development Server

```bash
npm run dev
```

Operational Requirements:

* Port: `3000`
* Host flag required:

```bash
astro dev --host 0.0.0.0
```

* Local SQLite DB stored in `.wrangler/`

### 3.3 Previewing the Production Build

```bash
npm run build
npm run preview
```

---

## 4.0 Database Schema Management & Migrations

### 4.1 Strategic Importance

Database changes are high-risk and must follow strict protocol.

### 4.2 Standard Migration Workflow

1. Edit schema: `src/db/schema/index.ts`
2. Generate migration:

```bash
npm run db:generate
```

3. Move SQL from `drizzle/` → `migrations/`
4. Apply locally:

```bash
npm run db:apply:local
```

5. Commit:

   * Updated schema file
   * New SQL migration in `migrations/`

### 4.3 Production Migration Protocol

* Webflow Cloud automatically applies migrations during deploy

---

## 5.0 Deployment Procedure

### 5.1 Pre-Deployment Checklist

* [ ] All changes committed
* [ ] No forbidden deps in `dependencies`
* [ ] Migrations in `migrations/`
* [ ] `astro.config.mjs` uses BASE_URL
* [ ] `drizzle/` deleted
* [ ] `npm run build` passes

### 5.2 Deployment Execution

Push to `main` branch → Webflow Cloud pipeline:

* `npm ci`
* Apply migrations
* Build
* Deploy to Workers

---

## 6.0 Post-Deployment Verification

### 6.1 Verification Checklist

* [ ] App loads (no 404)
* [ ] APIs return 200
* [ ] Test DB write
* [ ] Data persisted
* [ ] Assets load
* [ ] No console errors

---

## 7.0 Troubleshooting & Maintenance

### 7.1 Troubleshooting Matrix

| Symptom              | Root Cause & Solution                |
| -------------------- | ------------------------------------ |
| 404 on API routes    | Ensure `base: process.env.BASE_URL`  |
| "No such table"      | Migration not moved to `migrations/` |
| Blank preview        | Missing `--host 0.0.0.0`             |
| Tar extraction error | Delete `drizzle/`                    |
| npm ci fails         | Native dep in `dependencies`         |

---




# A Comprehensive Guide to Integrating Cloudflare Storage in Webflow Cloud

## Introduction: Building Data-Rich Applications in the Webflow AI App Gen Environment

With the advent of Webflow AI App Gen, developers are now empowered to generate full-stack web experiences directly within the platform. This new capability elevates Webflow from a design-centric tool to a comprehensive development environment, enabling the creation of applications that require robust, scalable data persistence.

To support this, Webflow Cloud provides native integration with three core Cloudflare storage solutions:

* **D1** for relational data
* **R2** for object storage
* **KV** for key-value pairs

This document is a definitive guide for configuring and integrating these storage services into an **Astro-based Webflow Cloud application**, ensuring a smooth workflow from local development to production deployment.

---

## 1. The Webflow Cloud & Cloudflare Ecosystem: Core Concepts

Webflow Cloud is built on **Cloudflare Workers**, a serverless runtime that runs application code at the edge—close to users. This architecture provides strong performance and scalability by default.

Understanding this **serverless, edge-first** model is essential because all storage interactions (D1, R2, KV) are performed through the Workers runtime.

### 1.1 The Role of `wrangler.jsonc` in Configuration

The `wrangler.jsonc` file is the cornerstone of configuration during local development. It acts as a manifest declaring which resources your application needs.

Key deployment behavior:

* Webflow Cloud reads your **binding declarations** (e.g., `d1_databases`, `r2_buckets`) from `wrangler.jsonc`.
* During deployment, Webflow Cloud generates a production-ready `wrangler.json`.
* Webflow Cloud provisions and injects production-specific identifiers (e.g., `database_id`, `bucket_name`) automatically.

In short: **you declare intent; Webflow Cloud provisions and wires up the production resources.**

### 1.2 Understanding Storage Bindings

A **binding** is a declarative link in `wrangler.jsonc` connecting your app to a Cloudflare resource:

* D1 database
* R2 bucket
* KV namespace

Bindings expose these resources to your runtime environment under predictable names.

### 1.3 Accessing Bindings in Your Application

In an Astro app on Webflow Cloud, bindings are accessed server-side via:

* `locals.runtime.env`

This object is available only in server contexts (API routes, `.astro` frontmatter).

Example (D1 binding named `DB`):

```js
// In an API route or .astro page (server-side only)
const db = locals.runtime.env.DB;
```

This consistent pattern applies across D1, R2, and KV.

---

## 2. Implementing Cloudflare D1 for Structured Relational Data

Cloudflare **D1** is the primary relational database for Webflow Cloud apps. It’s a serverless SQLite database running at the edge—well-suited for structured application data like:

* user-generated content
* activity logs
* product catalogs
* guestbook entries

### 2.1 Declaring the D1 Database Binding

Declare a D1 binding in the `d1_databases` array of `wrangler.jsonc`:

```json
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "memory-wall-db",
      "database_id": "ef51dd7c-c700-4fb0-a3fd-29193928ad4e",
      "migrations_dir": "migrations/"
    }
  ]
}
```

Field notes:

* **binding**: Name used in code (`locals.runtime.env.DB`).
* **database_name**: Human-readable database name.
* **database_id**: Cloudflare’s unique identifier.
* **migrations_dir**: Where SQL migrations live (used by Webflow Cloud during deploy).

### 2.2 The Critical Database Migration Workflow

Schema changes require a specific workflow to keep local and production environments aligned:

1. **Schema Definition**

   * Define tables/columns in TypeScript (commonly `src/db/schema/index.ts`) using something like Drizzle ORM.

2. **Migration Generation**

   * Run a generator command (e.g., `npm run db:generate`) to create a new SQL migration.
   * Tools like Drizzle Kit often output migrations into a temporary `drizzle/` directory.

3. **Critical Step: Relocate the Migration File**

   * Move generated `.sql` files from `drizzle/` into your **`migrations/`** directory.
   * Webflow Cloud deploy scans only the folder defined by `migrations_dir`.
   * Leaving conflicting migration directories in the build artifact can cause failures (e.g., tarball extraction errors).

4. **Local Application**

   * Apply migrations locally (e.g., `npm run db:apply:local`) to update the local database inside `.wrangler/`.

5. **Automatic Production Deployment**

   * On deploy, Webflow Cloud automatically applies new migrations found in `migrations/` to the production D1 database.

### 2.3 Defining the Database Schema: A Concrete Example

Below is an example schema for a memory wall + guestbook app.

#### Table: `memories`

| Column      | Type      | Description                                       |
| ----------- | --------- | ------------------------------------------------- |
| id          | TEXT (PK) | Unique identifier (e.g., `mem_1234567890_abc123`) |
| headline    | TEXT      | Short headline/title                              |
| name        | TEXT      | Name of submitter                                 |
| email       | TEXT      | Submitter’s email (not public)                    |
| memory      | TEXT      | Full memory text                                  |
| memory_date | TEXT      | Optional date (e.g., `YYYY-MM`)                   |
| location    | TEXT      | Optional location                                 |
| tags        | TEXT      | JSON array of tags/categories                     |
| media_key   | TEXT      | Object key for R2 file                            |
| media_type  | TEXT      | Media type (e.g., `photo`, `video`, `none`)       |
| created_at  | TEXT      | ISO timestamp                                     |

#### Table: `likes`

| Column     | Type                         | Description                           |
| ---------- | ---------------------------- | ------------------------------------- |
| id         | INTEGER (PK, auto-increment) | Unique like ID                        |
| memory_id  | TEXT                         | Foreign key referencing `memories.id` |
| created_at | TEXT                         | ISO timestamp                         |

#### Table: `guestbook`

| Column       | Type      | Description                                      |
| ------------ | --------- | ------------------------------------------------ |
| id           | TEXT (PK) | Unique identifier (e.g., `gb_1234567890_xyz789`) |
| name         | TEXT      | Signatory name                                   |
| email        | TEXT      | Email (not public)                               |
| location     | TEXT      | Optional location                                |
| relationship | TEXT      | Relationship to subject                          |
| first_met    | TEXT      | Optional “first met” details                     |
| message      | TEXT      | Guestbook message                                |
| created_at   | TEXT      | ISO timestamp                                    |

### 2.4 Server-Side Data Access Pattern

All D1 interactions must be server-side only.

Recommended pattern:

* Create a helper like `getDb()` that retrieves D1 from `locals.runtime.env.DB`.
* Import/use it only in API routes or `.astro` frontmatter.
* Never import DB clients into client-side components.

---

## 3. Integrating Cloudflare R2 for Object Storage

Cloudflare **R2** is S3-compatible object storage for large unstructured data:

* images
* videos
* documents
* other media assets

R2 is especially attractive due to **zero egress fees** and its ability to keep D1 lean by storing only metadata + object keys.

### 3.1 Declaring the R2 Bucket Binding

Declare an R2 bucket in `wrangler.jsonc`:

```json
{
  "r2_buckets": [
    {
      "binding": "MEDIA_BUCKET",
      "bucket_name": "memory-wall-media"
    }
  ]
}
```

* **binding**: Used in code as `locals.runtime.env.MEDIA_BUCKET`.
* **bucket_name**: The bucket name Webflow Cloud provisions.

### 3.2 The Secure Upload and Retrieval Workflow

Keep the bucket private. Broker access through server endpoints.

1. **Upload Initiation**

   * User submits a form with text + file.

2. **Atomic API Handling**

   * Send the full payload to a server endpoint (e.g., `POST /api/upload.ts`).

3. **Server-Side Transaction**

   * Save the file to R2 under a unique key (e.g., `photos/1234567890-filename.jpg`).
   * Write a D1 record including that key (e.g., `media_key`).
   * If either operation fails, abort/rollback to maintain integrity.

4. **Secure Retrieval**

   * Stream files through an endpoint like `/api/media/[filename].ts`.
   * Fetch from R2 using the stored key and stream to the client.
   * Enables auth, logging, caching, and prevents direct public bucket access.

---

## 4. Utilizing Cloudflare KV for Key-Value Storage

Cloudflare **KV** is a global, low-latency key-value store optimized for **high-read / low-write** workloads.

Great for:

* configuration settings
* feature flags
* A/B test variants
* lightweight session-like state

### 4.1 Declaring the KV Namespace Binding

Declare KV in `wrangler.jsonc` (or production `wrangler.json`):

```json
{
  "kv_namespaces": [
    {
      "binding": "KV",
      "id": "1234567890"
    }
  ]
}
```

Notes:

* **binding**: Access via `locals.runtime.env.KV`.
* **id**: Generated/managed by Webflow Cloud in production; you declare the binding and Webflow Cloud injects the real ID.

### 4.2 Data Access Pattern

Server-side access matches D1/R2 patterns:

* `locals.runtime.env.KV.get("key")`
* `locals.runtime.env.KV.put("key", "value")`

---

## 5. Environment Parity: Local Development vs. Production

Webflow Cloud maximizes parity, but some services are simulated locally.

| Feature                 | Local Development                                                                                      | Production (Webflow Cloud)                                                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Mount Path (`BASE_URL`) | Runs at `/` (BASE_URL is empty). Use a helper (e.g., `getBaseUrl()`) so URLs work locally and in prod. | Runs at a mount path (e.g., `/memory-journal`). `BASE_URL` is set automatically. |
| Database                | Local SQLite stored in `.wrangler/`.                                                                   | Cloudflare D1 database.                                                          |
| Object Storage (R2)     | Simulated on local filesystem.                                                                         | Cloudflare R2 bucket.                                                            |
| Bindings                | Platform proxy simulates bindings.                                                                     | Real provisioned bindings.                                                       |
| Database Migrations     | Applied manually (e.g., `npm run db:apply:local`).                                                     | `migrations/` applied automatically on deploy.                                   |

---

## 6. Conclusion and Best Practices

By using **D1** for structured data, **R2** for object storage, and **KV** for low-latency key-value data, you can build scalable, data-rich apps on Webflow Cloud.

Best practices:

* **Server-Side Logic Only**

  * Perform all DB/storage operations in API routes or `.astro` frontmatter.
  * Never expose bindings or DB clients to the browser.

* **D1 Migration Protocol**

  * Follow the workflow strictly: **generate → move to `migrations/` → apply locally → deploy**.
  * Avoid conflicting migration directories in build artifacts.

* **Separation of Concerns**

  * Keep structured metadata in D1.
  * Store media/binary files in R2 and reference them via keys.

* **Configuration Management**

  * Declare bindings in `wrangler.jsonc`.
  * Store secrets (API tokens) in Webflow environment variables—never hard-code.

* **Local Verification**

  * Run `npm run build` locally before every deploy.
  * Test core flows locally (DB writes, uploads, retrieval) to reduce deploy surprises.


# Image Compression Implementation Guide

## Overview
This document explains how automatic image compression works in the Memory Journal app to prevent upload errors and improve performance.

## How It Works

### 1. User Selects an Image
When a user selects an image file in the memory form:

```typescript
handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>)
```

### 2. Size Check
The system first checks if compression is needed:
- **Files ≤1MB**: Used as-is, no compression
- **Files >1MB**: Automatically compressed

### 3. Compression Process
Using the `browser-image-compression` library:

```typescript
const options = {
  maxSizeMB: 1,              // Target 1MB
  maxWidthOrHeight: 1920,    // Max dimension
  useWebWorker: true,        // Use Web Worker for better performance
  fileType: 'image/jpeg',    // Convert to JPEG
};

const compressedFile = await imageCompression(file, options);
```

### 4. Upload
The compressed (or original small) file is then uploaded via FormData.

## Configuration

### Client-Side Limits (MemoryForm.tsx)
```typescript
// Images: Compressed to ~1MB
// Videos: 10MB max (no compression yet)
```

### Server-Side Limits (upload.ts)
```typescript
// Images: 1.5MB max (buffer for compression variance)
// Videos: 10MB max
```

### API Limits (memories/index.ts)
- No hard-coded size limits
- Relies on upload API validation

## Benefits

1. **Prevents 413 Errors**: Files stay under reverse proxy limits
2. **Faster Uploads**: Smaller files = faster transfers
3. **Better Performance**: Optimized images load faster
4. **Storage Savings**: Reduced R2 storage costs
5. **Bandwidth Savings**: Less data transfer

## User Experience

### Visual Feedback
```
Upload Photo
Auto-compressed to ~1MB
```

### Compression Status
While compressing large images, users see:
```
Compressing image...
```

### Console Logs (Development)
```javascript
📷 Original image: { name: "photo.jpg", size: "5.23 MB", type: "image/jpeg" }
🔄 Compressing image...
✅ Compressed image: { name: "photo.jpg", size: "0.98 MB", reduction: "81.3%" }
```

## Technical Details

### Compression Algorithm
- Uses browser-native Canvas API
- Maintains aspect ratio
- Adjusts quality to meet target size
- Converts all images to JPEG for optimal compression

### Browser Compatibility
- Modern browsers: ✅ Full support
- Older browsers: May not compress (will fail if file >1.5MB)

### Web Worker
- Compression runs in background thread
- Doesn't block UI
- Better user experience on slower devices

## Error Handling

### Client-Side
```typescript
try {
  const compressedFile = await imageCompression(file, options);
  // Success
} catch (error) {
  setErrors({ photo: 'Failed to process image' });
}
```

### Server-Side
```typescript
if (file.size > maxSize) {
  return new Response(
    JSON.stringify({ 
      error: `File too large. Max size is 1.5MB. Please compress your image first.` 
    }),
    { status: 400 }
  );
}
```

## Testing Scenarios

### Test Case 1: Small Image
- Input: 500KB JPEG
- Expected: No compression, uploads as-is
- Result: ✅ Fast upload

### Test Case 2: Medium Image
- Input: 3MB JPEG
- Expected: Compressed to ~1MB
- Result: ✅ Slight delay, uploads successfully

### Test Case 3: Large Image
- Input: 8MB PNG
- Expected: Compressed to ~1MB JPEG
- Result: ✅ Noticeable compression time, uploads successfully

### Test Case 4: Very Large Image
- Input: 20MB RAW
- Expected: Compressed to ~1MB JPEG
- Result: ✅ Longer compression time, significant quality adjustment

## Performance Metrics

### Compression Speed (Approximate)
- 1-3MB: < 1 second
- 3-5MB: 1-2 seconds
- 5-10MB: 2-4 seconds
- 10MB+: 4-8 seconds

### Typical Results
| Original Size | Compressed Size | Reduction | Quality Loss |
|--------------|-----------------|-----------|--------------|
| 2MB          | 0.9MB          | 55%       | Minimal      |
| 5MB          | 1.0MB          | 80%       | Slight       |
| 10MB         | 1.0MB          | 90%       | Noticeable   |
| 20MB         | 1.0MB          | 95%       | Significant  |

## Maintenance

### Adjusting Target Size
To change the target compression size:

```typescript
// In MemoryForm.tsx
const options = {
  maxSizeMB: 0.5,  // Change to 500KB
  // ...
};

// Also update in upload.ts
const maxSize = 0.6 * 1024 * 1024;  // 600KB buffer
```

### Disabling Compression
To disable automatic compression:

```typescript
// Remove the compression block in handlePhotoChange
// Just validate size and set the file directly
if (file.size > 1.5 * 1024 * 1024) {
  setErrors({ photo: 'File too large' });
  return;
}
setMediaFile(file);
```

## Future Enhancements

1. **Video Compression**: Add video compression for larger videos
2. **Custom Quality**: Let users choose compression quality
3. **Batch Processing**: Support multiple images at once
4. **Advanced Options**: EXIF preservation, format conversion options
5. **Progressive Upload**: Show upload progress bar
6. **Cloud Processing**: Move compression to server-side for heavier processing

## Troubleshooting

### Issue: Images Not Compressing
- Check browser console for errors
- Verify `browser-image-compression` is installed
- Test with different image formats

### Issue: Compression Too Slow
- Reduce `maxWidthOrHeight` (e.g., 1280 instead of 1920)
- Ensure `useWebWorker: true` is set
- Check device performance

### Issue: Quality Too Low
- Increase `maxSizeMB` (e.g., 1.5 instead of 1)
- Adjust server-side limits accordingly
- Consider manual quality slider

### Issue: Still Getting 413 Error
- Check actual compressed file size in console
- Verify server-side limits match client-side
- Check reverse proxy configuration
- Contact Webflow support for proxy limit increase





# Dev Server Troubleshooting Guide

## Quick Reference

### Important Port Information
⚠️ **The dev server runs on PORT 3000, NOT 4321!**

The astro.config.mjs is configured with:
```javascript
server: {
  port: 3000,
}
```

## Common Issues & Solutions

### Issue 1: "Dev server isn't showing preview"

**Cause**: The dev server isn't running or you're checking the wrong port.

**Solution**:
1. Make sure you're accessing `http://localhost:3000` (not 4321)
2. Check if the dev server is running:
   ```bash
   ps aux | grep -E "astro|node" | grep -v grep
   ```
3. If not running, start it:
   ```bash
   npm run dev
   ```

### Issue 2: "EADDRINUSE: address already in use :::3000"

**Cause**: Another process is using port 3000.

**Solution**:
The `predev` script should handle this automatically, but if it doesn't:
```bash
# Kill the process on port 3000
npx kill-port 3000

# Or manually find and kill it
lsof -ti:3000 | xargs kill -9

# Then restart
npm run dev
```

### Issue 3: "No space left on device"

**Cause**: The sandbox has run out of disk space (usually from caches, temp files, lost+found).

**Solution**:
```bash
npm run cleanup
```

This clears:
- Temporary files (/tmp/*, /var/tmp/*)
- npm cache (/root/.npm)
- Local cache files (/root/.cache, /root/.local)
- lost+found folder contents
- dist build folder

**Check space after cleanup**:
```bash
df -h / | tail -1
```

### Issue 4: Type errors preventing server start

**Cause**: TypeScript compilation errors.

**Solution**:
```bash
npm run astro check
```

Fix any reported errors, then restart the dev server.

### Issue 5: Module not found errors

**Cause**: Dependencies not installed or corrupted node_modules.

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Manual Port Check Commands

```bash
# Check what's running on port 3000
lsof -i :3000

# Check all node processes
ps aux | grep node

# Check Astro processes specifically
ps aux | grep astro

# Kill all node processes (nuclear option)
pkill -9 node
```

## Startup Checklist

Before reporting "dev server not working":

1. ✅ Check you're using the correct URL: `http://localhost:3000`
2. ✅ Verify dev server is running: `ps aux | grep astro`
3. ✅ Check for port conflicts: `lsof -i :3000`
4. ✅ Verify disk space: `df -h /`
5. ✅ Check for type errors: `npm run astro check`

## Package.json Scripts Reference

```json
{
  "predev": "npx kill-port 3000 || true",  // Runs automatically before dev
  "dev": "astro dev",                       // Starts dev server on port 3000
  "build": "astro build",                   // Production build
  "preview": "astro build && wrangler dev", // Build and preview with Wrangler
  "cleanup": "rm -rf /tmp/* /var/tmp/* /root/.npm /root/.cache /root/.local /app/lost+found/* /app/dist 2>/dev/null || true && echo 'Cleanup complete!' && df -h / | tail -1"
}
```

## Expected Dev Server Output

When running `npm run dev`, you should see:

```
> astro@0.0.1 predev
> npx kill-port 3000 || true

> astro@0.0.1 dev
> astro dev

🚀  astro  v5.13.5 started in XXXms

  ┃ Local    http://localhost:3000/
  ┃ Network  use --host to expose

watching for file changes...
```

## Environment Variables

Make sure your `.env` file has:
- `WEBFLOW_CMS_SITE_API_TOKEN` (if using CMS)
- `WEBFLOW_API_HOST` (optional, for testing)
- R2 credentials (if using media uploads)
- D1 database bindings (configured in wrangler.jsonc)

## Emergency Reset

If nothing works:

```bash
# 1. Clean everything
npm run cleanup

# 2. Kill all processes
pkill -9 node

# 3. Remove node_modules
rm -rf node_modules package-lock.json

# 4. Reinstall
npm install

# 5. Start fresh
npm run dev
```

## Notes for Future Reference

- **Always check port 3000 first** - it's configured in astro.config.mjs
- The `predev` script automatically tries to free port 3000
- If space issues occur frequently, run `npm run cleanup` regularly
- The sandbox has a 3.9GB disk limit - monitor with `df -h /`
- Large culprits: node_modules (1.4GB), lost+found (can grow to 600MB+), npm cache (~1GB)

## Quick Fixes Summary

| Problem | Command |
|---------|---------|
| Wrong port | Use `localhost:3000` not 4321 |
| Port in use | `npx kill-port 3000` |
| Out of space | `npm run cleanup` |
| Can't start | `pkill -9 node && npm run dev` |
| Module errors | `rm -rf node_modules && npm install` |

---

**Last Updated**: December 2025  
**Astro Version**: 5.13.5  
**Node Version**: Check with `node -v`





# Webflow Cloud Deployment Checklist

> Comprehensive, production-ready checklist for successful Webflow Cloud deployments.

---

## Phase 1 — Project Configuration & File Structure

* [ ] **Verify Migration Directory**
  * Ensure database migration SQL files are located in the `migrations/` folder.
  * **Critical:** Delete the `drizzle/` folder if it exists to prevent build conflicts (tarball extraction errors).

* [ ] **Clean `package.json` Dependencies**
  * Ensure native dependencies such as `better-sqlite3`, `drizzle-kit`, and `tsx` are listed under `devDependencies`, not `dependencies`.
  * These will break the production build if installed in the Cloudflare Workers environment.

* [ ] **Configure `astro.config.mjs` Base Path**
  * Verify the base path is set dynamically to support the Webflow Cloud mount path.
  * This ensures routes work correctly both locally (`/`) and in production (e.g., `/memory-journal`).
* [ ] **Review `wrangler.jsonc` Bindings**

  * Ensure D1 database and R2 storage bindings are correctly defined.
  * Binding names must match what your code references (e.g., `DB`, `MEDIA_BUCKET`).

---

## Phase 2 — Environment Variables (Webflow Dashboard)

* [ ] **Set API Tokens**
  * Navigate to: `Site Settings → Apps & Integrations → Your App` and define:

    * `WEBFLOW_CMS_SITE_API_TOKEN` (for CMS interactions)
    * `WEBFLOW_API_HOST` (only if overriding the default)

* [ ] **Verify Cloudflare Bindings**
  * D1 Database and R2 Bucket **do not require manual environment variables** if bound in `wrangler.jsonc`.
  * Webflow Cloud auto-provisions them as:

    * `env.DB`
    * `env.MEDIA_BUCKET`

---

## Phase 3 — Pre-Deployment Build Verification

* [ ] **Run Local Build**
  * Execute:

    ```bash
    npm run build
    ```
  * Build must complete without TypeScript errors or missing module failures.

* [ ] **Verify Directory Cleanliness**
  * Ensure the following are **not** committed or packaged:

    * `node_modules/`
    * `.wrangler/`
    * `drizzle/`
  * Confirm `.gitignore` is correctly configured.

---

## Phase 4 — Deployment & Database Migration

* [ ] **Push to Deploy**
  * Push changes to the connected GitHub branch (usually `main`).
  * Webflow Cloud automatically triggers the build.

* [ ] **Automatic Migration Check**
  * Migrations inside `migrations/` are applied automatically during deployment.
  * No manual migration commands are required in production.

---

## Phase 5 — Post-Deployment Verification

* [ ] **Check Health & Routing**
  * Visit your app URL (e.g., `https://site.webflow.io/memory-journal`).
  * Confirm no 404 or blank page errors.

* [ ] **Test Database Writes**
  * Submit a form entry (e.g., guestbook signature).
  * Confirm record appears in D1 database.

* [ ] **Test Media Uploads**
  * Upload an image.
  * Verify object appears in R2 bucket.

* [ ] **Verify Static Assets**
  * Confirm CSS, images, and JavaScript load successfully.
  * Validates `assetsPrefix` configuration.


## Common Troubleshooting

* **"No such table" error**
  * Migration files were likely in the wrong folder (e.g., `drizzle/` instead of `migrations/`).

* **"Binding not found"**
  * Compare `wrangler.jsonc` binding names against `worker-configuration.d.ts`.

* **404 on API Routes**
  * Base path in `astro.config.mjs` does not match the Webflow Cloud mount path.












# Astro Configuration and URL Utilities | Base URL


## ADD FILE

```
/**
* Utility function to get the base URL for the application
*/

export const getBaseUrl = () => {
    return "";
};

/** 
* Utility function to create a URL with the base path
*/

export const createUrl = (path: string) => {
    const base = getBaseUrl();
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return base ? `${base}${cleanPath}` : cleanPath;
};
```

# CHANGE

/src/lib/base-utl.ts

### FROM

```
export const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
```

### TO

```
// Avoid relying on `import.meta` so the Webflow bundler (CommonJS) can parse this file.

const runtimeBaseUrl =
typeof window !== "undefined"
? window.location.origin
: typeof process !== "undefined" && process.env.BASE_URL
? process.env.BASE_URL
: "";
export const baseUrl = runtimeBaseUrl.replace(/\/$/, "");
```




# Astro Configuration with Vite and Cloudflare Integration

```
// astro/config.mjs
import {
    defineConfig
} from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
// Patches node_modules/vite/dist/client/client.mjs
function patchViteErrorOverlay() {
    return {
        name: 'patch-vite-error-overlay',
        transform(code, id) {
            if (id.includes('vite/dist/client/client.mjs')) {
                return code.replace(/const editorLink = this**\.createLink\(`Open in editor\$**{[^}]*}\`, void 0**\);[\s\S]*?codeHeader\.appendChild\(editorLink\)**;/g, '');
            }
        },
    };
}
/**

* Astro integration to inject development-only scripts

*/
function injectDevScript(options = {}) {
    const {
        scriptPath
    } = options;
    if (!scriptPath) {
        throw new Error('injectDevScript requires a scriptPath');
    }
    return {
        name: 'inject-dev-script',
        hooks: {
            'astro:config:setup': ({
                injectScript,
                command,
                logger
            }) => {
                if (command === 'dev') {
                    logger.info(`Injecting dev script: ${scriptPath}`);
                    // Inject as ES module
                    injectScript('page', `import "${scriptPath}";`);
                }
            },
        },
    };
}
// https://astro.build/config
export default defineConfig({
    // CRITICAL: Use BASE_URL environment variable provided by Webflow Cloud
    // In production, this will be something like "/memory-journal"
    // In local dev, this will be empty string (root)
    base: import.meta.env.BASE_URL || '',
    // Also configure assets to use the same base path
    build: {
        assetsPrefix: import.meta.env.BASE_URL || undefined,
    },
    output: 'server',
    devToolbar: {
        enabled: false,
    },
    server: {
        port: 3000,
        host: true, // Listen on all network interfaces (0.0.0.0)
        strictPort: true,
    },
    adapter: cloudflare({
        platformProxy: {
            enabled: true,
        },
    }),
    integrations: [
        react(),
        injectDevScript({
            scriptPath: '/generated/dev-only.js'
        }),
    ],
    vite: {
        plugins: [tailwindcss(), patchViteErrorOverlay()],
        server: {
            watch: {
                usePolling: true, // Enable polling for file watching in Docker
                interval: 1000,
                ignored: ['**/lost+found/**', '**/dist/**', '**/node_modules/**', '**/src/site-components/Webflow*.jsx', '**/src/site-components/Webflow*.js', '**/src/site-components/Webflow*.tsx', '**/src/site-components/Webflow*.ts', ],
            },
        },
        resolve: {
            // Use react-dom/server.edge instead of react-dom/server.browser for React 19.
            // Without this, MessageChannel from node:worker_threads needs to be polyfilled.
            alias: import.meta.env.PROD ? {
                'react-dom/server': 'react-dom/server.edge',
            } : undefined,
        },
    },
    security: {
        // Disable CSRF origin checking for FormData submissions
        // Cloudflare Workers provides its own security layer
        checkOrigin: false,
    },
});
```





# Helpful Inclusion to the Project Package.json

### Server Enviroment Error Due to Space Limits

```
"cleanup": "rm -rf /tmp/* /var/tmp/* /root/.npm /root/.cache /root/.local /app/lost+found/* /app/dist 2>/dev/null || true && echo 'Cleanup complete!' && df -h / | tail -1"
```


### Consldation of Documents - Add Script to Package JSON

```
"build:docs": "node ./scripts/build-master-doc.mjs",
```

```
// scripts/build-master-doc.mjs
import {
    promises as fs
} from "fs";
import path from "path";
const ROOT = process.cwd();
const OUTPUT_FILE = "MASTER_GUIDE.md";
// Order the important ones explicitly; everything else will be appended.
const ORDERED_FILES = ["README.md", ];

function toNiceTitle(filename) {
    const base = filename.replace(/\.md$/i, "");
    return base.replace(/_/g, " ").replace(/-/g, " ").replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeContent(content) {
    // Trim leading/trailing whitespace
    let out = content.trim();
    // If it starts with a top-level "# ..." heading, strip just that first line
    const lines = out.split(/\r?\n/);
    if (lines[0].startsWith("# ")) {
        lines.shift();
        out = lines.join("\n").trim();
    }
    return out;
}
async function main() {
    const dirEntries = await fs.readdir(ROOT, {
        withFileTypes: true
    });
    const allMd = dirEntries.filter((d) => d.isFile() && d.name.toLowerCase().endsWith(".md")).map((d) => d.name).filter((name) => name !== OUTPUT_FILE);
    // Files in explicit order first, then any others that exist but weren’t listed
    const ordered = [...ORDERED_FILES.filter((f) => allMd.includes(f)), ...allMd.filter((f) => !ORDERED_FILES.includes(f)), ];
    let combined = "# Memorial Site v2 – Master Guide\n\n";
    combined += "> This document is auto-generated by `scripts/build-master-doc.mjs` by combining all Markdown files in the repo.\n\n";
    for (const filename of ordered) {
        const filePath = path.join(ROOT, filename);
        const raw = await fs.readFile(filePath, "utf8");
        const body = normalizeContent(raw);
        const title = toNiceTitle(filename);
        combined += `\n---\n\n`;
        combined += `## ${title}\n\n`;
        combined += `\n\n`;
        combined += body + "\n";
    }
    await fs.writeFile(path.join(ROOT, OUTPUT_FILE), combined, "utf8");
    console.log(`✅ Wrote ${OUTPUT_FILE} with ${ordered.length} sections.`);
}
main().catch((err) => {
    console.error("❌ Error building master doc:", err);
    process.exit(1);
});

```

# GITHUB REPO INITAL SETUP

bootstrap_setup-repo.sh

```
#!/usr/bin/env bash
set -euo pipefail

# -------------------------
# Helpers
# -------------------------

prompt() {
  local var_name="$1"
  local msg="$2"
  local secret="${3:-false}"

  local value=""
  if [[ "${secret}" == "true" ]]; then
    read -r -s -p "${msg}: " value
    echo
  else
    read -r -p "${msg}: " value
  fi

  if [[ -z "${value}" ]]; then
    echo "❌ ${var_name} cannot be empty"
    exit 1
  fi
  printf -v "${var_name}" "%s" "${value}"
}

ensure_line_in_file() {
  local line="$1"
  local file="$2"
  mkdir -p "$(dirname "$file")" 2>/dev/null || true
  touch "$file"
  grep -qxF "$line" "$file" || echo "$line" >> "$file"
}

write_env_kv() {
  local key="$1"
  local val="$2"
  local env_file="${3:-./.env}"
  touch "$env_file"
  grep -v "^${key}=" "$env_file" > "${env_file}.tmp" || true
  mv "${env_file}.tmp" "$env_file"
  echo "${key}=\"${val}\"" >> "$env_file"
}

ensure_gitignore_entries() {
  ensure_line_in_file "webflow.json" ".gitignore"
  ensure_line_in_file "lost+found/" ".gitignore"
}

# -------------------------
# SSH Bootstrap
# -------------------------

ensure_ssh_ready() {
  if [[ ! -d "${HOME}/.ssh" ]]; then
    mkdir -p "${HOME}/.ssh"
  fi
  chmod 700 "${HOME}/.ssh"

  if [[ ! -f "${HOME}/.ssh/id_ed25519" || ! -f "${HOME}/.ssh/id_ed25519.pub" ]]; then
    echo "🔐 No SSH key found. Generating new ed25519 key..."
    ssh-keygen -t ed25519 -C "gary@revrebel.io" -f "${HOME}/.ssh/id_ed25519" -N ""
  fi

  chmod 600 "${HOME}/.ssh/id_ed25519"
  chmod 644 "${HOME}/.ssh/id_ed25519.pub"

  if [[ -z "${SSH_AUTH_SOCK:-}" ]]; then
    eval "$(ssh-agent -s)" >/dev/null
  fi
  ssh-add "${HOME}/.ssh/id_ed25519" >/dev/null || true

  echo "✅ SSH ready."
  echo "   If this key is not added to GitHub yet, add it now:"
  echo "--------------------------------------------------"
  cat "${HOME}/.ssh/id_ed25519.pub"
  echo "--------------------------------------------------"
  echo "Test with: ssh -T git@github.com"
}

# -------------------------
# Script generator
# -------------------------

ensure_build_and_push_script() {
  mkdir -p scripts

  cat > scripts/build-and-push.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

BRANCH="${BRANCH:-dev}"
BASE_BRANCH="${BASE_BRANCH:-main}"

if [[ -f ".env" ]]; then
  # shellcheck disable=SC1091
  source .env || true
fi

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "❌ Not inside a git repo."
  exit 1
}

git checkout -B "$BRANCH" >/dev/null 2>&1 || git checkout "$BRANCH"

git fetch origin >/dev/null 2>&1 || true
if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  echo "ℹ️  Rebasing on origin/$BRANCH ..."
  git pull --rebase origin "$BRANCH"
else
  echo "ℹ️  origin/$BRANCH does not exist yet; skipping rebase."
fi

echo "🏗️  Running build..."
npm run build

if git diff --quiet && git diff --cached --quiet; then
  echo "ℹ️  No changes to commit after build."
else
  git add -A
  COMMIT_MSG="${COMMIT_MSG:-"chore(build): build output $(date -u +'%Y-%m-%dT%H:%M:%SZ')"}"
  git commit -m "$COMMIT_MSG"
  echo "✅ Committed: $COMMIT_MSG"
fi

echo "🚀 Pushing to origin/$BRANCH ..."
git push -u origin "$BRANCH"

if command -v gh >/dev/null 2>&1; then
  PR_TITLE="${PR_TITLE:-"Build update"}"
  PR_BODY="${PR_BODY:-"Automated build + push from npm script."}"

  if gh pr view --head "$BRANCH" >/dev/null 2>&1; then
    echo "ℹ️  PR already exists for $BRANCH"
  else
    gh pr create --base "$BASE_BRANCH" --head "$BRANCH" --title "$PR_TITLE" --body "$PR_BODY" || true
    echo "✅ PR created (or attempted) via gh"
  fi
else
  echo "ℹ️  gh not found; skipping PR creation."
fi

echo "✅ Done."
EOF

  chmod +x scripts/build-and-push.sh
  echo "✅ Wrote scripts/build-and-push.sh"
}

# -------------------------
# package.json patcher (via node)
# -------------------------

ensure_package_json_scripts() {
  if [[ ! -f "package.json" ]]; then
    echo "ℹ️  package.json not found. Creating a minimal one."
    cat > package.json <<'EOF'
{
  "name": "revrebel-project",
  "private": true,
  "scripts": {}
}
EOF
  fi

# Patch scripts using node (safe + deterministic; avoids jq dependency)

node - <<'NODE'
const fs = require('fs');
const path = 'package.json';
const pkg = JSON.parse(fs.readFileSync(path, 'utf8'));

pkg.scripts = pkg.scripts || {};

pkg.scripts["setup:repo"] = "bash scripts/setup-repo.sh";

pkg.scripts["build:push"] = "bash scripts/build-and-push.sh";

pkg.scripts["cleanup"] =
  "rm -rf /tmp/* /var/tmp/* /root/.npm /root/.cache /root/.local /app/lost+found/* /app/dist 2>/dev/null || true && echo 'Cleanup complete!' && df -h / | tail -1";

pkg.scripts["build:docs"] = "node ./scripts/build-master-doc.mjs";

fs.writeFileSync(path, JSON.stringify(pkg, null, 2) + "\n");
console.log("✅ Updated package.json scripts: setup:repo, build:push");
NODE
}




# -------------------------
# Main flow
# -------------------------

# 0) Ensure scripts exist and package.json is patched (your ask)
mkdir -p scripts
ensure_build_and_push_script
ensure_package_json_scripts

# --- Load .env (if present) so we can reuse values without reprompting ---
if [[ -f "./.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "./.env"
  set +a
fi

# --- Git identity from env (public gist safe) ---
: "${GIT_USER_NAME:=}"
: "${GIT_USER_EMAIL:=}"

if [[ -z "$GIT_USER_NAME" ]]; then
  prompt GIT_USER_NAME "Git user.name (e.g., RR-Gary-Stringham)"
  write_env_kv "GIT_USER_NAME" "$GIT_USER_NAME" "./.env"
fi

if [[ -z "$GIT_USER_EMAIL" ]]; then
  prompt GIT_USER_EMAIL "Git user.email (e.g., gary@revrebel.io)"
  write_env_kv "GIT_USER_EMAIL" "$GIT_USER_EMAIL" "./.env"
fi

git config --global user.name "$GIT_USER_NAME"
git config --global user.email "$GIT_USER_EMAIL"

# --- Repo owner/org from env (optional) ---
: "${GITHUB_OWNER:=REVREBEL}"

# 3) Repo name prompt
prompt REPO_NAME "Enter repo name (e.g., guestbook-form)"

echo
echo "Choose GitHub auth method for 'origin':"
echo "  1) SSH (recommended)   git@github.com:${GITHUB_OWNER}/${REPO_NAME}.git"
echo "  2) HTTPS + token via git credential store (no token in URL) ✅"
echo "  3) GitHub CLI (gh)     https://github.com/${GITHUB_OWNER}/${REPO_NAME}.git"
read -r -p "Select 1/2/3: " AUTH_CHOICE

REMOTE_URL=""
case "${AUTH_CHOICE}" in
  1)
    ensure_ssh_ready
    REMOTE_URL="git@github.com:${GITHUB_OWNER}/${REPO_NAME}.git"
    ;;
  2)
    : "${GITHUB_ACCESS_TOKEN:=}"
    if [[ -z "$GITHUB_ACCESS_TOKEN" ]]; then
      prompt GITHUB_ACCESS_TOKEN "Enter GitHub access token" true
      write_env_kv "GITHUB_ACCESS_TOKEN" "$GITHUB_ACCESS_TOKEN" "./.env"
    fi

    # Use a clean remote URL (no token embedded)
    REMOTE_URL="https://github.com/${GITHUB_OWNER}/${REPO_NAME}.git"

    # Persist creds for github.com so git stops prompting.
    # This writes to the user's git credential store (not to the repo).
    git config --global credential.helper store

    # Approve token for github.com (username is arbitrary; x-access-token is common)
    printf "protocol=https\nhost=github.com\nusername=x-access-token\npassword=%s\n\n" \
      "$GITHUB_ACCESS_TOKEN" | git credential approve

    ;;
  3)
    if ! command -v gh >/dev/null 2>&1; then
      echo "❌ 'gh' not found. Install GitHub CLI or choose another method."
      exit 1
    fi
    echo "ℹ️  Using gh for auth. Make sure you've run: gh auth login"
    REMOTE_URL="https://github.com/${GITHUB_OWNER}/${REPO_NAME}.git"
    ;;
  *)
    echo "❌ Invalid selection."
    exit 1
    ;;
esac


# 4) Set origin remote
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REMOTE_URL"
  echo "✅ Updated origin: $REMOTE_URL"
else
  git remote add origin "$REMOTE_URL"
  echo "✅ Added origin: $REMOTE_URL"
fi

# 5) Ensure dev branch
git checkout -B dev >/dev/null 2>&1 || true
git branch -M dev
echo "✅ Ensured branch is dev"

# 6) Update .gitignore
ensure_gitignore_entries
echo "✅ Updated .gitignore (webflow.json, lost+found/)"

# 7) Optional initial commit
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  git add -A
  git commit -m "chore: initial commit" >/dev/null 2>&1 || true
  echo "✅ Created initial commit"
else
  echo "ℹ️  Repo already has commits; skipping initial commit"
fi

echo
echo "🎉 Setup complete."
echo "You can now run:"
echo "  npm run build:push"

```




# Build and Push Script 

```
#!/usr/bin/env bash
set -euo pipefail

BRANCH="${BRANCH:-dev}"
BASE_BRANCH="${BASE_BRANCH:-main}"
BUILD_CMD="${BUILD_CMD:-npm run build}"

# Load .env if present
if [[ -f ".env" ]]; then
  # shellcheck disable=SC1091
  source .env || true
fi

# Ensure we’re in a git repo
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "❌ Not inside a git repo."
  exit 1
}

# Ensure origin exists
git remote get-url origin >/dev/null 2>&1 || {
  echo "❌ No 'origin' remote set. Run setup-repo.sh first."
  exit 1
}

# Avoid rebasing with a dirty working tree (safer)
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "❌ Working tree has uncommitted changes. Commit/stash first."
  exit 1
fi

# Ensure branch exists locally and checkout
git checkout -B "$BRANCH" >/dev/null 2>&1 || git checkout "$BRANCH"

# Fetch + rebase on remote branch if it exists
git fetch origin >/dev/null 2>&1 || true
if git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
  echo "ℹ️  Rebasing on origin/$BRANCH ..."
  git pull --rebase origin "$BRANCH"
else
  echo "ℹ️  origin/$BRANCH does not exist yet; skipping rebase."
fi

# Run build
echo "🏗️  Running build: $BUILD_CMD"
eval "$BUILD_CMD"

# Commit build output if changes exist
if git diff --quiet && git diff --cached --quiet; then
  echo "ℹ️  No changes to commit after build."
else
  git add -A
  COMMIT_MSG="${COMMIT_MSG:-"chore(build): build output $(date -u +'%Y-%m-%dT%H:%M:%SZ')"}"
  git commit -m "$COMMIT_MSG"
  echo "✅ Committed: $COMMIT_MSG"
fi

# Push
echo "🚀 Pushing to origin/$BRANCH ..."
git push -u origin "$BRANCH"

# Optional PR creation via gh
if command -v gh >/dev/null 2>&1; then
  PR_TITLE="${PR_TITLE:-"Build update"}"
  PR_BODY="${PR_BODY:-"Automated build + push from npm script."}"

  if gh pr view --head "$BRANCH" >/dev/null 2>&1; then
    echo "ℹ️  PR already exists for $BRANCH"
  else
    gh pr create --base "$BASE_BRANCH" --head "$BRANCH" --title "$PR_TITLE" --body "$PR_BODY" || true
    echo "✅ PR created (or attempted) via gh"
  fi
else
  echo "ℹ️  gh not found; skipping PR creation."
fi

echo "✅ Done."

```
