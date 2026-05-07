# Integritas — User Flow

Audience: Backend developer.
Purpose: Map every screen-level action a user can take, in order, so endpoints and data contracts can be derived from each step.

Roles: **Guest**, **Learner** (default authenticated user), **Organization Admin** (a learner with org scope), **Tutor**, **Admin** (platform staff).

---

## 1. Public / Marketing

Entry: any unauthenticated visitor.

1. Land on `/` (Landing).
2. Browse marketing pages: `/about-us`, `/partners`, `/contact`.
3. Browse the public catalog:
   - `/explore/foundational` — list foundational courses.
   - `/explore/experta` — list Experta-class courses.
   - `/explore/courses` — full catalog with filters/search.
   - `/explore/course/:courseId` — public course detail (overview, syllabus, price, tutor).
4. Click **Login** → `/login`, or **Become an Associate** → `/signup`.

Backend needs: public course list + filters, public course detail, contact form submit, partners list.

---

## 2. Authentication

### 2.1 Sign up
1. `/signup` — submit name, email, password, role intent (learner / tutor / associate).
2. Backend creates account, sends verification email.
3. User opens link → `/verify/:id/:hash` → account marked verified.
4. Auto-login or redirect to `/login`.

### 2.2 Login
1. `/login` — email + password.
2. On success: token issued, user fetched.
3. Redirect by role:
   - learner → `/learner`
   - tutor → `/tutor` (gated by KYC, see 4.0)
   - admin/staff → `/admin`

### 2.3 Forgot password
1. `/forgot-password` — submit email.
2. Backend emails reset link.
3. User opens link → set new password → redirect to `/login`.

### 2.4 Logout
1. Clear token, redirect to `/`.

### 2.5 Organization invite (joining an org)
1. Invitee receives email link → `/org-invitations/accept?token=...` (or `/accept-invite`, `/org-invitations/public/accept`).
2. If not authenticated → prompt login/signup, then return to accept page.
3. User reviews org name + role, clicks **Accept** or **Decline**.
4. On accept: user added to org, redirect to `/learner/organization/overview`.

Backend needs: signup, verify, login (with role), refresh, forgot/reset, validate invite token, accept/decline invite.

---

## 3. Learner Module (`/learner`)

Default landing for an authenticated learner.

### 3.1 Dashboard (`/learner`)
- Show: continue-learning card(s), enrolled courses progress, recommended courses, recent certificates, organization snippet (if member).

### 3.2 Browse & enroll
1. From dashboard or header → `/explore/courses`.
2. Filter / search → click course card → `/explore/course/:courseId`.
3. On course detail click **Enroll** (free) or **Buy** (paid).
   - Free: enrollment created → redirect to `/explore/lesson/:courseId`.
   - Paid: redirect to `/checkout`.

### 3.3 Checkout (`/checkout`)
1. Show cart/course, price, certificate add-on if any.
2. Submit payment → payment provider.
3. On success → `/payment-success` → enrollment created → CTA to start learning.
4. On failure → return to checkout with error.

### 3.4 My Learning
- `/explore/my-learning` — all enrolled courses with progress.
- `/explore/enrollments` — enrollment history (active, completed, expired).
- `/explore/progress` — aggregated progress, certificates, time spent.

### 3.5 Take a course
1. `/explore/lesson/:courseId` — auto-resume at last lesson, or first lesson if new.
2. `/explore/lesson/:courseId/:lessonId` — lesson page:
   - View video / read text / download materials.
   - Mark lesson complete (auto on video end or button).
   - Take quiz at end of lesson/module → submit answers → score returned.
   - Progress bar updates.
3. On final lesson completion + passing quiz → certificate generated.

### 3.6 Certificate
- View / download from `/explore/progress` or course detail.

Backend needs: dashboard summary, course list with enrollment state, enroll, checkout session, payment webhook, lesson content, mark-complete, quiz submit + grade, progress aggregate, certificate generation + download.

---

## 4. Organization (inside `/learner/organization`)

A learner who belongs to an org sees these. An **Org Admin** sees additional management actions.

### 4.1 Overview (`/learner/organization/overview`)
- Org name, member count, active learning paths, recent activity.

### 4.2 Invitations (`/learner/organization/invite`)
- **Member view**: pending invites to accept/decline.
- **Org Admin view**: invite new members (email, role), see pending/accepted/expired invites, resend or revoke.

### 4.3 Learning Paths (`/learner/organization/learning-paths`)
- **Member**: list of paths assigned to them, click into path → list of courses in order, progress per course.
- **Org Admin**: create path, add courses, assign to members or groups.

### 4.4 Assignments
- `/learner/organization/my-assignments` — my assigned courses (deadline, status).
- `/learner/organization/assignments` — Org Admin: all assignments across members; create/edit/cancel assignments.

