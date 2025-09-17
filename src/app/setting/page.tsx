import StorageManager from "@/components/pdf/storage-manager";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your PDFAid data and preferences.
        </p>
      </div>

      <StorageManager />
    </div>
  );
}
