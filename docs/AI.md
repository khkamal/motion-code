# Gemini AI generation

The AI panel calls Google's Gemini `v1beta/models/{model}:generateContent` endpoint directly from the browser. The default model is `gemini-2.5-flash`, and the model field is editable for accounts with different model access.

## Privacy and keys

The API key is held only in the current React page memory. It is not written to IndexedDB, localStorage, sessionStorage, logs, project files, or source control. It is sent to Google as the `x-goog-api-key` request header. Reloading clears it.

This is a static browser application: a key entered into it is inspectable through your own browser developer tools. There is no server-side secret protection. Restrict keys in Google Cloud where supported and revoke exposed keys.

Only the user's prompt and the fixed Motion Studio API contract are transmitted. Existing animation source, scene objects, assets, project names, and notes are not sent.

## Flow

1. Enter a key, accessible model ID, and prompt.
2. Generate. Authentication, quota, API, network, cancellation, malformed-response, and generated-code validation errors remain visible.
3. Review and edit generated JavaScript locally.
4. Explicitly apply it. Motion Studio saves the previous source as a project code version before replacement.

Generated scripts pass the same restricted-token and syntax validator as hand-written scripts. Validation is not a complete security sandbox; review generated source before running it.
