import { prisma } from "./client";
import { hashPassword, normalizeEmail } from "./auth";
import { saveDraft, publishRevision, type PageSectionInput } from "./cms";
import { resolveTagIds } from "./tags";
import { upsertSiteSettings, type SiteSettingsValues } from "./site-settings";
import { upsertSeo, type SeoFields } from "./seo";
import type { CreateMediaInput } from "./media";
import type { SectionType } from "./generated/client";
import { withUniqueRetry } from "./upsert-retry";

const RESUME_EXPERIENCE = [
  {
    company: "Concept Recall",
    title: "Full Stack AI Engineer",
    startDate: new Date("2022-12-01"),
    endDate: new Date("2025-01-01"),
    description:
      "<ul>" +
      "<li>Shipped AI-driven features end-to-end for Brarista, an AI-powered bra-fitting platform for e-commerce clients — designing PostgreSQL schemas, building Python (Flask, FastAPI) backends integrating ML models, and developing React/Next.js and Vue.js frontends for production users on live Shopify storefronts.</li>" +
      "<li>Stepped up to own backend delivery during a team shortage, learning AWS Lambda and API Gateway on the job to keep features on schedule.</li>" +
      "<li>Built AWS Lambda functions triggered by Shopify store events, processing real-time data through API Gateway, with system health monitored via AWS CloudWatch.</li>" +
      "<li>Packaged the Brarista fitting tool UI as a reusable React component library adopted by 2 internal teams, cutting integration time for new storefronts.</li>" +
      "<li>Built and maintained a Node.js/Express.js backend with optimized PostgreSQL schemas for an internal analytics dashboard, securing endpoints with JWT and bcrypt authentication.</li>" +
      "<li>Automated CI/CD pipelines with GitHub Actions and built out Cypress E2E test coverage across core user flows, cutting recurring post-deployment regressions.</li>" +
      "<li>Reviewed pull requests and onboarded new engineers across frontend and backend work.</li>" +
      "</ul>",
  },
  {
    company: "Fiverr (Level 1 Seller)",
    title: "Freelance Full Stack Developer",
    startDate: new Date("2021-05-01"),
    endDate: new Date("2022-12-01"),
    description:
      "<ul>" +
      "<li>Delivered 30+ projects for 15+ clients spanning REST API integrations, authentication systems, backend automation, and responsive React/Next.js frontends with custom animations.</li>" +
      "<li>Debugged cross-browser JavaScript and CSS issues for long-term clients.</li>" +
      "<li>Maintained a consistent 5-star client rating throughout.</li>" +
      "</ul>",
  },
];

const RESUME_EDUCATION = [
  {
    institution: "University of Florence (UNIFI)",
    degree: "Master's in Software: Science & Technology",
    location: "Firenze, IT",
    startDate: new Date("2024-09-01"),
    endDate: new Date("2026-08-01"),
    description:
      "<ul>" +
      "<li>Erasmus Nazionale exchange (6 months) at the University of Camerino (UNICAM), with coursework in software testing, multi-agent systems, and process mining.</li>" +
      "<li>Coursework in Distributed Systems Design and concurrent programming with Go, which motivated building GoChat independently.</li>" +
      "</ul>",
  },
  {
    institution: "Quaid-e-Awam University of Engineering, Science & Technology",
    degree: "BS in Information Technology",
    location: null,
    startDate: new Date("2018-10-01"),
    endDate: new Date("2022-10-01"),
    description:
      "<ul>" +
      "<li>CGPA 3.8/4.0, ranked 4th in graduating cohort.</li>" +
      "<li>Technical Team Member for TechnoMind-2k19, organizing 14+ technical competitions.</li>" +
      "</ul>",
  },
];

const RESUME_LANGUAGES = [
  { name: "English", proficiency: "Fluent (Professional Proficiency)" },
  { name: "Italian", proficiency: "Beginner (A1 Level)" },
];

const RESUME_SKILLS: Array<{ name: string; category: string }> = [
  ...["Python", "Go", "Node.js", "TypeScript", "SQL"].map((name) => ({ name, category: "Languages" })),
  ...["React", "Next.js", "Vue.js", "Angular", "Redux Toolkit", "Tailwind CSS", "Material UI", "Ant Design"].map(
    (name) => ({ name, category: "Frontend" }),
  ),
  ...["Flask", "FastAPI", "Express.js", "REST APIs", "WebSockets", "Microservices", "Repository Pattern"].map(
    (name) => ({ name, category: "Backend" }),
  ),
  ...["PostgreSQL", "MongoDB", "Redis"].map((name) => ({ name, category: "Databases" })),
  ...[
    "AWS Lambda",
    "AWS API Gateway",
    "AWS S3",
    "AWS CloudFront",
    "AWS LightSail",
    "AWS CloudWatch",
    "Docker",
    "GitHub Actions",
    "CI/CD",
  ].map((name) => ({ name, category: "Cloud & DevOps" })),
  ...["pytest", "Cypress (E2E)"].map((name) => ({ name, category: "Testing" })),
  ...["Git", "Jira", "Notion", "Linux"].map((name) => ({ name, category: "Tools" })),
];

// Everything below (media, tech stack, site settings, projects, home page
// sections) is a snapshot of what was actually built up through the admin UI
// in development — extracted so a fresh production database gets seeded with
// the real site content on first boot instead of the placeholder resume data
// above. Media rows point at Vercel Blob URLs that already exist in storage,
// so re-creating the rows (upsert by url) is enough — no file upload needed.

