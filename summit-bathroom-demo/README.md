# Summit Bathroom Remodeling (demo)

A fictional bathroom remodeler's one-page site. It exists to demonstrate a lead-capture and follow-up system:
quote form -> Make.com webhook -> Google Sheet (lead tracker) -> emails (customer confirmation + owner alert).

**Demo project. Fictional business. Use fake data only.**

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole one-page site, including the quote form |
| `thank-you.html` | Shown after a successful submit |
| `css/styles.css` | All styling |
| `js/form.js` | Form validation and sending to the webhook |
| `.nojekyll` | Tells GitHub Pages to serve files as-is |

## Run locally

Open `index.html` in a browser. With no webhook set, the form runs in practice mode and logs to the console (F12).

## Connect the webhook

1. In Make, create a scenario that starts with **Webhooks > Custom webhook**. Copy its URL.
2. Paste it into `WEBHOOK_URL` at the top of `js/form.js`.
3. Submit a test enquiry once so Make learns the data structure.

## Troubleshooting

- **Console shows a CORS error:** the browser blocked the request before Make answered. Check the URL is exactly as Make shows it.
- **Nothing in the sheet:** open the scenario's history in Make and check the last run.
- **Spam rows:** the webhook URL is public in this demo. Delete the webhook in Make and create a new one.
