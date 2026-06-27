import { getDictionary} from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";
import { PageContainer, PageHeader } from "@/components/ui";
import { LanguageSettings } from "./language-settings";

export default async function SettingsPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <PageContainer size="narrow">
      <PageHeader title={dict.settings.title} subtitle={dict.settings.subtitle} />
      <LanguageSettings currentLocale={locale} />
    </PageContainer>
  );
}
