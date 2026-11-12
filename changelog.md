# Changelog

Complete history of this repository, newest first. Each entry ends with the
commit it came from, so any change can be traced with `git show <hash>`.

Two lines of work run through this repository:

- **Redesign** — this fork (`dougbug589/cube-website-`): visual design, layout and motion only.
- **Upstream** — the original project (`farook786-tech/cube-website-`): content, CMS, admin, security and hosting. Upstream changes are merged into the fork and recorded here as well.

**Maintaining this file:** every commit adds its entry under the date it was made, in the matching section (Redesign or Upstream) and group (Added, Changed, Fixed, Removed, Security). Facts only; say what changed and why it matters to someone using or running the site.

---

## 2026-11-12

### Redesign

#### Added
- Search dialog: a minimal box whose placeholder types real things you can search (pages such as Board Members or Careers, the verticals, project clients such as IIT Tirupati, news and CEL), each checked to return results; Tab fills in the suggestion. The keyword hint and chip buttons were removed. Site pages are now searchable, and projects match on client and location. (`4b8a4b8`)
- Home "Work with CUBE" rebuilt as three intent cards (start a project, bid on a tender, join the team), each with an icon, one line and an arrow, plus a slim glass strip with the office address, email and phone. (`12ea909`)
- Home Partners section: the seven partner logo sheets in white tiles with a slow, staggered float, and a light-gold "Clients served" card that links to the clients page. (`12ea909`)
- Top bar mega-menus: About and Media list their pages in two columns beside a photo card; Verticals and Projects show photo cards. (`c9eadec`)
- Top bar sliding hover pill that springs between menu items; the current page keeps a light-gold pill. (`c9eadec`)
- Top bar "three capsules": brand, menu capsule and actions capsule. (`c9eadec`)
- Route transition: each navigation gets a ~0.25 s spring fade-and-lift starting from 35% opacity, so clicks feel instant; skipped for reduced motion. (`c790d47`)
- Splash screen, once per browser session: the logo settles with scale and blur, the wordmark rises, a gold line draws, then the splash lifts away while the page springs into place. An inline boot script decides before first paint, so return visits never flash it. (`cdd61b7`)
- Project carousel swipe and drag with a rubber-band feel; click a side card to centre it; keyboard arrows when a card has focus. (`cdd61b7`)
- Home layout following the original cubeiitm.org order: hero, news, about, projects, verticals, CEL, then a Life at CUBE / Leadership / Media / Clients block. A scrolling news strip sits under the hero, and the final block is a grid of auto-rotating tiles. (`d17b290`)
- Typewriter hero headline: "We ___ / ___" types character by character with a gold caret, backspaces, then types the next pair, with no layout shift at any width. (`09cb739`)
- Depth shadow system (layered contact, near, mid and far shadows) for cards and glass surfaces. (`09cb739`)
- Verticals showcase on the home page: auto-advancing selector with a progress line, large image and a glass content card. (`23fa6d3`, `09cb739`)
- Hero plays the CUBE film on wide screens (not with data saver or reduced motion; pauses off-screen), with a photo slideshow as poster and fallback. (`23fa6d3`)
- Liquid-glass surfaces (saturated blur, specular sheen, light rim), spring press and icon jiggle, and blur-in scroll reveals. (`23fa6d3`)
- Etihad-inspired theme: slate and gold palette, scroll-reveal animations, gold scroll-progress bar. (`1977bf6`)

