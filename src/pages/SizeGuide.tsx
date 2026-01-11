import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import NavbarB2B from "@/components/NavbarB2B";
import FooterB2B from "@/components/FooterB2B";
import { Ruler, Baby, Moon, Shirt } from "lucide-react";

const SizeGuide = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const womensSizes = [
    { size: "XS", chest: "76-81", waist: "58-63", hip: "84-89", chestIn: "30-32", waistIn: "23-25", hipIn: "33-35" },
    { size: "S", chest: "81-86", waist: "63-68", hip: "89-94", chestIn: "32-34", waistIn: "25-27", hipIn: "35-37" },
    { size: "M", chest: "86-91", waist: "68-73", hip: "94-99", chestIn: "34-36", waistIn: "27-29", hipIn: "37-39" },
    { size: "L", chest: "91-96", waist: "73-78", hip: "99-104", chestIn: "36-38", waistIn: "29-31", hipIn: "39-41" },
    { size: "XL", chest: "96-101", waist: "78-83", hip: "104-109", chestIn: "38-40", waistIn: "31-33", hipIn: "41-43" },
    { size: "XXL", chest: "101-106", waist: "83-88", hip: "109-114", chestIn: "40-42", waistIn: "33-35", hipIn: "43-45" },
  ];

  const kidsSizes = [
    { age: "2-3Y", height: "92-98", chest: "52-54", waist: "50-51", heightIn: "36-39", chestIn: "20-21", waistIn: "20" },
    { age: "3-4Y", height: "98-104", chest: "54-56", waist: "51-52", heightIn: "39-41", chestIn: "21-22", waistIn: "20-21" },
    { age: "4-5Y", height: "104-110", chest: "56-58", waist: "52-53", heightIn: "41-43", chestIn: "22-23", waistIn: "21" },
    { age: "5-6Y", height: "110-116", chest: "58-60", waist: "53-54", heightIn: "43-46", chestIn: "23-24", waistIn: "21" },
    { age: "6-7Y", height: "116-122", chest: "60-62", waist: "54-55", heightIn: "46-48", chestIn: "24", waistIn: "21-22" },
    { age: "7-8Y", height: "122-128", chest: "62-64", waist: "55-56", heightIn: "48-50", chestIn: "24-25", waistIn: "22" },
    { age: "8-10Y", height: "128-140", chest: "64-68", waist: "56-60", heightIn: "50-55", chestIn: "25-27", waistIn: "22-24" },
    { age: "10-12Y", height: "140-152", chest: "68-74", waist: "60-64", heightIn: "55-60", chestIn: "27-29", waistIn: "24-25" },
  ];

  return (
    <>
      <Helmet>
        <title>{t('sizeGuide.pageTitle')} | Feather Fashions</title>
        <meta name="description" content={t('sizeGuide.pageDescription')} />
      </Helmet>

      <NavbarB2B />

      <main className={`min-h-screen bg-background ${isRTL ? 'rtl' : 'ltr'}`}>
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full mb-6">
              <Ruler className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">{t('sizeGuide.badge')}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-athletic font-bold tracking-tight mb-4">
              {t('sizeGuide.title')}
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
              {t('sizeGuide.subtitle')}
            </p>
          </div>
        </section>

        {/* Women's Sizing */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Moon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('sizeGuide.womensTitle')}</h2>
                <p className="text-muted-foreground">{t('sizeGuide.womensSubtitle')}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.size')}</th>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.chestCm')}</th>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.waistCm')}</th>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.hipCm')}</th>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.chestIn')}</th>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.waistIn')}</th>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.hipIn')}</th>
                  </tr>
                </thead>
                <tbody>
                  {womensSizes.map((row, idx) => (
                    <tr key={row.size} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                      <td className="px-4 py-3 font-medium">{row.size}</td>
                      <td className="px-4 py-3">{row.chest}</td>
                      <td className="px-4 py-3">{row.waist}</td>
                      <td className="px-4 py-3">{row.hip}</td>
                      <td className="px-4 py-3">{row.chestIn}</td>
                      <td className="px-4 py-3">{row.waistIn}</td>
                      <td className="px-4 py-3">{row.hipIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Kids Sizing */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Baby className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('sizeGuide.kidsTitle')}</h2>
                <p className="text-muted-foreground">{t('sizeGuide.kidsSubtitle')}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.age')}</th>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.heightCm')}</th>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.chestCm')}</th>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.waistCm')}</th>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.heightIn')}</th>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.chestIn')}</th>
                    <th className="px-4 py-3 text-start font-semibold">{t('sizeGuide.waistIn')}</th>
                  </tr>
                </thead>
                <tbody>
                  {kidsSizes.map((row, idx) => (
                    <tr key={row.age} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                      <td className="px-4 py-3 font-medium">{row.age}</td>
                      <td className="px-4 py-3">{row.height}</td>
                      <td className="px-4 py-3">{row.chest}</td>
                      <td className="px-4 py-3">{row.waist}</td>
                      <td className="px-4 py-3">{row.heightIn}</td>
                      <td className="px-4 py-3">{row.chestIn}</td>
                      <td className="px-4 py-3">{row.waistIn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* How to Measure */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shirt className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{t('sizeGuide.howToMeasure')}</h2>
                <p className="text-muted-foreground">{t('sizeGuide.howToMeasureSubtitle')}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">{t('sizeGuide.chestMeasure')}</h3>
                <p className="text-sm text-muted-foreground">{t('sizeGuide.chestMeasureDesc')}</p>
              </div>
              <div className="p-6 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">{t('sizeGuide.waistMeasure')}</h3>
                <p className="text-sm text-muted-foreground">{t('sizeGuide.waistMeasureDesc')}</p>
              </div>
              <div className="p-6 bg-muted/50 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">{t('sizeGuide.hipMeasure')}</h3>
                <p className="text-sm text-muted-foreground">{t('sizeGuide.hipMeasureDesc')}</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">{t('sizeGuide.note')}:</strong> {t('sizeGuide.noteText')}
              </p>
            </div>
          </div>
        </section>
      </main>

      <FooterB2B />
    </>
  );
};

export default SizeGuide;
