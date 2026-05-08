---
paths:
  - '*.cs'
---

## String Literals

- Prefer C# raw string literals (`"""..."""`) over string concatenation (`"..." + "..."`) for multi-line strings such as prompts, SQL, or templates. Raw string literals preserve formatting without escape sequences and are easier to edit.