#### Changed
- Careers page redesigned, with content and the application flow unchanged: a glass tab bar with a springing gold pill and the number of openings, a wide job card with an open-status badge, location, experience and a skills panel, a gold talent-network callout, an application view with a summary rail beside the form (16px fields, drag-and-drop resume upload, animated confirmation), a glass job-detail sheet and glass benefit cards. (`98162a7`)
- Home page now uses the full width of the top bar (up to 1600px) instead of a 1280px column, so sections line up with the logo and the Get in touch button; About, Verticals, CEL, Inside CUBE, Partners and Work with CUBE were retuned for the extra width (larger vision text, full-height vertical tabs, taller photos, heading and office details beside the three cards on wide screens). The footer follows the same width. (`8145035`)
- Media page redesigned, with content unchanged: the same glass section bar as About (News, Events, Gallery, Life at CUBE, Reports), a large lead story above image-led news cards, photo-first event cards, a gallery in a gap-free mosaic with glass captions, a Life at CUBE photo collage and report rows with a request button. Headings that never appeared on the original site, such as "Institutional Media Centre" and "Press Dispatches", are now plain labels. The About and Media pages share one section-bar component, and section links no longer stretch across the screen on phones. (`d304849`)
- Projects list redesigned: a sticky glass toolbar with a springing filter pill, live counts and search; cards reflow smoothly as you filter. Project cards are now image-led, with vertical and status chips, the title, client and location. (`1c84698`)
- About page redesigned in the new design language, with content unchanged: a glass section navigator whose gold pill follows the section in view, an editorial overview, the mission as a list, numbered objectives, portrait-and-message layouts for the Chairman and CEO, and photo grids for the board, advisory panel and team. On the home page, the three About points no longer leave empty space beside the vision card. (`282ed43`)
- Footer social icons are solid brand-colour circles (LinkedIn blue, X black, Facebook blue) with white marks and a brand-colour glow on hover. Twitter is now X: the link points to x.com/CUBEatIITM and shows the X mark. (`12ea909`)
- Larger, more legible text across the site: the smallest text steps were raised (about 13 to 15 px, 15 to 17 px, 17 to 18 px) and hard-coded tiny sizes bumped; the smallest text left is 13.5 px section labels. Checked for overflow on seven pages at three widths. (`0b76f04`)
- Top bar no longer condenses on scroll: it keeps one height, logo size and tagline; only the glass tint deepens once content is underneath. (`11fed57`)
- Top bar is a wide band flush to the top edge instead of a floating pill. (`c9eadec`)
- Card hover: lift, shadow and gold glow share one smooth curve and duration; the glow fades in as a pre-drawn ring (no repaint per frame) and the gold hairline sweeps from the centre; no sticky hover after a tap on touch screens. (`92167e5`)
- "Centre of Excellence" replaces the placeholder tagline "Beyond foundations" in the top bar and splash; the hero's last pair reads "We are / a Centre of Excellence." (`92167e5`)
- Faster auto-switching: project carousel every 2.8 s, verticals every 4.5 s, Inside CUBE tiles every 2.4 to 3.2 s on staggered clocks. (`5e1cc75`)
- Scroll reveals shortened (0.45 to 0.6 s, lighter blur, shorter stagger) so a newly opened page settles quickly. (`c790d47`)
- Menu follows the original site's order, grouping and labels: Home, About, Projects, Verticals, CEL, Media, Tenders, Careers, Contact Us; each About item links to its own page. (`d17b290`)
- Partner logos placed in the footer, as on the original site; footer links renamed to match the menu. (`d17b290`)
- Project carousel: arrows and dot bar removed, wider cards, and cards slide on a bouncy spring in the direction of travel. (`cdd61b7`)
- Home About section reduced to a vision card and three key points; the long text stays on the About page. (`09cb739`)
- Verticals showcase decluttered to image, title, one line, three capability chips and one action, with a glass highlight that springs between selector cards. (`09cb739`)
- Project carousel cards larger, with depth shadows and liquid-glass category chips. (`09cb739`)
- Mist palette: flat whites tinted with the Etihad slate, slate text, Etihad gold for highlights only; light-shade buttons across all pages; cool greys, teal, cyan and blue accents and old navy shadows harmonised across 40+ pages. (`23fa6d3`)
- One type family site-wide, Plus Jakarta Sans: bold headings, 500-weight body; thin serif headings made bold; base text size +6%. (`23fa6d3`)
- Left rail replaced by a liquid-glass top bar: full menu from 1280 px, drawer below that. Footer rebuilt as a solid band; inner-page header rebuilt. (`23fa6d3`)
- Slate rail sidebar on desktop, photo hero, and stacked project carousel (Etihad-style layout). Superseded the same day by the top bar. (`75f0d52`)

