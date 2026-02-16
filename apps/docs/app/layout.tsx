import { Footer, Layout, Navbar } from 'nextra-theme-docs';
import { Head } from 'nextra/components';
import { getPageMap } from 'nextra/page-map';
import 'nextra-theme-docs/style.css';

export const metadata = {
  // Define your metadata here
  // For more information on metadata API, see: https://nextjs.org/docs/app/building-your-application/optimizing/metadata
};

const navbar = (
  <Navbar
    logo={<b>Natie</b>}
    projectLink="https://github.com/watFiree/natie-ai"
    chatLink="https://discord.gg/Z7Rft3atc9"
  />
);
const footer = <Footer>Natie AI {new Date().getFullYear()}.</Footer>;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      // Not required, but good for SEO
      lang="en"
      // Required to be set
      dir="ltr"
      // Suggested by `next-themes` package https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <Head></Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/watFiree/natie-ai/tree/main/apps/docs"
          footer={footer}

          // ... Your additional layout options
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
