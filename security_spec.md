# Security Specification: Pulchra Hijab POS & Store Management

## 1. Data Invariants
- Products:
  - Document ID must be a valid alphanumeric string up to 128 characters.
  - Required fields: `id`, `name`, `category`, `target`, `price`, `stock`, `image`.
  - `price` must be a non-negative number (`>= 0`).
  - `stock` must be an integer/number `>= 0`.
  - `target` must be either `'Dewasa'` or `'Anak-anak'`.
  - `image` must be a valid non-empty string.
- Transactions:
  - Document ID must be a valid alphanumeric string.
  - Required fields: `id`, `invoiceNumber`, `date`, `items`, `totalAmount`, `payAmount`, `changeAmount`.
  - `totalAmount` must equal the sum of item subtotals (or `>= 0`).
  - `payAmount` must be `>= totalAmount`.
  - `changeAmount` must equal `payAmount - totalAmount`.
  - `items` must be a list with at least 1 item and bounded length.

## 2. Dirty Dozen Payloads (Targeting Exploits)
1. Negative Stock: `{ id: 'PRD-1', name: 'Voal', price: 50000, stock: -10 }` -> Rejected.
2. Negative Price: `{ id: 'PRD-1', name: 'Voal', price: -50000, stock: 10 }` -> Rejected.
3. Giant ID Injection: Path `{ 2KB_string }` -> Rejected by `isValidId`.
4. Missing Required Fields: `{ id: 'PRD-1' }` -> Rejected by required keys check.
5. Invalid Target Segment: `{ target: 'Hacker' }` -> Rejected.
6. Underpaid Transaction: `{ totalAmount: 100000, payAmount: 50000 }` -> Rejected.
7. Unbounded Items Array: `{ items: [array with 5000 items] }` -> Rejected.
8. Non-string Name: `{ name: 12345 }` -> Rejected.
9. Malicious Status Mutation -> Rejected.
10. Shadow Field Injection -> Rejected.
11. Blank Image String: `{ image: '' }` -> Handled or validated.
12. Arbitrary collection write: `/secret_backdoor/{id}` -> Denied by default-deny rule.