#### Fixed
- Top bar: between 1280 and 1439px wide the Get in touch button was cut off at the right edge; the CUBE wordmark now hides in that range so everything fits. (`8145035`)
- Production build restored: an unescaped apostrophe on the media page, introduced in the previous change, had failed the build. (`1e21f9b`)
- Remaining content matched to the live site: hero and gallery captions, 56 clients without an invented "Public Sector" label, tenders marked closed, the careers email (office@cubeiitm.org) and copy, the core values, the full vision and a listed mission, and a cut-off news summary. Removed invented promises and claims, and seven unused components that contained them. (`424a67b`)
- People pages now match the live site. The team page no longer lists board and advisory members as staff, and 24 former staff hidden on the live site were removed (82 people, as live). Board members show their real organisations, four advisors their departments, and the Chairman and CEO messages their live sign-offs. Invented bios, headings and counts were removed. (`c849ec6`)
- CEL laboratory content now limited to what the live site states: water, wastewater and solid waste testing, co-located with the office, with a link to the lab's own site, cube-el.org. Removed the invented facilities, equipment and parameter lists, soil testing, and the ISO, BIS and "CEL Certified" claims. (`5ce794e`)
- Verticals rewritten from the live vertical pages: their own introductions, services and figures (for example TPQA across 15 states and Rs 25,000 Cr+). Removed invented capabilities such as IoT and SCADA, a TNPCB partnership, zero liquid discharge and seismic retrofitting. Project counts now match the live projects list (26, 15, 0 and 14) instead of invented figures. (`d71d0c5`)
- Projects rebuilt from the live cubeiitm.org pages: 55 projects with their real titles, verticals, clients, locations, dates, status, descriptions, services, highlights and photos. The earlier import had read each page's footer, so 43 of 49 titles, 13 verticals and about 40 photos were wrong, and all projects carried the same invented objectives and methodology. Added the 9 missing live projects; removed two pages that were not projects and one project CUBE has hidden. Project pages no longer claim "Verified State Scheme" or a TPQA mandate, and no longer default the location to Tamil Nadu. (`3ecf5f7`)
- Contact details now match the original cubeiitm.org: Module No. 6C, 6th Floor, Phase II Building, IIT Madras Research Park, Kanagam Road, Taramani, Chennai 600 113; office@cubeiitm.org; 044 6121 0901. The previous address, email and phone came from the initial upstream commit and appeared nowhere on CUBE's site. Opening hours, also not on the original, were removed from the footer and contact page. (`561bcc0`)
- Mega-menu photos sharp on all screens: About and Media used thin banners stretched about 3.3x; they now use well-proportioned photos, and all menu photos request enough pixels for high-density screens. (`9bd8b76`)
- Header menus no longer appear transparent and then snap to blur: the glass panel now animates itself instead of a fading wrapper, so the blur works from the first frame. The mobile drawer had the same fix. (`c9eadec`)
- Header dropdowns render beside the bar instead of inside it, so their glass blurs the page rather than looking flat. (`cfdfeb6`)
- Sticky in-page tab bars sit just below the top bar: the offset now measures the bar's real height (85 px on desktop) instead of assuming 80 px. (`11fed57`)
- Hover lift on cards: the scroll-reveal styles had cancelled it and delayed hover by up to 0.34 s; reveals are now one-shot animations that leave hover untouched. (`92167e5`)
- Project carousel auto-scroll now runs: its pause listened on the whole section, so a resting pointer froze it; it now pauses only on a hovered or focused card, off-screen, in a hidden tab, or with reduced motion. (`edfde63`)
- Header logo and other images not loading in browsers: AVIF encoding hung on the build machine, so images are served as WebP only. (`09cb739`)
- Glass styles no longer override positioning utilities, which had stretched card chips and moved floating cards. (`09cb739`)

#### Removed
- Partner logos from the footer; they now appear once, in the home page Partners section. (`4c7c7fa`)
- Hero search widget and slide indicator. (`23fa6d3`)
- Unused hero component that depended on Git LFS video pointers. (`75f0d52`)

### Upstream

#### Added
- Live form inbox: website contact, CEL enquiry and job application forms reach the admin in real time; the admin sidebar shows unread counts and the browser tab shows the total. Job applications get a "New" status. (`b1a0528`)
- `/api/health` endpoint for uptime monitoring. (`b1a0528`)
- Server deployment kit: step-by-step guide (`deploy/DEPLOYMENT.md`), PM2 config, nginx config with live updates, 12 MB uploads and HTTPS, and a daily backup script kept for 30 days. (`b1a0528`)
- Publishing from the local admin to the public website: after each save, a public-only snapshot is committed and pushed, and the hosted site rebuilds from it; the admin shows live-site status with a "Publish now" button. (`dfe5717`)
- 720p compressed copies of the site videos. (`7c659f7`)

#### Changed
- Automatic publishing to GitHub is now opt-in, only for the interim local-admin setup; off on the production server. (`b1a0528`)
- News matches the original cubeiitm.org: original text, dates and photos for all 8 posts (5 had been missing); invented date labels removed. (`f9e95a7`)
- Invented content replaced with original cubeiitm.org content: board member bios, media events, reports, and sustainability figures; unused hero figures removed. (`5fb02a0`)
- Hero plays the compressed CUBE film from a new path; the unrelated template recordings were deleted. (`4a66f0f`)
- Full header menu appears from 1280 px (it needs about 1180 px); below that the menu button is used, so Contact never falls out of the bar. (`ac94174`)
- Themed navigation state refined. (`f6a6089`)
- Website content published from the admin. (`f890da2`, `6769aa1`)

