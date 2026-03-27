# GenBridge — Finalised System Design

> Last updated: 2026-03-27
> Status: **Sprint 3 Complete — Sprint 4 in progress**

---

## 1. Architecture Overview

GenBridge uses a **3-tier layered architecture**:

```
[React 18 + TypeScript Frontend]
         ↕ HTTPS / REST JSON
[Spring Boot 3.2.2 REST API (Java 17)]
         ↕ JDBC / JPA (Hibernate)
[PostgreSQL (hosted on Supabase)]
```

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
  Path: `src/main/java/com/genbridge/frontend/`
- **Backend:** Spring Boot 3.2.2, Maven, Spring Security, JWT
  Path: `src/main/java/com/genbridge/backend/`
- **Database:** PostgreSQL on Supabase; schema managed by JPA (Hibernate `ddl-auto`)

---

## 2. Roles

| Role | Who | Capabilities |
|---|---|---|
| `ADMIN` | Platform admin | Create, edit, delete, publish/unpublish lessons; manage content terms and quiz questions; resolve content reports; moderate forum |
| `LEARNER` | Parents, teachers, anyone | Browse published lessons, take quizzes, track progress, report factual errors, post/comment in forum, complete quests |

- Default role on registration: `LEARNER`
- Admin account auto-seeded on startup: `admin@genbridge.com` / `Admin@12345`
- There is no CONTRIBUTOR or MODERATOR role

---

## 3. Final Data Model

### 3.1 Entity-Relationship Overview

```
users ──────────────────────────────────────────────────┐
  │                                                      │
  ├── lesson_progress    (user_id → lessons.id)          │
  ├── quiz_attempts      (user_id → lessons.id)          │
  ├── content_reports    (reported_by → users.id)        │
  ├── forum_posts        (user_id)                       │
  ├── forum_comments     (user_id → forum_posts.id)      │
  ├── quest_completions  (user_id → quests.id)           │
  └──────────────────────────────────────────────────────┘

lessons ─── content          (lesson_id)
        │── quiz_questions   (lesson_id)
        └── content_reports  (lesson_id)

quests ──── quest_completions (quest_id)
```

### 3.2 Table Definitions

#### `users`
| Column | Type | Constraints |
|---|---|---|
| id | UUID | PK, auto-generated |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(254) | NOT NULL, UNIQUE |
| password_hash | VARCHAR(100) | NOT NULL |
| role | VARCHAR(30) | NOT NULL, DEFAULT 'LEARNER' |
| streak_count | INT | NOT NULL, DEFAULT 0 |
| last_active_date | DATE | NULLABLE |

#### `lessons`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NULLABLE |
| objective | TEXT | NULLABLE |
| difficulty | VARCHAR(20) | NOT NULL ('BEGINNER', 'INTERMEDIATE', 'ADVANCED') |
| is_published | BOOLEAN | NOT NULL, DEFAULT false |
| published_at | TIMESTAMP | NULLABLE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() |

#### `content`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| lesson_id | BIGINT | FK → lessons.id, NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| term | VARCHAR(100) | NOT NULL |
| description | TEXT | NOT NULL |
| example | TEXT | NULLABLE |
| order_index | INT | NOT NULL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() |

> Each `content` row is one **vocabulary term** within a lesson (e.g., "No Cap", "Rizz", "Slay").

#### `quiz_questions`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| lesson_id | BIGINT | FK → lessons.id, NOT NULL |
| question_text | TEXT | NOT NULL |
| option_a | VARCHAR(300) | NOT NULL |
| option_b | VARCHAR(300) | NOT NULL |
| option_c | VARCHAR(300) | NOT NULL |
| option_d | VARCHAR(300) | NOT NULL |
| correct_index | INT | NOT NULL (0=A, 1=B, 2=C, 3=D) |
| explanation | TEXT | NULLABLE |

#### `lesson_progress`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| user_id | UUID | FK → users.id, NOT NULL |
| lesson_id | BIGINT | FK → lessons.id, NOT NULL |
| completed | BOOLEAN | NOT NULL, DEFAULT false |
| started_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| completed_at | TIMESTAMP | NULLABLE |
| | | UNIQUE (user_id, lesson_id) |

