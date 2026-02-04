import { HomePage } from "./home-page";

interface PageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;
  const idToken = params.id_token;

  if (!idToken) {
    return (
      <HomePage error="Missing session token. This app must be opened from the Shopify Admin." />
    );
  }

  return <HomePage shop="test" />;
}
