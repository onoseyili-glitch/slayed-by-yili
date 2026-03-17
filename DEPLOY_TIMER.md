# Deploying the Testimony Timer

This project only contains a single HTML file (`testimony-timer.html`). You can make it available anywhere on the internet by deploying it as a static page. Below are two easy options:

---

## Option A – GitHub Pages (recommended)

1. **Rename the file**
   ```bash
   cd /root/slayed-by-yili
   cp testimony-timer.html index.html    # GitHub Pages looks for index.html
   ```

2. **Create a repository on GitHub**
   - Go to https://github.com/new and create a new public repo, e.g. `testimony-timer`.

3. **Push the page**
   ```bash
   git init
   git remote add origin https://github.com/<your‑username>/testimony-timer.git
   git add index.html
   git commit -m "Initial timer page"
   git branch -M main                  # ensure branch name is main
   git push -u origin main
   ```

4. **Enable Pages**
   - In the repo settings, under **Pages**, set the source branch to `main` and the folder to `/ (root)`.
   - After a minute the site will be live at
     `https://<your‑username>.github.io/testimony-timer/`.

5. **Use the URL** in OBS or on any device; it doesn’t depend on this computer.

Updating: modify `index.html` and run
```bash
   git add index.html
   git commit -m "Update timer"
   git push
```

---

## Option B – Drag&amp;Drop Hosting (Netlify / Vercel)

1. Go to one of the following pages:
   - https://app.netlify.com/drop
   - https://vercel.com/new (choose "Import Project" and then drag a folder)

2. Drag the `testimony-timer.html` file (or a folder containing it).

3. The service will upload it and respond with a public URL like
   `https://sleepy-hamster-123.netlify.app`.

4. Paste that address into OBS and you’re done.

These hosts will also auto-update if you connect the GitHub repo from Option A.

---

### Quick local serve (for testing)
If you just want to view the page in your browser locally, run:

```bash
node serve.js            # simple HTTP server already included
```

Then open `http://localhost:8000`.

---

You do **not** need `ngrok` or any tunnel once the page is published. Just open the public link in OBS or browsers on other devices.