### 4.5 Reports (`/learner/organization/reports`)
- Org Admin only. Completion rates per member / per course / per path. Export CSV.

Backend needs: my-org context, list/accept/decline invites, send invite, learning paths CRUD, assignments CRUD, assignment progress, org reports + export.

---

## 5. Tutor Module (`/tutor`)

Gated by `OnboardingGuard` — tutors must complete KYC before accessing other tutor pages.

### 5.1 KYC (`/tutor/kyc`)
1. New tutor lands here on first login.
2. Submit ID, qualifications, profile info, payout details.
3. Status = pending → tutor sees read-only state until reviewed.
4. Admin approves/rejects (see 6.4). On approve → full access to `/tutor/*`.

### 5.2 Dashboard (`/tutor`)
- Stats: courses count, students enrolled, revenue, recent activity, KYC status.

### 5.3 My Courses (`/tutor/courses`)
- List of tutor's own courses (draft, in-review, published, archived).
- Click a course → `/tutor/courses/:courseId` (Course Dashboard).

### 5.4 Create a course (`/tutor/create-course`)
1. Step 1 — basic info: title, category, description, price, thumbnail.
2. Step 2 — modules: add modules.
3. Step 3 — lessons per module: title, type (video/text/quiz).
4. Save as draft or submit for review.

### 5.5 Course Dashboard (`/tutor/courses/:courseId`)
- Tabs: Modules, Students, Reviews, Settings.
- Edit metadata, manage modules/lessons.

### 5.6 Edit lesson (`/tutor/courses/:courseId/modules/:moduleId/lessons/:lessonId`)
- Upload video, write rich text, attach files, set duration.
- Save → updates lesson.

### 5.7 Add quiz questions (`.../lessons/:lessonId/questions`)
- Add MCQ / true-false / short-answer.
- Set correct answer, points, pass mark.

### 5.8 Students (`/tutor/students`)
- List of learners enrolled in tutor's courses, progress per learner, message (if implemented).

### 5.9 Submit for review
- From course dashboard → submit → admin reviews (see 6.3).

Backend needs: KYC submit + status, tutor dashboard stats, my courses CRUD, modules/lessons CRUD, video upload, quiz CRUD, students per course, submit-for-review endpoint.

---

## 6. Admin Module (`/admin`)

Platform staff only. No KYC gate.

### 6.1 Dashboard (`/admin`)
- Platform KPIs: users, courses, revenue, pending KYC, pending course reviews.

### 6.2 User management (`/admin/users`)
Tabs:
- `/admin/users/staff` — internal staff CRUD, roles, permissions.
- `/admin/users/learners` — list, search, suspend, view profile.
- `/admin/users/tutors` — list, KYC status, suspend.
- `/admin/users/reviewers` — assign reviewer role.

### 6.3 Content management (`/admin/content`)
- `/admin/content/courses` — all courses; filter by status. Open `/:courseId` → review, approve/reject, publish/unpublish.
- `/admin/content/essential-courses` — platform-curated foundational courses; `/create` wizard.
- `/admin/content/lessons-by-admin` — lessons authored by admin (cross-module view).
- `/admin/content/categories` — CRUD course categories/tags.
- `/admin/content/price-changes` — review/approve certificate price-change requests.

### 6.4 KYC review (`/admin/kycreview`)
1. List of pending tutor KYCs.
2. Open a record → view documents → approve / reject with reason.
3. Tutor notified, status updated.

### 6.5 Settings (`/admin/settings`)
- Platform settings: branding, fees, payment config, email templates.

Backend needs: admin stats, user CRUD per role, suspend/activate, course list with status filter, approve/reject course, essential-course CRUD, categories CRUD, price-change approval queue, KYC queue + decision, platform settings CRUD.

---

## 7. Cross-cutting

- **Theme toggle** — client only, persist in user preferences (optional endpoint).
- **Header auth state** — `GET /me` on app load to populate user, role, org membership.
- **Protected routes** — every `/learner`, `/tutor`, `/admin` route requires a valid token; expired token → redirect `/login`.
- **404** — any unknown path renders `NotFound`.

---

## Suggested endpoint groups (for the backend dev)

- `auth/*` — signup, login, logout, verify, forgot, reset, me, refresh.
- `org-invitations/*` — validate, accept, decline, send, list, revoke.
- `courses/*` (public) — list, detail, categories.
- `enrollments/*` — create, list mine, progress.
- `lessons/*` — content, mark-complete, quiz submit.
- `checkout/*` — create session, webhook, success.
- `certificates/*` — issue, download.
- `organizations/*` — me, members, invitations, learning-paths, assignments, reports.
- `tutor/*` — kyc, dashboard, courses, modules, lessons, questions, students, submit-for-review.
- `admin/*` — dashboard, users (by role), courses (review/publish), essential-courses, categories, price-changes, kyc, settings.