#### `quiz_attempts`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| user_id | UUID | FK → users.id, NOT NULL |
| lesson_id | BIGINT | FK → lessons.id, NOT NULL |
| question_id | BIGINT | NULLABLE (null = full quiz submit) |
| score | INT | NOT NULL |
| total_questions | INT | NOT NULL |
| correct_answers | INT | NOT NULL |
| attempted_at | TIMESTAMP | NOT NULL, DEFAULT now() |

#### `content_reports`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| lesson_id | BIGINT | FK → lessons.id, NOT NULL |
| reported_by | UUID | FK → users.id, NOT NULL |
| description | TEXT | NOT NULL |
| status | VARCHAR(20) | NOT NULL ('OPEN', 'RESOLVED') |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| | | UNIQUE (lesson_id, reported_by) — one report per user per lesson |

> When open report count for a lesson reaches **3**, the lesson is automatically unpublished. Admin resolves reports and can republish.

#### `forum_posts`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| user_id | UUID | FK → users.id, NOT NULL |
| title | VARCHAR(300) | NOT NULL |
| body | TEXT | NOT NULL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() |

#### `forum_comments`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| post_id | BIGINT | FK → forum_posts.id, NOT NULL |
| user_id | UUID | FK → users.id, NOT NULL |
| body | TEXT | NOT NULL |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() |

#### `quests`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NOT NULL |
| instruction | TEXT | NOT NULL (what the learner must do offline) |
| difficulty | VARCHAR(20) | NOT NULL ('BEGINNER', 'INTERMEDIATE', 'ADVANCED') |
| is_published | BOOLEAN | NOT NULL, DEFAULT false |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() |

> A quest is an **offline, action-based task** (e.g., "Have a 5-minute conversation using at least 3 Gen-Alpha terms with someone you know"). The learner completes it offline, then returns to submit a short reflection.

#### `quest_completions`
| Column | Type | Constraints |
|---|---|---|
| id | BIGINT | PK, auto-increment |
| quest_id | BIGINT | FK → quests.id, NOT NULL |
| user_id | UUID | FK → users.id, NOT NULL |
| reflection | TEXT | NOT NULL |
| submitted_at | TIMESTAMP | NOT NULL, DEFAULT now() |
| | | UNIQUE (quest_id, user_id) — one completion per user per quest |

---

## 4. Key Design Decisions

### 4.1 Admin-Only Content Creation
Learners (parents, teachers) are the target audience — they have no Gen-Alpha knowledge and cannot reliably create accurate content. Only admins create lessons, content terms, quiz questions, and quests.

### 4.2 No Learner Submission Workflow
The DRAFT → PENDING → APPROVED/REJECTED workflow is **removed**. All content management is admin-only.

### 4.3 Lesson Publication Flow (Admin)
```
Admin creates lesson (is_published = false)
  → Adds content terms
  → Adds quiz questions
  → Publishes lesson (is_published = true, published_at = now())
  → Lesson visible to all LEARNERs
```

Lesson can be unpublished at any time (manually by admin, or automatically when 3 unique open reports are received).

### 4.4 Streak Logic
- `streak_count` increments by 1 only when `last_active_date < today`
- If `last_active_date == today`, no increment (idempotent within same day)
- If `last_active_date < yesterday`, streak resets to 1
- Triggered on quiz submission or lesson start

### 4.5 Quiz Completion Rule
A lesson is marked **COMPLETED** only when the learner answers **all questions correctly** in a single quiz submission. Retakes are allowed; score is always recalculated.

### 4.6 Content Report Threshold
- Each user can submit at most **one report per lesson** (duplicate reports are rejected with 409)
- When a lesson accumulates **3 unique OPEN reports**, it is **automatically unpublished**
- Admin reviews reports in the Reports tab, can mark individual reports as RESOLVED
- Admin can manually republish the lesson after fixing the issue

### 4.7 Admin Sidebar
Admins see a dedicated `AdminSidebar` (Lessons / Content / Quiz / Reports tabs) instead of the learner `AppSidebar`. Admins are redirected to `/admin` on login, not `/lessons`.

### 4.8 ContentSeeder
`ContentSeeder.java` seeds 3 published lessons with content terms and quiz questions on first startup (if no lessons exist).

