import { AddContentForm } from "@/components/add-content-form";

export default function AddContentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">Add New Content</h1>
      <AddContentForm />
    </div>
  );
}
