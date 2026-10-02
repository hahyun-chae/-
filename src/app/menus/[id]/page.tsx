import { MenuEditPage } from "@/components/menus/MenuEditPage";

export default async function EditMenuPage({ params }: PageProps<"/menus/[id]">) {
  const { id } = await params;
  return <MenuEditPage menuId={id} />;
}
