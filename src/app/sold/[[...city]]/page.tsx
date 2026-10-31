import { SearchPage, searchMetadata } from "@/components/search/search-page";

export const generateMetadata = searchMetadata("sold");

export default function Page(props: PageProps<"/sold/[[...city]]">) {
  return <SearchPage mode="sold" {...props} />;
}
