import "./../styles/globals.css";
import MenubarWrapper from "@/components/MenubarWrapper";
import SessionProviderWrapper from "@/components/SessionProviderWrapper"; // Import the wrapper

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper>  {/* Wrap your app content with SessionProviderWrapper */}
          <MenubarWrapper />
          <main>{children}</main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
