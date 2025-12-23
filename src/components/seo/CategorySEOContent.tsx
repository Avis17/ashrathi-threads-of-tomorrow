import { Link } from "react-router-dom";

interface RelatedLink {
  label: string;
  href: string;
}

interface CategorySEOContentProps {
  content: string;
  relatedCategories?: RelatedLink[];
  parentCategory?: RelatedLink;
}

const CategorySEOContent = ({ 
  content, 
  relatedCategories = [], 
  parentCategory 
}: CategorySEOContentProps) => {
  return (
    <section className="py-12 md:py-16 bg-background border-t border-border">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* SEO Content */}
        <article 
          className="prose prose-lg prose-invert max-w-none
            prose-headings:text-foreground prose-headings:font-bold
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-strong:text-foreground
            prose-a:text-neon prose-a:no-underline hover:prose-a:underline
            prose-ul:text-muted-foreground prose-li:marker:text-neon"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Internal Links Section */}
        {(relatedCategories.length > 0 || parentCategory) && (
          <nav className="mt-12 pt-8 border-t border-border" aria-label="Related categories">
            <h3 className="text-lg font-bold text-foreground mb-4">Explore More</h3>
            <div className="flex flex-wrap gap-3">
              {parentCategory && (
                <Link 
                  to={parentCategory.href}
                  className="px-4 py-2 bg-muted text-muted-foreground hover:bg-neon/10 hover:text-neon border border-border rounded-lg transition-colors text-sm"
                >
                  ← Back to {parentCategory.label}
                </Link>
              )}
              {relatedCategories.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-2 bg-muted text-muted-foreground hover:bg-neon/10 hover:text-neon border border-border rounded-lg transition-colors text-sm"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Supporting Pages Links */}
        <nav className="mt-8 pt-8 border-t border-border" aria-label="Learn more about our manufacturing">
          <h4 className="text-base font-semibold text-foreground mb-3">Learn More About Our Process</h4>
          <div className="flex flex-wrap gap-2">
            <Link to="/manufacturing-process" className="text-sm text-muted-foreground hover:text-neon transition-colors">
              Manufacturing Process
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/fabrics-we-use" className="text-sm text-muted-foreground hover:text-neon transition-colors">
              Fabrics We Use
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/quality-standards" className="text-sm text-muted-foreground hover:text-neon transition-colors">
              Quality Standards
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/garment-manufacturer-tirupur" className="text-sm text-muted-foreground hover:text-neon transition-colors">
              Made in Tirupur
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-neon transition-colors">
              Contact Us
            </Link>
          </div>
        </nav>
      </div>
    </section>
  );
};

export default CategorySEOContent;