const SEED_MEDIA: CreateMediaInput[] = [
  {
    url: "https://2lthuylud3nefzql.public.blob.vercel-storage.com/25f6e0a8-4efa-42af-a3af-fe8b3592b6e4.pdf",
    width: null,
    height: null,
    blurDataUrl: null,
    altText: null,
    filename: "Karan_Kumar_Resume___MERN_Stack.pdf",
    mimeType: "application/pdf",
    sizeBytes: 59868,
  },
  {
    url: "https://2lthuylud3nefzql.public.blob.vercel-storage.com/06d0f5d0-8872-42a0-9619-46671a5dff02.pdf",
    width: null,
    height: null,
    blurDataUrl: null,
    altText: null,
    filename: "Karan_Kumar_Resume_Normal.pdf",
    mimeType: "application/pdf",
    sizeBytes: 98572,
  },
  {
    url: "https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/907da04a-3706-4441-bc10-1dffa8b60979.png",
    width: 1200,
    height: 1200,
    blurDataUrl:
      "data:image/webp;base64,UklGRkoBAABXRUJQVlA4WAoAAAAQAAAADwAADwAAQUxQSN0AAAABgGXbtunoxLZz8Wwjtu3ku/rfjupERCREINYMZVMILJSA//TAUZlSwdRGegEiUB4Ka1XlZNFgpnYO4s6YmAqXzWFFGwT9CDKqliosa8XpoaTuR21PcdRqx5+LrGXTwDM8otKGeDwLuhx0ZCI+TmK54g0HLXdslrjVcOEqOfGi0wI3s8vixJj6Sv39pzBlJAlIG/V9r08PPypU2pLMj8dOd3LgMaNwPCf74WKA4q6gyt2V4c4Zd9bTo5Ab2p7tE1Yd+Ot+BgAS03Ao5HPScu/mASACEeQQphY6bBQAAABWUDggRgAAAJABAJ0BKhAAEAADgFolsZu9GACiAAD+7nsY+83AIrH3UHF6K81w6LDk2vZf/yaXPMY4PL/ua0xRBxJn+gAT5J6dT/96IAA=",
    altText: null,
    filename: "unipd_logo.png",
    mimeType: "image/png",
    sizeBytes: 458859,
  },
  {
    url: "https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/d54a9aa8-861c-4831-b19e-c1842ed2e380.jpg",
    width: 800,
    height: 800,
    blurDataUrl:
      "data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAADwAQCdASoQABAAA4BaJbACdACpfbg1F/gA/rIgrgfVX0QqLvbD/jbE1K1mKQOuQjdfpxXo6SLGmOtYFiy2l+j6O2oaLdj3ck1Zj5o9U313cKOfv4rtW7gamGL2Z7hjphv41ksGZez3tnO7O0EL/xuk9oAAAA==",
    altText: "Portrait of Karan Kumar",
    filename: "profile.jpg",
    mimeType: "image/jpeg",
    sizeBytes: 146612,
  },
  {
    url: "https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/f727c1ec-c366-4004-9b2a-14d657bf0f74.webp",
    width: 3840,
    height: 3840,
    blurDataUrl:
      "data:image/webp;base64,UklGRhYBAABXRUJQVlA4WAoAAAAQAAAADwAADwAAQUxQSJkAAAABgGJb27LqbVQydJgOjIQxWNXm2iC6uw/Arvv9Gtk54VvfP4aImAAREXfl/3b9zjnFuPJVAaamQ3iuKZM/mUxeDLb49km/g0ocG/YQFv9LEH2x0q/B6xW4bkaj0SjrPcHlAidPWttcgesr1HtYfIlA6d9K0N46JhTcn/RtzCYiouCSTCYDYlQA8/CTaaxVfSuTI/t1vf2XXRoAVlA4IFYAAABQAgCdASoQABAAA4BaJbACdFQAxQAE3m6hkMAA/hDGNbnU7k0LROpohiSA2ovUx/Z+bYqv5sjrX+Vz4N6p6JK5N+LtnqUNsoUTtYkP9m6c56JWSEIAAA==",
    altText: null,
    filename: "python-logo.webp",
    mimeType: "image/webp",
    sizeBytes: 79592,
  },
  {
    url: "https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/5992acd8-bce0-4caa-a702-9bb7764e53b2.png",
    width: 1915,
    height: 1277,
    blurDataUrl:
      "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADQAQCdASoQAAsAA4BaJZAC7ADy/IteAAD+9QS+w9sljzMdjwn4UY3C1lMc9REwPwFievkWqojW0aq2rOAAAA==",
    altText: null,
    filename: "Brarista-Trial_header.png",
    mimeType: "image/png",
    sizeBytes: 348588,
  },
  {
    url: "https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/9b22338e-8345-49f1-a460-7780e8d8d23d.png",
    width: 795,
    height: 400,
    blurDataUrl:
      "data:image/webp;base64,UklGRiwAAABXRUJQVlA4ICAAAABwAQCdASoQAAgAA4BaJZwC7AF1AAD+8VY+lfAkhYAAAA==",
    altText: null,
    filename: "Screenshot 2026-07-28 025317.png",
    mimeType: "image/png",
    sizeBytes: 23691,
  },
  {
    url: "https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/ad06b1fc-dafe-4dff-be32-223c7e723cc5.jpg",
    width: 800,
    height: 436,
    blurDataUrl:
      "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAACwAQCdASoQAAkAA4BaJZwAAudnu40AAP7z8sjas8bqRmSRrp0krv8qr+xUR2JmrfGhNM9w10swAA==",
    altText: null,
    filename: "RAG.jpeg",
    mimeType: "image/jpeg",
    sizeBytes: 53527,
  },
];

const SEED_TECH_STACK: Array<{ name: string; imageUrl: string | null; order: number }> = [
  { name: "JavaScript", imageUrl: null, order: 0 },
  { name: "TypeScript", imageUrl: null, order: 1 },
  {
    name: "Python",
    imageUrl: "https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/f727c1ec-c366-4004-9b2a-14d657bf0f74.webp",
    order: 2,
  },
  { name: "Go", imageUrl: null, order: 3 },
  { name: "React", imageUrl: null, order: 4 },
  { name: "Next.js", imageUrl: null, order: 5 },
  { name: "Node.js", imageUrl: null, order: 6 },
  { name: "FastAPI", imageUrl: null, order: 7 },
  { name: "PostgreSQL", imageUrl: null, order: 8 },
  { name: "MongoDB", imageUrl: null, order: 9 },
  { name: "Redis", imageUrl: null, order: 10 },
  { name: "Docker", imageUrl: null, order: 11 },
  { name: "RabbitMQ", imageUrl: null, order: 12 },
  { name: "GitHub Actions", imageUrl: null, order: 13 },
  { name: "LangChain", imageUrl: null, order: 14 },
  { name: "Streamlit", imageUrl: null, order: 15 },
];

const SEED_SITE_SETTINGS: SiteSettingsValues = {
  title: "Karan Kumar",
  description:
    "Portfolio of Karan Kumar, a Full Stack Software Engineer building production systems and retrieval-augmented generation pipelines.",
  githubUrl: "https://github.com/karan-khatri",
  linkedinUrl: "https://linkedin.com/in/karan-kumar-khatri",
  upworkUrl: null,
  fiverrUrl: null,
  instagramUrl: null,
  resumeUrl: "https://2lthuylud3nefzql.public.blob.vercel-storage.com/25f6e0a8-4efa-42af-a3af-fe8b3592b6e4.pdf",
  location: "Florence (Firenze), Italy",
};

