# cdApp - Multi-tenant Colombian CDA (Centro de Diagnóstico Automotor - Automotive Diagnostic Center) admin tool

**#cdApp** is a sophisticated, production-grade multi-tenant administration platform specifically engineered for Colombian Automotive Diagnostic Centers (CDAs). Built as a complete operational system, it manages the entire workflow of a diagnostic center—from initial vehicle intake and diagnostics to final diagnostic, technical reports, and customer management, all while maintaining strict data isolation between different tenant organizations. The application leverages a modern, edge-ready architecture with Next.js 16 and Supabase to deliver real-time collaboration, role-based access control, and a seamless user experience that adapts to the unique regulatory and operational requirements of the Colombian automotive industry.

Developed to demonstrate mastery of complex, real-world software engineering challenges, #cdApp showcases a robust implementation of domain-driven design within a multi-tenant ecosystem. The system handles critical business logic such as automated diagnostic report generation (RTM), digital signature capture, technician assignment with availability tracking, and dynamic PDF report creation using **@react-pdf/renderer**. By combining cutting-edge frontend technologies with a scalable backend infrastructure—including PostgreSQL partitioning, Row Level Security (RLS) for tenant isolation, and Supabase Realtime for instant updates—this project exemplifies how to build, deploy, and maintain a secure, high-performance enterprise application ready for the demands of a modern automotive service network.

## 🛠️ Tools Used

- **🚀 Framework:** Next.js 16 (App Router) with React 19, utilizing Server Components, Streaming (Suspense), and ISR for optimal performance and SEO.
- **🗄️ Database:** PostgreSQL on **Supabase** with logical partitioning, RLS policies for multi-tenant isolation, and migrations managed via CLI.
- **⚡ Real-time & Collaboration:** **Supabase Realtime** (WebSockets) for live data updates across the platform.
- **📊 UI/UX:** **Shadcn/ui** components, **Tailwind CSS** with theming support (`next-themes`), **Framer Motion** for smooth animations, and **Embla Carousel** for interactive galleries.
- **📝 Forms & Validation:** **Zod** for schema validation, ensuring data integrity across complex forms.
- **📄 Document Generation:** **@react-pdf/renderer** for generating high-quality, dynamic diagnostic reports and **ExcelJS** for data export.
- **✍️ Digital Signatures:** **@uiw/react-signature** for capturing technician and customer signatures natively in the browser.
- **📊 Data Visualization & Tables:** **Recharts** for interactive analytics dashboards and **TanStack Table** for powerful, feature-rich data grids.
- **📦 State & Data Management:** **TanStack Query** for efficient server-state management, caching, and synchronization.
- **🖼️ Image Optimization:** **Sharp** for server-side image processing and dynamic resizing on the edge.
- **🛡️ Security:** Server-Side Rendering (SSR) authentication with Supabase, custom **JWT Claims**, and strict **RLS** policies.
- **📧 Emails:** **Resend** for transactional email delivery.
- **🌐 Infrastructure:** Deployed on **Vercel** with a Supabase backend, utilizing Edge functions and middleware for intelligent request routing.
