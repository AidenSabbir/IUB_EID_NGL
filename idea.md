# 🌙 Eid Moon - Locked Inbox App

An NGL-style messaging web app specially designed for Ramadan and Eid. Users can share their unique profile links to receive messages from friends. The twist? The inbox is completely locked until Eid night, building anticipation and excitement for the big reveal!

## ✨ Features

* **The Eid Lock:** Messages are locked server-side. Users can see *how many* messages they have and *who* sent them (if not anonymous), but the content is completely inaccessible until the exact time of Eid.
* **Authenticated Sending:** To prevent spam, users must log in to send a message.
* **Sender's Choice:** Senders can choose to attach their name to the "envelope" or remain completely anonymous.
* **User Search:** Find friends easily through a built-in user search feature.
* **Custom Links:** Every user gets a shareable link (e.g., `eid-moon.com/u/username`) for their social media bios.
* **Wish back:** Users can send a "wish back" to the sender after opening the message.
## 🛠 Tech Stack

* **Frontend Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Animation:** [Framer Motion](https://www.framer.com/motion/)
* **Backend as a Service (BaaS):** [Supabase](https://supabase.com/)
    * **Database:** PostgreSQL
    * **Authentication:** Supabase Auth (Google OAuth & Email)
    * **Security:** Row Level Security (RLS) & Postgres RPC Functions (to handle the time-lock securely).
* **Auth** Google OAuth
## 🎨 UI/UX Design: "Golden Serenity"

The app moves away from harsh neobrutalism into a softer, more elegant, and welcoming theme perfect for Ramadan. 
## MUST PLACE ALL COLORS IN `globals.css` and use var(--color-name) for all colors
**Color Palette:**
* `Background:` Soft Cream (`#F7F4EF`)
* `Cards/Envelopes:` Pure White (`#FFFFFF`)
* `Primary Accent:` Muted Gold (`#B38B59`) - *Used for icons, buttons, and thin borders.*
* `Secondary Pattern:` Light Beige (`#E3D7C5`)
* `Text/Shadows:` Warm Dark Brown (`#4A3B2C`)

**Styling Rules:**
* **Borders:** Thin, solid 2px borders using the Muted Gold color instead of harsh black lines.
* **Shadows:** Soft, blurred drop shadows using the Warm Dark Brown color to make envelopes "float."
* **Corners:** Slightly rounded (moderate `border-radius`) for a friendly feel.
* **Typography:** Elegant serif fonts for headings (e.g., "Ramadan Kareem"); clean sans-serif for reading 
messages.
* **Grid**: Bento  Grid on PC