interface SeedProject {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tags: string[];
  coverImageUrl: string | null;
  codeRepository: string | null;
  liveUrl: string | null;
  featured: boolean;
  featuredOrder: number | null;
  seo: SeoFields | null;
}

const SEED_PROJECTS: SeedProject[] = [
  {
    slug: "national-gas-industries",
    title: "National Gas Industries",
    excerpt:
      "National Gas Industries (NGI) — A bilingual corporate website for a Jordanian industrial gas manufacturer, showcasing their product catalog, accessories, and location with an integrated lead-generation contact form.",
    body: "<p>A responsive corporate website built for National Gas Industries Co., a Jordan-based industrial and medical gas manufacturer established in 1973. The site presents the company's product lines (medical, industrial, refrigerant, high-purity, and cryogenic gases) and accessories (cylinders, regulators, manifolds) through a structured catalog layout, includes an embedded location map, a lead-generation contact form, and supports bilingual (English/Arabic) content for company announcements and shareholder notices.</p>",
    tags: [],
    coverImageUrl: null,
    codeRepository: null,
    liveUrl: null,
    featured: false,
    featuredOrder: null,
    seo: {
      metaTitle: "National Gas Industries Website — Corporate Site for Gas Manufacturer",
      metaDescription:
        "A bilingual corporate website for National Gas Industries, a Jordan-based gas manufacturer, with a product catalog and lead-gen contact form.",
      canonicalUrl: "https://kumarkaran.com/projects/national-gas-industries",
    },
  },
  {
    slug: "gochat",
    title: "GoChat — Distributed Messaging Platform",
    excerpt:
      "A production-grade real-time chat application built as six independent Go microservices. The architecture tackles WebSocket fan-out across instances via Redis Streams, JWT token rotation with race-condition safety, a three-layer blocking cache, and a raw-TCP WebSocket tunnel at the API gateway.",
    body: "<h2><strong>What It Is</strong></h2><p>A real-time chat backend with direct messaging, group conversations, online presence, and in-app notifications. The backend is six Go microservices — auth, user, chat, notification, presence, and API gateway — each owning its domain, its PostgreSQL schema, and its failure surface. Services communicate asynchronously over MQTT events published to a Mosquitto broker. Real-time updates reach clients through WebSockets, with Redis Streams providing the fan-out layer across hub instances.</p><p>The goal was to build something that would genuinely hold up at modest scale. Not a tutorial monolith dressed as microservices, but a system where each service can fail, scale, or be replaced without touching the others. The tradeoffs are real — cross-service calls add latency and introduce network failure modes that don't exist in a monolith — but the architectural clarity is worth it: each service's API is explicit and versioned by necessity.</p><h2><strong>System Overview</strong></h2><p>All client traffic enters through the API gateway, which validates JWT tokens and enforces per-user rate limits before forwarding to the appropriate backend service. Services share three infrastructure components: a PostgreSQL schema per service, Redis for caching and message streams, and Mosquitto as the MQTT broker for inter-service events.</p><img src=\"https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/9b22338e-8345-49f1-a460-7780e8d8d23d.png\"><h2><strong>Decisions Worth Explaining</strong></h2><p>Most of the interesting work happened at places where the obvious choice had a hidden failure mode. These are the five decisions that shaped the architecture.</p><h3><strong>Redis Streams, Not Pub/Sub</strong></h3><p>Keeping WebSocket clients in a single hub's memory is the naive approach — it breaks the moment you run more than one service instance. The obvious next step is Redis Pub/Sub: publish a message, every subscribed hub receives it. But Pub/Sub has a critical flaw: messages published while a subscriber is briefly disconnected are silently dropped. No error, no retry — just gone.</p><p>Redis Streams preserve total message order and let a consumer resume from a specific offset. Each hub instance creates its own consumer group, named by hostname and PID. When a message arrives on the stream, every running hub reads it and delivers it to any local WebSocket connections for that conversation. A hub that restarts mid-operation picks up exactly where it left off — no messages lost.</p><blockquote><p>A background goroutine scans for dead hub consumer groups by checking a heartbeat key in Redis, and destroys their groups when the key expires — keeping the stream clean as instances come and go without a central coordinator.</p></blockquote><h3><strong>Three-Layer Blocking Cache</strong></h3><p>Every message send triggers a block check: has either participant blocked the other? At any meaningful message volume, hitting the database for each check isn't viable.</p><p>The solution is a layered read strategy. Check in-process memory first (<code>sync.Map</code>, sub-100ns), then Redis (1–5ms), then make an authenticated HTTP call to user-service as the authoritative fallback. The cache is write-on-miss and positive-only — it stores confirmed blocked relationships, not their absence. When a user unblocks someone, the Redis entry expires by TTL rather than requiring an active invalidation broadcast across all running chat-service instances.</p><p>If user-service is unreachable on the HTTP fallback, the check fails closed — the message is rejected rather than delivered to someone who may have been blocked.</p><h3><strong>Refresh Token Rotation with Race-Condition Safety</strong></h3><p>Each refresh token is single-use: the server deletes the old token and issues a new pair in a single database transaction. The atomic delete is load-bearing. A naive read-then-delete creates a window where two concurrent refresh requests can both see the same token as valid and both succeed, effectively forking the session.</p><pre><code>// RowsAffected == 0 means another caller already consumed this token.\nresult := tx.Where(\"token = ?\", refreshToken).Delete(&amp;RefreshToken{})\nif result.RowsAffected == 0 {\n    return ErrInvalidRefreshToken\n}</code></pre><p>If <code>RowsAffected</code> is zero, the transaction rolls back and the client receives a 401, forcing re-authentication. Logout blacklists the access token in Redis with a TTL matching the token's remaining expiry, so stolen tokens can't be replayed even if they haven't expired.</p><h3><strong>WebSocket Proxying via Raw TCP Hijack</strong></h3><p>Standard HTTP reverse proxying doesn't handle WebSocket connections: the protocol upgrade requires a persistent TCP connection, not a request-response cycle. Rather than pull in an external library, the gateway handles this at the transport layer using only the Go standard library.</p><pre><code>hijacker, ok := c.Writer.(http.Hijacker)\nclientConn, _, _ := hijacker.Hijack() // get the raw net.Conn\nbackendConn, _   := net.DialTimeout(\"tcp\", backendAddr, 5*time.Second)\n\n// replay the upgrade handshake, then tunnel both directions\ngo func() { io.Copy(backendConn, clientConn); done &lt;- struct{}{} }()\ngo func() { io.Copy(clientConn, backendConn); done &lt;- struct{}{} }()\n&lt;-done</code></pre><p>When a WebSocket upgrade request arrives, the gateway hijacks the connection to get the raw <code>net.Conn</code>, dials the backend service directly over TCP, replays the upgrade handshake with identity headers from the JWT-validated context, then runs two goroutines in each direction. No WebSocket parsing, no external proxy library.</p><h3><strong>Online Users as a Redis Sorted Set</strong></h3><p>Tracking which users are online seems simple: store a set of user IDs with a TTL. The problem is that Redis TTLs apply to the entire key, not individual members. With a simple SET, you'd need a key-per-user approach and a background job to sweep expired entries and broadcast \"user went offline\" events — extra operational complexity for something that should be stateless.</p><p>The solution uses a Redis sorted set where each member is a user ID and the score is the Unix timestamp of their last heartbeat. Querying online users for a conversation becomes a range query: all members with a score greater than <code>now - timeoutSeconds</code>. Stale members are never deleted — they're simply invisible to the range query once their score falls outside the window.</p><pre><code>// Heartbeat: update the user's score to now.\nredis.ZAdd(ctx, \"presence:online\", redis.Z{\n    Score:  float64(time.Now().Unix()),\n    Member: userID,\n})\n\n// Online users: score &gt; (now - 90s).\nthreshold := float64(time.Now().Unix() - 90)\nmembers, _ := redis.ZRangeByScore(ctx, \"presence:online\",\n    &amp;redis.ZRangeBy{Min: fmt.Sprintf(\"%f\", threshold), Max: \"+inf\"},\n)</code></pre><p>The presence service is effectively stateless with respect to cleanup. No background goroutine needs to run. No \"went offline\" event needs to be broadcast — consumers asking for online users simply re-query the sorted set. The tradeoff is choosing a heartbeat interval and timeout window: too short and heartbeat traffic is high; too long and presence state lags.</p><h2><strong>What I Learned</strong></h2><p>The most interesting design problems came from thinking about failure before the happy path. The WebSocket fan-out changed after reading Redis Pub/Sub's documentation carefully, not after a runtime failure. The refresh token race condition is invisible in development but inevitable under concurrent load. Distributed systems reward thinking about how things fail, not just how they work.</p><p>Service boundaries also enforce API discipline that's hard to maintain voluntarily. Because the chat service can only access user blocking data through an HTTP call — not a shared database join — the interface between those two domains had to be explicit from day one. That's more friction upfront, but either service can be rewritten without touching the other.</p><p>If I built this again, I'd add distributed tracing from day one. Debugging a request that touches four services across two network hops is painful when the only tool is JSON log lines, even when they share a <code>request_id</code>.</p>",
    tags: ["Docker", "Go", "Microservices", "PostgreSQL", "RabbitMQ", "WebSockets"],
    coverImageUrl: "https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/9b22338e-8345-49f1-a460-7780e8d8d23d.png",
    codeRepository: "https://github.com/karan-khatri/go-chat-distributed-messaging",
    liveUrl: null,
    featured: true,
    featuredOrder: 2,
    seo: {
      metaTitle: "Real-Time Chat Backend — Go Microservices Case Study",
      metaDescription:
        "A real-time chat backend built as six Go microservices, with Redis Streams WebSocket fan-out, JWT rotation, and a raw-TCP WebSocket tunnel at the gateway.",
      canonicalUrl: "/projects/gochat",
    },
  },
  {
    slug: "brarista-ai-fitting-tool",
    title: "Brarista AI Fitting Tool",
    excerpt:
      "An AI-powered size-calculation backend for an e-commerce bra-fitting platform, serving real-time predictions to live Shopify storefronts.",
    body: "<h2>Background</h2><p>Brarista is an AI-powered bra-fitting platform that helps e-commerce brands offer personalised size recommendations to their customers. The platform serves multiple lingerie brands simultaneously — each with their own sizing standards, brand colour schemes, and slightly different customer-facing UI — making it a genuinely multi-tenant system with meaningful variation across clients.</p><p>The project was delivered through <a target=\"_blank\" rel=\"noopener noreferrer nofollow\" class=\"underline underline underline-offset-2 decoration-1 decoration-current/40 hover:decoration-current focus:decoration-current\" href=\"https://conceptrecall.com\">Concept Recall</a>, a software development agency based in Karachi. I joined as a Software Engineer on the Brarista engagement, initially focused on the frontend, and over time became a full-stack contributor across the React component layer, Python backend APIs, and the AWS serverless infrastructure.</p><h2>My Role</h2><p>My involvement spanned the full stack across two areas of the product:</p><ul><li><p><strong>Frontend engineering</strong> — building and maintaining the React + TypeScript fitting tool UI, which shipped as a reusable component library deployed directly into Shopify themes.</p></li><li><p><strong>Backend engineering</strong> — stepping in to own API development and AWS infrastructure when the backend team was short-staffed, learning Lambda and API Gateway on the job while keeping feature delivery on schedule.</p></li></ul><p>Beyond feature work, I conducted pull request reviews, onboarded new engineers onto the codebase, and built out the Cypress E2E test suite covering the core user flows.</p><h2>Technical Architecture</h2><h3>Frontend — React Component Library on Shopify</h3><p>The fitting tool UI was built in React and TypeScript and packaged as a reusable component library rather than a standalone application. This was a deliberate architectural choice: Brarista needed to embed the tool into multiple Shopify storefronts, each belonging to a different brand. Shipping it as a library meant each storefront could pull in the same core logic while applying its own theme tokens and UI variations without forking the codebase.</p><p>The library was adopted by two internal teams at Concept Recall for additional storefronts, which validated the approach — new integrations could be completed significantly faster than if each team had been working from a separate implementation.</p><p>Static builds were deployed to AWS S3 and distributed via CloudFront, then injected into the relevant Shopify theme. GitHub Actions handled the CI/CD pipeline, including environment-specific pipelines for staging and production.</p><h3>Backend — Python APIs and AWS Serverless</h3><p>The backend was built in Python using Flask and FastAPI, exposing REST endpoints that integrated with an ML model to generate size recommendations. The endpoints handled user measurement inputs, passed them through the model, and returned structured size outputs mapped to the specific brand's sizing table.</p><p>The highest-traffic entry points were exposed as AWS Lambda functions behind API Gateway. This was particularly useful for Shopify event ingestion — Shopify webhooks fire in bursts rather than at a steady rate, and Lambda meant the backend scaled to handle those bursts without over-provisioning a standing server. AWS CloudWatch was used to monitor function health, latency, and error rates in production.</p><h3>Multi-Tenancy</h3><p>One of the more architecturally interesting aspects of the system was how it handled multiple brands simultaneously. Each brand (tenant) had:</p><ul><li><p>Its own sizing table — because bra sizing varies meaningfully between brands</p></li><li><p>A corresponding set of frontend UI variations and colour scheme</p></li><li><p>Slightly different conditional logic on both the frontend and backend to handle brand-specific edge cases</p></li></ul><p>This tenant configuration was maintained in backend mapping tables, and every ML response had to be correctly matched to the requesting tenant before a size recommendation could be returned to the user.</p><h2>A Problem Worth Describing in Detail</h2><blockquote><p>The most complex issue I worked on was a multi-tenant response-routing bug that was causing silent failures for end users — a class of bug that is particularly hard to catch because the system appears to be functioning on the surface.</p></blockquote><h3>What was happening</h3><p>The ML model was returning results to the backend, but the backend's conditional logic for routing those results was not correctly scoped per tenant. Different brands shared overlapping code paths, and under certain conditions, the wrong branch would execute — meaning the result returned to the frontend was either for the wrong tenant's sizing schema, or no result was returned at all.</p><p>To make things worse, the frontend had a fallback flow: if no result arrived within a timeout window, it would prompt the user with a \"we'll email your results\" message. Two problems with that: first, the email-sending logic was never triggered correctly because the backend had already technically responded — it just responded with the wrong result. Second, users who triggered the fallback never received the email. So the failure mode was: user completes the fitting flow, receives a wrong result or a \"check your email\" message, and the email never arrives. A dead end, with no error surface for the engineering team to easily detect.</p><h3>How I diagnosed it</h3><p>Because the bug crossed the frontend/backend boundary, I had to trace the entire response lifecycle — from the user input on the React side, through the API Gateway endpoint, into the Lambda function, through the ML model call, and back out through the tenant-routing logic. I mapped out the conditional branches for each tenant and identified where the routing logic was making incorrect assumptions about which tenant's configuration to apply.</p><h3>How I fixed it</h3><p>The fix was targeted rather than a full rewrite. The codebase had many interdependent parts — rewriting the routing layer from scratch carried a real risk of breaking unrelated tenant configurations that were working correctly. Instead, I corrected the specific conditional logic responsible for tenant identification in the ML response handler, and separately fixed the email-fallback trigger so it only fired when a result had genuinely not been produced, not when a result existed but was malformed.</p><p>Working across frontend and backend simultaneously was necessary here: the fix required understanding both what the backend was sending and what the frontend was interpreting, since the bug lived in the gap between the two.</p><h2>Testing</h2><p>I built out the Cypress E2E test suite covering the core user journeys: the fitting flow from measurement input through to size recommendation, the per-tenant UI variations, and the fallback behaviour. Having these tests in place was directly relevant to catching regressions — after the routing bug fix, the tests confirmed that all previously-working tenant configurations continued to behave correctly.</p><h2>What I Took Away From This Project</h2><p>Brarista was the project that shifted how I think about multi-tenancy. The surface-level implementation — different configs per client — is straightforward. The harder part is maintaining correctness guarantees as the number of tenants grows, especially when conditional logic branches accumulate over time and start to interact in ways the original design didn't anticipate. Building defensively against that kind of drift, and having test coverage that reflects the real per-tenant variation rather than a single generic happy path, is something I now treat as a first-order concern rather than a nice-to-have.</p><p>Stepping into backend ownership from a frontend-first role on a live production system was also a meaningful experience. It required being honest about what I didn't yet know (Lambda, API Gateway), learning quickly from real documentation rather than tutorials, and being careful not to break things that were already working while getting up to speed.</p>",
    tags: ["API Gateway", "AWS Lambda", "FastAPI", "Flask", "Python", "React", "TypeScript"],
    coverImageUrl: "https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/5992acd8-bce0-4caa-a702-9bb7764e53b2.png",
    codeRepository: null,
    liveUrl: null,
    featured: true,
    featuredOrder: 0,
    seo: null,
  },
  {
    slug: "analytics-dashboard",
    title: "Analytics Dashboard",
    excerpt:
      "A full-stack analytics dashboard with a Node.js/Express backend and an ECharts-powered React frontend, powering internal decision-making.",
    body: "<ul><li>Developed the Node.js/Express.js backend and optimized PostgreSQL schemas for a full-stack analytics dashboard powering internal decision-making.</li><li>Built an ECharts-powered React frontend for data visualization.</li><li>Secured endpoints with JWT and bcrypt authentication; deployed on AWS LightSail for reliable, cost-efficient hosting.</li></ul>",
    tags: ["AWS LightSail", "Express.js", "Node.js", "PostgreSQL", "React"],
    coverImageUrl: null,
    codeRepository: null,
    liveUrl: null,
    featured: false,
    featuredOrder: null,
    seo: null,
  },
  {
    slug: "distributed-notepad",
    title: "Distributed Notepad",
    excerpt:
      "A real-time collaborative document editor in Go with live multi-user editing, presence indicators, and version history.",
    body: "<ul><li><p>Built a real-time collaborative document editor in Go with live multi-user editing, presence indicators, and document version history with restore.</p></li><li><p>Implemented WebSocket-based broadcasting for instant synchronization across clients, with a layered handler/service/repository architecture and bcrypt/session-based authentication.</p></li></ul><p></p>",
    tags: ["GORM", "Gin", "Go", "SQLite", "WebSockets"],
    coverImageUrl: null,
    codeRepository: "https://github.com/karan-khatri/distributed-notepad",
    liveUrl: "https://github.com/karan-khatri/distributed-notepad",
    featured: false,
    featuredOrder: null,
    seo: null,
  },
  {
    slug: "publishing-house-management-system",
    title: "Publishing House Management System",
    excerpt:
      "A full-stack management system for a publishing house, with an Angular frontend and a Jakarta EE backend supporting role-based access control.",
    body: "<p>Built a full-stack management system with an Angular frontend and a Jakarta EE (JAX-RS) backend on WildFly, with JWT authentication and role-based access control across four roles.</p><ul><li><p>Designed the PostgreSQL schema for employees, authors, and publications with many-to-many relationships; fully containerized with Docker Compose.</p></li></ul><p></p>",
    tags: ["Angular", "Docker", "Jakarta EE", "PostgreSQL"],
    coverImageUrl: "https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/d54a9aa8-861c-4831-b19e-c1842ed2e380.jpg",
    codeRepository: "https://github.com/karan-khatri/distributed-notepad",
    liveUrl: "https://github.com/karan-khatri/distributed-notepad",
    featured: false,
    featuredOrder: null,
    seo: null,
  },
  {
    slug: "pra-chat-app",
    title: "PRA Chat App",
    excerpt:
      "A real-time messaging application with WebSocket-based delivery, secure authentication, and a performance-tuned frontend.",
    body: "<ul><li>Built a real-time messaging application with WebSocket-based delivery, cutting message latency well below the polling-based prototype it replaced.</li><li>Implemented JWT and bcrypt authentication for secure access to channels; applied lazy loading, code-splitting, and a customizable theming system to cut initial load time.</li></ul>",
    tags: ["Express.js", "MongoDB", "Node.js", "React", "WebSockets"],
    coverImageUrl: null,
    codeRepository: null,
    liveUrl: null,
    featured: true,
    featuredOrder: 3,
    seo: null,
  },
  {
    slug: "rag-pipeline-from-scratch",
    title: "RAG Pipeline from Scratch",
    excerpt:
      "A Retrieval-Augmented Generation pipeline built from scratch with Ollama — no LangChain, no cloud APIs — evolved from a single notebook into a local Streamlit app with multi-document comparison and automatic query routing.",
    body: "<h2><strong>The problem</strong></h2><p>Most RAG tutorials start and end with <code>langchain.from_documents()</code> — a few lines that hide every interesting decision inside a framework call. I wanted to understand what's actually happening: how text gets chunked, how embeddings turn meaning into numbers, how similarity search actually finds relevant context, and how that context turns into a grounded answer. So I built the whole pipeline by hand, running entirely locally against Ollama with no cloud APIs and no LangChain.</p><h2><strong>Starting point: RAG in its simplest form</strong></h2><p>The first version was intentionally minimal: load one PDF, split it into overlapping character-based chunks, embed each chunk with Ollama's <code>nomic-embed-text</code> model, and store the embeddings in a plain Python list. For a question, I embedded it the same way and computed cosine similarity by hand against every stored chunk, took the top matches, and passed them to <code>llama3.2</code> as context for the final answer. No vector database, no index — just loops and NumPy. It worked, and more importantly, it made every step visible.</p><h2><strong>Scaling to multiple documents</strong></h2><p>A single PDF doesn't test much. I extended the pipeline to load an entire folder of PDFs and tag every chunk with a <code>source</code> field so retrieval could later be scoped to a specific document. This is also where the manual cosine-similarity loop started to show its limits — it's fine for ten chunks, unworkable for hundreds. I replaced it with <strong>ChromaDB</strong>, a persistent local vector store: it indexes embeddings for fast nearest-neighbor search and survives between runs, so I stopped re-embedding the same documents every time I restarted the notebook.</p><h2><strong>Comparison-aware generation</strong></h2><p>Once the pipeline handled multiple documents, a natural use case appeared: comparing two versions of the same document (I tested this against two versions of a course's exam guidelines — \"what changed between the old and new AST exam rules?\"). A single similarity search across a mixed collection doesn't answer that well, since it just returns whichever chunks are closest regardless of which document they're from. I added a filtered retrieval path using Chroma's <code>where</code> clause to pull top matches from each document <em>separately</em>, then built a comparison-specific prompt that explicitly labels an OLD and a NEW context block and asks the model to identify what changed between them.</p><h2><strong>Automatic query routing</strong></h2><p>Manually deciding \"is this a lookup or a comparison question?\" and passing the right filename defeats the point of a natural-language interface. So I added a routing layer: the question is first sent to <code>llama3.2</code> with a classification prompt that returns structured JSON — either <code>{\"type\": \"lookup\"}</code> or <code>{\"type\": \"comparison\", \"item_a\": ..., \"item_b\": ...}</code>. For comparisons, the extracted phrases (e.g. \"old AST exam\") aren't real filenames, so I match them to actual filenames by embedding both the phrase and every candidate filename and picking the closest one by cosine similarity — a second, smaller RAG problem nested inside the first. This surfaced a real failure mode worth designing around: the match always returns <em>something</em>, even with no good match, so a low-confidence guess can silently produce a wrong comparison. I added an explicit guard so an unmatched document fails loudly with a clear message instead of crashing several layers deeper inside Chroma's filter validation — which is exactly what happened once, mid-project: the vector database was cleared and rebuilt but never reloaded before the next query, and the resulting <code>None</code> filename got passed straight into Chroma's <code>where</code> filter, producing an opaque <code>ValueError</code> several stack frames removed from the actual cause.</p><h2><strong>Sentence-aware chunking</strong></h2><p>The original chunker split text at fixed character offsets, which regularly cut sentences in half mid-thought. I replaced it with a sentence-aware chunker built on NLTK's tokenizer: it groups whole sentences up to a target length, with a small sentence-level overlap between consecutive chunks, so retrieval never hands the model a fragment that starts or ends mid-sentence.</p><h2><strong>From notebook to a real tool</strong></h2><p>The full system — loading, chunking, embedding, storage, retrieval, comparison, and routing — still only lived inside notebook cells, which meant testing a new question meant editing a variable and re-running cells by hand. Not something you could hand to someone else. I extracted all of that logic into a standalone Streamlit app (<code>app.py</code>): a text box, a submit button, and a loading spinner while the local LLM thinks, all running against the <em>already-persisted</em> Chroma collection built earlier — no re-embedding needed to use it. <code>streamlit run app.py</code> now opens a real browser-based tool where any question, lookup or comparison, gets routed and answered automatically.</p><h2><strong>Outcome</strong></h2><p>What started as \"let's see how RAG actually works under the hood\" became a locally-run, multi-document Q&amp;A tool with automatic query classification, document comparison, and a real UI — built without a single line of LangChain, and without sending a single request to an external API. The bigger takeaway was less about the specific pipeline and more about the debugging instinct it built: most of the hardest bugs weren't in the \"smart\" parts (the LLM prompts) — they were in the plumbing between them (an unrefreshed vector store, an unguarded <code>None</code>), which is exactly the kind of thing a framework would have hidden from me.</p>",
    tags: ["ChromaDB", "NLTK", "Ollama (nomic-embed-text, llama3.2)", "Python", "Streamlit"],
    coverImageUrl: "https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/ad06b1fc-dafe-4dff-be32-223c7e723cc5.jpg",
    codeRepository: "https://github.com/karan-khatri/rag-practice",
    liveUrl: null,
    featured: true,
    featuredOrder: 1,
    seo: {
      metaTitle: "Building a RAG Pipeline From Scratch with Ollama",
      metaDescription:
        "How I built a local Retrieval-Augmented Generation pipeline from scratch — chunking, embeddings, ChromaDB, and query routing — with no LangChain or cloud APIs.",
      canonicalUrl: "/projects/rag-pipeline-from-scratch",
    },
  },
];

