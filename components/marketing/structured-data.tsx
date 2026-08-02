import { faqs, siteConfig } from "@/lib/marketing/content";

/**
 * JSON-LD for the landing page: the product itself plus the FAQ, so answers can
 * surface directly in search results.
 */
export function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: siteConfig.name,
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        description: siteConfig.description,
        url: siteConfig.url,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free for your first course",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Content is authored locally in `lib/marketing/content.ts`, never
      // user-supplied, and `JSON.stringify` escapes the values.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
