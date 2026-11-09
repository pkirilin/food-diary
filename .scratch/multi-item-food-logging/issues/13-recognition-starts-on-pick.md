# 13: Start recognition when photos are picked

**What to build:** Recognition is a response to the owner picking photos, but it started in an effect when the recognition screen opened, so a browser forward onto the screen silently sent a paid request again. The request moves to the pick handler, and leaving the screen ends the recognition. See the spec's "Product create, edit and recognition" section, and [Separating Events from Effects](https://react.dev/learn/separating-events-from-effects).

**Blocked by:** None

**Status:** resolved

- [x] One pick sends exactly one recognition request, and opening the screen sends nothing
- [x] **Retry** sends the same photos again
- [x] Leaving while recognition runs aborts the request
- [x] Going forward after leaving lands on the search with no second request, whether the recognition was running, failed or succeeded
- [x] No error alert or empty photo list flashes while leaving the screen
