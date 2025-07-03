import HomeCatalog from "../client/components/widget/HomeCatalog";
import CategoryGrid from "../client/components/catalog/CategoryGrid";

export default function Home() {
  return (
    <div>
      <div className="mt-40">
        <CategoryGrid />
      </div>
      <div className="mt-16">
        <HomeCatalog />
      </div>
    </div>
  );
}
