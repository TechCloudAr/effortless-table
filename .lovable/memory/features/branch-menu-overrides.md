---
name: Branch menu overrides
description: Each branch can override availability and price of base menu items via branch_menu_overrides table
type: feature
---
- Menu is per-restaurant (base menu). All branches share it.
- Table `branch_menu_overrides` (branch_id, menu_item_id, available_override, price_override) allows per-branch customization.
- In admin menu page: branch selector pills switch between "Menú base" and branch-specific view.
- In branch view: toggle availability creates/updates override; edit/delete buttons hidden (only base menu).
- `useMenu(restaurantId, branchId)` applies overrides automatically when branchId is provided.
- CustomerMenu should pass branchId to useMenu for correct per-branch rendering.
