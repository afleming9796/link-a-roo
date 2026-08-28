# Privacy Policy — Link-a-roo

**Last updated:** 21 August 2026

Link-a-roo is a Chrome extension that lets you highlight text on any page and search
for it in sites you configure. This policy describes exactly what it stores, what it
reads, and where that information goes.

The short version: **everything stays in your browser's local storage on your own
device. Link-a-roo has no server, no account, and no analytics, and it sends nothing
anywhere.**

## What is stored, and where

Link-a-roo keeps its settings in `chrome.storage.local`, Chrome's on-device storage
for extensions. That data lives in your Chrome profile on your computer.

What is stored:

- **Your destinations** — for each one: the label you gave it, its URL template, the
  encoding option, and whether it should always open a new tab.
- **A dismissal flag** — a single true/false value recording that you closed the tip
  in the panel.

That is the entire contents. Nothing else is written.

Two details worth being explicit about:

- It uses `chrome.storage.local`, **not** `chrome.storage.sync`. Your destinations do
  not travel to other devices and are not uploaded to your Google account by the
  extension.
- Uninstalling Link-a-roo removes this data along with the extension.

## What is *not* stored

- **No search history.** Text you search is used to build a URL and is then discarded.
  It is never written to storage.
- **No browsing history.** Link-a-roo does not record pages you visit.
- **No page content.** Apart from the text you highlight at the moment you invoke it,
  no page content is read.
- **No personal or account information.** There is no sign-in and no user identifier.

An earlier version of this extension had a "remember searches" feature, which was
removed. Any leftover data it wrote is deleted automatically when the extension
starts.

## What is read, and when

**The text you highlight.** When you open the panel, press a quick-search shortcut, or
use the right-click menu, Link-a-roo reads the current selection from the active tab.
It uses the `activeTab` permission, which Chrome grants only for the tab you are on,
only at the moment you invoke the extension, and which expires when that tab
navigates. The text is held in memory long enough to build a URL and is then gone.

**The addresses of your open tabs.** Link-a-roo can reopen a search in a tab you
already have on that site rather than piling up duplicates. To find that tab it checks
the addresses of your open tabs, using the `tabs` permission. This happens only at the
moment you run a search, the addresses are compared in memory and never stored, and
nothing about them leaves your device. You can switch this off per destination with
**Always open a new tab**.

## Network activity

Link-a-roo makes no network requests of its own. There is no server to talk to, no
analytics, no crash reporting, and no remote configuration. The font used in the
interface is bundled with the extension rather than fetched from a font CDN,
specifically so that opening the panel contacts nothing.

The one time your browser goes to the network on Link-a-roo's behalf is when you run a
search — it navigates a tab to the destination you chose. **That destination site then
receives your search term, exactly as if you had typed it into that site's own search
box**, and handles it under its own privacy policy. Link-a-roo has no visibility into
what happens after the navigation.

## Sharing

Nothing is collected, so nothing is shared, sold, or transferred. There are no third
parties involved in the extension's operation.

## Permissions, and why each is needed

| Permission | Why |
| --- | --- |
| `storage` | Save your destinations on your device. |
| `activeTab` | Read the text you highlighted, on the tab you are on, when you invoke the extension. |
| `scripting` | Perform that one-line read of the selection. |
| `contextMenus` | Add the right-click **Link-a-roo** submenu. |
| `tabs` | Find an already-open tab on the destination site so a search can reuse it. |

Link-a-roo requests **no host permissions**. It has no standing access to any site and
cannot read pages you have not invoked it on.

## Your control over the data

- **See it** — everything is visible on the extension's settings page.
- **Change or delete it** — edit or delete any destination there.
- **Remove all of it** — uninstalling Link-a-roo clears its storage.

## Children

Link-a-roo is a general-purpose utility, collects nothing, and is not directed at
children.

## Changes to this policy

Any change will be committed to this file in the public repository, so the history of
this document is the history of the policy.

## Contact

Questions or concerns: open an issue at
<https://github.com/afleming9796/link-a-roo/issues>.
