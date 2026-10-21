# Employee salary slips

Administrators can open **Directory → employee → Salary / Gaji**. The tab lists
income slips newest first, with 30 records per page and an optional payroll month
filter. Use **View slip / Lihat slip** to display the original HRMIS HTML, including
its labels, amounts, deductions, and styles, in an isolated, script-disabled frame.

## Backend contract

The Biller Simulator backend provides `GET /api/employees/{nrp}/salary` with
optional `tanggal=YYYY-MM-DD` and zero-based `page`. The frontend sends the first
day of the selected month. Responses contain `data.listPenghasilan`, `data.page`,
and `data.hasMore`. The endpoint requires the existing `ADMIN` role and the
backend's existing HRMIS database configuration. Deploy the backend change along
with the frontend.

The query follows `API_HRMIS/app/controller/SlipPenghasilanController.js`:

- Read `TBL_SLIP_PENGHASILAN` for the selected employee, excluding null slips.
- Without a date filter, include slip dates through the database's current day.
- With a date filter, match the exact slip date **or** its `bulan` and `tahun`.
  As in HRMIS, an explicit period filter replaces the current-day cutoff.
- Preserve `rowNum`, `id`, `nrp`, `tahun`, `bulan`, `jnsSlip`, `jnsSlipText`,
  `slip`, `tanggal`, and `tanggal2`, and all six HRMIS income-type labels.
- Order by slip date descending, adding ID descending only to stabilize ties.
  Bind parameters rather than interpolating request values into SQL.

The backend fetches one additional row to determine whether another page exists.
The original slip HTML and amounts are passed through without parsing or
recalculating them. Indonesian payroll month names and HRMIS income-type labels
remain unchanged when the application language changes.

## Manual verification

With a running updated backend and an administrator session:

1. Open an employee and select Salary / Gaji; compare the records with HRMIS for
   the same NRP.
2. Choose a known payroll month; compare routine and non-routine slips, including
   records whose slip date differs from their payroll month.
3. Open a slip and compare its layout, income, deductions, and net total with HRMIS.
4. Check All months, Load more, an empty period, retry after a backend error, and
   switching employees. Confirm the list remains usable on a narrow screen.
5. Confirm non-administrators cannot access the salary endpoint.

## Salary privacy lock

Salary starts locked. Draw the shared Android-style pattern to unlock an
employee's salary view for a fixed five minutes; activity does not extend it.
Keyboard users can select dots with Tab and Space, then choose Unlock salary.
Lock now ends the window immediately. The remaining time is shown above the list.
The unlock deadline is scoped to the signed-in account and employee in this
browser tab's session storage. Other tabs and employees start locked.

While locked, the salary content is unmounted and makes no salary requests.
Relocking removes cached salary queries, cancels in-flight requests, and removes
open slip frames. Expiry is checked on a timer and when returning to the window.
Normal logout clears the browser session storage.

This is a frontend privacy screen to prevent casual viewing, not an authorization
boundary. The shared pattern and deadline are controlled by browser code and can
be bypassed with developer tools. Backend administrator authorization remains in
force; enforce step-up authentication on the backend if stronger protection is
required.

Manual checks: verify the shared pattern, a wrong pattern, keyboard entry, Lock
now, automatic locking after five minutes, returning after expiry in a hidden
tab, switching employees, and cancellation of a slow request when locking.
