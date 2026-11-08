# Analytics Setup

The public site loads Google Tag Manager only when `NEXT_PUBLIC_GTM_ID` is set to a valid `GTM-...` container ID. The loader and event dispatcher are excluded from `/admin`, `/api`, and server-side finance submission routes. Until the container ID is configured, no tracking tags load.

## Configure Tags in GTM

Add the GA4 Google tag and Meta Pixel in the GTM container. Keep their measurement/pixel IDs in GTM, not in application source. Configure the GA4 Google tag with `send_page_view` disabled; the site sends route page views through the `page_view` custom event so client-side navigation is counted once.

Create Custom Event triggers for the events below and map only the listed data-layer variables. Do not create user-property, form-field, email, phone-number, finance-value, or admin-page variables.

| Event | Allowed parameters | Suggested use |
| --- | --- | --- |
| `page_view` | `page_path` | GA4 page view; Meta PageView |
| `vehicle_detail_view` | `page_path` | GA4 vehicle view; Meta ViewContent |
| `contact_click` | `method` (`phone`, `email`) | GA4 contact intent; Meta Contact |
| `finance_cta_click` | `source` (`home`, `vehicle_detail`, `finance_form`, `navigation`) | GA4 finance intent |
| `finance_start` | `source` (`home`, `vehicle_detail`, `finance_form`, `navigation`) | GA4 application start; Meta custom event |
| `finance_success` | `source` (`finance_form`) | GA4 conversion; Meta Lead |

`finance_success` is emitted only after `/api/submit-finance` returns success. The event helper allowlists event names and parameters, removes query strings from page paths, and drops extra payload properties.

## Launch Checks

- Add the GTM container ID only after the privacy disclosure and no-consent-banner decision have been reviewed for applicable requirements.
- Preview the GTM container and verify page views, vehicle views, phone/email clicks, finance starts, and successful finance submissions.
- Confirm `/admin/login` and all `/admin/*` pages load no GTM script and dispatch no data-layer events.
- Confirm finance events contain no form values or other personal information.
- Keep the GA4 and Meta Pixel IDs configured inside GTM; they are not currently available in the repository.