### 4.9 Quest Reflection Model
Quests are not auto-graded. The learner performs an offline action, writes a free-text reflection, and submits it. There is no right or wrong answer — the goal is real-world practice and self-reporting.

---

## 5. User Workflows

### 5.1 LEARNER Workflow

```
1. Visit landing page  →  click "Get Started" or "Log in"
2. Register (name, email, password)  →  role = LEARNER
3. Log in  →  receive JWT, stored in localStorage
4. Redirected to /lessons (Learn page)
   - Sees list of all published lessons (title, difficulty, progress badge)
5. Click a lesson
   - Lesson detail page: objective, list of content terms
   - Read each term (title, description, example)
   - Click "Take Quiz" when ready
6. Take the quiz
   - Presented with all quiz questions for the lesson (multiple choice)
   - Submit answers  →  score displayed
   - lesson_progress set to COMPLETED if all answers correct
   - quiz_attempt recorded, streak updated
7. Report a factual error (optional)
   - Click "Report a factual error" at bottom of lesson
   - Submit description of the error
   - If 3 users report the same lesson, it is auto-unpublished for admin review
8. Complete a Quest (/quests)
   - Browse published quests (offline action challenges)
   - Read the instruction (e.g., "Use 3 Gen-Alpha terms in a real conversation")
   - Complete the task offline, return to submit a reflection
   - Quest marked as completed; can only be submitted once per quest
9. Go to Forum (/forum)
   - Browse posts from other learners
   - Create a new post (title + body)
   - Comment on existing posts
10. View Profile (/profile)
    - See name, email, streak count, XP
    - See list of completed lessons and quests
```

### 5.2 ADMIN Workflow

```
1. Log in with admin@genbridge.com / Admin@12345
2. JWT received with role = ADMIN
3. Redirected to /admin (Admin Dashboard with AdminSidebar)
4. Admin Dashboard tabs:
   a. Lessons
      - View all lessons (published + unpublished, with report count)
      - Create new lesson (title, description, objective, difficulty)
      - Edit lesson details
      - Publish / unpublish a lesson
      - Delete a lesson (with confirmation modal)
   b. Content
      - Select a lesson from dropdown
      - Add content terms (term, title, description, example, order)
      - Edit / delete content terms (with confirmation modal)
   c. Quiz
      - Select a lesson from dropdown
      - Add quiz question (text, 4 options, correct answer index, explanation)
      - Edit / delete quiz questions (with confirmation modal)
   d. Reports
      - View all content reports sorted by date
      - See lesson title, reporter, description, open count (X/3)
      - Mark individual reports as Resolved
      - Navigate to lesson to review and fix content
5. ContentSeeder ensures 3 lessons exist on first login
```

---

## 6. API Endpoint Reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register new learner |
| POST | /api/auth/login | Public | Login, returns JWT |

### Lessons
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/lessons | Public | Get all published lessons |
| GET | /api/lessons/{id} | Public | Get one published lesson |
| POST | /api/lessons | ADMIN | Create lesson |
| PUT | /api/lessons/{id} | ADMIN | Update lesson |
| DELETE | /api/lessons/{id} | ADMIN | Delete lesson |
| GET | /api/admin/lessons | ADMIN | Get all lessons (incl. unpublished) |

### Content Terms
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/content/lesson/{lessonId} | Authenticated | Get content terms for lesson |
| POST | /api/content | ADMIN | Add content term |
| PUT | /api/content/{id} | ADMIN | Update content term |
| DELETE | /api/content/{id} | ADMIN | Delete content term |

### Quiz
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/lessons/{id}/quiz | Authenticated | Get quiz questions (no correct answers exposed) |
| POST | /api/lessons/{id}/quiz | ADMIN | Add quiz question |
| PUT | /api/lessons/{id}/quiz/{questionId} | ADMIN | Update quiz question |
| DELETE | /api/lessons/{id}/quiz/{questionId} | ADMIN | Delete quiz question |
| POST | /api/lessons/{id}/quiz/submit | Authenticated | Submit quiz answers |

### Progress & Streak
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/lessons/{id}/start | Authenticated | Mark lesson as started |
| GET | /api/progress | Authenticated | Get all lesson progress for current user |
| GET | /api/profile | Authenticated | Get profile (streak, completed lessons) |

