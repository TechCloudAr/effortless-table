

# Plan: Fix 3 Build Errors

## 1. Create `src/components/admin/MenuExcelImport.tsx`
A stub component that accepts `onSuccess` prop. It renders an "Importar Excel" button (functionality can be built out later).

## 2. Fix `AdminMenuPage.tsx` broken JSX
The diff shows the `<MenuExcelImport>` was placed incorrectly inside the `<Button>` tag. Move it to be a sibling element before the button.

## 3. Fix `supabase/functions/business-chat/index.ts`
- Add `!` assertions on `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (or throw if missing)
- Type `productCount` as `Record<string, number>`
- Type the `.sort()` callback params

## 4. Fix `supabase/functions/create-payment/index.ts`
- Add type annotation `(item: any)` on the `.map()` callback
- Add `!` assertions on env vars
- Cast `error` to `Error` in the catch block

No database changes needed.