interface SeedSection {
  type: SectionType;
  order: number;
  enabled: boolean;
  content: Record<string, unknown>;
}

const HOME_PAGE_TITLE = "Karan Kumar";

// HERO's content below carries `imageUrl` (not the real `imageId` field the
// HERO schema expects) — resolved to the freshly-seeded Media row's id in
// seedHomePage(), since Media ids are regenerated per environment.
const HOME_PAGE_SECTIONS: SeedSection[] = [
  {
    type: "HERO" as SectionType,
    order: 0,
    enabled: true,
    content: {
      ctaHref: "#projects",
      heading: "Karan Kumar",
      ctaLabel: "View my Projects",
      subheading:
        "Full Stack Software Engineer — building production systems and, right now, retrieval-augmented generation from scratch.",
      imageUrl: "https://zi7ftns91iaieyuf.public.blob.vercel-storage.com/d54a9aa8-861c-4831-b19e-c1842ed2e380.jpg",
    },
  },
  {
    type: "ABOUT" as SectionType,
    order: 1,
    enabled: true,
    content: {
      body: '<p style="text-align: justify;">I build the layer between AI and production — where models meet real users, real data, and real failure modes. I built the backend for Brarista, an AI fitting tool for Shopify storefronts, and I\'m now building a RAG pipeline from scratch — Ollama, ChromaDB, sentence-aware chunking — because I\'d rather understand retrieval than call an API. </p><p style="text-align: justify;"><strong>I ship, then stick around to make sure it holds.</strong></p>',
      role: "Full Stack Software Engineer",
      status: "OPERATIONAL",
      heading: "About me",
      focusTag: "BACKEND_LLM",
      location: "FLORENCE_IT",
      currently: "Building retrieval-augmented generation pipelines",
      education: "MSc, Univ. of Florence",
      focusDetail: "Full Stack Systems / LLM Pipelines",
      showEyebrow: true,
      headingAlign: "center",
      terminalTitle: "karan@portfolio: ~",
    },
  },
  {
    type: "EXPERIENCE" as SectionType,
    order: 2,
    enabled: true,
    content: { heading: "Experience", showEyebrow: true, headingAlign: "center" },
  },
  {
    type: "PROJECTS" as SectionType,
    order: 3,
    enabled: true,
    content: { limit: 4, heading: "Projects", displayMode: "slider", showEyebrow: true, headingAlign: "center" },
  },
  {
    type: "EDUCATION" as SectionType,
    order: 4,
    enabled: true,
    content: { heading: "Education", showEyebrow: true, headingAlign: "center" },
  },
  {
    type: "SKILLS" as SectionType,
    order: 5,
    enabled: true,
    content: {
      heading: "Skills",
      showDiagram: true,
      showEyebrow: true,
      headingAlign: "center",
      diagramCenterLabel: "Tech Stack",
      diagramTopLeftItems: [
        { id: "d9528a1a-4ad1-4629-b2a2-ec89529912a1", label: "React / Next.js" },
        { id: "fcae1662-da70-4136-a94b-1305a65414d0", label: "TypeScript" },
        { id: "86181dc8-f15e-4ccc-b3fa-ca79ede3881a", label: "JavaScript" },
        { id: "6044ea1c-39bd-438f-897f-53d0d0d1b1b3", label: "Tailwind" },
        { id: "a1922c94-223c-4de9-aeeb-5eb3ccd24920", label: "Redux" },
      ],
      diagramTopLeftTitle: "Frontend Systems",
      diagramTopRightItems: [
        { id: "1baa885b-f857-4c9e-a1fb-23fbb395e6a4", label: "Python / FastAPI" },
        { id: "f90eb14d-5295-4237-b2ee-62a08e26a9f2", label: "AWS" },
        { id: "1123d33c-2be1-4721-a7e5-357b77f2d383", label: "Docker" },
        { id: "28817dc7-c711-45fc-947f-fd9e844b5ba9", label: "CI/ CD" },
        { id: "48917e7c-8548-4dc8-9265-168497a39402", label: "PostgreSQL" },
        { id: "805ddf7c-dd29-4869-96ee-dbf0c8fe688e", label: "RabbitMQ" },
      ],
      diagramTopRightTitle: "Backend & Infra",
      diagramCenterSubtitle: "Overview",
      diagramBottomLeftItems: [
        { id: "37fed1ff-8c19-4c0f-947b-aeb0eb8551c0", label: "LangChain" },
        { id: "9793fac5-4ac2-444a-a730-1afc962f60c0", label: "Vector DBs" },
        { id: "d8bc4da3-b79b-4c35-8ae1-010ba6a0146a", label: "LLMs" },
        { id: "5ad7f816-8a6e-4d57-b7a2-f649079867c2", label: "RAG Pipelines" },
      ],
      diagramBottomLeftTitle: "Machine Learning & AI",
      diagramBottomRightItems: [
        { id: "bcc82e40-cd41-47cc-b248-da217b28f941", label: "Git" },
        { id: "34498947-bfed-41d2-a532-55c3289d4e04", label: "Github" },
        { id: "6da8e472-4f77-4801-af0e-dadda48a898a", label: "Jira" },
        { id: "4e13bcc9-8b5f-44a1-a8c2-2b91abe071a4", label: "Notion" },
        { id: "b3055f44-3c52-4bbb-9b20-52cb26f3721a", label: "Linux" },
      ],
      diagramBottomRightTitle: "Tooling",
    },
  },
  {
    type: "NOW" as SectionType,
    order: 6,
    enabled: true,
    content: {
      items: [
        { id: "1cf51bb0-5583-4684-80e9-ff1d92401a69", label: "Ingestion & chunking", status: "done" },
        { id: "eca3c99c-8e63-4d48-93ae-91e0000be963", label: "Embeddings + vector store", status: "done" },
        { id: "e0598210-82a4-4785-a4fb-8c62e549eaef", label: "Multi-doc query routing", status: "done" },
        { id: "c3bec86c-9356-4e08-bc7f-ff2ef0e60ad1", label: "Evaluation & reranking", status: "in_progress" },
        { id: "04efd2b9-4980-4025-a133-054d9576e837", label: "FastAPI service wrapper", status: "remaining" },
      ],
      heading: "Building Now",
      description:
        "A local-first RAG pipeline from scratch — Ollama for inference, ChromaDB for vector storage, sentence-aware chunking, and LLM-based query routing across multiple documents, with a Streamlit interface on top.",
      showEyebrow: true,
      headingAlign: "left",
    },
  },
  {
    type: "CONTACT" as SectionType,
    order: 7,
    enabled: true,
    content: { email: "khatrikamlesh23@gmail.com", heading: "Get in touch", showEyebrow: false, headingAlign: "center" },
  },
  {
    type: "LANGUAGES" as SectionType,
    order: 8,
    enabled: true,
    content: { heading: "Languages", showEyebrow: true, headingAlign: "center" },
  },
];