### Content Reports
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /api/lessons/{lessonId}/report | Authenticated | Submit a factual error report |
| GET | /api/admin/reports | ADMIN | Get all reports (sorted by date) |
| PUT | /api/admin/reports/{reportId}/resolve | ADMIN | Mark a report as RESOLVED |

### Forum (Sprint 4)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/forum/posts | Authenticated | Get all forum posts |
| POST | /api/forum/posts | Authenticated | Create forum post |
| GET | /api/forum/posts/{id} | Authenticated | Get post + comments |
| POST | /api/forum/posts/{id}/comments | Authenticated | Add comment |
| DELETE | /api/forum/posts/{id} | ADMIN | Delete post |
| DELETE | /api/forum/comments/{id} | ADMIN | Delete comment |

### Quests (Sprint 4)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /api/quests | Authenticated | Get all published quests |
| GET | /api/quests/{id} | Authenticated | Get quest details |
| POST | /api/quests | ADMIN | Create quest |
| PUT | /api/quests/{id} | ADMIN | Update quest |
| DELETE | /api/quests/{id} | ADMIN | Delete quest |
| POST | /api/quests/{id}/complete | Authenticated | Submit reflection to complete quest |
| GET | /api/quests/completions | Authenticated | Get current user's completed quests |

---

## 7. Sprint Plan

### Sprint 3 (Core Learning Features) ✅ COMPLETE
- [x] Backend: Lesson + Content + Quiz APIs (admin CRUD + learner read)
- [x] Backend: Progress + Streak APIs
- [x] Backend: ContentSeeder with 3 sample lessons
- [x] Backend: Remove deprecated content submission endpoints
- [x] Backend: Content report system with threshold-based auto-unpublish
- [x] Backend: Quiz question edit + delete endpoints
- [x] Frontend: Learn page (lesson list with progress badges)
- [x] Frontend: Lesson detail + quiz page with score display
- [x] Frontend: Admin dashboard with AdminSidebar (Lessons / Content / Quiz / Reports tabs)
- [x] Frontend: Custom delete confirmation modal (no browser confirm())
- [x] Frontend: Lesson dropdown in Content and Quiz tabs
- [x] Frontend: Quiz question edit/delete with pre-filled modal
- [x] Frontend: "Report a factual error" flow on lesson detail page
- [x] Frontend: Reports tab in admin dashboard (resolve reports, open count display)
- [x] Fix: Admin login redirects to /admin (not /lessons)
- [x] Fix: PublicOnlyRoute redirects admins to /admin

### Sprint 4 (Forum + Quests + Profile + Polish + Deployment)

Work is split across 5 people. Each person owns a full feature end-to-end.

> **Shared files that multiple people touch:** `AppSidebar.tsx`, `AdminSidebar.tsx`, `Admin.tsx`, `App.tsx`, `SecurityConfig.java`
> Coordinate these merges at the end, or designate one person to integrate all route/nav/security additions after everyone is done.

---

#### Person 1 — Forum (Posts + Comments)

**Backend:**
- Entity: `ForumPost.java`, `ForumComment.java`
- Repository: `ForumPostRepository.java`, `ForumCommentRepository.java`
- Service: `ForumService.java`
- Controller: `ForumController.java`
- Endpoints:
  - `GET /api/forum/posts` — list all posts
  - `POST /api/forum/posts` — create post (Authenticated)
  - `GET /api/forum/posts/{id}` — get post + comments
  - `POST /api/forum/posts/{id}/comments` — add comment (Authenticated)
  - `DELETE /api/forum/posts/{id}` — delete post (ADMIN)
  - `DELETE /api/forum/comments/{id}` — delete comment (ADMIN)
- `SecurityConfig.java`: add forum endpoint rules

**Frontend:**
- New page: `Forum.tsx` — post list + create post button
- New page: `ForumPostDetail.tsx` — view post + threaded comments
- Add "Forum" nav link to `AppSidebar.tsx`
- Add "Forum Moderation" tab to `AdminSidebar.tsx` and `Admin.tsx` (view/delete posts and comments)

---

#### Person 2 — Quests

