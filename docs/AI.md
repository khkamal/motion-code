# Gemini AI generation

The AI panel calls Google's Gemini `v1beta/models/{model}:generateContent` endpoint directly from the browser. The default model is `gemini-3.1-flash-lite`, and the model field is editable for accounts with different model access.

## Privacy and keys

The API key stays in page memory by default. If the user explicitly chooses **Save key**, it is stored unencrypted in browser `localStorage` and restored on reopen. **Remove** clears localStorage and memory. It is never written to IndexedDB, logs, project files, or source control. It is sent to Google as the `x-goog-api-key` request header. Reloading clears a memory-only key; an explicitly saved key reloads from this browser.

This is a static browser application: a key entered into it is inspectable through your own browser developer tools. There is no server-side secret protection. Restrict keys in Google Cloud where supported and revoke exposed keys.

Only the user's prompt and the fixed Motion Studio API contract are transmitted. Existing animation source, scene objects, assets, project names, and notes are not sent.

## Flow

1. Enter a key. Test connection makes a real Google models request and loads models supporting `generateContent`. Saving is optional and explicit.
2. Select a model and enter a prompt.
3. Generate. Authentication, quota, API, network, cancellation, malformed-response, and generated-code validation errors remain visible.
4. Review and edit generated JavaScript locally.
5. Explicitly apply it. Motion Studio saves the previous source as a project code version before replacement.

Generated scripts pass the same restricted-token and syntax validator as hand-written scripts. Validation is not a complete security sandbox; review generated source before running it.