#### Fixed
- Hero video now plays on the hosted site: it had been served as a 133-byte Git LFS pointer, so it is stored as a normal Git file. (`9559507`)
- Replaced photos no longer stay stale: images are cached for one day instead of one year. (`f9e95a7`)
- npm audit findings for `minimatch` resolved. (`caabc24`)
- Admin "Verifying..." screen offers Reload or Sign in again after 8 s. (`4a66f0f`)

---

## 2026-11-11

### Upstream

#### Added
- CI validation for linting, production builds, dependency audits and repository data checks. (`e436340`)
- Distributed rate limiting for admin sign-in, enquiries and career applications, backed by Supabase with a local fallback for development. Apply `supabase/migrations/003_rate_limits.sql` to enable shared limits in hosted deployments. (`3df897d`)
- Content Security Policy covering the site's fonts, maps, images and API connections. (`24e466c`)
- Home button in the desktop and mobile menus, with themed styling and matching icons. (`bfd8348`, `c2d54f4`)
- Technical document request dialog for Media and Publications. (`62697d8`)
- `.vercelignore`, keeping every file within the 100 MB hosting limit. (`19d843d`)
- This changelog. (`e402ffe`)

#### Changed
- Live updates faster: only admin views are revalidated after a save, cutting publish-to-visitor time from 2.9 to 3.8 s down to 1.1 to 1.6 s. (`9f1762d`)
- 300+ images and the Next.js config optimised for fast production deployment. (`52566e1`)
- Leadership photos, tender PDFs, navbar and team components updated. (`e8840c4`)

#### Fixed
- Admin uploads reject malformed or oversized images by checking their decoded dimensions. (`e436340`)
- Missing project-card and client-logo fallback images replaced with existing assets. (`e402ffe`)
- Missing image for the Urban Water Resilience symposium in Media events. (`cf355a9`)
- CEL card text rendering and layering. (`ecbab42`)
- Badge contrast for the co-located testing laboratory on the Environment vertical. (`fdfc1ba`)
- Spelling errors in public project descriptions. (`24e466c`)

#### Security
- Transitive `minimatch` dependencies pinned to 11.0.8, clearing npm audit findings. (`24e466c`)

#### Notes
- At the time of the 11 November audit, lint, production build and dependency audit could not run in the audit environment because Node.js and npm were unavailable; TypeScript diagnostics, Python syntax, JSON data, featured-project and data-image checks passed.

---

## 2026-11-10

### Upstream

#### Added
- Initial release: CUBE website with a liquid-glass design, careers hub, 80-member team directory and admin CMS. (`f2e25b3`)
- Supabase migration and seed scripts. (`7aad155`)
- Optional Supabase backend: each content collection stored as one row; uploads and résumés in private storage buckets; safe concurrent saves across server instances; a script to migrate local content. (`5d806bb`, `a45f22a`)
- Real-time admin-to-website sync: open pages refresh within about a second of an admin save, replacing 30-second polling. (`7666930`)
- Careers fully managed from the admin, with a job detail popup, editable page content, qualifications, application email and a live/hidden switch. (`4ed5abf`, `ec1456b`)
- Admin résumé viewer with in-page PDF preview; upload-only image fields with preview, replace and delete. (`5d806bb`)
- Admin back button and change-password screen (current password required, 12+ characters, signs out other devices). (`ef92851`)

#### Changed
- Enquiry form dropdowns replaced with free-text inputs. (`61ca208`)
- Horizontal scrollbars hidden and pill padding increased on in-page anchor bars. (`a60d71c`)
- Hero: per-slide project button removed, background video loops reliably, bottom fade shortened. (`ef92851`)
- Mobile menu sections expand and collapse as an accordion; tapping outside or pressing Escape closes it. (`c207353`)

#### Fixed
- Admin sign-out: navigation had cancelled the logout request, leaving the session alive. Sessions can now be revoked, tokens last 8 hours, and admin pages are never cached. (`7666930`)
- Announcement popup legibility. (`4b9f830`)
- Fixed header no longer scrolls away; sticky anchor bars and the project sidebar now stick. (`c207353`)
- Gallery viewer controls, keyboard and swipe support; clickable case-study cards; the Back button no longer leaves the site; broken breadcrumb and dashboard links. (`c207353`)
- Flip and expand cards work on tap; the announcement popup fits phone screens. (`7666930`)
- CEL cards: text panel no longer disappears on desktop. (`ef92851`)

#### Security
- Résumé uploads limited to PDF, DOC and DOCX, stored privately, admin-only download, rate limited. (`7666930`)
- Unique, valid slugs for news and projects; uploaded images served in production through a safe fallback route. (`c207353`)
