# Sprint 5 — Manual Testing Guide

> **Sprint:** Sprint 5 — Auth, Profiles, and Polish  
> **Date range:** Mon 14 – Thu 17 Sep 2026  
> **Tickets:** #19 to #26

---

## Prerequisites

### 1. Start both servers

```bash
# Terminal 1 — API
npm run dev --workspace=@inapyuk/api

# Terminal 2 — Web
npm run dev --workspace=@inapyuk/web
```

API: http://localhost:8000  
Web: http://localhost:3000

### 2. Test accounts (all verified, password `Inapyuk123!`)

| Role | Email | Profile URL |
|---|---|---|
| Tenant | `tenant.bali@inapyuk.space` | `http://localhost:3000/tenant/profile` |
| Customer (User) | `budi@inapyuk.space` | `http://localhost:3000/profile` |
| Google User | *(Any valid Google account)* | `http://localhost:3000/profile` |

### 3. Environment Variables
Make sure `.env` has valid `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and SMTP Mailer configs.

---

## Tickets #19 & #20 — Password Reset Flow
*(Public forms, applicable to all users with `provider: EMAIL`)*

### TC-19/20-01 · Request and Confirm Password Reset (Happy Path)
| Step | Action | Expected |
|---|---|---|
| 1 | Navigate to http://localhost:3000/login | Login page loads |
| 2 | Click **"Lupa Password?"** | Redirects to `/reset-password` |
| 3 | Enter registered email (e.g., `budi@inapyuk.space`) | — |
| 4 | Click **"Kirim Link Reset"** | ✅ Toast: *"Jika email terdaftar, kami telah mengirimkan link reset"* |
| 5 | Open the reset link from terminal/Mailtrap | Redirects to `/reset-password/confirm?token=xxx` |
| 6 | Enter `NewPass123!` in both fields | Passwords match |
| 7 | Click **"Simpan Password Baru"** | ✅ Toast: *"Password berhasil diubah, silakan login"* |

### TC-19/20-02 · Enumeration Defense (Unhappy Path)
| Step | Action | Expected |
|---|---|---|
| 1 | Navigate to `/reset-password` | — |
| 2 | Enter an unregistered email (e.g., `fake@email.com`) | — |
| 3 | Click **"Kirim Link Reset"** | ✅ Toast: *"Jika email terdaftar, kami telah mengirimkan link reset"* (Does not leak that email is fake). No email is sent. |

---

## Ticket #21 — User Profile
*(Validated separately for Customer and Tenant)*

### TC-21-01 · Customer (User) Profile Update
| Step | Action | Expected |
|---|---|---|
| 1 | Log in as Customer (`budi@inapyuk.space`) | Redirects to `/` |
| 2 | Click avatar in header → **Profil Saya** | Navigates to `/profile` |
| 3 | Change name to `Budi Customer` | — |
| 4 | Upload a new `< 1MB` `.jpg` avatar via the camera icon | Preview updates |
| 5 | Click **"Simpan Perubahan"** | ✅ Toast: *"Profil berhasil diperbarui"*; Name and avatar update instantly in header and DB. |

### TC-21-02 · Tenant Profile Update
| Step | Action | Expected |
|---|---|---|
| 1 | Log in as Tenant (`tenant.bali@inapyuk.space`) | Redirects to `/tenant` |
| 2 | Click avatar in header → **Profil Saya** | Navigates to `/tenant/profile` |
| 3 | Change name to `Tenant Bali Owner` | — |
| 4 | Upload a new `< 1MB` `.png` avatar via the camera icon | Preview updates |
| 5 | Click **"Simpan Perubahan"** | ✅ Toast: *"Profil berhasil diperbarui"*; Updates instantly. |

---

## Ticket #22 — Email Change
*(Validated separately for Customer and Tenant)*

### TC-22-01 · Customer Email Change
| Step | Action | Expected |
|---|---|---|
| 1 | In `/profile` (Customer), click **"Ubah Email"** | Modal opens |
| 2 | Enter `budi.new@inapyuk.space` | — |
| 3 | Submit form | ✅ Toast: *"Link konfirmasi dikirim"* |
| 4 | Open link from Mailtrap | Navigates to `/email-change/verify?token=xxx` |
| 5 | System verifies token | ✅ Success message shown; Sessions are revoked. User must log in again with new email. |

### TC-22-02 · Tenant Email Change
| Step | Action | Expected |
|---|---|---|
| 1 | In `/tenant/profile` (Tenant), click **"Ubah Email"** | Modal opens |
| 2 | Enter `tenant.new@inapyuk.space` | — |
| 3 | Submit form | ✅ Toast: *"Link konfirmasi dikirim"* |
| 4 | Open link from Mailtrap | Navigates to `/email-change/verify?token=xxx` |
| 5 | System verifies token | ✅ Success message shown; Tenant sessions revoked. Tenant logs in with new email. |

---

## Ticket #23 — Change Password
*(For users who registered via Email, not Google)*

### TC-23-01 · Change Password (Both Customer & Tenant)
| Step | Action | Expected |
|---|---|---|
| 1 | In `/profile` OR `/tenant/profile`, find the **Ganti Password** section | Form visible |
| 2 | Enter `WrongOldPass!` as Current Password | — |
| 3 | Enter `NewPass123!` as New Password | — |
| 4 | Submit | ❌ Error: *"Password lama salah"* |
| 5 | Correct Current Password and submit | ✅ Toast: *"Password berhasil diubah"* |

---

## Ticket #24 — Google Social Login
*(Public functionality)*

### TC-24-01 · Login / Register via Google (New Account)
| Step | Action | Expected |
|---|---|---|
| 1 | Go to `/login` | — |
| 2 | Click **"Lanjutkan dengan Google"** | Google OAuth screen |
| 3 | Select an account NOT registered on InapYuk | — |
| 4 | Wait for redirect | ✅ Logged in automatically. Profile created as Customer with `provider: GOOGLE` and `isVerified: true`. |

### TC-24-02 · Prevent Silent Takeover
| Step | Action | Expected |
|---|---|---|
| 1 | Go to `/login` | — |
| 2 | Click **"Lanjutkan dengan Google"** | — |
| 3 | Select a Google account matching an existing EMAIL user (e.g., `budi@inapyuk.space`) | — |
| 4 | Wait for redirect | ❌ Blocked. Error: *"Email ini sudah terdaftar dengan password. Silakan login menggunakan email dan password Anda."* |

---

## Ticket #25 — Google Account Linking
*(For existing Email users who want to link their Google account)*

### TC-25-01 · Link Google Account (Both Customer & Tenant)
| Step | Action | Expected |
|---|---|---|
| 1 | Log in as Customer or Tenant (via email/password) | — |
| 2 | Go to `/profile` OR `/tenant/profile` | — |
| 3 | Find the **Social Accounts / Tautkan Google** section | — |
| 4 | Click **"Hubungkan Google"** | Redirects to Google OAuth |
| 5 | Select the exact matching Google account | — |
| 6 | Wait for redirect | ✅ Toast: *"Akun Google berhasil ditautkan"*. Button changes to "Terhubung". |

---

## Ticket #26 — Mobile-First Responsive Pass
*(UI Polish)*

### TC-26-01 · Responsive Checks (Customer)
| Step | Action | Expected |
|---|---|---|
| 1 | Open Chrome DevTools (F12) → Toggle Device Toolbar | Set to 360px (e.g., Galaxy S8) |
| 2 | Navigate to `/profile`, `/login`, `/register`, `/reset-password` | Layouts stack vertically (`flex-col`). |
| 3 | Check inputs and buttons | Tap targets are large; no horizontal scrolling. |

### TC-26-02 · Responsive Checks (Tenant)
| Step | Action | Expected |
|---|---|---|
| 1 | Set DevTools viewport to 360px | — |
| 2 | Navigate to `/tenant/profile` | Layout stacks vertically; Avatar and forms are centered and readable. |
| 3 | Resize window slowly to Desktop (1280px) | Layout gracefully expands (`md:grid-cols-2` or side-by-side flex). No layout breaks. |

---

## Quick Pass/Fail Checklist

```
Tickets #19 & #20 — Password Reset
[ ] Submit shows success toast for real/fake emails (no enumeration leakage)
[ ] Confirm form catches mismatched passwords client-side
[ ] Success redirects to login

Ticket #21 — User Profile (Customer & Tenant)
[ ] Both `/profile` and `/tenant/profile` load correctly
[ ] Name validation (min 3 chars) works
[ ] Avatar upload rejects >1MB files with alert
[ ] Valid images save to Cloudinary

Ticket #22 — Email Change (Customer & Tenant)
[ ] Changing email sends a verification link
[ ] Clicking the link logs out the user (revokes sessions)
[ ] New email works on next login

Ticket #23 — Change Password (Customer & Tenant)
[ ] Form validates old password
[ ] Successfully changes password in DB

Ticket #24 & #25 — Google Social Login & Linking
[ ] New Google login creates an auto-verified user
[ ] Existing Email user CANNOT be silently taken over by Google
[ ] Existing Email user CAN manually link Google via Profile page

Ticket #26 — Responsive Pass
[ ] All Auth and Profile forms look good and have no horizontal scroll at 360px
```
