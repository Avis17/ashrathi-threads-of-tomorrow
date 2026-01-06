import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import categoryMen from "@/assets/home/category-men.jpg";
import categoryWomen from "@/assets/home/category-women.jpg";
import categoryKids from "@/assets/home/category-kids.jpg";

const categories = [
  {
    id: 1,
    title: "WOMEN",
    subtitle: "Leggings, Sports Bras & More",
    image: categoryWomen,
    link: "/women",
    accent: "from-rose-500/20 to-orange-500/20",
  },
  {
    id: 2,
    title: "MEN",
    subtitle: "Performance Tees & Joggers",
    image: categoryMen,
    link: "/men",
    accent: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: 3,
    title: "KIDS",
    subtitle: "Colorful & Comfortable",
    image: categoryKids,
    link: "/shop?category=kids",
    accent: "from-green-500/20 to-yellow-500/20",
  },
];

const CategorySection = () => {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-accent font-medium tracking-[0.3em] text-sm mb-4">
            SHOP BY CATEGORY
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-athletic font-black text-foreground">
            EXPLORE COLLECTIONS
          </h2>
          <div className="w-24 h-1 bg-accent mx-auto mt-6" />
        </div>

        {/* Category Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={category.link}
              className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Hover Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Content */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="transform transition-transform duration-500 group-hover:-translate-y-4">
                  <span className="text-white/60 text-sm tracking-wider mb-2 block">
                    {category.subtitle}
                  </span>
                  <h3 className="text-3xl lg:text-4xl font-athletic font-black text-white mb-4">
                    {category.title}
                  </h3>
                  
                  {/* CTA */}
                  <div className="flex items-center gap-2 text-accent font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    <span className="tracking-wider text-sm">SHOP NOW</span>
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </div>
              
              {/* Corner Accent */}
              <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                <ArrowUpRight className="w-5 h-5 text-white" />
              </div>
            </Link>
          ))}
        </div>
        
        {/* View All Link */}
        <div className="text-center mt-12">
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-3 text-foreground font-athletic font-bold tracking-wider hover:text-accent transition-colors group"
          >
            VIEW ALL CATEGORIES
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
