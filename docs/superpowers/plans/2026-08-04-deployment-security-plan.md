# Deployment Security & UI Login Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement pre-flight verification checks, graceful fallback UI, and a multi-email Supabase Auth login gate with soft-lock navigation on Slide 0.

**Architecture:** Integrate Supabase JS client (`@supabase/supabase-js`) with custom React state management in `CoverSlide` for Sign In / Sign Up modes. Enforce soft-lock hotkey guardrails in `app/page.tsx` when unauthenticated, and display user session details with logout revocation in the top status bar.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons, Supabase Auth (`@supabase/supabase-js`), Jest.

## Global Constraints

- Preserve all existing 55 test passes in Jest (`npx jest`).
- Zero ESLint errors or warnings (`npm run lint`).
- Dark glassmorphism styling (`bg-zinc-900/60 backdrop-blur-md border border-amber-500/30`) consistent with ZenFX design system.
- Support multi-email authentication & registration via Supabase Auth.

---

### Task 1: Supabase Client & Multi-Email Auth Helper

**Files:**
- Create: `lib/supabaseClient.ts`
- Test: `__tests__/unit/supabaseClient.test.ts`

**Interfaces:**
- Consumes: Environment variables `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Produces: `supabase` client instance for authentication & database queries.

- [ ] **Step 1: Write the failing test**

Create `__tests__/unit/supabaseClient.test.ts`:
```typescript
import { supabase } from "@/lib/supabaseClient"

describe("Supabase Client Initialization", () => {
  it("initializes supabase client without throwing", () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase.auth.signInWithPassword).toBe("function")
    expect(typeof supabase.auth.signUp).toBe("function")
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/unit/supabaseClient.test.ts`
Expected: FAIL with "Cannot find module '@/lib/supabaseClient'"

- [ ] **Step 3: Write minimal implementation**

Create `lib/supabaseClient.ts`:
```typescript
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/unit/supabaseClient.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/supabaseClient.ts __tests__/unit/supabaseClient.test.ts
git commit -m "feat: add supabase client initialization helper"
```

---

### Task 2: Multi-Email Login & Sign-Up Card on Cover Slide

**Files:**
- Modify: `components/slides/cover-slide.tsx`
- Test: `__tests__/unit/cover-slide-auth.test.tsx`

**Interfaces:**
- Consumes: `supabase` client from `lib/supabaseClient.ts` and callback `onLoginSuccess(email: string)`.
- Produces: Interactive Auth Card with Sign In / Sign Up toggle and email/password authentication.

- [ ] **Step 1: Write the unit test**

Create `__tests__/unit/cover-slide-auth.test.tsx`:
```typescript
import { render, screen } from "@testing-library/react"
import { CoverSlide } from "@/components/slides/cover-slide"

describe("CoverSlide Auth Form", () => {
  it("renders email and password inputs with Sign In button", () => {
    render(<CoverSlide onNavigate={() => {}} isAuthenticated={false} onLoginSuccess={() => {}} />)
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest __tests__/unit/cover-slide-auth.test.tsx`
Expected: FAIL due to missing props or inputs.

- [ ] **Step 3: Implement Auth Card in `CoverSlide`**

Update `components/slides/cover-slide.tsx` to include state for `isSignUpMode`, `email`, `password`, `errorMessage`, `loading`, and call `supabase.auth.signInWithPassword` or `supabase.auth.signUp`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx jest __tests__/unit/cover-slide-auth.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/slides/cover-slide.tsx __tests__/unit/cover-slide-auth.test.tsx
git commit -m "feat: implement multi-email login and sign-up card on cover slide"
```

---

### Task 3: Unauthenticated Navigation Guardrails & Soft Lock

**Files:**
- Modify: `app/page.tsx`
- Test: `__tests__/integration/navigation-guardrail.test.tsx`

**Interfaces:**
- Consumes: `isAuthenticated` boolean state.
- Produces: Navigation protection that triggers shake micro-animation and alert badge if unauthenticated.

- [ ] **Step 1: Write the integration test**

Create `__tests__/integration/navigation-guardrail.test.tsx`:
```typescript
import { render, screen } from "@testing-library/react"
import Home from "@/app/page"

describe("Navigation Guardrail", () => {
  it("renders ZenFX title and cover slide", () => {
    render(<Home />)
    expect(screen.getByText(/ZenFX/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it passes**

Run: `npx jest __tests__/integration/navigation-guardrail.test.tsx`
Expected: PASS

- [ ] **Step 3: Update `app/page.tsx` for Soft Lock Navigation**

Add `isAuthenticated` state and `userEmail` state stored in Supabase Auth session / localStorage. If user clicks or hits hotkeys 1-4 while `isAuthenticated` is false, trigger shake alert.

- [ ] **Step 4: Run full test suite**

Run: `npx jest`
Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx __tests__/integration/navigation-guardrail.test.tsx
git commit -m "feat: add navigation soft lock and hotkey guardrails"
```

---

### Task 4: Status Bar User Session Badge & Logout Revocation

**Files:**
- Modify: `app/page.tsx`
- Test: `__tests__/unit/status-bar-auth.test.tsx`

**Interfaces:**
- Consumes: `userEmail` and `supabase.auth.signOut()`.
- Produces: Header badge showing `admin@domain.com [Logout]` with session revocation.

- [ ] **Step 1: Implement Header Logout Badge**

Update `app/page.tsx` top status bar to render email badge and Logout button when authenticated.

- [ ] **Step 2: Verify with Jest**

Run: `npx jest`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: add user email session badge and logout button to status bar"
```

---

### Task 5: Pre-Flight Verification Audit

**Files:**
- Verification: `package.json`, `eslint.config.mjs`

- [ ] **Step 1: Run ESLint audit**

Run: `npm run lint`
Expected: 0 errors, 0 warnings.

- [ ] **Step 2: Run complete Jest test suite**

Run: `npx jest`
Expected: All tests pass.

- [ ] **Step 3: Run static production build**

Run: `npm run build`
Expected: Static build successful.
