import { SearchPage, searchMetadata } from "@/components/search/search-page";

export const generateMetadata = searchMetadata("rent");

export default function Page(props: PageProps<"/rent/[[...city]]">) {
  return <SearchPage mode="rent" {...props} />;
}
