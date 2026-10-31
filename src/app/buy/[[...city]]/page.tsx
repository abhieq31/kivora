import { SearchPage, searchMetadata } from "@/components/search/search-page";

export const generateMetadata = searchMetadata("buy");

export default function Page(props: PageProps<"/buy/[[...city]]">) {
  return <SearchPage mode="buy" {...props} />;
}
