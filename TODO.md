# TODO - Quick Planner: Event dropdown + more required services

## Step 1: Confirm current UI behavior

- [x] Quick planner already renders Event Type dropdown from `options.eventTypes`.
- [x] Required Services step already renders buttons from `options.serviceCategories`.

## Step 2: Confirm backend source for planner options

- [x] `GET /api/planner/options` uses:
  - `event_types` table for active `eventTypes`.
  - approved `services.category` for `serviceCategories`.

## Step 3: Ensure data exists in DB

- [ ] Add/activate all desired rows in `event_types` (`status='active'`).
- [ ] Ensure all desired service categories exist via at least one `services` row with `status='approved'` and non-empty `category`.

## Step 4: Verify after deployment

- [ ] Re-check home page quick planner:
  - Event dropdown shows full list.
  - Required services shows added categories.
