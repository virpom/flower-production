import { getCachedSettings } from "@/lib/cache";
import SettingsForm from "./SettingsForm";

// Принудительно делаем страницу динамической
export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getCachedSettings();
  
  // Преобразуем сложный объект Mongoose в простой, "плоский" объект,
  // безопасный для передачи в клиентский компонент.
  const plainSettings = JSON.parse(JSON.stringify(settings));

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <SettingsForm initialSettings={plainSettings} />
    </div>
  );
}