async function seedMedia(): Promise<Map<string, string>> {
  const idByUrl = new Map<string, string>();
  for (const item of SEED_MEDIA) {
    const media = await withUniqueRetry(() =>
      prisma.media.upsert({
        where: { url: item.url },
        update: {},
        create: item,
      }),
    );
    idByUrl.set(item.url, media.id);
  }
  return idByUrl;
}

async function seedTechStack(): Promise<void> {
  console.log("Seeding tech stack items...");
  for (const item of SEED_TECH_STACK) {
    await withUniqueRetry(() =>
      prisma.techStackItem.upsert({
        where: { name: item.name },
        update: {},
        create: item,
      }),
    );
  }
}

async function seedSiteSettings(): Promise<void> {
  if ((await prisma.siteSetting.count()) === 0) {
    await upsertSiteSettings(SEED_SITE_SETTINGS);
  }
}

async function seedProjects(adminId: string, mediaIdByUrl: Map<string, string>): Promise<void> {
  for (const entry of SEED_PROJECTS) {
    const project = await withUniqueRetry(() =>
      prisma.project.upsert({
        where: { slug_locale: { slug: entry.slug, locale: "en" } },
        update: {},
        create: {
          slug: entry.slug,
          locale: "en",
          translationGroupId: entry.slug,
          title: entry.title,
          status: "DRAFT",
        },
      }),
    );

    if (project.status !== "PUBLISHED") {
      const tagIds = await resolveTagIds(entry.tags);
      const coverImageId = entry.coverImageUrl ? (mediaIdByUrl.get(entry.coverImageUrl) ?? null) : null;

      const revision = await saveDraft({
        entityType: "Project",
        entityId: project.id,
        data: {
          title: entry.title,
          excerpt: entry.excerpt,
          body: entry.body,
          tagIds,
          coverImageId,
          codeRepository: entry.codeRepository,
          liveUrl: entry.liveUrl,
        },
        userId: adminId,
      });
      await publishRevision({
        entityType: "Project",
        entityId: project.id,
        revisionId: revision.id,
        userId: adminId,
      });

      if (entry.featured) {
        await prisma.project.update({
          where: { id: project.id },
          data: { featured: true, featuredOrder: entry.featuredOrder },
        });
      }

      if (entry.seo) {
        await upsertSeo({ entityType: "Project", entityId: project.id, fields: entry.seo });
      }
    }
  }
}

