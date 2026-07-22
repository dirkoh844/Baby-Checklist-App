#!/usr/bin/env node
/* Regenerate VAPID keys: node scripts/generate-vapid.mjs
   Put the public key in reminders.html (VAPID_PUBLIC) and the private key in the
   GitHub secret VAPID_PRIVATE_KEY. Regenerating invalidates old subscriptions. */
import webpush from 'web-push';
console.log(JSON.stringify(webpush.generateVAPIDKeys(), null, 2));
