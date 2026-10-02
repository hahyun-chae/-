import { IngredientDetailView } from "@/components/ingredients/IngredientDetailView";

export default async function IngredientDetailPage({ params }: PageProps<"/ingredients/[id]">) {
  const { id } = await params;
  return <IngredientDetailView id={decodeURIComponent(id)} />;
}