async function seedHomePage(adminId: string, mediaIdByUrl: Map<string, string>): Promise<void> {
  const homePage = await withUniqueRetry(() =>
    prisma.page.upsert({
      where: { slug_locale: { slug: "home", locale: "en" } },
      update: {},
      create: {
        slug: "home",
        locale: "en",
        translationGroupId: "home",
        title: HOME_PAGE_TITLE,
        status: "DRAFT",
      },
    }),
  );

  if (homePage.status !== "PUBLISHED") {
    const sections: PageSectionInput[] = HOME_PAGE_SECTIONS.map((section) => {
      const content = { ...section.content };
      const imageUrl = content.imageUrl;
      if (typeof imageUrl === "string") {
        delete content.imageUrl;
        const imageId = mediaIdByUrl.get(imageUrl);
        if (imageId) content.imageId = imageId;
      }
      return { type: section.type, order: section.order, enabled: section.enabled, content };
    });

    const revision = await saveDraft({
      entityType: "Page",
      entityId: homePage.id,
      data: { title: HOME_PAGE_TITLE, sections },
      userId: adminId,
    });
    await publishRevision({
      entityType: "Page",
      entityId: homePage.id,
      revisionId: revision.id,
      userId: adminId,
    });
  }
}

async function seedResumeContent(adminId: string, mediaIdByUrl: Map<string, string>): Promise<void> {
  if ((await prisma.experience.count()) === 0) {
    await prisma.experience.createMany({
      data: RESUME_EXPERIENCE.map((entry, index) => ({
        locale: "en",
        company: entry.company,
        title: entry.title,
        startDate: entry.startDate,
        endDate: entry.endDate,
        description: entry.description,
        order: index,
      })),
    });
  }

  if ((await prisma.education.count()) === 0) {
    await prisma.education.createMany({
      data: RESUME_EDUCATION.map((entry, index) => ({
        locale: "en",
        institution: entry.institution,
        degree: entry.degree,
        location: entry.location,
        startDate: entry.startDate,
        endDate: entry.endDate,
        description: entry.description,
        order: index,
      })),
    });
  }

  if ((await prisma.language.count()) === 0) {
    await prisma.language.createMany({
      data: RESUME_LANGUAGES.map((entry, index) => ({
        locale: "en",
        name: entry.name,
        proficiency: entry.proficiency,
        order: index,
      })),
    });
  }

  if ((await prisma.skill.count()) === 0) {
    await prisma.skill.createMany({
      data: RESUME_SKILLS.map((skill, index) => ({
        locale: "en",
        name: skill.name,
        category: skill.category,
        order: index,
      })),
    });
  }

  await seedProjects(adminId, mediaIdByUrl);
}

export async function ensureSeedData(): Promise<void> {
  const adminEmailRaw = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;

  if (!adminEmailRaw || !adminPassword) {
    throw new Error(
      "SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must both be set — refusing to start without them.",
    );
  }
  const adminEmail = normalizeEmail(adminEmailRaw);

  const adminRole = await withUniqueRetry(() =>
    prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: { name: "ADMIN", isPermanent: true },
    }),
  );

  const admin = await withUniqueRetry(() =>
    prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: "Admin",
        passwordHash: hashPassword(adminPassword),
      },
    }),
  );

  const hasAdminRole = await prisma.userRoleAssignment.findFirst({
    where: { userId: admin.id, roleId: adminRole.id },
  });
  if (!hasAdminRole) {
    await prisma.userRoleAssignment.create({
      data: { userId: admin.id, roleId: adminRole.id, expiresAt: null },
    });
  }

  const mediaIdByUrl = await seedMedia();
  await seedTechStack();
  await seedSiteSettings();
  await seedHomePage(admin.id, mediaIdByUrl);
  await seedResumeContent(admin.id, mediaIdByUrl);
}