**Backend:**
- Entity: `Quest.java`, `QuestCompletion.java`
- Repository: `QuestRepository.java`, `QuestCompletionRepository.java`
- Service: `QuestService.java`
- Controller: `QuestController.java`
- Endpoints:
  - `GET /api/quests` — list all published quests (Authenticated)
  - `GET /api/quests/{id}` — get quest details (Authenticated)
  - `POST /api/quests/{id}/complete` — submit reflection (Authenticated, one per user per quest)
  - `GET /api/quests/completions` — get current user's completed quests
  - `POST /api/quests` — create quest (ADMIN)
  - `PUT /api/quests/{id}` — update quest (ADMIN)
  - `DELETE /api/quests/{id}` — delete quest (ADMIN)
- `SecurityConfig.java`: add quest endpoint rules

**Frontend:**
- New page: `Quests.tsx` — quest list with completion status badges
- New page: `QuestDetail.tsx` — quest description + offline instruction + reflection textarea + submit button
- Add "Quests" nav link to `AppSidebar.tsx`
- Add "Quests" tab to `AdminSidebar.tsx` and `Admin.tsx` (admin create/edit/delete quests, same pattern as Lessons tab)

---

#### Person 3 — Profile Page

**Backend:**
- `ProfileController.java` already exists — check current response and extend:
  - Add `completedQuestsCount` to profile response
  - Add `xp` field (formula: `completedLessons * 10 + completedQuests * 15`)
  - Add list of completed lessons with titles
  - Add list of completed quests with titles

**Frontend:**
- Build out `Profile.tsx` — currently a stub
  - Show: name, email, streak count, XP, progress bar
  - Completed lessons list (title, date completed)
  - Completed quests list (title, date submitted)
- Add XP/progress bar component
- Update `AppSidebar.tsx` to pull streak and XP from `GET /api/profile` instead of localStorage

---

#### Person 4 — Settings Page + Dark Mode

**Backend:**
- Add `PUT /api/auth/change-password` endpoint
  - Request body: `{ oldPassword, newPassword }`
  - Validate old password matches current hash
  - Hash and save new password using `BCryptPasswordEncoder`
  - Return 400 if old password is wrong

**Frontend:**
- Build out `Settings.tsx` — currently a stub
  - Change password form: old password, new password, confirm new password fields
  - Show success/error toast on submit
- Dark mode toggle
  - Toggle adds/removes `dark` class on `<html>` element
  - Persist preference in `localStorage` (`gb_theme`)
  - Apply saved theme on page load (in `main.tsx` or `App.tsx`)
- Add "Settings" nav link to `AppSidebar.tsx`

---

#### Person 5 — Search/Filter + Deployment

**Frontend:**
- Search bar on `Learn.tsx` — filter lessons by title (client-side)
- Difficulty filter dropdown (`All / Beginner / Intermediate / Advanced`)
- "Show completed only" toggle
- Fix any UI inconsistencies across pages

**Deployment — Railway (backend) + Vercel (frontend):**

*Backend — Railway:*
1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select the repo, set root directory to `/` (Railway detects Maven automatically)
3. Add environment variables in Railway dashboard:
   - `SPRING_DATASOURCE_URL` — your Supabase JDBC URL (`jdbc:postgresql://...`)
   - `SPRING_DATASOURCE_USERNAME` — Supabase DB username
   - `SPRING_DATASOURCE_PASSWORD` — Supabase DB password
   - `JWT_SECRET` — your JWT secret key
   - `SPRING_PROFILES_ACTIVE=prod`
4. Railway auto-builds and deploys on every push to `main`
5. Note the public URL (e.g., `https://yourapp.up.railway.app`) — this is the backend base URL

*Frontend — Vercel:*
1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set framework preset to **Vite**
3. Set root directory to `src/main/java/com/genbridge/frontend`
4. Add environment variable:
   - `VITE_API_BASE_URL` — set to the Railway backend URL above
5. Update `src/services/api.ts` to use `import.meta.env.VITE_API_BASE_URL` as the base URL
6. Vercel auto-deploys on every push to `main`

*After deployment:*
- Update CORS config in `CorsConfig.java` to allow the Vercel frontend URL
- Test the full stack end-to-end (register, login, lesson, quiz, report flow)

---

### Sprint 5 (Quality + Demo)
- [ ] Unit tests for all service classes
- [ ] Integration tests for API endpoints
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Final demo preparation
