# CLAUDE.md — Root

Global development guidelines for Claude Code across all packages in this monorepo.

## TypeScript

### Never use `as` type casting

Do **not** use `as` to cast types. It bypasses the type checker and hides real bugs.

```ts
// BAD
const user = data as User;
const id = (req.params as { id: string }).id;
```

Instead, write a **type guard** — a function with a type predicate that validates the value at runtime using the `in` operator for narrowing (no `as` needed):

```ts
// GOOD
function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false;
  if (!('id' in value) || !('email' in value)) return false;
  return typeof value.id === 'string' && typeof value.email === 'string';
}

if (isUser(data)) {
  // data is narrowed to User here
}
```

#### Rules

1. **No `as` casts** — not even `as unknown as T` double-casts.
2. **No `!` non-null assertions** — use an explicit null check or type guard instead.
3. **Type guards must validate structure** — check every property the code depends on, not just that the value is non-null.
4. **Prefer Zod `parse` / `safeParse` for external data** — schemas already act as runtime type guards for API payloads, env vars, and config files.

```ts
// Parsing external data with Zod instead of casting
const result = UserSchema.safeParse(rawInput);
if (!result.success) {
  return reply.code(400).send({ error: 'Invalid input' });
}
const user = result.data; // fully typed, no cast needed
```

5. **`satisfies` is allowed** — it checks against a type without widening, so it is safe.

```ts
const config = {
  host: 'localhost',
  port: 5432,
} satisfies DatabaseConfig;
```