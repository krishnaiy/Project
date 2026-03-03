# 🚀 Deploying Pension Calculator to Render (Free Tier)

This document explains how to take the existing Flask‑based pension calculator and host it on [Render](https://render.com) without changing its behaviour. The web app will run exactly as it does locally, serving the static frontend and REST API from the same service.

---

## 1. Prepare the repository

1. **Ensure the following files are included in your Git repo**:
   - `pension_api.py` (API layer)
   - `pension_backend.py` (calculation engine)
   - `static/` directory with `index.html`, `app.js`, `styles.css`, etc.
   - `requirements.txt` (see below)
   - `Procfile` (start command)
   - `RENDER_DEPLOYMENT.md` (this instructions file)

2. **`requirements.txt`**
   ```text
   Flask==3.1.2
   Flask-CORS==6.0.2
   gunicorn==20.1.0
   ```
   These are the Python dependencies needed by the app.

3. **`Procfile`**
   ```text
   web: gunicorn pension_api:app
   ```
   Render will use this to start the web service. It tells Gunicorn to load the `app` object from `pension_api.py`.

4. **Code changes** (already applied):
   - `pension_api.py` now reads `PORT` and `DEBUG` from the environment and falls back to `5001`/`False`.
   - `static/app.js` uses a relative base URL (`/api`) so it works on any host.

---

## 2. Create a Render account & new web service

1. Sign in to **Render** with GitHub/GitLab or create a free account.
2. Click **New** ▶ **Web Service**.
3. Connect your repository (select the repository containing this project).
4. Configure the service settings:
   - **Name**: `pension-calculator` (or any friendly name)
   - **Environment**: `Python 3` (Render will detect automatically)
   - **Build Command**: leave blank (Render auto-runs `pip install -r requirements.txt`)
   - **Start Command**: leave blank if you have a `Procfile`; otherwise `gunicorn pension_api:app`.
   - **Instance Type**: `Free` (shared); the app is lightweight.
   - **Region**: choose your preferred region.
5. Click **Create Web Service** and wait for the first deploy to finish.

> 🔧 **Note**: Render automatically sets the `PORT` environment variable; your app reads it and binds accordingly.

---

## 3. Verify the deployment

1. Once the deploy succeeds, Render will provide a URL such as `https://pension-calculator.onrender.com`.
2. Open that URL in a browser – the calculator UI should load.
3. Play with the sliders; the API calls should succeed and the status indicators will show "Live".
4. You can also hit the health endpoint directly:
   ```bash
   curl https://pension-calculator.onrender.com/api/health
   ```
   Expected result:
   ```json
   { "status": "healthy", "message": "Pension Calculator API is running" }
   ```

---

## 4. Local development after changes

- Continue running the app locally with `python pension_api.py`.
- The code uses port 5001 by default, but you can override with `PORT`:
  ```bash
  PORT=5001 python pension_api.py
  ```

## 5. Updating and redeploying

1. Make your code changes locally and commit to the repository.
2. Push the commits to the branch connected to Render (e.g. `main`).
3. Render will automatically build and deploy the new version.

---

## 6. Troubleshooting

- **Blank page or missing static files**: ensure `static` directory is committed.
- **API calls failing**: open browser console/network tab; check that requests are going to `/api/...` on the same host.
- **Port issues**: Render always expects your app to listen on `$PORT`.
- **Installing packages**: add them to `requirements.txt` and push; Render rebuilds on each deploy.

---

## 7. Additional Notes

- This setup works equally well on other free Python hosts (Heroku, Railway, etc.) with minimal adjustments.
- For production extra features like SSL are handled automatically by Render.
- You can add environment variables via the Render dashboard if needed.

Enjoy your hosted pension calculator! 🎉
